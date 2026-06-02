import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// No auth: this is a workshop companion on a trusted LAN, so an unauthenticated
// PUT is acceptable for a single operator.
const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'now-speaking.json');

export async function GET() {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const { session } = JSON.parse(raw) as { session?: string };
    return NextResponse.json({ session: session || null });
  } catch {
    return NextResponse.json({ session: null });
  }
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { session?: string };
  const session = (body.session ?? '').trim();

  if (!session) {
    return NextResponse.json({ session: null });
  }

  await mkdir(dataDir, { recursive: true });
  // Not atomic, but a single operator setting the current session is low-stakes.
  await writeFile(dataFile, JSON.stringify({ session }), 'utf8');
  return NextResponse.json({ session });
}
