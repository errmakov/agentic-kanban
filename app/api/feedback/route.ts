import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function storagePath() {
  return path.join(process.env.DATA_DIR ?? './data', 'feedback.json');
}

async function readTallies(file: string): Promise<{ up: number; down: number }> {
  try {
    const data = JSON.parse(await readFile(file, 'utf8'));
    return { up: Number(data.up) || 0, down: Number(data.down) || 0 };
  } catch {
    return { up: 0, down: 0 };
  }
}

export async function GET() {
  return NextResponse.json(await readTallies(storagePath()));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { vote?: unknown } | null;
  const vote = body?.vote;
  if (vote !== 'up' && vote !== 'down') {
    return NextResponse.json({ error: 'vote must be "up" or "down"' }, { status: 400 });
  }

  const file = storagePath();
  await mkdir(path.dirname(file), { recursive: true });

  const tallies = await readTallies(file);
  tallies[vote] += 1;

  await writeFile(file, JSON.stringify(tallies));

  return NextResponse.json(tallies);
}
