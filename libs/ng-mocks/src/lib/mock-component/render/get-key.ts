export default (
  contentChildSelector: string | [string, ...number[]],
): [string, string, string, undefined | number[]] => {
  if (typeof contentChildSelector === 'string') {
    return ['key', `__mockTpl_key_${contentChildSelector}`, contentChildSelector, undefined];
  }

  const [key, ...indices] = contentChildSelector;

  return ['prop', key, key, indices.length > 0 ? indices : undefined];
};
