import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  InjectionToken,
  Input,
  NgModule,
  Pipe,
  PipeTransform,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@Pipe({
  name: 'pure',
})
class PurePipe implements PipeTransform {
  public value: any;

  public transform(value: any): any {
    this.value = value;

    return value;
  }
}

@Pipe({
  name: 'impure',
  pure: false,
})
class ImpurePipe implements PipeTransform {
  public value: any;

  public transform(value: any): any {
    this.value = value;

    return value;
  }
}

@Directive({
  providers: [
    {
      provide: TOKEN,
      useValue: 'test',
    },
  ],
  selector: '[tpl]',
})
class TplDirective {
  @Input() public readonly data: any = null;
  @Input('tpl') public readonly name: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  providers: [
    {
      provide: TOKEN,
      useValue: 'test',
    },
  ],
  selector: '[tpl2]',
})
class Tpl2Directive {
  @Input('tpl') public readonly name: string | null = null;

  public constructor(public readonly tpl?: TemplateRef<any>) {}
}

@Directive({
  providers: [
    {
      provide: TOKEN,
      useValue: 'test',
    },
  ],
  selector: '[block]',
})
class BlockDirective {
  @Input('block') public readonly name: string | null = null;

  @ContentChild(Tpl2Directive, {} as any)
  public readonly template?: QueryList<Tpl2Directive>;

  @ContentChildren(TplDirective)
  public readonly templates?: QueryList<TplDirective>;
}

@Component({
  providers: [
    {
      provide: TOKEN,
      useValue: 'test',
    },
  ],
  selector: 'mock',
  template: '',
})
class MockComponent {
  @ContentChildren(BlockDirective)
  public blocks?: QueryList<BlockDirective>;
}

@NgModule({
  declarations: [
    MockComponent,
    BlockDirective,
    TplDirective,
    Tpl2Directive,
    PurePipe,
    ImpurePipe,
  ],
  imports: [CommonModule],
  providers: [
    {
      provide: TOKEN,
      useValue: 'test',
    },
  ],
})
class TargetModule {}

describe('ng-mocks-reveal:test', () => {
  let fixture: ComponentFixture<any>;
  const data = {
    value: Math.random(),
  };

  beforeEach(() =>
    MockBuilder(null, TargetModule)
      .mock(PurePipe, v => v)
      .mock(ImpurePipe, v => v),
  );

  beforeEach(
    () =>
      (fixture = MockRender(
        `
      1-{{ echo | pure | impure }}
      <mock>
        <!-- fun --> 2 <!-- fun -->
        <ng-container block="1">
          3-{{ echo | impure | pure }}
          <ng-template tpl="header" [data]="data">rendered-header-1</ng-template>
          <!-- fun --> 4 <!-- fun -->
          <ng-template tpl2>rendered-1</ng-template>
          5-{{ echo | pure }}
          <ng-template tpl="footer" tpl2>rendered-footer-1</ng-template>
          <!-- fun --> 6 <!-- fun -->
        </ng-container>
        7-{{ echo | impure }}
        <div #div>
          <!-- fun --> 8 <!-- fun -->
          <span tpl2>hello</span>
          9-{{ echo }}
        </div>
        <!-- fun --> 10 <!-- fun -->
        <ng-container block="2">
          11-{{ echo | pure | impure }}
          <ng-template [tpl]="'header'">rendered-header-2</ng-template>
          <!-- fun --> 12 <!-- fun -->
          <ng-template tpl2>rendered-2</ng-template>
          13-{{ echo }}
          <ng-template [tpl]="'footer'" [data]="data">rendered-footer-2</ng-template>
          <!-- fun --> 14 <!-- fun -->
        </ng-container>
        15-{{ echo }}
      </mock>
      <!-- fun --> 16 <!-- fun -->
    `,
        { data, echo: 'A', tag: 'span' },
      )),
  );

  it('crawls blocks, templates and directives', () => {
    const el = ngMocks.reveal(MockComponent);
    expect(el).toBeDefined();
    expect(ngMocks.formatHtml(el)).toEqual(
      '2 3-A 4 5-A 6 7-A <div> 8 <span tpl2="">hello</span> 9-A </div> 10 11-A 12 13-A 14 15-A',
    );

    {
      expect(ngMocks.reveal(fixture, MockComponent)).toBe(el);
      expect(
        ngMocks.reveal(fixture.debugElement, MockComponent),
      ).toBe(el);
      expect(ngMocks.reveal('mock')).toBe(el);
      expect(ngMocks.reveal(fixture, 'mock')).toBe(el);
      expect(ngMocks.reveal(fixture.debugElement, 'mock')).toBe(el);
    }

    {
      const elSet = ngMocks.revealAll(MockComponent);
      expect(elSet.length).toEqual(1);
      expect(elSet[0]).toBe(el);
    }
    {
      const elSet = ngMocks.revealAll(fixture, MockComponent);
      expect(elSet.length).toEqual(1);
      expect(elSet[0]).toBe(el);
    }
    {
      const elSet = ngMocks.revealAll(
        fixture.debugElement,
        MockComponent,
      );
      expect(elSet.length).toEqual(1);
      expect(elSet[0]).toBe(el);
    }
    {
      const elSet = ngMocks.revealAll('mock');
      expect(elSet.length).toEqual(1);
      expect(elSet[0]).toBe(el);
    }
    {
      const elSet = ngMocks.revealAll(fixture, 'mock');
      expect(elSet.length).toEqual(1);
      expect(elSet[0]).toBe(el);
    }
    {
      const elSet = ngMocks.revealAll(fixture.debugElement, 'mock');
      expect(elSet.length).toEqual(1);
      expect(elSet[0]).toBe(el);
    }

    const div = ngMocks.reveal(el, '#div');
    expect(div).toBeDefined();
    expect(ngMocks.formatHtml(div)).toEqual(
      '8 <span tpl2="">hello</span> 9-A',
    );

    {
      const divSet = ngMocks.revealAll(el, '#div');
      expect(divSet.length).toEqual(1);
      expect(divSet[0]).toBe(div);
    }

    const tpl2 = ngMocks.reveal(div, Tpl2Directive);
    expect(tpl2).toBeDefined();

    {
      const tpl2Set = ngMocks.revealAll(div, Tpl2Directive);
      expect(tpl2Set.length).toEqual(1);
      expect(tpl2Set[0]).toBe(tpl2);
    }
    {
      // it is a tag name selector
      const tpl2Set = ngMocks.revealAll(div, 'tpl2');
      expect(tpl2Set.length).toEqual(0);
    }
    {
      // it is an attribute selector
      const tpl2Set = ngMocks.revealAll(div, ['tpl2']);
      expect(tpl2Set.length).toEqual(1);
      expect(tpl2Set[0]).toBe(tpl2);
    }
    {
      // it is an input selector, fails because there not an input.
      const tpl2Set = ngMocks.revealAll(div, ['tpl2', '']);
      expect(tpl2Set.length).toEqual(0);
    }

    {
      expect(ngMocks.revealAll(Tpl2Directive).length).toEqual(4);
      expect(ngMocks.revealAll(['tpl2']).length).toEqual(4);
    }

    const blocks = ngMocks.revealAll(el, ['block']);
    expect(blocks.length).toEqual(2);
    const [block1, block2] = blocks;
    expect(block1.injector.get(BlockDirective).name).toEqual('1');
    expect(block2.injector.get(BlockDirective).name).toEqual('2');

    {
      expect(ngMocks.revealAll(block1, ['tpl2']).length).toEqual(2);
      expect(ngMocks.revealAll(block2, Tpl2Directive).length).toEqual(
        1,
      );
    }

    {
      const header = ngMocks.reveal(block1, ['tpl', 'header']);
      expect(header.injector.get(TplDirective).name).toEqual(
        'header',
      );
      expect(header.injector.get(TplDirective).data).toBe(data);
      expect(() => footer.injector.get(Tpl2Directive)).toThrow();

      const footer = ngMocks.reveal(block1, ['tpl', 'footer']);
      expect(footer.injector.get(TplDirective).name).toEqual(
        'footer',
      );
      expect(footer.injector.get(TplDirective).data).toBeUndefined();
      expect(() => footer.injector.get(Tpl2Directive)).not.toThrow();

      const templates = ngMocks.revealAll(block1, ['tpl']);
      expect(templates.length).toEqual(2);
      expect(templates[0]).toBe(header);
      expect(templates[1]).toBe(footer);
    }

    {
      const header = ngMocks.reveal(block2, ['tpl', 'header']);
      expect(header.injector.get(TplDirective).name).toEqual(
        'header',
      );
      expect(header.injector.get(TplDirective).data).toBeUndefined();
      expect(() => footer.injector.get(Tpl2Directive)).toThrow();

      const footer = ngMocks.reveal(block2, ['tpl', 'footer']);
      expect(footer.injector.get(TplDirective).name).toEqual(
        'footer',
      );
      expect(footer.injector.get(TplDirective).data).toBe(data);
      expect(() => footer.injector.get(Tpl2Directive)).toThrow();

      const templates = ngMocks.revealAll(block2, TplDirective);
      expect(templates.length).toEqual(2);
      expect(templates[0]).toBe(header);
      expect(templates[1]).toBe(footer);
    }

    expect(ngMocks.formatHtml(el)).toContain('3-A 4');
    ngMocks.render(
      el.componentInstance,
      ngMocks.findTemplateRef(block1, ['tpl', 'header']),
    );
    expect(ngMocks.formatHtml(el)).toContain(
      '3-A rendered-header-1 4',
    );

    expect(ngMocks.formatHtml(el)).toContain('5-A 6');
    ngMocks.render(
      el.componentInstance,
      ngMocks.findTemplateRef(block1, ['tpl', 'footer']),
    );
    expect(ngMocks.formatHtml(el)).toContain(
      '5-A rendered-footer-1 6',
    );

    expect(ngMocks.formatHtml(el)).toContain('4 5-A');
    ngMocks.render(
      el.componentInstance,
      ngMocks.findTemplateRef(block1, Tpl2Directive),
    );
    expect(ngMocks.formatHtml(el)).toContain('4 rendered-1 5-A');

    expect(ngMocks.formatHtml(el)).toContain('11-A 12');
    ngMocks.render(
      el.componentInstance,
      ngMocks.findTemplateRef(block2, ['tpl', 'header']),
    );
    expect(ngMocks.formatHtml(el)).toContain(
      '11-A rendered-header-2 12',
    );

    expect(ngMocks.formatHtml(el)).toContain('13-A 14');
    ngMocks.render(
      el.componentInstance,
      ngMocks.findTemplateRef(block2, ['tpl', 'footer']),
    );
    expect(ngMocks.formatHtml(el)).toContain(
      '13-A rendered-footer-2 14',
    );

    expect(ngMocks.formatHtml(el)).toContain('12 13-A');
    ngMocks.render(
      el.componentInstance,
      ngMocks.findTemplateRef(block2, Tpl2Directive),
    );
    expect(ngMocks.formatHtml(el)).toContain('12 rendered-2 13-A');
  });

  it('throws on unknown selectors', () => {
    expect(() => ngMocks.reveal(5 as any)).toThrowError(
      'Unknown selector',
    );
    expect(() => ngMocks.revealAll({} as any)).toThrowError(
      'Unknown selector',
    );
  });

  it('throws on unknown elements', () => {
    expect(() => ngMocks.reveal('unknown')).toThrowError(
      'Cannot find a DebugElement via ngMocks.reveal(unknown)',
    );
  });

  it('returns default value on missed values selectors', () => {
    const defaultValue = {};
    expect(ngMocks.reveal('unknown', defaultValue)).toBe(
      defaultValue,
    );
  });

  it('skips itself', () => {
    ngMocks.flushTestBed();
    const loFixture = MockRender(`
      <ng-container block="1">
        <ng-container block="2">
          <ng-container block="3"></ng-container>
        </ng-container>
      </ng-container>
    `);

    const block1El = ngMocks.reveal(loFixture, BlockDirective);
    const block1 = ngMocks.get(block1El, BlockDirective);
    expect(block1.name).toEqual('1');

    const block2El = ngMocks.reveal(block1El, BlockDirective);
    const block2 = ngMocks.get(block2El, BlockDirective);
    expect(block2.name).toEqual('2');

    const block3El = ngMocks.reveal(block2El, BlockDirective);
    const block3 = ngMocks.get(block3El, BlockDirective);
    expect(block3.name).toEqual('3');

    expect(() =>
      ngMocks.reveal(block3El, BlockDirective),
    ).toThrowError(
      'Cannot find a DebugElement via ngMocks.reveal(BlockDirective)',
    );

    {
      const blocks = ngMocks.revealAll(loFixture, BlockDirective);
      expect(blocks.length).toEqual(3);
      expect(blocks[0]).toBe(block1El);
      expect(blocks[1]).toBe(block2El);
      expect(blocks[2]).toBe(block3El);
    }
    {
      const blocks = ngMocks.revealAll(block1El, BlockDirective);
      expect(blocks.length).toEqual(2);
      expect(blocks[0]).toBe(block2El);
      expect(blocks[1]).toBe(block3El);
    }
    {
      const blocks = ngMocks.revealAll(block2El, BlockDirective);
      expect(blocks.length).toEqual(1);
      expect(blocks[0]).toBe(block3El);
    }
    {
      const blocks = ngMocks.revealAll(block3El, BlockDirective);
      expect(blocks.length).toEqual(0);
    }
  });
});
