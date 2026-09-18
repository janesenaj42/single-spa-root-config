# File: src/eventBus.js

# src/eventBus.js

## Overview

Naive interim cross-MFE event bus backed by CustomEvents on an
EventTarget (window in the browser). See ADR-0003 for why this
exists and its known limitations.

It exposes 1 public symbol.

## Public API

| Symbol | Kind | Signature |
| --- | --- | --- |
| `createEventBus` | function | function createEventBus(target) |

## Used by

Imported by 2 files in this repository.

**`src`**

- `src/root-config.js`

**`test`**

- `test/eventBus.test.js`

## Usage Notes

**Layer:** Application | **Role:** internal to its layer

## Questions this page answers

- What does `src/eventBus.js` export?
- Where is `createEventBus` defined?
- What imports `src/eventBus.js`?

## In the code

naive interim cross mfe event bus backed custom events target window the browser see adr for why this exists and its known limitations export function create return publish topic detail dispatch new subscribe handler const listener add remove

---

*Built from the code itself: parsed symbols, the import graph, git history and
the knowledge graph. Every statement here is checked against the source rather
than written about it.*