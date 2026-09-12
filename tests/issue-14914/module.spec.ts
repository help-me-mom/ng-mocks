import {
  Component,
  Inject,
  InjectionToken,
  NgModule,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockedNgDefOf, MockBuilder, ngMocks } from 'ng-mocks';

class Dependency {
  public constructor(public readonly label: string) {}
}

const TOKEN = new InjectionToken<Dependency>('issue-14914-module');
// View Engine copies literal provider objects; class instances retain identity.
const originalValue = new Dependency('original');

@Component({
  host: { 'data-child': 'original' },
  selector: 'child-14914-module',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original child',
})
class ChildComponent {}

@Component({
  host: { 'data-child': 'first' },
  selector: 'child-14914-module',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'first child',
})
class FirstChildComponent {}

@Component({
  host: { 'data-child': 'second' },
  selector: 'child-14914-module',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'second child',
})
class SecondChildComponent {}

@Component({
  selector: 'target-14914-module',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '{{ dependency.label }} <child-14914-module></child-14914-module>',
})
class TargetComponent {
  public constructor(
    @Inject(TOKEN) public readonly dependency: Dependency,
  ) {}
}

@NgModule({
  declarations: [TargetComponent, ChildComponent],
  exports: [TargetComponent],
  providers: [{ provide: TOKEN, useValue: originalValue }],
})
class KeptModule {
  public readonly constructedValue: string;

  public constructor(
    @Inject(TOKEN) public readonly dependency: Dependency,
  ) {
    this.constructedValue = dependency.label;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14914
describe('issue-14914:module', () => {
  it('isolates generated kept-module subclasses from their original and siblings', async () => {
    const firstValue = new Dependency('first');
    // Replacing a declaration forces a subclass of the decorated kept module.
    const firstDefinition = MockBuilder(KeptModule)
      .replace(ChildComponent, FirstChildComponent, {
        dependency: true,
      })
      .provide({ provide: TOKEN, useValue: firstValue })
      .build();
    let firstClass: Type<KeptModule> = KeptModule;
    for (const imported of firstDefinition.imports!) {
      if (isMockedNgDefOf(imported, KeptModule, 'm')) {
        firstClass = imported;
        break;
      }
    }
    expect(firstClass).toBeDefined();
    await TestBed.configureTestingModule(
      firstDefinition,
    ).compileComponents();
    const firstFixture = TestBed.createComponent(TargetComponent);
    firstFixture.detectChanges();
    const firstModule =
      firstFixture.debugElement.injector.get(firstClass);

    expect(firstClass).not.toBe(KeptModule);
    expect(Object.getPrototypeOf(firstClass.prototype)).toBe(
      KeptModule.prototype,
    );
    expect(firstModule.constructor).toBe(firstClass);
    expect(firstModule instanceof KeptModule).toBe(true);
    expect(firstModule.dependency).toBe(firstValue);
    expect(firstModule.constructedValue).toEqual('first');
    expect(firstFixture.componentInstance.constructor).toBe(
      TargetComponent,
    );
    expect(firstFixture.componentInstance.dependency).toBe(
      firstValue,
    );
    expect(firstFixture.debugElement.injector.get(TOKEN)).toBe(
      firstValue,
    );
    expect(
      ngMocks.findInstance(firstFixture, FirstChildComponent)
        .constructor,
    ).toBe(FirstChildComponent);
    expect(
      ngMocks.find(firstFixture, FirstChildComponent).nativeElement
        .dataset.child,
    ).toEqual('first');
    expect(ngMocks.formatText(firstFixture)).toEqual(
      'first first child',
    );

    TestBed.resetTestingModule();
    const secondValue = new Dependency('second');
    const secondDefinition = MockBuilder(KeptModule)
      .replace(ChildComponent, SecondChildComponent, {
        dependency: true,
      })
      .provide({ provide: TOKEN, useValue: secondValue })
      .build();
    let secondClass: Type<KeptModule> = KeptModule;
    for (const imported of secondDefinition.imports!) {
      if (isMockedNgDefOf(imported, KeptModule, 'm')) {
        secondClass = imported;
        break;
      }
    }
    expect(secondClass).toBeDefined();
    await TestBed.configureTestingModule(
      secondDefinition,
    ).compileComponents();
    const secondFixture = TestBed.createComponent(TargetComponent);
    secondFixture.detectChanges();
    const secondModule =
      secondFixture.debugElement.injector.get(secondClass);

    expect(secondClass).not.toBe(firstClass);
    expect(Object.getPrototypeOf(secondClass.prototype)).toBe(
      KeptModule.prototype,
    );
    expect(secondModule.constructor).toBe(secondClass);
    expect(secondModule instanceof KeptModule).toBe(true);
    expect(secondModule).not.toBe(firstModule);
    expect(secondModule.dependency).toBe(secondValue);
    expect(secondModule.constructedValue).toEqual('second');
    expect(secondFixture.componentInstance.dependency).toBe(
      secondValue,
    );
    expect(secondFixture.debugElement.injector.get(TOKEN)).toBe(
      secondValue,
    );
    expect(
      ngMocks.findInstance(secondFixture, SecondChildComponent)
        .constructor,
    ).toBe(SecondChildComponent);
    expect(
      ngMocks.find(secondFixture, SecondChildComponent).nativeElement
        .dataset.child,
    ).toEqual('second');
    expect(ngMocks.formatText(secondFixture)).toEqual(
      'second second child',
    );
    expect(firstModule.dependency).toBe(firstValue);
    expect(firstModule.constructedValue).toEqual('first');

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [firstClass],
      providers: [{ provide: TOKEN, useValue: firstValue }],
    }).compileComponents();
    const reusedFixture = TestBed.createComponent(TargetComponent);
    reusedFixture.detectChanges();
    const reusedModule =
      reusedFixture.debugElement.injector.get(firstClass);

    expect(reusedModule.constructor).toBe(firstClass);
    expect(reusedModule).not.toBe(firstModule);
    expect(reusedModule.dependency).toBe(firstValue);
    expect(reusedModule.constructedValue).toEqual('first');
    expect(reusedFixture.componentInstance.dependency).toBe(
      firstValue,
    );
    expect(
      ngMocks.findInstance(reusedFixture, FirstChildComponent)
        .constructor,
    ).toBe(FirstChildComponent);
    expect(
      ngMocks.find(reusedFixture, FirstChildComponent).nativeElement
        .dataset.child,
    ).toEqual('first');
    expect(ngMocks.formatText(reusedFixture)).toEqual(
      'first first child',
    );

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [KeptModule],
    }).compileComponents();
    const originalFixture = TestBed.createComponent(TargetComponent);
    originalFixture.detectChanges();
    const originalModule =
      originalFixture.debugElement.injector.get(KeptModule);

    expect(originalModule.constructor).toBe(KeptModule);
    expect(originalModule.dependency).toBe(originalValue);
    expect(originalModule.constructedValue).toEqual('original');
    expect(originalFixture.componentInstance.constructor).toBe(
      TargetComponent,
    );
    expect(originalFixture.componentInstance.dependency).toBe(
      originalValue,
    );
    expect(originalFixture.debugElement.injector.get(TOKEN)).toBe(
      originalValue,
    );
    expect(
      ngMocks.findInstance(originalFixture, ChildComponent)
        .constructor,
    ).toBe(ChildComponent);
    expect(
      ngMocks.find(originalFixture, ChildComponent).nativeElement
        .dataset.child,
    ).toEqual('original');
    expect(ngMocks.formatText(originalFixture)).toEqual(
      'original original child',
    );
    expect(firstModule.dependency).toBe(firstValue);
    expect(secondModule.dependency).toBe(secondValue);
  });
});
