import { DirectiveIo, DirectiveIoParsed } from './core.types';

export default function ({ name, alias, required }: DirectiveIoParsed, skipName = false): DirectiveIo {
  if (required) {
    return { name, alias, required };
  }
  if (!alias || name === alias) {
    return skipName ? '' : name;
  }

  return skipName ? alias : `${name}:${alias}`;
}
