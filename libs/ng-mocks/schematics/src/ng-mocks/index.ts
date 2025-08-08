import {
  apply,
  chain,
  externalSchematic,
  mergeWith,
  move,
  template,
  url,
  MergeStrategy,
  Rule,
  SchematicContext,
  Tree,
  noop,
} from '@angular-devkit/schematics';
import {strings, normalize } from '@angular-devkit/core';

import { ServiceOptions } from './schema';
import { ensurePath } from './utils/ensure-path.helper';

export function ngMocksServiceSchematic(options: ServiceOptions): Rule {
  return chain([
    externalSchematic(
      '@schematics/angular',
      'service',
      { ...options, skipTests: true }
    ),
    async(tree: Tree, _context: SchematicContext): Promise<Rule> => {
      if (options.skipTests) {
        return noop;
      }

      await ensurePath(tree, options);
      const movePath = normalize(options.path || '');
      const specTemplateRule = apply(url('./files/service'), [
        template({
          ...strings,
          ...options,
        }),
        move(movePath),
      ]);

      return mergeWith(specTemplateRule, MergeStrategy.Default);
    }
  ]);
}