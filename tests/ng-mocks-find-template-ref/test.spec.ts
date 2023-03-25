import {
  Component,
  Directive,
  Injectable,
  Input,
  NgModule,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[target]',
})
class TargetDirective {
  @Input() public readonly target: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  selector: '[unused]',
})
class UnusedDirective {
  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Component({
  selector: 'target-ng-mocks-find-template-of',
  template: '',
})
class TargetComponent {}

@Component({
  selector: 'test',
  template: `
    <target-ng-mocks-find-template-of>
      1
      <ng-template #id1>id1</ng-template>
      2
      <ng-template #id2>id2</ng-template>
      3
      <span>
        4
        <ng-template target="1">target1</ng-template>
        5
        <span>
          6
          <span *target="'2'">target2</span>
          7
        </span>
        8
      </span>
      9
    </target-ng-mocks-find-template-of>
  `,
})
class TestComponent {}

@Injectable()
class TargetService {}

@NgModule({
  declarations: [
    TestComponent,
    TargetDirective,
    TargetComponent,
    UnusedDirective,
  ],
  providers: [TargetService],
})
class TargetModule {}

describe('ng-mocks-find-template-ref', () => {
  beforeEach(() => MockBuilder(TestComponent, TargetModule));

  it('finds the template based on id', () => {
    const fixture = MockRender(TestComponent);

    const tpl1 = ngMocks.findTemplateRef('id1');
    const tpl2 = ngMocks.findTemplateRef(fixture, 'id1');
    const tpl3 = ngMocks.findTemplateRef(fixture.debugElement, 'id2');

    expect(tpl1).toBeDefined();
    expect(tpl1).toEqual(tpl2);
    expect(tpl1).not.toEqual(tpl3);
  });

  it('finds the template based on attribute', () => {
    const fixture = MockRender(TestComponent);

    const tpl1 = ngMocks.findTemplateRef(['target']);
    const tpl2 = ngMocks.findTemplateRef(fixture, ['target', '1']);
    const tpl3 = ngMocks.findTemplateRef(fixture.debugElement, [
      'target',
      '2',
    ]);

    expect(tpl1).toBeDefined();
    expect(tpl1).toEqual(tpl2);
    expect(tpl3).toBeDefined();
    expect(tpl2).not.toEqual(tpl3);
    expect(tpl1).not.toEqual(tpl3);
  });

  it('finds the template based on directive', () => {
    const fixture = MockRender(TestComponent);

    const tpl1 = ngMocks.findTemplateRef(TargetDirective);
    const tpl2 = ngMocks.findTemplateRef(fixture, TargetDirective);
    const tpl3 = ngMocks.findTemplateRef(
      fixture.debugElement,
      TargetDirective,
    );

    expect(tpl1).toBeDefined();
    expect(tpl1).toEqual(tpl2);
    expect(tpl1).toEqual(tpl3);
  });

  it('throws on missed directives', () => {
    const fixture = MockRender(TestComponent);

    expect(() => ngMocks.findTemplateRef('unknownId')).toThrowError(
      'Cannot find a TemplateRef via ngMocks.findTemplateRef(unknownId)',
    );
    expect(() =>
      ngMocks.findTemplateRef(fixture, ['unknownAttribute1']),
    ).toThrowError(
      'Cannot find a TemplateRef via ngMocks.findTemplateRef(unknownAttribute1)',
    );
    expect(() =>
      ngMocks.findTemplateRef(fixture.debugElement, [
        'unknownAttribute2',
        'value',
      ]),
    ).toThrowError(
      'Cannot find a TemplateRef via ngMocks.findTemplateRef(unknownAttribute2)',
    );
    expect(() =>
      ngMocks.findTemplateRef(UnusedDirective),
    ).toThrowError(
      'Cannot find a TemplateRef via ngMocks.findTemplateRef(UnusedDirective)',
    );
  });

  it('returns default value on missed directives', () => {
    const fixture = MockRender(TestComponent);

    expect(ngMocks.findTemplateRef('unknownId', null)).toEqual(null);
    expect(
      ngMocks.findTemplateRef(fixture, ['unknownAttribute1'], null),
    ).toEqual(null);
    expect(
      ngMocks.findTemplateRef(
        fixture.debugElement,
        ['unknownAttribute2', 'value'],
        null,
      ),
    ).toEqual(null);
    expect(ngMocks.findTemplateRef(UnusedDirective, null)).toEqual(
      null,
    );
  });

  it('returns default value on missed directives', () => {
    const fixture = MockRender(TestComponent);

    expect(ngMocks.findTemplateRef('unknownId', null)).toEqual(null);
    expect(
      ngMocks.findTemplateRef(fixture, ['unknownAttribute1'], null),
    ).toEqual(null);
    expect(
      ngMocks.findTemplateRef(
        fixture.debugElement,
        ['unknownAttribute2', 'value'],
        null,
      ),
    ).toEqual(null);
    expect(ngMocks.findTemplateRef(UnusedDirective, null)).toEqual(
      null,
    );
  });

  it('fails on wrong selector type', () => {
    MockRender(TestComponent);
    expect(() => ngMocks.findTemplateRef(123 as any)).toThrowError(
      'Unknown selector',
    );
  });

  it('fails on unknown fixture', () => {
    expect(() => ngMocks.findTemplateRef('id1')).toThrowError(
      'Cannot find a TemplateRef via ngMocks.findTemplateRef(id1)',
    );
  });
});
