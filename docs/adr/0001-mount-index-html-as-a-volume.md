---
status: accepted
---

# Mount index.html as a volume instead of baking it into the image

The layout shell (`public/index.html`) was baked into the root-config
image at build time, meaning adding a new in-flow layout region required
an image rebuild — inconsistent with `mfes/*.yaml`, which already update
without a rebuild via a mounted volume. We now bind-mount
`public/index.html` over the built copy in the container, so editing it
on the host takes effect on next page load with no rebuild *and* no
restart (nginx re-reads static files from disk per request). The
trade-off: the layout shell's markup is no longer pinned to a specific
image version, so a rollback of the root-config image won't roll back an
in-place `index.html` edit — deploy tooling that manages this file needs
to account for that separately from the image tag.
