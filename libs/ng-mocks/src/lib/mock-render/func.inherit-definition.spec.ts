import funcInheritDefinition from './func.inherit-definition';

describe('funcInheritDefinition', () => {
  it('leaves declarations without Ivy definition getters unchanged', () => {
    const definition = { hostAttrs: ['role', 'button'] };
    const child = { ɵcmp: definition };
    const descriptor = Object.getOwnPropertyDescriptor(child, 'ɵcmp');

    funcInheritDefinition(child, { ɵcmp: { hostAttrs: [] } });

    expect(child.ɵcmp).toBe(definition);
    expect(Object.getOwnPropertyDescriptor(child, 'ɵcmp')).toEqual(
      descriptor,
    );
    expect(
      Object.getOwnPropertyDescriptor(child, 'ɵdir'),
    ).toBeUndefined();
  });

  it('normalizes nonconfigurable Ivy getters without replacing their descriptor', () => {
    const original = {
      data: { animation: ['original'] },
      findHostDirectiveDefs: jasmine.createSpy(
        'findHostDirectiveDefs',
      ),
      hostAttrs: ['role', 'button'],
      hostBindings: jasmine.createSpy('hostBindings'),
      hostDirectives: [
        {
          directive: 'original',
          inputs: { input: 'alias' },
          outputs: {},
        },
      ],
      hostVars: 1,
      resolveHostDirectives: jasmine.createSpy(
        'resolveHostDirectives',
      ),
    };
    const definition: any = {
      data: {
        animation: ['original', 'original'],
        retained: 'value',
      },
      hostVars: 2,
    };
    const child: any = { definition };
    Object.defineProperty(child, 'ɵcmp', {
      configurable: false,
      enumerable: true,
      get() {
        return this.definition;
      },
    });
    const descriptor = Object.getOwnPropertyDescriptor(child, 'ɵcmp');

    expect(() =>
      funcInheritDefinition(child, { ɵcmp: original }),
    ).not.toThrow();

    expect(Object.getOwnPropertyDescriptor(child, 'ɵcmp')).toEqual(
      descriptor,
    );
    expect(child.ɵcmp).toBe(definition);
    expect(definition.hostBindings).toBe(original.hostBindings);
    expect(definition.hostVars).toBe(1);
    expect(definition.hostAttrs).toEqual(['role', 'button']);
    expect(definition.hostAttrs).not.toBe(original.hostAttrs);
    expect(definition.data).toEqual({
      animation: ['original'],
      retained: 'value',
    });
    expect(definition.data.animation).not.toBe(
      original.data.animation,
    );
    expect(definition.hostDirectives).toEqual(
      original.hostDirectives,
    );
    expect(definition.hostDirectives).not.toBe(
      original.hostDirectives,
    );
    expect(definition.hostDirectives[0].inputs).not.toBe(
      original.hostDirectives[0].inputs,
    );
    expect(definition.findHostDirectiveDefs).toBe(
      original.findHostDirectiveDefs,
    );
    expect(definition.resolveHostDirectives).toBe(
      original.resolveHostDirectives,
    );
    expect(original.data.animation).toEqual(['original']);
    expect(original.hostVars).toBe(1);
  });

  it('copies inherited side effects without mutating original metadata or other clone fields', () => {
    class HostDirective {}
    const lazyHostDirectives = jasmine.createSpy(
      'lazyHostDirectives',
    );
    const original = {
      data: { animation: [{ name: 'original' }] },
      findHostDirectiveDefs: jasmine.createSpy(
        'findHostDirectiveDefs',
      ),
      hostAttrs: ['role', 'button'],
      hostBindings: jasmine.createSpy('hostBindings'),
      hostDirectives: [
        {
          directive: HostDirective,
          inputs: { input: 'publicInput' },
          outputs: { output: 'publicOutput' },
        },
        lazyHostDirectives,
      ],
      hostVars: 2,
      resolveHostDirectives: jasmine.createSpy(
        'resolveHostDirectives',
      ),
    };
    const inputs = { publicInput: ['input', 1] };
    const outputs = { publicOutput: 'output' };
    const contentQueries = jasmine.createSpy('contentQueries');
    const viewQuery = jasmine.createSpy('viewQuery');
    const providersResolver = jasmine.createSpy('providersResolver');
    const template = jasmine.createSpy('template');
    const data = {
      animation: [{ name: 'duplicate' }],
      retained: 'value',
    };
    const definition: any = {
      contentQueries,
      data,
      inputs,
      outputs,
      providersResolver,
      selectors: [['middleware']],
      standalone: true,
      template,
      viewQuery,
    };
    const child: any = { definition };
    Object.defineProperty(child, 'ɵcmp', {
      configurable: true,
      enumerable: true,
      get() {
        return this.definition;
      },
      set(value) {
        this.definition = value;
      },
    });
    const descriptor = Object.getOwnPropertyDescriptor(
      child,
      'ɵcmp',
    )!;

    funcInheritDefinition(child, { ɵcmp: original });

    expect(child.ɵcmp).toBe(definition);
    const inheritedAttrs = definition.hostAttrs;
    const inheritedAnimations = definition.data.animation;
    const inheritedHostDirectives = definition.hostDirectives;
    expect(definition.hostBindings).toBe(original.hostBindings);
    expect(definition.hostVars).toBe(2);
    expect(inheritedAttrs).toEqual(original.hostAttrs);
    expect(inheritedAttrs).not.toBe(original.hostAttrs);
    expect(inheritedAnimations).toEqual(original.data.animation);
    expect(inheritedAnimations).not.toBe(original.data.animation);
    expect(definition.data.retained).toBe('value');
    expect(data.animation).toEqual([{ name: 'duplicate' }]);
    expect(inheritedHostDirectives).toEqual(original.hostDirectives);
    expect(inheritedHostDirectives).not.toBe(original.hostDirectives);
    expect(inheritedHostDirectives[0]).not.toBe(
      original.hostDirectives[0],
    );
    expect(inheritedHostDirectives[0].inputs).not.toBe(
      (original.hostDirectives[0] as any).inputs,
    );
    expect(inheritedHostDirectives[0].outputs).not.toBe(
      (original.hostDirectives[0] as any).outputs,
    );
    expect(inheritedHostDirectives[1]).toBe(lazyHostDirectives);
    expect(lazyHostDirectives).not.toHaveBeenCalled();
    expect(definition.findHostDirectiveDefs).toBe(
      original.findHostDirectiveDefs,
    );
    expect(definition.resolveHostDirectives).toBe(
      original.resolveHostDirectives,
    );
    expect(definition.inputs).toBe(inputs);
    expect(definition.outputs).toBe(outputs);
    expect(definition.contentQueries).toBe(contentQueries);
    expect(definition.viewQuery).toBe(viewQuery);
    expect(definition.providersResolver).toBe(providersResolver);
    expect(definition.template).toBe(template);
    expect(definition.selectors).toEqual([['middleware']]);
    expect(definition.standalone).toBe(true);
    expect(Object.getOwnPropertyDescriptor(child, 'ɵcmp')).toEqual({
      ...descriptor,
      get: jasmine.any(Function),
    });

    inheritedAttrs.push('title', 'clone');
    inheritedAnimations.push({ name: 'clone' });
    inheritedHostDirectives[0].inputs.input = 'cloneInput';
    inheritedHostDirectives[0].outputs.output = 'cloneOutput';
    inheritedHostDirectives.push(lazyHostDirectives);

    // Repeated reads retain Angular's work on this same compiled definition.
    expect(child.ɵcmp.hostAttrs).toBe(inheritedAttrs);
    expect(child.ɵcmp.data.animation).toBe(inheritedAnimations);
    expect(child.ɵcmp.hostDirectives).toBe(inheritedHostDirectives);
    expect(original.hostAttrs).toEqual(['role', 'button']);
    expect(original.data.animation).toEqual([{ name: 'original' }]);
    expect(original.hostDirectives).toEqual([
      {
        directive: HostDirective,
        inputs: { input: 'publicInput' },
        outputs: { output: 'publicOutput' },
      },
      lazyHostDirectives,
    ]);
  });

  it('refreshes inherited fields when TestBed replaces the original or clone definition', () => {
    const firstOriginal = {
      data: { animation: ['original'] },
      hostAttrs: ['role', 'button'],
      hostBindings: jasmine.createSpy('originalHostBindings'),
      hostDirectives: [
        { directive: 'original', inputs: {}, outputs: {} },
      ],
      hostVars: 1,
    };
    const template: any = { ɵcmp: firstOriginal };
    const child: any = {
      definition: { data: { retained: 'first' } },
    };
    Object.defineProperty(child, 'ɵcmp', {
      configurable: true,
      get() {
        return this.definition;
      },
      set(value) {
        this.definition = value;
      },
    });
    funcInheritDefinition(child, template);
    const firstDefinition = child.ɵcmp;
    expect(firstDefinition.data.animation).toEqual(['original']);

    // A metadata override can remove inherited effects instead of adding them.
    template.ɵcmp = {
      findHostDirectiveDefs: null,
      hostAttrs: null,
      hostBindings: null,
      hostDirectives: null,
      hostVars: 0,
      resolveHostDirectives: null,
    };

    expect(child.ɵcmp).toBe(firstDefinition);
    expect(firstDefinition.hostAttrs).toBeNull();
    expect(firstDefinition.hostBindings).toBeNull();
    expect(firstDefinition.hostVars).toBe(0);
    expect(firstDefinition.hostDirectives).toBeNull();
    expect(firstDefinition.findHostDirectiveDefs).toBeNull();
    expect(firstDefinition.resolveHostDirectives).toBeNull();
    expect(firstDefinition.data.animation).toBeUndefined();
    expect(firstDefinition.data.retained).toBe('first');
    expect(firstOriginal.hostAttrs).toEqual(['role', 'button']);
    expect(firstOriginal.data.animation).toEqual(['original']);

    const replacement = {
      data: { animation: ['stale'], retained: 'replacement' },
    };
    child.ɵcmp = replacement;

    expect(child.ɵcmp).toBe(replacement);
    expect(child.definition).toBe(replacement);
    expect(child.ɵcmp.hostBindings).toBeNull();
    expect(child.ɵcmp.hostDirectives).toBeNull();
    expect(child.ɵcmp.data).toEqual({
      animation: undefined,
      retained: 'replacement',
    });
  });

  it('waits for directive definitions and leaves component-only data absent', () => {
    const template: any = { ɵdir: { hostVars: 0 } };
    const child: any = {};
    Object.defineProperty(child, 'ɵdir', {
      configurable: true,
      get() {
        return this.definition;
      },
    });

    funcInheritDefinition(child, template);

    expect(child.ɵdir).toBeUndefined();
    template.ɵdir = undefined;
    child.definition = { hostVars: 3 };
    expect(child.ɵdir).toBe(child.definition);
    expect(child.ɵdir.hostVars).toBe(3);

    template.ɵdir = {
      hostAttrs: [],
      hostBindings: jasmine.createSpy('directiveHostBindings'),
      hostDirectives: [],
      hostVars: 0,
    };

    expect(child.ɵdir).toBe(child.definition);
    expect(child.ɵdir.hostBindings).toBe(template.ɵdir.hostBindings);
    expect(child.ɵdir.hostAttrs).toEqual([]);
    expect(child.ɵdir.hostDirectives).toEqual([]);
    expect(child.ɵdir.hostVars).toBe(0);
    expect(child.ɵdir.data).toBeUndefined();
    expect(child.ɵdir.findHostDirectiveDefs).toBeUndefined();
    expect(child.ɵdir.resolveHostDirectives).toBeUndefined();
  });
});
