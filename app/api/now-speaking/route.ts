import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'now-speaking.json');

async function readTitle(): Promise<string> {
  try {
    const raw = await fs.readFile(dataFile, 'utf-8');
    const parsed = JSON.parse(raw) as { title?: unknown };
    return typeof parsed.title === 'string' ? parsed.title : '';
  } catch {
    return '';
  }
}

export async function GET() {
  return NextResponse.json({ title: await readTitle() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { title?: unknown } | null;
  if (!body || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'title must be a string' }, { status: 400 });
  }
  const title = body.title;
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify({ title }), 'utf-8');
  return NextResponse.json({ title });
}
