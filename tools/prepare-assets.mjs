import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'apps/storefront/public/media');
await mkdir(output, { recursive: true });
const assets = [
  { input: 'book/before-you-forget-me-cover.png', name: 'book-cover', width: 1000 },
  { input: 'book/before-you-forget-me-jacket.png', name: 'book-jacket', width: 1000 },
  { input: 'images/Screenshot 2026-09-07 123259.png', name: 'author', width: 600 },
  { input: 'images/ChatGPT Image Sep 7, 2026, 12_46_46 AM.png', name: 'hero-moonlit', width: 1920 },
  { input: 'images/Gemini_Generated_Image_riqgnuriqgnuriqg.png', name: 'reading-book', width: 900 },
  { input: '../generated/review-reading.png', name: 'review-reading', width: 900 },
  { input: '../generated/review-letters.png', name: 'review-letters', width: 900 },
  { input: '../generated/review-window.png', name: 'review-window', width: 900 }
];
const manifest = [];
for (const asset of assets) {
  const source = resolve(root, 'assets/source', asset.input);
  const result = await sharp(source).rotate().resize({ width: asset.width, withoutEnlargement: true }).webp({ quality: 85 }).toFile(resolve(output, asset.name + '.webp'));
  await sharp(source).rotate().resize({ width: Math.min(asset.width, 480), withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(output, asset.name + '-small.webp'));
  manifest.push({ name: asset.name, width: result.width, height: result.height, bytes: result.size });
}
await sharp(resolve(root, 'assets/source/logo/Frame 1.png')).trim().png().toFile(resolve(output, 'signature.png'));
await sharp(resolve(root, 'assets/source/book/before-you-forget-me-cover.png')).resize(64,64,{fit:'cover'}).png().toFile(resolve(root, 'apps/storefront/public/icon.png'));
await writeFile(resolve(root, 'docs/verification/optimized-assets.json'), JSON.stringify(manifest, null, 2));
console.log('Prepared original book artwork, moonlit hero, reading photograph, author portrait and signature for the storefront.');
