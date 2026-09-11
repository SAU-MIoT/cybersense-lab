import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const routes = [
  '/ekip',
  '/projeler',
  '/yayinlar',
  '/duyurular',
  '/etkinlikler',
  '/iletisim',
  '/gizlilik-ve-kvkk',
  '/login',
  '/admin',
];

const outputDirectory = fileURLToPath(new URL('../dist/', import.meta.url));
const sourceIndex = path.join(outputDirectory, 'index.html');

for (const route of routes) {
  const segments = route.split('/').filter(Boolean);
  const routeDirectory = path.resolve(outputDirectory, ...segments);
  const relativeDestination = path.relative(outputDirectory, routeDirectory);

  if (
    segments.length === 0 ||
    relativeDestination.startsWith('..') ||
    path.isAbsolute(relativeDestination)
  ) {
    throw new Error(`Unsafe SPA fallback route: ${route}`);
  }

  await mkdir(routeDirectory, { recursive: true });
  await copyFile(sourceIndex, path.join(routeDirectory, 'index.html'));
}

console.log(`Generated SPA fallbacks for ${routes.length} routes.`);
