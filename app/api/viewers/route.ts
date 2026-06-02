import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const EXPIRY_MS = 45_000;

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'viewers.json');

async function readViewers(): Promise<Record<string, number>> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  await mkdir(dataDir, { recursive: true });
  const viewers = await readViewers();

  const now = Date.now();
  if (id) {
    viewers[id] = now;
  }

  for (const [key, lastSeen] of Object.entries(viewers)) {
    if (now - lastSeen > EXPIRY_MS) {
      delete viewers[key];
    }
  }

  await writeFile(filePath, JSON.stringify(viewers));

  return NextResponse.json({ count: Object.keys(viewers).length });
}
