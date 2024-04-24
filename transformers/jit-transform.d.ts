/**
 * @fileoverview This file will be replaced as a build step with a bundled
 * CommonJS version of the Angular JIT transform.
 *
 * This is necessary because ng-mocks is shipped as CommonJS, while the Angular
 * compiler CLI is a strict ESM package that would otherwise require migration to ESM
 * of the preset, or result in asynchronous ESM/CJS interops being necessary.
 */

export { angularJitApplicationTransform } from '@angular/compiler-cli';
