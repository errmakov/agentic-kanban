export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type AttendeeState = {
  count: number;
  controllers: Set<ReadableStreamDefaultController>;
};

const globalForAttendees = globalThis as typeof globalThis & {
  _attendees?: AttendeeState;
};

const state: AttendeeState = (globalForAttendees._attendees ??= {
  count: 0,
  controllers: new Set(),
});

const encoder = new TextEncoder();

function broadcast() {
  const payload = encoder.encode(`data: ${state.count}\n\n`);
  for (const controller of state.controllers) {
    try {
      controller.enqueue(payload);
    } catch {
      state.controllers.delete(controller);
    }
  }
}

export function GET() {
  let self: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(controller) {
      self = controller;
      state.controllers.add(controller);
      state.count += 1;
      broadcast();
    },
    cancel() {
      state.controllers.delete(self);
      state.count = Math.max(0, state.count - 1);
      broadcast();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
