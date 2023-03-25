import { Component } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

class ParentClass {
  public pubParentProp = true;
  public readonly pubReadonlyParentProp = true;
  protected proParentProp = true;
  protected readonly proReadonlyParentProp = true;

  public get pubParentPropGet(): boolean {
    return this.pubParentProp;
  }
  public set pubParentPropSet(value: boolean) {
    this.pubParentProp = value;
  }

  public get pubReadonlyParentPropGet(): boolean {
    return this.pubReadonlyParentProp;
  }

  protected get proParentPropGet(): boolean {
    return this.proParentProp;
  }
  protected set proParentPropSet(value: boolean) {
    this.proParentProp = value;
  }

  protected get proReadonlyParentPropGet(): boolean {
    return this.proReadonlyParentProp;
  }

  public pubParentPropMethod(value?: boolean): boolean {
    if (value !== undefined) {
      this.pubParentPropSet = value;
    }

    return this.pubParentPropGet;
  }

  public pubReadonlyProMethod(): boolean {
    return this.pubReadonlyParentPropGet;
  }

  protected proParentPropMethod(value?: boolean): boolean {
    if (value !== undefined) {
      this.proParentPropSet = value;
    }

    return this.proParentPropGet;
  }

  protected proReadonlyProMethod(): boolean {
    return this.proReadonlyParentPropGet;
  }
}

@Component({
  selector: 'target-mock-render-all-properties',
  template: `
    'pubChildProp:{{ pubChildProp }}' 'pubChildPropGet:{{
      pubChildPropGet
    }}' 'pubReadonlyChildProp:{{ pubReadonlyChildProp }}'
    'pubReadonlyChildPropGet:{{ pubReadonlyChildPropGet }}'
    'pubParentProp:{{ pubParentProp }}' 'pubParentPropGet:{{
      pubParentPropGet
    }}' 'pubParentParentProp:{{ pubReadonlyParentProp }}'
    'pubParentParentPropGet:{{ pubReadonlyParentPropGet }}'
  `,
})
class TargetComponent extends ParentClass {
  public pubChildProp = true;
  public readonly pubReadonlyChildProp = true;
  protected proChildProp = true;
  protected readonly proReadonlyChildProp = true;

  public get pubChildPropGet(): boolean {
    return this.pubChildProp;
  }
  public set pubChildPropSet(value: boolean) {
    this.pubChildProp = value;
  }

  public get pubReadonlyChildPropGet(): boolean {
    return this.pubReadonlyChildProp;
  }

  protected get proChildPropGet(): boolean {
    return this.proChildProp;
  }
  protected set proChildPropSet(value: boolean) {
    this.proChildProp = value;
  }

  protected get proReadonlyChildPropGet(): boolean {
    return this.proReadonlyChildProp;
  }

  public pubChildPropMethod(value?: boolean): boolean {
    if (value !== undefined) {
      this.pubChildPropSet = value;
    }

    return this.pubChildPropGet;
  }

  public pubReadonlyProMethod(): boolean {
    return this.pubReadonlyChildPropGet;
  }

  protected proChildPropMethod(value?: boolean): boolean {
    if (value !== undefined) {
      this.proChildPropSet = value;
    }

    return this.proChildPropGet;
  }

  protected proReadonlyProMethod(): boolean {
    return this.proReadonlyChildPropGet;
  }
}

describe('mock-render-all-properties', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('gives access to all properties via the middle component', () => {
    const fixture = MockRender(TargetComponent);

    // any gives us access to private stuff
    const middleInstance: any = fixture.componentInstance;
    const originalInstance: any = fixture.point.componentInstance;

    // pubParentProp
    expect(middleInstance.pubParentProp).toEqual(true);
    expect(middleInstance.pubParentPropGet).toEqual(true);
    expect(middleInstance.pubParentPropMethod()).toEqual(true);
    expect(originalInstance.pubParentProp).toEqual(true);
    expect(originalInstance.pubParentPropGet).toEqual(true);
    expect(originalInstance.pubParentPropMethod()).toEqual(true);
    middleInstance.pubParentPropSet = false;
    expect(middleInstance.pubParentProp).toEqual(false);
    expect(middleInstance.pubParentPropGet).toEqual(false);
    expect(middleInstance.pubParentPropMethod()).toEqual(false);
    expect(originalInstance.pubParentProp).toEqual(false);
    expect(originalInstance.pubParentPropGet).toEqual(false);
    expect(originalInstance.pubParentPropMethod()).toEqual(false);
    middleInstance.pubParentProp = true;
    expect(middleInstance.pubParentProp).toEqual(true);
    expect(middleInstance.pubParentPropGet).toEqual(true);
    expect(middleInstance.pubParentPropMethod()).toEqual(true);
    expect(originalInstance.pubParentProp).toEqual(true);
    expect(originalInstance.pubParentPropGet).toEqual(true);
    expect(originalInstance.pubParentPropMethod()).toEqual(true);
    middleInstance.pubParentPropMethod(false);
    expect(middleInstance.pubParentProp).toEqual(false);
    expect(middleInstance.pubParentPropGet).toEqual(false);
    expect(middleInstance.pubParentPropMethod()).toEqual(false);
    expect(originalInstance.pubParentProp).toEqual(false);
    expect(originalInstance.pubParentPropGet).toEqual(false);
    expect(originalInstance.pubParentPropMethod()).toEqual(false);

    // pubReadonlyParentProp
    expect(middleInstance.pubReadonlyParentProp).toEqual(true);
    expect(middleInstance.pubReadonlyParentPropGet).toEqual(true);
    expect(middleInstance.pubReadonlyProMethod()).toEqual(true);
    expect(originalInstance.pubReadonlyParentProp).toEqual(true);
    expect(originalInstance.pubReadonlyParentPropGet).toEqual(true);
    expect(originalInstance.pubReadonlyProMethod()).toEqual(true);

    // proParentProp
    expect(middleInstance.proParentProp).toEqual(true);
    expect(middleInstance.proParentPropGet).toEqual(true);
    expect(middleInstance.proParentPropMethod()).toEqual(true);
    expect(originalInstance.proParentProp).toEqual(true);
    expect(originalInstance.proParentPropGet).toEqual(true);
    expect(originalInstance.proParentPropMethod()).toEqual(true);
    middleInstance.proParentPropSet = false;
    expect(middleInstance.proParentProp).toEqual(false);
    expect(middleInstance.proParentPropGet).toEqual(false);
    expect(middleInstance.proParentPropMethod()).toEqual(false);
    expect(originalInstance.proParentProp).toEqual(false);
    expect(originalInstance.proParentPropGet).toEqual(false);
    expect(originalInstance.proParentPropMethod()).toEqual(false);
    middleInstance.proParentProp = true;
    expect(middleInstance.proParentProp).toEqual(true);
    expect(middleInstance.proParentPropGet).toEqual(true);
    expect(middleInstance.proParentPropMethod()).toEqual(true);
    expect(originalInstance.proParentProp).toEqual(true);
    expect(originalInstance.proParentPropGet).toEqual(true);
    expect(originalInstance.proParentPropMethod()).toEqual(true);
    middleInstance.proParentPropMethod(false);
    expect(middleInstance.proParentProp).toEqual(false);
    expect(middleInstance.proParentPropGet).toEqual(false);
    expect(middleInstance.proParentPropMethod()).toEqual(false);
    expect(originalInstance.proParentProp).toEqual(false);
    expect(originalInstance.proParentPropGet).toEqual(false);
    expect(originalInstance.proParentPropMethod()).toEqual(false);

    // proReadonlyParentProp
    expect(middleInstance.proReadonlyParentProp).toEqual(true);
    expect(middleInstance.proReadonlyParentPropGet).toEqual(true);
    expect(middleInstance.proReadonlyProMethod()).toEqual(true);
    expect(originalInstance.proReadonlyParentProp).toEqual(true);
    expect(originalInstance.proReadonlyParentPropGet).toEqual(true);
    expect(originalInstance.proReadonlyProMethod()).toEqual(true);
  });
});
