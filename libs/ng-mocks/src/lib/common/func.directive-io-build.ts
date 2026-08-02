import { DirectiveIo, DirectiveIoParsed } from './core.types';

export default function (
  { name, alias, required, isSignal, transform }: DirectiveIoParsed,
  skipName = false,
): DirectiveIo {
  if (required !== undefined || isSignal !== undefined || transform !== undefined) {
    return {
      ...(skipName ? {} : { name }),
      ...(alias === undefined ? {} : { alias }),
      ...(required === undefined ? {} : { required }),
      ...(isSignal === undefined ? {} : { isSignal }),
      ...(transform === undefined ? {} : { transform }),
    } as DirectiveIo;
  }
  if (!alias || name === alias) {
    return skipName ? '' : name;
  }

  return skipName ? alias : `${name}:${alias}`;
}
