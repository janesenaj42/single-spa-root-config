const SIMPLE_TOKEN = /^[A-Za-z0-9_-]+$/;

export function parseSimpleSelector(selector) {
  const type = selector.startsWith('#') ? 'id' : selector.startsWith('.') ? 'class' : undefined;
  const name = type ? selector.slice(1) : undefined;

  if (!type || !SIMPLE_TOKEN.test(name)) {
    throw new Error(`Auto-created containers only support simple #id or .class selectors, got: "${selector}"`);
  }

  return { type, name };
}

/**
 * Returns the element matching `selector`, creating and appending one to
 * `doc.body` if it doesn't already exist. See ADR-0002.
 */
export function getOrCreateContainer(selector, doc = document) {
  const existing = doc.querySelector(selector);
  if (existing) return existing;

  const { type, name } = parseSimpleSelector(selector);
  const el = doc.createElement('div');
  if (type === 'id') {
    el.id = name;
  } else {
    el.className = name;
  }
  doc.body.appendChild(el);
  return el;
}
