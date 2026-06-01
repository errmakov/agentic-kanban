export const dynamic = 'force-dynamic';

// Counts are per-process; with multiple server instances each tracks its own
// connections. That's acceptable for a live demo.
const controllers = new Set<ReadableStreamDefaultController>();

const encoder = new TextEncoder();

function broadcast(count: number) {
  for (const controller of controllers) {
    controller.enqueue(encoder.encode(`data: ${count}\n\n`));
  }
}

export function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      controllers.add(controller);
      broadcast(controllers.size);

      request.signal.addEventListener('abort', () => {
        controllers.delete(controller);
        broadcast(controllers.size);
      });
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
