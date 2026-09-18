# single-spa root config, driven by YAML

Instead of hardcoding `registerApplication()` calls for every microfrontend,
each MFE gets one YAML file under `mfes/`. A small script merges them into a
`mfes.json` manifest that `root-config.js` fetches at page load and uses to
register every app with `single-spa`. Adding, removing, or repointing an MFE
is a YAML edit — root-config's JS/HTML never changes.

## How it works

```
mfes/*.yaml  --(build-mfe-config.js)-->  dist/mfes.json  --(fetch)-->  root-config.js  --(registerApplication)-->  single-spa
```

Each YAML file:

```yaml
name: dashboard              # unique app name
entry: "https://cdn.example.com/dashboard/dashboard.js"   # SystemJS bundle URL, loaded by the BROWSER
container: "#main"           # CSS selector the app mounts into
activeWhen: "/dashboard"     # single-spa route prefix (string or array)
customProps:                 # optional, passed through to the MFE
  theme: dark
```

`entry` is fetched client-side via `System.import()`, so it must be an
address the user's browser can reach — not just something reachable inside
a Docker network (see the demo compose file, which publishes each demo MFE
on `localhost`).

The merge step (`scripts/build-mfe-config.js`) validates required fields
(`name`, `entry`, `activeWhen`) and fails the build/startup on duplicate
names or malformed YAML, so a bad config can't silently break the shell.

## Why this split

- **`mfes/` is mounted, not baked into the image.** The container's
  `entrypoint.sh` regenerates `mfes.json` from the mounted directory at
  **startup**, not at image build time. That means updating which MFEs are
  registered (new app, new URL, new route) only needs an edit to a YAML
  file + a container restart — not a root-config rebuild/redeploy. Twenty
  teams can each own their own YAML file without touching root-config code.
- **root-config.js is generic.** It has no knowledge of any specific MFE —
  it just loops over whatever `mfes.json` contains.

## Run the demo

```
docker compose up --build
```

Open http://localhost:8080. The navbar MFE is always mounted; click
"Dashboard" / "Settings" to see `single-spa` route between the other two
MFEs, each defined purely by a YAML file in `mfes/`. Three throwaway nginx
containers (`navbar-mfe`, `dashboard-mfe`, `settings-mfe`) stand in for real
MFE deployments.

To see config-only changes take effect: edit e.g. `mfes/settings.yaml`
(change `activeWhen` or `customProps`), then:

```
docker compose restart root-config
```

No rebuild needed — only the mounted `mfes/` directory changed.

## Local dev without Docker

```
npm install
npm run build        # bundles root-config.js and merges mfes/*.yaml
npm run serve        # serves dist/ on :8080
```

## Adding a real MFE

1. Deploy the MFE's SystemJS bundle somewhere reachable by browsers.
2. Add `mfes/<name>.yaml` with `name`, `entry`, `container`, `activeWhen`.
3. If it mounts into a new region, add a matching `<div id="...">` in
   `public/index.html` and rebuild the root-config image (layout shell
   changes are the one thing that still touches root-config's HTML).
4. Restart the root-config container (or redeploy, if `mfes/` lives outside
   the container image in your setup — e.g. synced from a git repo or
   config service).

## Scaling past the MVP

This is intentionally minimal. Natural next steps as you grow past a
handful of MFEs:

- **Schema validation** — swap the hand-rolled checks in
  `build-mfe-config.js` for `ajv`/`zod` with a proper JSON schema, so
  teams get precise error messages.
- **Per-environment overlays** — `mfes/prod/*.yaml`, `mfes/staging/*.yaml`,
  selected via `MFE_CONFIG_DIR`, instead of one shared set.
- **Hot reload without a restart** — a file watcher (`chokidar`) that
  regenerates `mfes.json` on change, paired with an SSE/WebSocket ping to
  the browser to prompt `registerApplication`/`unregisterApplication` diffs
  instead of a full page reload.
- **Config as a service** — for 20+ teams, move `mfes/` out of a mounted
  directory into a tiny CRUD API (backed by git or a database) with an
  admin UI, so teams don't need filesystem/container access to change
  their own entry.
- **Declarative layout** — if MFEs need to nest, redirect, or share layout
  regions in more complex ways than "prefix route into a named div", look
  at [`single-spa-layout`](https://single-spa.js.org/docs/layout-overview)
  and mirror its JSON schema in YAML instead of this flat one.
