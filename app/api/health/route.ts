import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  // version is the git SHA baked in at image build (BUILD_SHA); deploys assert the
  // live value matches what they just shipped, so a stale/no-op deploy fails loudly.
  return NextResponse.json({ status: 'ok', version: process.env.BUILD_SHA ?? 'dev' });
}
