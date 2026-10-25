// One passive scroll listener for the whole page, throttled to one callback batch per frame.
// Subscribers get the position and the change since the last frame, and write to the DOM
// themselves: nothing here touches React state, so scrolling never re-renders a component.

type Listener = (y: number, dy: number) => void;

const listeners = new Set<Listener>();
let lastY = 0;
let frame = 0;

function flush() {
  frame = 0;
  const y = scrollY;
  const dy = y - lastY;
  lastY = y;
  listeners.forEach((listener) => listener(y, dy));
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(flush);
}

export function subscribeScroll(listener: Listener) {
  if (!listeners.size) {
    lastY = scrollY;
    addEventListener("scroll", onScroll, { passive: true });
  }
  listeners.add(listener);
  listener(scrollY, 0);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}
