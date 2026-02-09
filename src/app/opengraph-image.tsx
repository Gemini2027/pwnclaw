import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PwnClaw — AI Agent Security Testing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
        }}
      >
        <div style={{ fontSize: 80, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>🦝</span>
          <span style={{ color: '#22c55e', fontWeight: 'bold', fontFamily: 'monospace' }}>PWN</span>
          <span style={{ color: 'white', fontWeight: 'bold', fontFamily: 'monospace' }}>CLAW</span>
        </div>
        <div style={{ fontSize: 32, color: '#a3a3a3', marginTop: 24 }}>
          AI Agent Security Testing
        </div>
        <div style={{ fontSize: 20, color: '#525252', marginTop: 16 }}>
          112 Attacks • 14 Categories • Fix Instructions Included
        </div>
      </div>
    ),
    { ...size }
  );
}
