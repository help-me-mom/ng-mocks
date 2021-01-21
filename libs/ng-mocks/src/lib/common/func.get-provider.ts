export default (provider: any): any => {
  return provider && typeof provider === 'object' && provider.provide ? provider.provide : provider;
};
