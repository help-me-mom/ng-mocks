import {
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AnimationDriver } from '@angular/animations/browser';
import { Component, DebugElement, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 0,
        }),
      ),
      state(
        'closed',
        style({
          opacity: 1,
        }),
      ),
      transition('open => closed', []),
      transition('closed => open', []),
    ]),
  ],
  selector: 'target-1377',
  template: `
    <div [@openClose]="isOpen ? 'open' : 'closed'">
      The box is now {{ isOpen ? 'Open' : 'Closed' }}!
    </div>
  `,
})
class TargetComponent {
  public isOpen = true;

  public toggle() {
    this.isOpen = !this.isOpen;
  }
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
})
class TargetModule {}

const expectBrowserAnimations = async () => {
  const fixture = MockRender(TargetComponent);
  const driver = fixture.point.injector.get(AnimationDriver);
  // the browser provider
  // Skipping the check for IE and react-jsdom
  if (
    typeof (Element as any) !== 'undefined' &&
    typeof (Element as any).prototype.animate === 'function'
  ) {
    expect(driver.constructor.name).not.toEqual(
      'NoopAnimationDriver',
    );
  }
  expect((driver as any).__ngMocks).toBeUndefined();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Open!');
    expect(div.nativeElement.style['opacity']).toEqual('0');
  }

  fixture.point.componentInstance.toggle();
  fixture.detectChanges();
  await fixture.whenStable();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Closed!');
    expect(div.nativeElement.style['opacity']).toEqual('1');
  }
};

const expectNoopAnimations = async () => {
  const fixture = MockRender(TargetComponent);
  const driver = fixture.point.injector.get(AnimationDriver);
  // the noop provider
  expect(driver.constructor.name).toEqual('NoopAnimationDriver');
  expect((driver as any).__ngMocks).toBeUndefined();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Open!');
    expect(div.nativeElement.style['opacity']).toEqual('0');
  }

  fixture.point.componentInstance.toggle();
  fixture.detectChanges();
  await fixture.whenStable();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Closed!');
    expect(div.nativeElement.style['opacity']).toEqual('1');
  }
};

const expectNoAnimations = async () => {
  const fixture = MockRender(TargetComponent);
  const driver = fixture.point.injector.get(AnimationDriver);
  // the mock provider
  expect((driver as any).__ngMocks).toEqual(true);

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Open!');
    expect(div.nativeElement.style['opacity']).toEqual('');
  }

  fixture.point.componentInstance.toggle();
  fixture.detectChanges();
  await fixture.whenStable();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Closed!');
    expect(div.nativeElement.style['opacity']).toEqual('');
  }
};

const expectThrow = () => {
  expect(() => MockRender(TargetComponent)).toThrowError(
    /BrowserAnimationsModule/,
  );
};

const expectEmpty = () => {
  const fixture = MockRender(TargetComponent);

  expect(ngMocks.formatHtml(fixture)).toEqual(
    '<target-1377></target-1377>',
  );
  expect(
    isMockOf(fixture.point.componentInstance, TargetComponent, 'c'),
  ).toEqual(true);
};

// @see https://github.com/help-me-mom/ng-mocks/issues/1377
describe('issue-1377', () => {
  describe('BrowserAnimationsModule', () => {
    describe('classic', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
          imports: [BrowserModule, BrowserAnimationsModule],
        }).compileComponents(),
      );

      it('renders animations', expectBrowserAnimations);
    });

    describe('MockModule', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
          imports: [
            BrowserModule,
            MockModule(BrowserAnimationsModule),
          ],
        }).compileComponents(),
      );

      it(
        'does not render animations due to mocks',
        expectNoAnimations,
      );
    });

    describe('MockBuilder:default', () => {
      beforeEach(() => MockBuilder(TargetComponent, TargetModule));

      it(
        'does not render animations due to mocks',
        expectNoAnimations,
      );
    });

    describe('MockBuilder:keep', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).keep(
          BrowserAnimationsModule,
        ),
      );

      it('renders animations due to .keep', expectBrowserAnimations);
    });

    describe('MockBuilder:mock', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).mock(
          BrowserAnimationsModule,
        ),
      );

      it(
        'does not render animations due to mocks',
        expectNoAnimations,
      );
    });

    describe('MockBuilder:replace', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).replace(
          BrowserAnimationsModule,
          NoopAnimationsModule,
        ),
      );

      it('uses noop animations', expectNoopAnimations);
    });

    describe('MockBuilder:exclude', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).exclude(
          BrowserAnimationsModule,
        ),
      );

      it('throws an error', expectThrow);
    });

    describe('ngMocks.guts:default', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts(TargetComponent, TargetModule),
        ).compileComponents(),
      );

      it(
        'does not render animations due to mock',
        expectNoAnimations,
      );
    });

    describe('ngMocks.guts:mock', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts([TargetModule], BrowserAnimationsModule),
        ).compileComponents(),
      );

      it(
        'does not render animations due to mock',
        expectNoAnimations,
      );
    });

    describe('ngMocks.guts:keep', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts(
            [TargetComponent, BrowserAnimationsModule],
            TargetModule,
          ),
        ).compileComponents(),
      );

      it('renders animations due to keep', expectBrowserAnimations);
    });

    describe('ngMocks.guts:exclude', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts(
            TargetComponent,
            TargetModule,
            BrowserAnimationsModule,
          ),
        ).compileComponents(),
      );

      it('throws an error', expectThrow);
    });
  });

  describe('NoopAnimationsModule', () => {
    beforeAll(() =>
      ngMocks.globalReplace(
        BrowserAnimationsModule,
        NoopAnimationsModule,
      ),
    );
    afterAll(() => ngMocks.globalWipe(BrowserAnimationsModule));

    describe('classic', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
          imports: [BrowserModule, NoopAnimationsModule],
        }).compileComponents(),
      );

      it('uses noop animations', expectNoopAnimations);
    });

    describe('MockModule', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
          imports: [
            BrowserModule,
            MockModule(BrowserAnimationsModule),
          ],
        }).compileComponents(),
      );

      it(
        'does not render animations due to mocks',
        expectNoAnimations,
      );
    });

    describe('MockBuilder:default', () => {
      beforeEach(() => MockBuilder(TargetComponent, TargetModule));

      it('uses noop animations', expectNoopAnimations);
    });

    describe('MockBuilder:keep', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).keep(
          BrowserAnimationsModule,
        ),
      );

      it('renders animations due to .keep', expectBrowserAnimations);
    });

    describe('MockBuilder:mock', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).mock(
          BrowserAnimationsModule,
        ),
      );

      it(
        'does not render animations due to .mock',
        expectNoAnimations,
      );
    });

    describe('MockBuilder:replace', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).replace(
          BrowserAnimationsModule,
          NoopAnimationsModule,
        ),
      );

      it('uses noop animations', expectNoopAnimations);
    });

    describe('MockBuilder:exclude', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).exclude(
          BrowserAnimationsModule,
        ),
      );

      it('throws an error', expectThrow);
    });

    describe('ngMocks.guts:default', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts(TargetComponent, TargetModule),
        ).compileComponents(),
      );

      it('uses noop animations', expectNoopAnimations);
    });

    describe('ngMocks.guts:mock', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts([TargetModule], BrowserAnimationsModule),
        ).compileComponents(),
      );

      it(
        'does not render animations due to mock',
        expectNoAnimations,
      );
    });

    describe('ngMocks.guts:keep', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts(
            [TargetComponent, BrowserAnimationsModule],
            TargetModule,
          ),
        ).compileComponents(),
      );

      it('renders animations due to keep', expectBrowserAnimations);
    });

    describe('ngMocks.guts:exclude', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts(
            TargetComponent,
            TargetModule,
            BrowserAnimationsModule,
          ),
        ).compileComponents(),
      );

      it('throws an error', expectThrow);
    });
  });

  describe('mock animations', () => {
    describe('MockComponent', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [MockComponent(TargetComponent)],
        }).compileComponents(),
      );

      it('renders empty element', expectEmpty);
    });

    describe('MockModule', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          imports: [MockModule(TargetModule)],
        }).compileComponents(),
      );

      it('renders empty element', expectEmpty);
    });

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(null, TargetComponent));

      it('renders empty element', expectEmpty);
    });

    describe('ngMocks.guts', () => {
      beforeEach(() =>
        TestBed.configureTestingModule(
          ngMocks.guts(null, TargetModule),
        ).compileComponents(),
      );

      it('renders empty element', expectEmpty);
    });
  });
});
