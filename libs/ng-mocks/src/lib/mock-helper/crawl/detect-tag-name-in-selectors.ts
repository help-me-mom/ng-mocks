const regExp = new RegExp('\\[.*?\\]', 'g');

export default (selectors: string[], query: string): boolean => {
  for (const selector of selectors) {
    const attributes = selector.replace(regExp, '').split(',');

    for (const attribute of attributes) {
      if (attribute.trim() === query) {
        return true;
      }
    }
  }

  return false;
};
