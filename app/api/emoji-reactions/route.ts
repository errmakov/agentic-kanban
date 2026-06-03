import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_EMOJIS = ['👍', '❤️', '🔥', '🤔', '👏'];

function dataFilePath() {
  const dir = process.env.DATA_DIR ?? './data';
  return { dir, file: path.join(dir, 'emoji-reactions.json') };
}

async function readCounts(): Promise<Record<string, number>> {
  const { file } = dataFilePath();
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw).counts ?? {};
  } catch {
    return {};
  }
}

async function writeCounts(counts: Record<string, number>): Promise<void> {
  const { dir, file } = dataFilePath();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify({ counts }), 'utf-8');
}

export async function GET() {
  const counts = await readCounts();
  return NextResponse.json({ counts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { emoji } = body as { emoji: string };

  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await writeCounts(counts);

  return NextResponse.json({ counts });
}
