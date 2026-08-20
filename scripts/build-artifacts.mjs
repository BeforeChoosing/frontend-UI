import { copyFile, mkdir, rm } from 'node:fs/promises';

const action = process.argv[2];
const generatedFiles = [
  'standalone-app.html',
  'public/standalone-app.html',
  'public/preview.html',
  'server.js',
];

if (action === 'copy') {
  await mkdir('public', { recursive: true });
  await Promise.all([
    copyFile('dist/index.html', 'standalone-app.html'),
    copyFile('dist/index.html', 'public/standalone-app.html'),
    copyFile('dist/index.html', 'public/preview.html'),
  ]);
} else if (action === 'clean') {
  await Promise.all([
    rm('dist', { recursive: true, force: true }),
    ...generatedFiles.map(path => rm(path, { force: true })),
  ]);
} else {
  throw new Error('Usage: node scripts/build-artifacts.mjs <copy|clean>');
}
