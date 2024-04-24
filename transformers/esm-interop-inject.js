/**
 * @fileoverview This file will be inlined when generating the CommonJS bundle
 * for the transformers. ESBuild is not able to transform `import.meta.url` ESM
 * usages directly, so we define `import.meta.url` using its CommonJS variant.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const import_meta_url = require('node:url').pathToFileURL(__filename);
