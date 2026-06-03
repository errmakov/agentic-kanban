import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const TTL_MS = 60_000;
const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'attendee-sessions.json');

type Sessions = Record<string, number>;

async function readSessions(): Promise<Sessions> {
  try {
    const raw = await readFile(FILE, 'utf8');
    return JSON.parse(raw) as Sessions;
  } catch {
    return {};
  }
}

function prune(sessions: Sessions): Sessions {
  const cutoff = Date.now() - TTL_MS;
  const live: Sessions = {};
  for (const [id, ts] of Object.entries(sessions)) {
    if (ts > cutoff) live[id] = ts;
  }
  return live;
}

async function writeSessions(sessions: Sessions): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(sessions), 'utf8');
}

export async function GET() {
  const sessions = prune(await readSessions());
  await writeSessions(sessions);
  return NextResponse.json({ count: Object.keys(sessions).length });
}

export async function POST(request: Request) {
  const { sessionId } = (await request.json()) as { sessionId?: string };
  const sessions = prune(await readSessions());
  if (sessionId) sessions[sessionId] = Date.now();
  await writeSessions(sessions);
  return NextResponse.json({ count: Object.keys(sessions).length });
}
