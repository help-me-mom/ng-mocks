import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  NgModule,
  RendererFactory2,
} from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  animations: [
    trigger('state', [
      transition('void => *', [
        style({
          backgroundColor: '#000',
          color: '#fff',
          height: 0,
        }),
        animate(10 * 1000, style({ height: 100 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-641',
  template: `<div @state (@state.done)="show = true">
    <span *ngIf="show">target</span>
  </div>`,
})
class TargetComponent {
  public show = false;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule, BrowserAnimationsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/641
describe('issue-641', () => {
  beforeAll(() =>
    ngMocks.globalReplace(
      BrowserAnimationsModule,
      NoopAnimationsModule,
    ),
  );
  afterAll(() => ngMocks.globalWipe(BrowserAnimationsModule));

  describe('BrowserAnimationsModule:default', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('works on whenStable and due to NoopAnimationsModule', async () => {
      const fixture = MockRender(TargetComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('target');
    });

    it('works on whenStable and due to NoopAnimationsModule', async () => {
      const fixture = MockRender(TargetComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('target');
    });
  });

  // unfortunately with real animations it is not so easy.
  // eslint-disable-next-line no-restricted-globals
  xdescribe('BrowserAnimationsModule:mock', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule)
        .mock(BrowserAnimationsModule)
        .exclude(RendererFactory2),
    );

    it('fails due to mock BrowserAnimationsModule', fakeAsync(() => {
      const fixture = MockRender(TargetComponent);
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        tick(10 * 1000);
        flush();

        // In a mock BrowserAnimationsModule nothing happens,
        // and it doesn't render "target".
        expect(ngMocks.formatText(fixture)).toEqual('');

        fixture.destroy();
      });
    }));
  });

  describe('BrowserAnimationsModule:exclude', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).exclude(
        BrowserAnimationsModule,
      ),
    );

    it('fails due to missing BrowserAnimationsModule', () => {
      expect(() => MockRender(TargetComponent)).toThrowError(
        /BrowserAnimationsModule/,
      );
    });
  });

  describe('BrowserAnimationsModule:replace', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).replace(
        BrowserAnimationsModule,
        NoopAnimationsModule,
      ),
    );

    it('works on whenStable and due to NoopAnimationsModule', async () => {
      const fixture = MockRender(TargetComponent);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('target');
    });
  });

  // unfortunately with real animations it is not so easy.
  // eslint-disable-next-line no-restricted-globals
  xdescribe('BrowserAnimationsModule:keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(
        BrowserAnimationsModule,
      ),
    );

    it('works on whenStable and due to BrowserAnimationsModule', fakeAsync(() => {
      const fixture = MockRender(TargetComponent);
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        // waiting for the animation
        tick(9999);

        // we need to wait for real animation ended
        expect(ngMocks.formatText(fixture)).not.toEqual('target');

        // waiting for the animation
        tick(1);

        // profit
        expect(ngMocks.formatText(fixture)).toEqual('target');

        fixture.destroy();
      });
    }));
  });
});
