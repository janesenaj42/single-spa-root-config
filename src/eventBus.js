/**
 * Naive interim cross-MFE event bus backed by CustomEvents on an
 * EventTarget (window in the browser). See ADR-0003 for why this
 * exists and its known limitations.
 */
export function createEventBus(target) {
  return {
    publish(topic, detail) {
      target.dispatchEvent(new CustomEvent(topic, { detail }));
    },
    subscribe(topic, handler) {
      const listener = (event) => handler(event.detail);
      target.addEventListener(topic, listener);
      return () => target.removeEventListener(topic, listener);
    },
  };
}
