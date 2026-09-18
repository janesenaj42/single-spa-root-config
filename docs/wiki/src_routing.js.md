# File: src/routing.js

# src/routing.js

## Overview

`src/routing.js` is a javascript source file in the Application layer.

It exposes 2 public symbols.

## Public API

| Symbol | Kind | Signature |
| --- | --- | --- |
| `matchesActiveWhen` | function | function matchesActiveWhen(activeWhen, pathname) |
| `isAppActive` | function | function isAppActive(app, pathname, authState) |

## Used by

Imported by 2 files in this repository.

**`src`**

- `src/root-config.js`

**`test`**

- `test/routing.test.js`

## Usage Notes

**Layer:** Application | **Role:** internal to its layer

## Questions this page answers

- What does `src/routing.js` export?
- Where is `matchesActiveWhen` defined?
- What imports `src/routing.js`?

## In the code

function matches pattern pathname const segments split filter boolean path length return false every segment starts with export active when patterns array some decides whether mfe should for given url auth state route matching and the public role check are independent mismatch always wins regardless app true authenticated has any required roles

---

*Built from the code itself: parsed symbols, the import graph, git history and
the knowledge graph. Every statement here is checked against the source rather
than written about it.*