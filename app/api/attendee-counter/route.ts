import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

type ViewerMap = { viewers: Record<string, number> };

const TTL_MS = 30_000;

function dataPath() {
  const dir = process.env.DATA_DIR ?? './data';
  return path.join(dir, 'attendee-counter.json');
}

async function readViewers(): Promise<ViewerMap> {
  try {
    const raw = await fs.readFile(dataPath(), 'utf-8');
    return JSON.parse(raw) as ViewerMap;
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { viewers: {} };
    throw e;
  }
}

function pruned(data: ViewerMap): ViewerMap {
  const cutoff = Date.now() - TTL_MS;
  const viewers: Record<string, number> = {};
  for (const [id, ts] of Object.entries(data.viewers)) {
    if (ts >= cutoff) viewers[id] = ts;
  }
  return { viewers };
}

async function writeViewers(data: ViewerMap): Promise<void> {
  const file = dataPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data));
}

export async function GET() {
  const data = pruned(await readViewers());
  return NextResponse.json({ count: Object.keys(data.viewers).length });
}

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as { id: string };
  const data = pruned(await readViewers());
  data.viewers[id] = Date.now();
  await writeViewers(data);
  return NextResponse.json({ count: Object.keys(data.viewers).length });
}
