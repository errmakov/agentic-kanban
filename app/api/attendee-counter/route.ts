import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ephemeral in-memory count. Each GET represents a new viewer arriving; the count
// is a live demo figure that doesn't need to survive a restart, so no persistence.
let count = 0;

export function GET() {
  count += 1;
  return NextResponse.json({ count });
}
