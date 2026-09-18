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
public: false                # optional, default false — see Authentication section
requiredRoles:                # optional — Keycloak realm roles, ANY of which grant access
  - admin
customProps:                 # optional, passed through to the MFE
  theme: dark
```

`entry` is fetched client-side via `System.import()`, so it must be an
address the user's browser can reach — not just something reachable inside
a Docker network (see the demo compose file, which publishes each demo MFE
on `localhost`).

The merge step (`scripts/build-mfe-config.js`) validates every file against
an `ajv` JSON schema and fails the build/startup on duplicate names or
malformed YAML (unknown fields, wrong types, missing required fields), so a
bad config can't silently break the shell — you get a filename + field-level
error instead.

## Why this split

- **`mfes/` is mounted, not baked into the image.** The container's
  `entrypoint.sh` regenerates `mfes.json` from the mounted directory at
  **startup**, not at image build time. That means updating which MFEs are
  registered (new app, new URL, new route) only needs an edit to a YAML
  file + a container restart — not a root-config rebuild/redeploy. Twenty
  teams can each own their own YAML file without touching root-config code.
- **root-config.js is generic.** It has no knowledge of any specific MFE —
  it just loops over whatever `mfes.json` contains.

## Authentication & role-based visibility (Keycloak)

Which MFEs are even eligible to mount now also depends on who's logged in,
not just the URL. Each YAML file can set:

- `public: true` — always eligible (subject to `activeWhen` still matching).
  Use this for shell pieces like the navbar that need to render a
  login/logout button for signed-out visitors too.
- `requiredRoles: [admin, finance]` — only eligible if the signed-in user
  holds at least one of these Keycloak **realm roles**. Omit it (with
  `public` unset/false) to mean "any authenticated user, no specific role."

`root-config.js` wraps each app's `activeWhen` in a function that checks,
in order: the route still has to match, then `public` short-circuits to
true, otherwise the user must be authenticated and hold a matching role.
Route matching and auth/role checks are independent — a route match with a
failed role check just means that container stays empty on that URL, it
doesn't error.

Auth itself is handled once, centrally, by `src/auth.js` using `keycloak-js`
— individual MFEs never talk to Keycloak directly. Every MFE receives
`isAuthenticated()`, `getToken()`, `login()`, `logout()` via `customProps`,
so an MFE that needs to call a protected API can grab the bearer token
without knowing anything about your Keycloak setup.

The Keycloak client config (`url`, `realm`, `clientId`) is generated at
container startup from `KEYCLOAK_URL` / `KEYCLOAK_REALM` /
`KEYCLOAK_CLIENT_ID` env vars into `keycloak.json` — same "no rebuild
needed" pattern as `mfes.json`. `KEYCLOAK_URL` must be reachable from the
**browser** (keycloak-js runs client-side), and in Keycloak's admin console
that client needs the root-config's origin in both "Valid redirect URIs"
and "Web origins".

## Run the demo

```
docker compose up --build
```

Open http://localhost:8090 (root-config no longer uses 8080, so it doesn't
collide with a Keycloak instance running there). Before it'll work you need
a real Keycloak reachable at the `KEYCLOAK_URL`/`KEYCLOAK_REALM`/
`KEYCLOAK_CLIENT_ID` set in `docker-compose.yml` — point those at your
existing Keycloak, create/confirm a client for this app, and set its
redirect URI / web origin to `http://localhost:8090/*`.

The navbar MFE is `public`, so it always mounts and shows a Login/Logout
button. "Dashboard" requires being logged in (any role); "Settings"
additionally requires the `admin` realm role — log in as a user without
that role and the Settings link still routes, but nothing mounts into
`#main`. Three throwaway nginx containers (`navbar-mfe`, `dashboard-mfe`,
`settings-mfe`) stand in for real MFE deployments.

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
2. Add `mfes/<name>.yaml` with `name`, `entry`, `container`, `activeWhen`,
   and `public`/`requiredRoles` if it needs to be gated by login or role.
3. If it mounts into a new region, add a matching `<div id="...">` in
   `public/index.html` and rebuild the root-config image (layout shell
   changes are the one thing that still touches root-config's HTML).
4. Restart the root-config container (or redeploy, if `mfes/` lives outside
   the container image in your setup — e.g. synced from a git repo or
   config service).

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
