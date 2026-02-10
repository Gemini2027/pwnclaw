import { ImageResponse } from 'next/og';
import { getPost } from '@/lib/blog';

export const runtime = 'nodejs';
export const alt = 'PwnClaw Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title || 'PwnClaw Blog';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        <div style={{ fontSize: 36, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <span>🦝</span>
          <span style={{ color: '#22c55e', fontWeight: 'bold', fontFamily: 'monospace' }}>PWN</span>
          <span style={{ color: 'white', fontWeight: 'bold', fontFamily: 'monospace' }}>CLAW</span>
          <span style={{ color: '#525252', fontFamily: 'monospace', marginLeft: 8 }}>BLOG</span>
        </div>
        <div
          style={{
            fontSize: title.length > 80 ? 36 : 44,
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: '90%',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 18, color: '#525252', marginTop: 32 }}>
          pwnclaw.com/blog
        </div>
      </div>
    ),
    { ...size }
  );
}
