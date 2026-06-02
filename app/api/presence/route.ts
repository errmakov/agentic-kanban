import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STALE_MS = 60_000;

function storagePath() {
  return path.join(process.env.DATA_DIR ?? './data', 'presence.json');
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = body?.id;
  if (typeof id !== 'string' || id.length === 0) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const file = storagePath();
  await mkdir(path.dirname(file), { recursive: true });

  let data: Record<string, number> = {};
  try {
    data = JSON.parse(await readFile(file, 'utf8'));
  } catch {
    data = {};
  }

  const now = Date.now();
  data[id] = now;
  for (const key of Object.keys(data)) {
    if (now - data[key] > STALE_MS) {
      delete data[key];
    }
  }

  await writeFile(file, JSON.stringify(data));

  return NextResponse.json({ count: Object.keys(data).length });
}
