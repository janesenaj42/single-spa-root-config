---
status: accepted
---

# Auto-vivify MFE containers instead of requiring them in index.html

Every MFE's `container` was a CSS selector that had to already exist in
`index.html`, or single-spa would throw on mount. That meant *any* new
MFE — including purely floating ones like a chat widget or an admin
drawer that don't need a specific place in document flow — required an
`index.html` edit. root-config now creates a missing container itself
(appended to `document.body`, parsed from a simple `#id` or `.class`
selector) when the configured selector isn't found, via
`src/containers.js#getOrCreateContainer`.

## Considered options

- **Explicit `floating: true` config flag**, with root-config only
  auto-creating containers for MFEs that opt in. Rejected: it's an extra
  field to teach and get wrong, and there's no real downside to
  auto-creating for every MFE — an MFE whose container *is* already in
  `index.html` just gets that element back unchanged.

## Consequences

Auto-created containers always land at the end of `<body>`, in DOM
order. Irrelevant for anything `position: fixed` (drawers, floating
widgets — our current cases), but a future MFE that needs to sit at a
specific place in normal document flow (e.g. between the navbar and
main content, or above the navbar) still needs an explicit
`index.html` layout region — auto-vivification doesn't control order.
