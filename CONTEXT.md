# single-spa-root-config

A `single-spa` root config that registers microfrontends from YAML files
instead of hardcoded JS, with Keycloak-driven visibility. The demo theme
is a warehouse operations shell (navbar, assets grid, admin drawer, comms
widget).

## Language

**MFE tier**:
One of three visibility levels an MFE's YAML config declares: `public`
(always eligible), all-authenticated (default — no `public`, no
`requiredRoles`), or role-gated (`requiredRoles: [...]`).
_Avoid_: "permission level", "access level"

**Layout region**:
A named container element that exists in `public/index.html` before any
MFE mounts, used for content that must sit at a specific place in normal
document flow (e.g. `#navbar`, the only one left as `mfes/*.yaml` now
prefers auto-vivified containers even for full-screen/backdrop MFEs).
Contrast with an auto-vivified
container.
_Avoid_: "slot", "zone"

**Auto-vivified container**:
A container element root-config creates on the fly (appended to
`document.body`) because the MFE's configured `container` selector isn't
already present in `index.html`. Used by MFEs that position themselves
via CSS (`position: fixed`) rather than needing a specific place in
document flow — drawers, floating widgets. See ADR-0002.
_Avoid_: "dynamic mount point"

**Drawer**:
A panel that slides in from a screen edge and occupies a fraction of the
viewport (e.g. the admin panel, 25% width from the right), as opposed to
a full-page MFE or a small floating widget.
_Avoid_: "sidebar", "flyout"

**Cross-MFE event**:
A signal one MFE triggers to change another MFE's visible state, since
MFEs never call each other directly. Currently backed by `window`
`CustomEvent`s via `src/eventBus.js`, exposed to MFEs as
`publish`/`subscribe` through `customProps`. This is an interim
implementation — see ADR-0003 for its known limitations and the pending
emittery-vs-RxJS decision.
_Avoid_: "message bus" (implies more than currently exists), "pub/sub
library" (there isn't one yet)
