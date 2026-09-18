/**
 * Replaces entrypoint.sh. Runs config generation in-process (no
 * subprocess/shell needed for that part - just calls the same functions
 * the CLI scripts export) then execs nginx directly via child_process,
 * with no shell involved anywhere in this file or its invocation.
 *
 * Written so the final image's ENTRYPOINT can be ["node", "bootstrap.js"]
 * with no /bin/sh required at runtime.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { loadConfigs } from './scripts/build-mfe-config.js';
import { buildKeycloakConfig } from './scripts/build-keycloak-config.js';

function writeJson(outputFile, data) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
}

const mfeConfigDir = process.env.MFE_CONFIG_DIR;
const mfeOutputFile = process.env.MFE_OUTPUT_FILE;
const keycloakOutputFile = process.env.KEYCLOAK_OUTPUT_FILE;

console.log(`Generating MFE config from ${mfeConfigDir}...`);
const apps = loadConfigs(mfeConfigDir);
writeJson(mfeOutputFile, apps);
console.log(`Wrote ${apps.length} MFE config(s) to ${mfeOutputFile}`);

console.log('Generating Keycloak config...');
const keycloakConfig = buildKeycloakConfig(process.env);
writeJson(keycloakOutputFile, keycloakConfig);
console.log(`Wrote Keycloak config to ${keycloakOutputFile}`);

console.log('Starting nginx...');
const nginx = spawn('nginx', ['-g', 'daemon off;'], { stdio: 'inherit' });

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => nginx.kill(signal));
}

nginx.on('exit', (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});
