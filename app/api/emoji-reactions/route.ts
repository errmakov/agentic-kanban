import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_EMOJI = ['👍', '❤️', '😂', '🎉', '🤯'];

function dataPath() {
  const dir = process.env.DATA_DIR ?? './data';
  return path.join(dir, 'emoji-reactions.json');
}

async function readCounts(): Promise<Record<string, number>> {
  try {
    const raw = await fs.readFile(dataPath(), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return Object.fromEntries(ALLOWED_EMOJI.map((e) => [e, 0]));
  }
}

async function writeCounts(counts: Record<string, number>) {
  const p = dataPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  // NOTE: read-modify-write race is acceptable for a live-demo context
  await fs.writeFile(p, JSON.stringify(counts));
}

export async function GET() {
  const counts = await readCounts();
  return NextResponse.json({ counts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { emoji } = body as { emoji: unknown };

  if (typeof emoji !== 'string' || !ALLOWED_EMOJI.includes(emoji)) {
    return NextResponse.json({ error: 'Unknown emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await writeCounts(counts);

  return NextResponse.json({ counts });
}
