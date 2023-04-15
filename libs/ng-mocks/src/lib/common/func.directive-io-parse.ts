import { DirectiveIo, DirectiveIoParsed } from './core.types';

export default function (param: DirectiveIo): DirectiveIoParsed {
  if (typeof param === 'string') {
    const [name, alias] = param.split(':').map(v => v.trim());

    if (name === alias || !alias) {
      return { name };
    }

    return { name, alias };
  }

  return param;
}
