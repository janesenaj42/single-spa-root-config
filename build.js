import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
fs.mkdirSync(distDir, { recursive: true });

esbuild.buildSync({
  entryPoints: ['src/root-config.js'],
  bundle: true,
  outfile: 'dist/root-config.js',
  format: 'esm',
  target: 'es2020',
  minify: process.env.NODE_ENV === 'production',
});

fs.copyFileSync(path.join(__dirname, 'public', 'index.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(
  path.join(__dirname, 'public', 'silent-check-sso.html'),
  path.join(distDir, 'silent-check-sso.html')
);

console.log('Bundled src/root-config.js -> dist/root-config.js and copied static files');
