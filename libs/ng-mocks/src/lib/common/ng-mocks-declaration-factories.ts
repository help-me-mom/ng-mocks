const factories = new Map<any, PropertyDescriptor | undefined>();

export const rememberDeclarationFactory = (declaration: any): void => {
  if (!factories.has(declaration)) {
    factories.set(declaration, Object.getOwnPropertyDescriptor(declaration, 'ɵfac'));
  }
};

export const resetDeclarationFactories = (): void => {
  for (const [declaration, descriptor] of factories) {
    // Angular can create a factory where none existed; only restore factories we actually replaced.
    if (descriptor) {
      Object.defineProperty(declaration, 'ɵfac', descriptor);
    }
  }
  factories.clear();
};
