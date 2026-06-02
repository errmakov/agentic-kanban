import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dataDir = process.env.DATA_DIR ?? './data';

  try {
    await fs.mkdir(dataDir, { recursive: true });
    const raw = await fs.readFile(path.join(dataDir, 'break.json'), 'utf-8');
    const parsed = JSON.parse(raw) as { breakAt?: string };
    const breakAt = parsed.breakAt;

    if (typeof breakAt !== 'string' || Number.isNaN(Date.parse(breakAt))) {
      return NextResponse.json({ breakAt: null });
    }
    if (Date.parse(breakAt) <= Date.now()) {
      return NextResponse.json({ breakAt: null });
    }
    return NextResponse.json({ breakAt });
  } catch {
    return NextResponse.json({ breakAt: null });
  }
}
