declare const vi: any;
export default () => {
  try {
    return vi;
  } catch {
    return undefined;
  }
};
