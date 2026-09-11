// Middleware declarations represent the same Angular declaration under a new
// selector. Recompiling copied metadata must not add inherited side effects twice.
const inheritDefinition = (definition: any, original: any): void => {
  if (!definition || !original) {
    return;
  }

  // Reflected annotations can lose Angular 22's implicit OnPush strategy.
  if (original.onPush !== undefined) {
    definition.onPush = original.onPush;
  }

  definition.hostBindings = original.hostBindings;
  definition.hostVars = original.hostVars;
  definition.hostAttrs = original.hostAttrs && [...original.hostAttrs];
  if (definition.data) {
    const animation = original.data?.animation;
    definition.data = {
      ...definition.data,
      animation: animation && [...animation],
    };
  }
  definition.hostDirectives =
    original.hostDirectives &&
    original.hostDirectives.map((hostDirective: any) =>
      typeof hostDirective === 'function'
        ? hostDirective
        : {
            ...hostDirective,
            inputs: { ...hostDirective.inputs },
            outputs: { ...hostDirective.outputs },
          },
    );
  definition.findHostDirectiveDefs = original.findHostDirectiveDefs;
  definition.resolveHostDirectives = original.resolveHostDirectives;
};

export default (child: any, template: any): void => {
  for (const key of ['ɵcmp', 'ɵdir']) {
    const descriptor = Object.getOwnPropertyDescriptor(child, key);
    if (!descriptor?.get) {
      continue;
    }
    const getter = descriptor.get;
    if (!descriptor.configurable) {
      // Production-mode JIT getters cannot be replaced, even by TestBed.
      inheritDefinition(getter.call(child), template[key]);
      continue;
    }

    let lastDefinition: any;
    let lastOriginal: any;
    Object.defineProperty(child, key, {
      ...descriptor,
      get() {
        const definition = getter.call(this);
        const original = template[key];
        if (definition !== lastDefinition || original !== lastOriginal) {
          // TestBed can recompile the original after the middleware was reflected.
          // Read its effective definition here so overrides also take effect once.
          inheritDefinition(definition, original);
          lastDefinition = definition;
          lastOriginal = original;
        }

        return definition;
      },
    });
  }
};
