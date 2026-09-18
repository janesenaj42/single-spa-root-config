---
status: proposed (interim)
---

# Interim cross-MFE event bus via window CustomEvents

The navbar needs to toggle the admin drawer open — a different MFE,
mounted separately, that navbar can't call directly (single-spa MFEs
don't call each other's code). Cross-MFE communication is a bigger
open problem than this one interaction: the team is deciding between
`emittery` and RxJS and hasn't settled it (emittery has no built-in
topic discovery; RxJS brings more async-composition power but more
concepts to learn). Rather than block this feature on that decision, or
wire raw `window.dispatchEvent`/`addEventListener` calls directly into
MFE code, `src/eventBus.js` wraps `window` `CustomEvent`s behind a
`publish(topic, detail)` / `subscribe(topic, handler)` pair, exposed to
every MFE via `customProps` (same pattern as `isAuthenticated`/
`getToken` for auth) so the *call sites* in MFE code don't change
regardless of what backs them.

## Consequences

This is deliberately naive and known to be incomplete:

- **No topic discovery.** MFEs agree on topic name strings (e.g.
  `warehouse:admin-panel:toggle`) out of band — there's no registry of
  what topics exist or who's listening.
- **No async composition.** No debouncing, buffering, backpressure, or
  operator chaining — fine for a one-off toggle signal, not a
  general-purpose message bus.

TODO: revisit once the emittery-vs-RxJS decision lands; `eventBus.js` is
the one place that should need to change.
