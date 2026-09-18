/**
 * Merges one YAML file per microfrontend into a single mfes.json manifest
 * that root-config.js fetches at runtime.
 *
 * Env vars:
 *   MFE_CONFIG_DIR  - directory of *.yaml files (default: ../mfes)
 *   MFE_OUTPUT_FILE - where to write the merged JSON (default: ../dist/mfes.json)
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CONFIG_DIR = process.env.MFE_CONFIG_DIR || path.join(__dirname, '..', 'mfes');
const OUTPUT_FILE = process.env.MFE_OUTPUT_FILE || path.join(__dirname, '..', 'dist', 'mfes.json');
const REQUIRED_FIELDS = ['name', 'entry', 'activeWhen'];

function loadConfigs(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`MFE config directory not found: ${dir}`);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort();

  if (files.length === 0) {
    console.warn(`Warning: no *.yaml files found in ${dir}`);
  }

  const seenNames = new Set();
  const apps = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    let raw;
    try {
      raw = yaml.load(fs.readFileSync(fullPath, 'utf8'));
    } catch (err) {
      throw new Error(`Failed to parse ${file}: ${err.message}`);
    }

    validate(raw, file);

    if (seenNames.has(raw.name)) {
      throw new Error(`Duplicate MFE name "${raw.name}" (found again in ${file})`);
    }
    seenNames.add(raw.name);

    apps.push({
      name: raw.name,
      entry: raw.entry,
      container: raw.container || '#app',
      activeWhen: raw.activeWhen,
      customProps: raw.customProps || {},
    });
  }

  return apps;
}

function validate(raw, file) {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`${file} did not parse to an object`);
  }
  for (const key of REQUIRED_FIELDS) {
    const value = raw[key];
    const missing = value === undefined || value === null || value === '';
    if (missing) {
      throw new Error(`Missing required field "${key}" in ${file}`);
    }
  }
}

const apps = loadConfigs(CONFIG_DIR);
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(apps, null, 2));
console.log(`Wrote ${apps.length} MFE config(s) from ${CONFIG_DIR} to ${OUTPUT_FILE}`);
