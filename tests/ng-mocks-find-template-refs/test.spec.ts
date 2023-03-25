import {
  Component,
  Directive,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@Injectable()
class NoSelectorService {}

@Directive({
  selector: 'target-ng-mocks-find-template-refs',
})
class NoAttributeSelectorDirective {}

@Directive({} as any)
class NoSelectorDirective {}

@Directive({
  providers: [
    {
      provide: NoAttributeSelectorDirective,
      useExisting: TargetDirective,
    },
    {
      provide: NoSelectorDirective,
      useExisting: TargetDirective,
    },
    {
      provide: TOKEN,
      useExisting: true,
    },
    NoSelectorService,
  ],
  selector: '[target]',
})
class TargetDirective {
  @Input() public readonly target: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  selector: '[target2]',
})
class Target2Directive {
  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  selector: 'ng-template',
})
class NgTemplateDirective {
  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  selector: '[unused]',
})
class UnusedDirective {
  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Component({
  selector: 'target-ng-mocks-find-template-refs',
  template: '',
})
class TargetComponent {}

@Component({
  selector: 'test',
  template: `
    <target-ng-mocks-find-template-refs>
      1
      <ng-template #id1>id1</ng-template>
      2
      <ng-template #id2>id2</ng-template>
      3
      <span>
        4
        <ng-template target="1" target2 target3>target1</ng-template>
        5
        <span>
          6
          <span *target="'2'">target2</span>
          7
        </span>
        8
      </span>
      9
    </target-ng-mocks-find-template-refs>
  `,
})
class TestComponent {}

@Injectable()
class TargetService {}

@NgModule({
  declarations: [
    TestComponent,
    TargetDirective,
    Target2Directive,
    NgTemplateDirective,
    TargetComponent,
    UnusedDirective,
  ],
  providers: [TargetService],
})
class TargetModule {}

describe('ng-mocks-find-template-refs', () => {
  beforeEach(() => MockBuilder(TestComponent, TargetModule));

  it('finds the template based on id', () => {
    const fixture = MockRender(TestComponent);

    const [tpl1] = ngMocks.findTemplateRefs('id1');
    const [tpl2] = ngMocks.findTemplateRefs(fixture, 'id1');
    const [tpl3] = ngMocks.findTemplateRefs(
      fixture.debugElement,
      'id2',
    );

    expect(tpl1).toBeDefined();
    expect(tpl1).toEqual(tpl2);
    expect(tpl1).not.toEqual(tpl3);
  });

  it('finds the template based on attribute', () => {
    const fixture = MockRender(TestComponent);

    const tpl = ngMocks.findTemplateRefs(['target']);
    const [tpl2] = ngMocks.findTemplateRefs(fixture, ['target', '1']);
    const [tpl3] = ngMocks.findTemplateRefs(fixture.debugElement, [
      'target',
      '2',
    ]);

    expect(tpl.length).toBeGreaterThan(0);
    expect(tpl[0]).toEqual(tpl2);
    expect(tpl[1]).toEqual(tpl3);
  });

  it('finds the template based on directive', () => {
    const fixture = MockRender(TestComponent);

    const tpl1 = ngMocks.findTemplateRefs(TargetDirective);
    const tpl2 = ngMocks.findTemplateRefs(fixture, TargetDirective);
    const tpl3 = ngMocks.findTemplateRefs(
      fixture.debugElement,
      TargetDirective,
    );

    expect(tpl1.length).toBeGreaterThan(0);
    expect(tpl1).toEqual(tpl2);
    expect(tpl1).toEqual(tpl3);
  });

  it('returns empty arrays on missed directives', () => {
    const fixture = MockRender(TestComponent);

    expect(ngMocks.findTemplateRefs('unknownId')).toEqual([]);
    expect(
      ngMocks.findTemplateRefs(fixture, ['unknownAttribute1']),
    ).toEqual([]);
    expect(
      ngMocks.findTemplateRefs(fixture.debugElement, [
        'unknownAttribute2',
        'value',
      ]),
    ).toEqual([]);
    expect(ngMocks.findTemplateRefs(UnusedDirective)).toEqual([]);
  });

  it('fails on wrong selector type', () => {
    MockRender(TestComponent);
    expect(() => ngMocks.findTemplateRefs(123 as any)).toThrowError(
      'Unknown selector',
    );
  });

  it('returns nothing on unknown fixture', () => {
    expect(ngMocks.findTemplateRefs('id1')).toEqual([]);
  });
});
