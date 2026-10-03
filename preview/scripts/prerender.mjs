import { readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
const output = '.prerender-cache';
try {
  await build({ configFile: false, plugins: [react()], logLevel: 'error', build: {
    ssr: 'src/entry-server.jsx', outDir: output, emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'render.mjs' } },
  } });
  const { render } = await import(pathToFileURL(resolve(output, 'render.mjs')));
  const page = await readFile('dist/client/index.html', 'utf8');
  const rendered = render();
  if (!rendered.includes('七个康复阶段')) throw new Error('Prerender did not emit product content');
  await writeFile('dist/client/index.html', page.replace('<div id="root"></div>', '<div id="root">' + rendered + '</div>'));
  console.log('Prerendered complete landing page into static index.html');
} finally { await rm(output, { recursive: true, force: true }); }
