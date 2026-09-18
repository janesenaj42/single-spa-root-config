# single-spa root config, driven by YAML

A `single-spa` root config where **registering a microfrontend is a YAML
edit, not a code change**. Each MFE gets one YAML file describing its
entry point, mount point, route, and who's allowed to see it. A small
script merges those files into a manifest the shell fetches at load time —
so adding, removing, or repointing an MFE never touches root-config's
JS/HTML, and 20 different teams can each own their own file.

Fully containerized, with a working `docker compose` demo that includes a
real Keycloak instance, three example MFEs, and three visibility tiers
(public / any logged-in user / role-gated).

- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [MFE config reference](#mfe-config-reference)
- [Authentication & role-based visibility](#authentication--role-based-visibility-keycloak)
- [Project layout](#project-layout)
- [Adding a real MFE](#adding-a-real-mfe)
- [Development](#development)
- [Scaling past the MVP](#scaling-past-the-mvp)

## Quick start

```
docker compose up --build
```

Give Keycloak ~10-15s to finish starting and importing its demo realm,
then open **http://localhost:8090**. Check `docker compose logs keycloak`
for `Realm 'root-config-demo' imported` if the login redirect errors out.

The navbar MFE is public, so it always mounts and shows a Login/Logout
button.

| Try it as | Password | You'll see |
|---|---|---|
| (stay logged out) | — | navbar only |
| **bob** | `password` | navbar + dashboard |
| **alice** | `password` | navbar + dashboard + settings |

Three throwaway nginx containers (`navbar-mfe`, `dashboard-mfe`,
`settings-mfe`) stand in for real MFE deployments — see
[Adding a real MFE](#adding-a-real-mfe) to replace them with actual apps.

To see a config-only change take effect, edit e.g. `mfes/settings.yaml`
then `docker compose restart root-config` — no rebuild needed, since
`mfes/` is a mounted volume, not baked into the image.

## How it works

```
mfes/*.yaml  --(build-mfe-config.js)-->  dist/mfes.json  --(fetch)-->  root-config.js  --(registerApplication)-->  single-spa
```

- **`mfes/` is mounted, not baked into the image.** The container's
  `entrypoint.sh` regenerates `mfes.json` from the mounted directory at
  **startup**, not at image build time. Updating which MFEs are
  registered only needs a YAML edit + a container restart — not a
  root-config rebuild/redeploy.
- **root-config.js is generic.** It has no knowledge of any specific MFE;
  it just loops over whatever `mfes.json` contains and calls
  `registerApplication()`.
- **Validation is centralized.** `scripts/build-mfe-config.js` validates
  every YAML file against an `ajv` JSON schema and fails the
  build/startup on duplicate names or malformed config (unknown fields,
  wrong types, missing required fields) — you get a filename +
  field-level error instead of a silently broken shell.

## MFE config reference

```yaml
name: dashboard              # unique app name
entry: "https://cdn.example.com/dashboard/dashboard.js"   # SystemJS bundle URL, loaded by the BROWSER
container: "#main"           # CSS selector the app mounts into
activeWhen: "/dashboard"     # single-spa route prefix (string or array)
public: false                # optional, default false — see Authentication section
requiredRoles:                # optional — Keycloak realm roles, ANY of which grant access
  - admin
customProps:                 # optional, passed through to the MFE
  theme: dark
```

`entry` is fetched client-side via `System.import()`, so it must be an
address the user's **browser** can reach — not just something reachable
inside a Docker network (see `docker-compose.yml`, which publishes each
demo MFE on `localhost`).

## Authentication & role-based visibility (Keycloak)

Which MFEs are even eligible to mount depends on who's logged in, not
just the URL. Each MFE is one of three tiers, set in its YAML file:

| Tier | YAML | Example |
|---|---|---|
| Public | `public: true` | `navbar` — always mounts, shows a Login/Logout button even for signed-out visitors |
| All authenticated users | neither `public` nor `requiredRoles` set | `dashboard` — mounts for anyone logged in, regardless of role |
| Selected users by role | `requiredRoles: [admin, finance]` | `settings` — only mounts if the user holds at least one of these Keycloak **realm roles** |

`root-config.js` wraps each app's `activeWhen` in a function that checks,
in order: the route still has to match, then `public` short-circuits to
true, otherwise the user must be authenticated and hold a matching role.
Route matching and auth/role checks are independent — a route match with a
failed role check just means that container stays empty on that URL, it
doesn't error. (This decision logic lives in `src/routing.js#isAppActive`,
unit tested in `test/routing.test.js`.)

Auth itself is handled once, centrally, by `src/auth.js` using `keycloak-js`
— individual MFEs never talk to Keycloak directly. Every MFE receives
`isAuthenticated()`, `getToken()`, `login()`, `logout()` via `customProps`,
so an MFE that needs to call a protected API can grab the bearer token
without knowing anything about your Keycloak setup.

The Keycloak client config (`url`, `realm`, `clientId`) is generated at
container startup from `KEYCLOAK_URL` / `KEYCLOAK_REALM` /
`KEYCLOAK_CLIENT_ID` env vars into `keycloak.json` — same "no rebuild
needed" pattern as `mfes.json`. `KEYCLOAK_URL` must be reachable from the
**browser** (keycloak-js runs client-side).

### The demo's Keycloak

`docker-compose.yml` runs a real Keycloak (`quay.io/keycloak/keycloak`) on
**8180** (not 8080, so it doesn't collide with an unrelated Keycloak you
might already have running on this machine), and imports
`keycloak/realm-export.json` on startup — no manual admin-console setup
needed. That realm (`root-config-demo`) pre-seeds:

- A public client `root-config` with redirect URI / web origin
  `http://localhost:8090/*` (PKCE, no client secret — this is a browser SPA).
- Two realm roles: `user`, `admin`.
- Two demo users, password `password` for both: **alice** (`user`+`admin`)
  and **bob** (`user` only).

`directAccessGrantsEnabled` is turned on for that client purely so the
setup can be sanity-checked with `curl` (password grant) without a
browser; the app itself uses the standard authorization-code + PKCE flow.
The admin console is at http://localhost:8180 (`admin` / `admin`, from
`KC_BOOTSTRAP_ADMIN_USERNAME` / `KC_BOOTSTRAP_ADMIN_PASSWORD`) if you want
to inspect or extend the realm.

**This realm is for the demo only.** For a real deployment, point
`KEYCLOAK_URL` / `KEYCLOAK_REALM` / `KEYCLOAK_CLIENT_ID` at your actual
Keycloak instead of running one from this compose file.

## Project layout

```
mfes/*.yaml                 One file per MFE — this is what teams actually edit day-to-day.
src/root-config.js          Bootstraps single-spa: fetches mfes.json, registers every app.
src/routing.js              Pure route + public/auth/role gating logic (unit tested).
src/auth.js                 Centralized Keycloak client (keycloak-js).
scripts/build-mfe-config.js Merges + ajv-validates mfes/*.yaml into dist/mfes.json.
scripts/build-keycloak-config.js  Writes dist/keycloak.json from KEYCLOAK_* env vars.
test/                       node --test unit tests for the two scripts above.
demo-mfes/                  Three throwaway example MFEs used by the compose demo.
keycloak/realm-export.json  Demo realm auto-imported by the Keycloak container.
docker/                     nginx.conf + entrypoint.sh baked into the runtime image.
Dockerfile                  3-stage build: deps -> esbuild bundle -> nginx + node runtime.
docker-compose.yml          Full demo stack: root-config + Keycloak + 3 demo MFEs.
```

## Adding a real MFE

1. Deploy the MFE's SystemJS bundle somewhere reachable by browsers.
2. Add `mfes/<name>.yaml` with `name`, `entry`, `container`, `activeWhen`,
   and `public`/`requiredRoles` if it needs to be gated by login or role.
3. If it mounts into a new region, add a matching `<div id="...">` in
   `public/index.html` and rebuild the root-config image (layout shell
   changes are the one thing that still touches root-config's HTML).
4. Restart the root-config container (or redeploy, if `mfes/` lives outside
   the container image in your setup — e.g. synced from a git repo or
   config service).

## Development

```
npm install     # also wires up git hooks via husky's "prepare" script
npm run build   # bundles root-config.js and merges mfes/*.yaml into dist/
npm run serve   # serves dist/ on :8080
npm test        # node's built-in test runner
npm run lint    # eslint
```

### Commit messages & releases

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, etc.), enforced on
`git commit` by husky + commitlint (`commitlint.config.js`). A pre-commit
hook also runs `npm run lint && npm test`.

> Both hooks skip themselves with a warning if `npm`/`npx` aren't on
> `PATH`, so they degrade gracefully on a machine without Node installed
> locally (e.g. if you only ever run this project through Docker) —
> they just won't enforce anything in that case.

Versioning and `CHANGELOG.md` generation are driven by those commit types
via [`commit-and-tag-version`](https://github.com/absolute-version/commit-and-tag-version)
(the maintained drop-in replacement for the now-unmaintained
`standard-version` — same CLI and config):

```
npm run release   # bumps version per commit history, updates CHANGELOG.md, tags
```

### CI

`.github/workflows/ci.yml` runs on every push/PR: unit tests, `ajv`
validation of the real `mfes/*.yaml` files, and a check that the Docker
image still builds.

## Scaling past the MVP

This is intentionally minimal. Natural next steps as you grow past a
handful of MFEs:

- ~~Schema validation~~ — done: `build-mfe-config.js` validates every YAML
  file against an `ajv` JSON schema.
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
