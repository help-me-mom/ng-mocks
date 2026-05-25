import { DirectiveIo, DirectiveIoParsed } from './core.types';

const normalize = ({ name, alias, required }: DirectiveIoParsed): DirectiveIoParsed => {
  if (name === alias || !alias) {
    return required === undefined ? { name } : { name, required };
  }

  if (name + 'Change' === alias) {
    return required === undefined ? { name: alias } : { name: alias, required };
  }

  return required === undefined ? { name, alias } : { name, alias, required };
};

export default function (param: DirectiveIo): DirectiveIoParsed {
  if (typeof param === 'string') {
    const [name, alias] = param.split(':').map(v => v.trim());
    return normalize({ name, alias });
  }

  return normalize(param);
}
