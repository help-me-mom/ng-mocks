const { execFileSync } = require('node:child_process');
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const legacyDts = path.resolve(root, 'dist/libs/ng-mocks/index.d.ts');
const modernDts = path.resolve(root, 'dist/libs/ng-mocks/modern/index.d.ts');
const dtsBundleGenerator = process.platform === 'win32' ? 'dts-bundle-generator.cmd' : 'dts-bundle-generator';

mkdirSync(path.dirname(modernDts), { recursive: true });

execFileSync(
  dtsBundleGenerator,
  [
    '--no-banner',
    '-o',
    modernDts,
    '--project',
    path.resolve(root, 'libs/ng-mocks/tsconfig.build.types.json'),
    '--no-check',
    '--export-referenced-types=true',
    path.resolve(root, 'libs/ng-mocks/src/index.ts'),
  ],
  {
    stdio: 'inherit',
  },
);

const modernDeclaration = readFileSync(modernDts, 'utf8');
const legacyDeclaration = modernDeclaration.replace(
  /export type MockRenderInputSignalNode<T> =[\s\S]*?export type DefaultRenderComponent<MComponent> = \{[\s\S]*?\n\};/,
  'export type DefaultRenderComponent<MComponent> = {\n\t[K in keyof MComponent]: MComponent[K];\n};',
);

if (legacyDeclaration === modernDeclaration) {
  throw new Error('Unable to downlevel DefaultRenderComponent declarations');
}

writeFileSync(legacyDts, legacyDeclaration);
