// path: scripts/build.mjs
import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const entry = 'src/assertroute.ts';
mkdirSync('dist', { recursive: true });

const define = { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production') };
const common = { bundle: true, sourcemap: true, minify: true, logLevel: 'info', define };

await Promise.all([
  build({ ...common, entryPoints: [entry], format: 'esm', platform: 'neutral', target: ['es2020'], outfile: 'dist/assertroute.esm.js' }),
  build({ ...common, entryPoints: [entry], format: 'cjs', platform: 'node',    target: ['node18'], outfile: 'dist/assertroute.cjs' }),
  build({
    ...common,
    entryPoints: [entry],
    format: 'iife',
    platform: 'browser',
    target: ['es2018'],
    globalName: 'assertroute',                // => window.assertroute
    outfile: 'dist/assertroute.browser.min.js',
    banner: { js: '/*! assertroute – browser bundle */' }
  })
]);

execSync('npm run build:types', { stdio: 'inherit' });
console.log('✅ Built ESM, CJS, IIFE + types.');
