/**
 * Merges one YAML file per microfrontend into a single mfes.json manifest
 * that root-config.js fetches at runtime.
 *
 * Env vars:
 *   MFE_CONFIG_DIR  - directory of *.yaml files (default: ../mfes)
 *   MFE_OUTPUT_FILE - where to write the merged JSON (default: ../dist/mfes.json)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ajv = new Ajv({ allErrors: true });
const validateSchema = ajv.compile({
  type: 'object',
  additionalProperties: false,
  required: ['name', 'entry', 'activeWhen'],
  properties: {
    name: { type: 'string', minLength: 1 },
    entry: { type: 'string', minLength: 1 },
    container: { type: 'string', minLength: 1 },
    activeWhen: {
      oneOf: [
        { type: 'string', minLength: 1 },
        { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1 },
      ],
    },
    // If true, the app is mounted regardless of auth state (e.g. a shell navbar).
    // If false/omitted, the app only activates for an authenticated user, and
    // only if the user holds at least one of requiredRoles (when specified).
    public: { type: 'boolean' },
    requiredRoles: { type: 'array', items: { type: 'string', minLength: 1 } },
    customProps: { type: 'object' },
  },
});

/**
 * Validates a parsed YAML document against the MFE config schema and
 * returns the normalized app object (defaults applied). Throws on
 * schema violations. `filename` is only used to make error messages
 * traceable to a source file.
 */
export function validateAndNormalize(raw, filename) {
  if (!validateSchema(raw)) {
    const details = ajv.errorsText(validateSchema.errors, { separator: '; ' });
    throw new Error(`Invalid config in ${filename}: ${details}`);
  }

  return {
    name: raw.name,
    entry: raw.entry,
    container: raw.container || '#app',
    activeWhen: raw.activeWhen,
    public: Boolean(raw.public),
    requiredRoles: raw.requiredRoles || [],
    customProps: raw.customProps || {},
  };
}

export function loadConfigs(dir) {
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

    const app = validateAndNormalize(raw, file);

    if (seenNames.has(app.name)) {
      throw new Error(`Duplicate MFE name "${app.name}" (found again in ${file})`);
    }
    seenNames.add(app.name);

    apps.push(app);
  }

  return apps;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const CONFIG_DIR = process.env.MFE_CONFIG_DIR || path.join(__dirname, '..', 'mfes');
  const OUTPUT_FILE = process.env.MFE_OUTPUT_FILE || path.join(__dirname, '..', 'dist', 'mfes.json');

  const apps = loadConfigs(CONFIG_DIR);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(apps, null, 2));
  console.log(`Wrote ${apps.length} MFE config(s) from ${CONFIG_DIR} to ${OUTPUT_FILE}`);
}
