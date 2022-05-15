export default (): Record<keyof any, any> => {
  // istanbul ignore if
  if (typeof window === 'undefined') {
    return global;
  }

  return window;
};
