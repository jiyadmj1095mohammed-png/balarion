// Run `node generate-pages.mjs` whenever images in comic/ change.
// pages.js lets the reader work even when index.html is opened directly.
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const comicDirectory = 'comic';
const supportedExtensions = /\.(avif|gif|jpe?g|png|webp)$/i;

const names = await readdir(comicDirectory);
const pages = names
  .filter((name) => supportedExtensions.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  .map((name) => `${comicDirectory}/${encodeURIComponent(name)}`);

const list = JSON.stringify(pages, null, 2);
await Promise.all([
  writeFile(join('pages.json'), `${list}\n`),
  writeFile(join('pages.js'), `window.MANGA_PAGES = ${list};\n`),
]);
console.log(`Created pages.json and pages.js with ${pages.length} pages.`);
