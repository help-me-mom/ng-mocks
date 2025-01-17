export default (): {
  ngMocksUniverse: any,
  ngMocksParent: any,
  ngMocksResult: any,
  ngMockshelperMockService: any,
} => {
  // istanbul ignore if
  if (typeof window === 'undefined') {
    return global as unknown as  {
      ngMocksUniverse: any,
      ngMocksParent: any,
      ngMocksResult: any,
      ngMockshelperMockService: any,
    };
  }

  return window as unknown as {
    ngMocksUniverse: any,
    ngMocksParent: any,
    ngMocksResult: any,
    ngMockshelperMockService: any,
  };
};
