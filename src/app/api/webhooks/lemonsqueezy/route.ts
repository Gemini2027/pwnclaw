import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/supabase';

// Lemon Squeezy Webhook Handler
// Handled events: order_created, order_refunded, subscription_created, subscription_updated,
// subscription_plan_changed, subscription_cancelled, subscription_expired, subscription_paused,
// subscription_resumed, subscription_unpaused, subscription_payment_failed,
// subscription_payment_success, subscription_payment_recovered, subscription_payment_refunded,
// dispute_created, dispute_resolved

// Known PwnClaw Product IDs → plan mapping
const PRODUCT_PLAN_MAP: Record<string, 'pro' | 'team'> = {
  '816634': 'pro',   // PwnClaw Pro (Variant 1287201)
  '821997': 'team',  // PwnClaw Team (Variant 1295478)
};
const PWNCLAW_PRODUCT_IDS = Object.keys(PRODUCT_PLAN_MAP);

// In-memory idempotency guard (survives within a single serverless instance lifetime).
const processedEvents = new Set<string>();

/**
 * Find user by best available identifier. Priority:
 * 1. Lemon subscription_id (most reliable for lifecycle events)
 * 2. Lemon customer_id (persists across subscriptions)
 * 3. Clerk user_id from custom_data
 * 4. Email fallback (least reliable)
 */
async function findUser(opts: {
  subscriptionId?: string;
  customerId?: string;
  clerkUserId?: string;
  email?: string;
}): Promise<{ user: any; method: string } | null> {
  // 1. Lemon subscription_id
  if (opts.subscriptionId) {
    const { data } = await db.from('users').select('*').eq('lemon_subscription_id', opts.subscriptionId).single();
    if (data) return { user: data, method: 'lemon_subscription_id' };
  }
  // 2. Lemon customer_id
  if (opts.customerId) {
    const { data } = await db.from('users').select('*').eq('lemon_customer_id', opts.customerId).single();
    if (data) return { user: data, method: 'lemon_customer_id' };
  }
  // 3. Clerk ID
  if (opts.clerkUserId) {
    const { data } = await db.from('users').select('*').eq('clerk_id', opts.clerkUserId).single();
    if (data) return { user: data, method: 'clerk_id' };
  }
  // 4. Email fallback
  if (opts.email) {
    const { data } = await db.from('users').select('*').eq('email', opts.email).limit(1).single();
    if (data) return { user: data, method: 'email' };
  }
  return null;
}

/**
 * Detect plan from product_id. Falls back to product name matching.
 */
function detectPlan(productId: string, productName: string): 'pro' | 'team' {
  if (PRODUCT_PLAN_MAP[productId]) return PRODUCT_PLAN_MAP[productId];
  return productName.toLowerCase().includes('team') ? 'team' : 'pro';
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');
    
    // Verify webhook signature
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
    
    // Idempotency
    const eventId = payload.meta?.webhook_id || payload.data?.id;
    if (eventId) {
      if (processedEvents.has(eventId)) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      const { data: existingEvent } = await db
        .from('webhook_events')
        .select('id')
        .eq('event_id', eventId)
        .single();
      if (existingEvent) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      await db.from('webhook_events').insert({
        event_id: eventId, event_name: eventName, payload, processed: true, processed_at: new Date().toISOString()
      });
      processedEvents.add(eventId);
      if (processedEvents.size > 1000) {
        const first = processedEvents.values().next().value;
        if (first) processedEvents.delete(first);
      }
    }
    
    // Extract all identifiers from payload
    const customData = payload.meta?.custom_data || payload.data?.attributes?.custom_data || {};
    const attrs = payload.data?.attributes || {};
    
    const userEmail = attrs.user_email || attrs.customer_email || customData.email || '';
    const customerId = attrs.customer_id?.toString() || '';
    const clerkUserId = customData.user_id || '';
    
    // subscription_id: only trust data.id for subscription_* events.
    // For order_created, data.id is the ORDER id — not a subscription id.
    const isSubscriptionEvent = eventName?.startsWith('subscription_');
    const subscriptionId = isSubscriptionEvent 
      ? payload.data?.id?.toString() || ''
      : '';
    
    const productId = attrs.product_id?.toString() || attrs.first_order_item?.product_id?.toString() || '';
    const productName = (attrs.product_name || attrs.first_order_item?.product_name || '').toLowerCase();
    
    console.log('Lemon Squeezy webhook:', JSON.stringify({
      event: eventName, email: userEmail, customerId, subscriptionId,
      clerkUserId: clerkUserId || 'none', product: productName, productId
    }, null, 2));
    
    // Only process PwnClaw products
    const isPwnClaw = PWNCLAW_PRODUCT_IDS.includes(productId) ||
      customData.source === 'pwnclaw' ||
      productName.includes('pwnclaw') || productName.includes('agent security');
    
    if (!isPwnClaw) {
      // If product_id is present but NOT a PwnClaw product → definitely not ours, skip.
      // Only proceed without product match if product_id is genuinely missing (rare edge case).
      if (productId) {
        console.log(`Ignoring non-PwnClaw product: "${productName}" (ID: ${productId})`);
        return NextResponse.json({ received: true, ignored: true });
      }
      
      // No product_id at all — only allow lifecycle events to proceed
      const isLifecycleEvent = ['order_refunded', 'subscription_paused', 'subscription_resumed',
        'subscription_unpaused', 'subscription_cancelled', 'subscription_expired',
        'subscription_payment_failed', 'subscription_payment_success',
        'subscription_payment_recovered', 'subscription_payment_refunded',
        'subscription_plan_changed', 'dispute_created', 'dispute_resolved'].includes(eventName);
      
      if (!isLifecycleEvent) {
        console.log(`Ignoring event without product info: ${eventName}`);
        return NextResponse.json({ received: true, ignored: true });
      }
      console.log(`Lifecycle event ${eventName} without product_id — proceeding with user lookup`);
    }

    const plan = detectPlan(productId, productName);
    const lookupOpts = { subscriptionId, customerId, clerkUserId, email: userEmail };

    switch (eventName) {
      case 'order_created':
      case 'subscription_created': {
        const found = await findUser(lookupOpts);
        
        if (found) {
          // Upgrade existing user + store Lemon IDs
          const updates: Record<string, any> = {
            plan,
            credits_remaining: PLAN_LIMITS[plan].credits,
          };
          if (customerId) updates.lemon_customer_id = customerId;
          if (subscriptionId) updates.lemon_subscription_id = subscriptionId;
          
          await db.from('users').update(updates).eq('id', found.user.id);
          console.log(`Upgraded ${found.user.email} to ${plan} (via ${found.method}). Lemon customer=${customerId}, sub=${subscriptionId}`);
        } else if (clerkUserId) {
          // User has Clerk ID but doesn't exist in DB yet (signed up via Lemon before visiting dashboard)
          const newEmail = userEmail || `${clerkUserId}@clerk.user`;
          const { data: newUser, error } = await db.from('users').insert({
            clerk_id: clerkUserId,
            email: newEmail,
            plan,
            credits_remaining: PLAN_LIMITS[plan].credits,
            credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lemon_customer_id: customerId || null,
            lemon_subscription_id: subscriptionId || null,
          }).select().single();
          
          if (newUser) {
            console.log(`Created user ${newEmail} with ${plan} plan (webhook, Clerk ID). Lemon customer=${customerId}`);
          } else {
            console.error(`Failed to create user:`, error);
          }
        } else {
          // NO Clerk ID available — cannot reliably link to a PwnClaw account.
          // Do NOT create a phantom user. Log for manual resolution.
          console.error(`[WEBHOOK] ${eventName}: Cannot match payment to user! No Clerk ID in custom_data. Email=${userEmail}, customer=${customerId}. Manual linking required.`);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const found = await findUser(lookupOpts);
        if (found) {
          await db.from('users').update({
            plan: 'free',
            credits_remaining: PLAN_LIMITS.free.credits
          }).eq('id', found.user.id);
          console.log(`Downgraded ${found.user.email} to Free (via ${found.method})`);
        } else {
          console.error(`[WEBHOOK] ${eventName}: User not found! customer=${customerId}, sub=${subscriptionId}, email=${userEmail}`);
        }
        break;
      }

      case 'subscription_payment_failed': {
        const found = await findUser(lookupOpts);
        if (found) {
          await db.from('users').update({
            plan: 'free',
            credits_remaining: PLAN_LIMITS.free.credits
          }).eq('id', found.user.id);
          console.log(`Payment failed — downgraded ${found.user.email} to Free (via ${found.method})`);
        } else {
          console.error(`[WEBHOOK] payment_failed: User not found! customer=${customerId}, email=${userEmail}`);
        }
        break;
      }

      case 'order_refunded': {
        // Refund — downgrade to free immediately
        const found = await findUser(lookupOpts);
        if (found) {
          await db.from('users').update({
            plan: 'free',
            credits_remaining: PLAN_LIMITS.free.credits,
            lemon_subscription_id: null, // Clear sub ID — subscription is void after refund
          }).eq('id', found.user.id);
          console.log(`Refunded — downgraded ${found.user.email} to Free (via ${found.method})`);
        } else {
          console.error(`[WEBHOOK] order_refunded: User not found! customer=${customerId}, email=${userEmail}`);
        }
        break;
      }

      case 'subscription_paused': {
        // Paused — downgrade to free but keep current credits (don't punish pausing)
        const found = await findUser(lookupOpts);
        if (found) {
          // Cap credits at free limit so they can't use Pro credits while paused
          const cappedCredits = Math.min(found.user.credits_remaining, PLAN_LIMITS.free.credits);
          await db.from('users').update({
            plan: 'free',
            credits_remaining: cappedCredits
          }).eq('id', found.user.id);
          console.log(`Paused — downgraded ${found.user.email} to Free, credits capped to ${cappedCredits} (via ${found.method})`);
        } else {
          console.error(`[WEBHOOK] subscription_paused: User not found! customer=${customerId}, email=${userEmail}`);
        }
        break;
      }

      case 'subscription_resumed':
      case 'subscription_unpaused': {
        // Resumed — restore paid plan with fresh credits (new billing cycle)
        const found = await findUser(lookupOpts);
        if (found) {
          const updates: Record<string, any> = {
            plan,
            credits_remaining: PLAN_LIMITS[plan].credits,
          };
          if (customerId) updates.lemon_customer_id = customerId;
          if (subscriptionId) updates.lemon_subscription_id = subscriptionId;
          
          await db.from('users').update(updates).eq('id', found.user.id);
          console.log(`Resumed — upgraded ${found.user.email} to ${plan} (via ${found.method})`);
        } else {
          console.error(`[WEBHOOK] subscription_resumed: User not found! customer=${customerId}, email=${userEmail}`);
        }
        break;
      }

      case 'subscription_payment_success': {
        // Successful payment — ensure user is on the correct plan.
        // Catches edge cases where user was wrongly downgraded.
        const found = await findUser(lookupOpts);
        if (found && found.user.plan === 'free') {
          await db.from('users').update({
            plan,
            credits_remaining: PLAN_LIMITS[plan].credits,
          }).eq('id', found.user.id);
          console.log(`Payment success — restored ${found.user.email} from Free to ${plan} (via ${found.method})`);
        } else if (found) {
          console.log(`Payment success for ${found.user.email} — already on ${found.user.plan}, no action needed`);
        }
        break;
      }

      case 'subscription_payment_recovered': {
        // Payment recovered after failure — restore paid plan
        const found = await findUser(lookupOpts);
        if (found) {
          await db.from('users').update({
            plan,
            credits_remaining: PLAN_LIMITS[plan].credits,
          }).eq('id', found.user.id);
          console.log(`Payment recovered — restored ${found.user.email} to ${plan} (via ${found.method})`);
        } else {
          console.error(`[WEBHOOK] payment_recovered: User not found! customer=${customerId}, email=${userEmail}`);
        }
        break;
      }

      case 'subscription_payment_refunded': {
        // Individual subscription payment refunded.
        // DON'T auto-downgrade — the subscription may still be active.
        // If the subscription is truly cancelled, subscription_cancelled will handle it.
        const found = await findUser(lookupOpts);
        console.warn(`[WEBHOOK] Payment refunded for ${found?.user?.email || userEmail}. customer=${customerId}. Subscription may still be active — NOT auto-downgrading. Monitor for subscription_cancelled.`);
        break;
      }

      case 'dispute_created': {
        // Chargeback — immediate downgrade
        const found = await findUser(lookupOpts);
        if (found) {
          await db.from('users').update({
            plan: 'free',
            credits_remaining: PLAN_LIMITS.free.credits,
            lemon_subscription_id: null,
          }).eq('id', found.user.id);
          console.error(`[DISPUTE] Chargeback! Downgraded ${found.user.email} to Free (via ${found.method}). Customer=${customerId}`);
        } else {
          console.error(`[DISPUTE] Chargeback but user not found! customer=${customerId}, email=${userEmail}`);
        }
        break;
      }

      case 'dispute_resolved': {
        // Dispute resolved — if we won, restore the plan
        // Note: Lemon doesn't tell us if we won or lost in the webhook.
        // Log for manual review. Don't auto-upgrade (could be resolved against us).
        const found = await findUser(lookupOpts);
        console.log(`[DISPUTE] Resolved for ${found?.user?.email || userEmail}. customer=${customerId}. CHECK MANUALLY if plan should be restored.`);
        break;
      }

      case 'subscription_plan_changed':
      case 'subscription_updated': {
        const found = await findUser(lookupOpts);
        if (found) {
          const updates: Record<string, any> = {};
          
          // Only change plan + credits if the plan actually changed
          const currentPlan = found.user.plan;
          if (currentPlan !== plan) {
            updates.plan = plan;
            updates.credits_remaining = PLAN_LIMITS[plan].credits;
            console.log(`Plan changed ${currentPlan} → ${plan} for ${found.user.email}`);
          }
          
          // Always update Lemon IDs if available (e.g. plan switch creates new subscription)
          if (customerId) updates.lemon_customer_id = customerId;
          if (subscriptionId) updates.lemon_subscription_id = subscriptionId;
          
          if (Object.keys(updates).length > 0) {
            await db.from('users').update(updates).eq('id', found.user.id);
          }
          console.log(`subscription_updated for ${found.user.email} (via ${found.method}), plan change: ${currentPlan !== plan}`);
        } else {
          console.error(`[WEBHOOK] subscription_updated: User not found! customer=${customerId}, email=${userEmail}`);
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
