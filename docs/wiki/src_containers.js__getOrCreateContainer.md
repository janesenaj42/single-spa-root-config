# Symbol: src/containers.js::getOrCreateContainer

# getOrCreateContainer

**Kind:** function | **Defined in:** `src/containers.js` | **Estimated complexity:** 3

```
function getOrCreateContainer(selector, doc = document)
```

## Overview

`getOrCreateContainer` is a function defined in `src/containers.js`. It carries no docstring.

## Where it is used

Reached by 1 resolved call.

- `bootstrap` in `src/root-config.js`

## Files importing this module

2 files import the module that defines it. These are import-level references, not confirmed call sites.

- `src/root-config.js`
- `test/containers.test.js`

## Implementation

```
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
```

## Questions this page answers

- Where is `getOrCreateContainer` defined?
- What is `src.containers.getOrCreateContainer`?
- What calls `getOrCreateContainer`?

---

*Built from the code itself: parsed symbols, the import graph, git history and
the knowledge graph. Every statement here is checked against the source rather
than written about it.*