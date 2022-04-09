export default (selectors: string[], query: string): boolean => {
  for (const selector of selectors) {
    const attributes = selector.match(/\[([^=\]]+)/g);
    if (!attributes) {
      continue;
    }

    for (const attribute of attributes) {
      if (attribute === `[${query}`) {
        return true;
      }
    }
  }

  return false;
};
