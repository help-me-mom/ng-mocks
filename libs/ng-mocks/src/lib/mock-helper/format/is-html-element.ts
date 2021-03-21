export default (value: any): value is HTMLElement => {
  return !!value && typeof value === 'object' && value.innerHTML !== undefined;
};
