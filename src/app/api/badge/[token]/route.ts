import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateBadgeSvg(score: number | null, grade: string): string {
  const label = 'PwnClaw';
  const value = score !== null ? `${score}/100 ${grade}` : 'no data';

  // Shields.io flat style
  const labelWidth = 54;
  const valueWidth = score !== null ? (grade === 'A' ? 56 : 56) : 52;
  const totalWidth = labelWidth + valueWidth;

  let color: string;
  if (score === null) {
    color = '#9f9f9f';
  } else if (score >= 80) {
    color = '#4c1'; // green
  } else if (score >= 60) {
    color = '#dfb317'; // yellow
  } else {
    color = '#e05d44'; // red
  }

  const labelX = labelWidth / 2;
  const valueX = labelWidth + valueWidth / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelX * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${label}</text>
    <text x="${labelX * 10}" y="140" transform="scale(.1)" fill="#fff">${label}</text>
    <text aria-hidden="true" x="${valueX * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${value}</text>
    <text x="${valueX * 10}" y="140" transform="scale(.1)" fill="#fff">${value}</text>
  </g>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  let { token } = await params;

  // Strip .svg suffix
  if (token.endsWith('.svg')) {
    token = token.slice(0, -4);
  }

  // Look up the test by token
  const { data: test } = await db
    .from('tests')
    .select('score, status')
    .eq('test_token', token)
    .single();

  let score: number | null = null;
  let grade = '?';

  if (test && test.status === 'completed' && test.score !== null) {
    score = test.score as number;
    grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  }

  const svg = generateBadgeSvg(score, grade);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
