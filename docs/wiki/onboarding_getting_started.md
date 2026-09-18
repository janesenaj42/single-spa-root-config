# Getting Started

# Getting Started






## From the README

Quoted verbatim from the repository's setup documentation.

### Quickstart — `README.md`

```
docker compose up --build
```

Give Keycloak ~10-15s to finish starting and importing its demo realm,
then open **http://localhost:8090**. Check `docker compose logs keycloak`
for `Realm 'root-config-demo' imported` if the login redirect errors out.

The navbar and the comms bubble (bottom-right) are public, so they're
always there.

| Try it as | Password | You'll see |
|---|---|---|
| (stay logged out) | — | navbar + comms bubble |
| **bob** | `password` | + Assets page (`/assets`) |
| **alice** | `password` | + Assets, + an "Admin" button in the navbar that opens a drawer |

Five throwaway nginx containers (`navbar-mfe`, `assets-mfe`,
`admin-panel-mfe`, `comms-mfe`, plus `keycloak`) stand in for a real
deployment — see [Adding a real MFE](#adding-a-real-mfe) to replace them.

To see




## Declared scripts

- From `.`: `npm run build` (declared by `package.json` as `npm run build:js && npm run build:config`)

- From `.`: `npm run test` (declared by `package.json` as `node --test test/`)

- From `.`: `npm run lint` (declared by `package.json` as `eslint .`)

- From `.`: `npm run build:config` (declared by `package.json` as `node scripts/build-mfe-config.js`)

- From `.`: `npm run build:js` (declared by `package.json` as `node build.js`)

- From `.`: `npm run build:keycloak-config` (declared by `package.json` as `node scripts/build-keycloak-config.js`)

- From `.`: `npm run prepare` (declared by `package.json` as `husky || true`)

- From `.`: `npm run release` (declared by `package.json` as `commit-and-tag-version`)

- From `.`: `npm run serve` (declared by `package.json` as `npx http-server dist -p 8080 -c-1`)






---

*Built from the code's structure. It states what is there, not why it is that
way. The explanatory prose is a separate, model-written layer.*