import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/supabase';

// Lemon Squeezy Webhook Handler
// Events: order_created, subscription_created, subscription_updated, subscription_cancelled

// In-memory idempotency guard (survives within a single serverless instance lifetime).
// DB upsert below provides durable idempotency across cold starts.
const processedEvents = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');
    
    // Verify webhook signature (REQUIRED in production)
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured — rejecting webhook');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }
    
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(rawBody).digest('hex');
    
    if (signature !== digest) {
      console.error('Invalid Lemon Squeezy webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    
    // Idempotency: skip already-processed events (retries from Lemon Squeezy)
    const eventId = payload.meta?.webhook_id || payload.data?.id;
    if (eventId) {
      // Fast in-memory check
      if (processedEvents.has(eventId)) {
        console.log(`Skipping duplicate webhook event: ${eventId}`);
        return NextResponse.json({ received: true, duplicate: true });
      }
      // DB-level idempotency: check if event already exists
      const { data: existingEvent } = await db
        .from('webhook_events')
        .select('id')
        .eq('event_id', eventId)
        .single();
      if (existingEvent) {
        console.log(`Skipping duplicate webhook event (DB): ${eventId}`);
        return NextResponse.json({ received: true, duplicate: true });
      }
      // Insert new event
      await db
        .from('webhook_events')
        .insert({ event_id: eventId, event_name: eventName, payload: payload, processed: true, processed_at: new Date().toISOString() });
      processedEvents.add(eventId);
      // Cap in-memory set size
      if (processedEvents.size > 1000) {
        const first = processedEvents.values().next().value;
        if (first) processedEvents.delete(first);
      }
    }
    
    // Custom data can be in different places depending on the event
    const customData = payload.meta?.custom_data || payload.data?.attributes?.custom_data || {};
    
    // Email can be in multiple places
    const userEmail = 
      payload.data?.attributes?.user_email || 
      payload.data?.attributes?.customer_email ||
      customData.email ||
      '';
    
    const productId = payload.data?.attributes?.product_id?.toString() || 
                      payload.data?.attributes?.first_order_item?.product_id?.toString() || '';
    const productName = (
      payload.data?.attributes?.product_name || 
      payload.data?.attributes?.first_order_item?.product_name || 
      ''
    ).toLowerCase();
    const variantId = payload.data?.attributes?.variant_id?.toString();
    
    // Log full payload for debugging (remove in production later)
    console.log('Lemon Squeezy webhook received:', JSON.stringify({
      event: eventName,
      email: userEmail,
      product: productName,
      productId,
      customData
    }, null, 2));
    
    // Only process PwnClaw products - ignore NoID Privacy etc.
    // Primary: match by known Product ID. Secondary: name-based fallback.
    const PWNCLAW_PRODUCT_ID = '816634';
    const PWNCLAW_PRODUCT_IDS = (process.env.LEMONSQUEEZY_PRODUCT_IDS || PWNCLAW_PRODUCT_ID).split(',').filter(Boolean);
    const isPwnClawProduct = 
      PWNCLAW_PRODUCT_IDS.includes(productId) ||
      productId === PWNCLAW_PRODUCT_ID ||
      (customData.source === 'pwnclaw') ||
      productName.includes('pwnclaw') ||
      productName.includes('agent security');
    
    if (!isPwnClawProduct) {
      console.log(`Ignoring webhook for non-PwnClaw product: "${productName}" (ID: ${productId})`);
      return NextResponse.json({ received: true, ignored: true });
    }
    
    console.log(`Processing PwnClaw product: "${productName}" (ID: ${productId})`);

    // Handle different events
    switch (eventName) {
      case 'order_created':
      case 'subscription_created': {
        // Upgrade user to Pro
        const email = userEmail || customData.email;
        const clerkUserId = customData.user_id;
        
        let upgraded = false;
        
        // Try to find user by Clerk ID first (most reliable)
        if (clerkUserId) {
          const { data: userByClerk } = await db
            .from('users')
            .select('*')
            .eq('clerk_id', clerkUserId)
            .single();
          
          if (userByClerk) {
            await db
              .from('users')
              .update({ 
                plan: 'pro',
                credits_remaining: PLAN_LIMITS.pro.credits
              })
              .eq('id', userByClerk.id);
            
            console.log(`Upgraded user ${userByClerk.email} to Pro plan (via Clerk ID)`);
            upgraded = true;
          }
        }
        
        // Fallback: Try by email
        if (!upgraded && email) {
          const { data: userByEmail } = await db
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (userByEmail) {
            await db
              .from('users')
              .update({ 
                plan: 'pro',
                credits_remaining: PLAN_LIMITS.pro.credits
              })
              .eq('id', userByEmail.id);
            
            console.log(`Upgraded user ${email} to Pro plan (via email)`);
            upgraded = true;
          }
        }
        
        // If user not found, create them with Pro plan
        if (!upgraded && (clerkUserId || email)) {
          const newEmail = email || `${clerkUserId}@clerk.user`;
          const newClerkId = clerkUserId || `unknown_${Date.now()}`;
          const { data: newUser, error: createError } = await db
            .from('users')
            .insert({ 
              clerk_id: newClerkId, 
              email: newEmail,
              plan: 'pro',
              credits_remaining: PLAN_LIMITS.pro.credits,
              credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();
          if (newUser) {
            console.log(`Created new user ${newEmail} with Pro plan (via webhook)`);
            upgraded = true;
          } else {
            console.error(`Failed to create user for upgrade:`, createError);
          }
        }
        
        if (!upgraded) {
          console.log(`User not found and could not create. Email: ${email}, ClerkID: ${clerkUserId}`);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        // Downgrade to free — use email lookup (subscription_id/customer_id columns
        // don't exist in the users table; email is the most reliable identifier we have
        // from Lemon Squeezy cancel/expire events)
        const email = userEmail || customData.email;
        const clerkUserId = customData.user_id;
        
        let downgraded = false;
        
        // Try Clerk ID first (most reliable if custom_data was passed)
        if (!downgraded && clerkUserId) {
          const { data: userByClerk } = await db
            .from('users')
            .select('id, email')
            .eq('clerk_id', clerkUserId)
            .single();
          if (userByClerk) {
            await db.from('users').update({ plan: 'free', credits_remaining: PLAN_LIMITS.free.credits }).eq('id', userByClerk.id);
            console.log(`Downgraded user ${userByClerk.email} to Free plan (via Clerk ID)`);
            downgraded = true;
          }
        }
        
        // Fallback: email — use .limit(1) to avoid updating multiple users with same email
        if (!downgraded && email) {
          const { data: userByEmail } = await db
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1)
            .single();
          if (userByEmail) {
            await db.from('users').update({ plan: 'free', credits_remaining: PLAN_LIMITS.free.credits }).eq('id', userByEmail.id);
            console.log(`Downgraded user ${email} to Free plan (via email)`);
          }
        }
        break;
      }

      case 'subscription_payment_failed': {
        // Payment failed — downgrade to free plan
        const email = userEmail || customData.email;
        const clerkUserId = customData.user_id;
        
        let handled = false;
        
        if (clerkUserId) {
          const { data: userByClerk } = await db
            .from('users')
            .select('id, email')
            .eq('clerk_id', clerkUserId)
            .single();
          if (userByClerk) {
            await db.from('users').update({ plan: 'free', credits_remaining: PLAN_LIMITS.free.credits }).eq('id', userByClerk.id);
            console.log(`Payment failed — downgraded user ${userByClerk.email} to Free plan (via Clerk ID)`);
            handled = true;
          }
        }
        
        if (!handled && email) {
          const { data: userByEmail } = await db.from('users').select('id').eq('email', email).limit(1).single();
          if (userByEmail) {
            await db.from('users').update({ plan: 'free', credits_remaining: PLAN_LIMITS.free.credits }).eq('id', userByEmail.id);
            console.log(`Payment failed — downgraded user ${email} to Free plan (via email)`);
            handled = true;
          }
        }
        
        if (!handled && !email) {
          console.log(`Payment failed but no user found. ClerkID: ${clerkUserId}, Email: ${email}`);
        }
        break;
      }

      case 'subscription_updated': {
        // Handle plan changes (e.g., Pro to Team) — same fallback chain as order_created
        const variantName = payload.data?.attributes?.variant_name?.toLowerCase();
        const email = userEmail || customData.email;
        const clerkUserId = customData.user_id;
        
        const plan = variantName?.includes('team') ? 'team' : 'pro';
        const credits = plan === 'team' ? (PLAN_LIMITS.team.credits === -1 ? 999 : PLAN_LIMITS.team.credits) : PLAN_LIMITS.pro.credits;
        
        let updated = false;
        
        // Try Clerk ID first
        if (!updated && clerkUserId) {
          const { data: userByClerk } = await db
            .from('users')
            .select('id')
            .eq('clerk_id', clerkUserId)
            .single();
          if (userByClerk) {
            await db.from('users').update({ plan, credits_remaining: credits }).eq('id', userByClerk.id);
            console.log(`Updated user to ${plan} plan (via Clerk ID)`);
            updated = true;
          }
        }
        
        // Fallback: email — use .limit(1) to avoid updating multiple users with same email
        if (!updated && email) {
          const { data: userByEmail } = await db.from('users').select('id').eq('email', email).limit(1).single();
          if (userByEmail) {
            await db.from('users').update({ plan, credits_remaining: credits }).eq('id', userByEmail.id);
            console.log(`Updated user ${email} to ${plan} plan (via email)`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
