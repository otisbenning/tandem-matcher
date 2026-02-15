// Copy static extension files to dist/extension
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'extension');
const dest = join(root, 'dist', 'extension');

// Ensure dest directories exist
mkdirSync(join(dest, 'assets', 'icons'), { recursive: true });

// Copy manifest.json
copyFileSync(join(src, 'manifest.json'), join(dest, 'manifest.json'));
console.log('Copied: manifest.json');

// Copy popup files
copyFileSync(join(src, 'popup', 'popup.html'), join(dest, 'popup.html'));
copyFileSync(join(src, 'popup', 'popup.css'), join(dest, 'popup.css'));
console.log('Copied: popup.html, popup.css');

// Copy icons
const iconsDir = join(src, 'assets', 'icons');
if (existsSync(iconsDir)) {
  const icons = readdirSync(iconsDir).filter(f => f.endsWith('.png'));
  for (const icon of icons) {
    copyFileSync(join(iconsDir, icon), join(dest, 'assets', 'icons', icon));
  }
  console.log(`Copied: ${icons.length} icons`);
}

console.log('Extension static files copied successfully!');
