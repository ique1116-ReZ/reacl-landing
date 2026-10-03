import { readdir, mkdir, copyFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const project = resolve(fileURLToPath(new URL('..', import.meta.url)));
const root = resolve(project, '..');
const built = join(project, 'dist/client');
const index = await readFile(join(built, 'index.html'), 'utf8');
if (!index.includes('七个康复阶段') || index.includes('专项训练')) throw new Error('Release content check failed');
async function copyTree(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (entry.isDirectory()) await copyTree(join(from, entry.name), join(to, entry.name));
    else await copyFile(join(from, entry.name), join(to, entry.name));
  }
}
await copyTree(built, root);
console.log('Staged production files in the GitHub Pages repository root. No commit or push performed.');
