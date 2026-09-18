---
status: accepted
---

# Eliminate the shell from the root-config runtime image

For attack-surface reduction in production, the root-config image must
not contain a shell. `entrypoint.sh` was the only thing requiring
`/bin/sh` at runtime, so it's replaced by `bootstrap.js`: config
generation now calls the existing `loadConfigs`/`buildKeycloakConfig`
functions in-process, then execs nginx via `child_process.spawn` with no
shell involved. With no shell script left to run, busybox (Alpine's
provider of `/bin/sh` and every other shell utility) is removed too —
`apk del busybox` refuses, since nginx and alpine-baselayout declare it
as a dependency (almost certainly for nginx's OpenRC init-script
shebang, irrelevant here since nginx is exec'd directly, never through a
service manager) — so removal happens by hand: find every symlink
pointing at busybox and delete them plus the binary in **one** `rm`
call, not a loop of individual calls (`rm` is itself one of those
symlinks, so a loop breaks after the first call deletes `/bin/rm` out
from under the rest). This must also be the *last* shell-dependent `RUN`
in the Dockerfile, since Docker executes every `RUN` via `/bin/sh -c` —
once busybox is gone, no later `RUN` can execute at all.

## Considered options

- **Switch to Chainguard's images.** Prototyped first
  (`cgr.dev/chainguard/node`). Abandoned: their genuinely free tags
  still include a shell (same "distroless means no package manager, not
  no shell" ambiguity Alpine has once busybox is stripped), the truly
  shell-less variants weren't reliably available for anonymous pulls,
  and Wolfi's nginx package has real integration differences from
  Alpine's (no `http.d/*.conf` include convention, different pid file
  path) that would need solving regardless of which base is used. No
  demonstrated vulnerability-count benefit over the already-hardened
  Alpine image (both scan to 0 HIGH/CRITICAL).

## Consequences

Any future `Dockerfile` change to the final stage that adds a `RUN`
step needing a shell must land *before* the busybox-removal step, not
after — there's no shell left to catch the mistake, it just fails with
"exec: /bin/sh: no such file or directory".
