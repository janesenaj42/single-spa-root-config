/**
 * Writes the browser-facing Keycloak client config from env vars, so the
 * Keycloak connection can be changed per-environment without rebuilding
 * the root-config image (same pattern as build-mfe-config.js).
 *
 * Env vars (all required):
 *   KEYCLOAK_URL        - e.g. http://localhost:8080 (browser-reachable)
 *   KEYCLOAK_REALM
 *   KEYCLOAK_CLIENT_ID
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function requireEnv(env, name) {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} for keycloak.json generation`);
  }
  return value;
}

export function buildKeycloakConfig(env) {
  return {
    url: requireEnv(env, 'KEYCLOAK_URL'),
    realm: requireEnv(env, 'KEYCLOAK_REALM'),
    clientId: requireEnv(env, 'KEYCLOAK_CLIENT_ID'),
  };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const OUTPUT_FILE = process.env.KEYCLOAK_OUTPUT_FILE || path.join(__dirname, '..', 'dist', 'keycloak.json');

  const config = buildKeycloakConfig(process.env);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  console.log(`Wrote Keycloak config to ${OUTPUT_FILE}`);
}
