export default (value: any): value is Text => {
  return !!value && typeof value === 'object' && value.nodeName === '#text';
};
