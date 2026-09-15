// scripts/build-icons.mjs
//
// Reads the Font Awesome kit package and writes site/icons.json.
// Run with: FA_KIT_CODE=abc123 node scripts/build-icons.mjs
//
// ---------------------------------------------------------------------------
// DO NOT ADD SVG PATH DATA TO THIS OUTPUT.
//
// This repository and its published page are public. icons.json intentionally
// contains only icon names, style prefixes, search aliases, and unicode
// codepoints. It contains no artwork.
//
// The page renders icons through the WSU kit script on the Font Awesome CDN,
// which is domain locked to approved WSU hosts. Writing the `icon[4]` path data
// into this file would put licensed Pro icons in a public repo as
// redistributable SVGs, which our Font Awesome Pro license does not allow.
//
// If you need the page to work without the CDN, talk to whoever owns the FA
// account before changing this.
// ---------------------------------------------------------------------------

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const kitCode = process.env.FA_KIT_CODE;
if (!kitCode) {
  console.error('FA_KIT_CODE is not set. Set it to your kit code and run again.');
  process.exit(1);
}

const packageName = `@awesome.me/kit-${kitCode}`;

let all;
try {
  ({ all } = await import(`${packageName}/icons`));
} catch (error) {
  console.error(`Could not import ${packageName}/icons`);
  console.error('Check that the package is installed and .npmrc has a valid package token.');
  console.error(error.message);
  process.exit(1);
}

if (!Array.isArray(all) || all.length === 0) {
  console.error('The kit package imported but returned no icons.');
  console.error('Check that "Enable Package Installation" is on in your kit settings.');
  process.exit(1);
}

let kitVersion = 'unknown';
try {
  const manifestPath = require.resolve(`${packageName}/package.json`);
  kitVersion = JSON.parse(await readFile(manifestPath, 'utf8')).version;
} catch {
  // Not fatal. The page shows "unknown" for the version.
}

const icons = all
  .map((def) => {
    // Destructured deliberately. `aliases` and `unicode` are used, the width,
    // height, and path data are not. See the note at the top of this file.
    const [, , aliases, unicode] = def.icon;

    return {
      p: def.prefix,
      n: def.iconName,
      a: (aliases ?? []).filter((entry) => typeof entry === 'string'),
      u: unicode,
    };
  })
  .sort((a, b) => a.n.localeCompare(b.n) || a.p.localeCompare(b.p));

const byPrefix = {};
for (const icon of icons) {
  byPrefix[icon.p] = (byPrefix[icon.p] ?? 0) + 1;
}

const payload = {
  generated: new Date().toISOString(),
  kitCode,
  kitVersion,
  count: icons.length,
  byPrefix,
  icons,
};

await mkdir('site', { recursive: true });
await writeFile('site/icons.json', JSON.stringify(payload));

const sizeKb = (Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(1);
console.log('Wrote site/icons.json');
console.log(`  kit package version: ${kitVersion}`);
console.log(`  icons: ${icons.length}`);
console.log(`  styles: ${Object.entries(byPrefix).map(([k, v]) => `${k}=${v}`).join(' ')}`);
console.log(`  size: ${sizeKb} KB (names only, no artwork)`);
