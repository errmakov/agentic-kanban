import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'now-speaking.json');

async function readSession(): Promise<string> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return typeof parsed.session === 'string' ? parsed.session : '';
  } catch {
    return '';
  }
}

export async function GET() {
  return NextResponse.json({ session: await readSession() });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const session = typeof body.session === 'string' ? body.session : '';
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify({ session }), 'utf-8');
  return NextResponse.json({ session });
}
