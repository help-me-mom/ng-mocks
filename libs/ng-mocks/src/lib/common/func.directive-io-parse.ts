import { DirectiveIo, DirectiveIoParsed } from './core.types';

const normalize = ({ name, alias, required, isSignal, transform }: DirectiveIoParsed): DirectiveIoParsed => {
  const metadata = {
    ...(required === undefined ? {} : { required }),
    ...(isSignal === undefined ? {} : { isSignal }),
    ...(transform === undefined ? {} : { transform }),
  };

  if (name === alias || !alias) {
    return { name, ...metadata };
  }

  if (name + 'Change' === alias) {
    return { name: alias, ...metadata };
  }

  return { name, alias, ...metadata };
};

export default function (param: DirectiveIo): DirectiveIoParsed {
  if (typeof param === 'string') {
    const [name, alias] = param.split(':').map(v => v.trim());
    return normalize({ name, alias });
  }

  return normalize(param);
}
