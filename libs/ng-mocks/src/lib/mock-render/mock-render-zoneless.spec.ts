import {
  ChangeDetectionStrategy,
  Component,
  Input,
  provideZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ngMocks } from '../mock-helper/mock-helper';

import { MockRenderFactory } from './mock-render-factory';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  template: '{{ content }}',
})
class ZonelessInputComponent {
  @Input() public content = '';
}

describe('MockRender zoneless input params', () => {
  // Core also loads Zone.js, so zoneless setup emits the expected NG0914 notice.
  ngMocks.ignoreOnConsole('warn');

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ZonelessInputComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('preserves inherited accessors', async () => {
    let content = 'initial';
    const writes: string[] = [];
    const prototype = Object.defineProperty({}, 'content', {
      configurable: true,
      enumerable: true,
      get: () => content,
      set: (value: string) => {
        writes.push(value);
        content = `set:${value}`;
      },
    });
    const params = Object.create(prototype) as {
      content: string;
    };
    const factory = MockRenderFactory(ZonelessInputComponent, [
      'content',
    ]);
    factory.configureTestBed();
    const fixture = factory(params);

    params.content = 'updated';
    await fixture.whenStable();

    expect(writes).toEqual(['updated']);
    expect(content).toEqual('set:updated');
    expect(fixture.point.componentInstance.content).toEqual(
      'set:updated',
    );
  });

  // @see https://github.com/help-me-mom/ng-mocks/issues/14898
  it('schedules wrapper and params writes once while preserving the inherited setter', async () => {
    let content = 'initial';
    const writes: string[] = [];
    const prototype = Object.defineProperty({}, 'content', {
      configurable: true,
      enumerable: true,
      get: () => content,
      set: (value: string) => {
        writes.push(value);
        content = `set:${value}`;
      },
    });
    const params = Object.create(prototype) as {
      content: string;
    };
    const factory = MockRenderFactory(ZonelessInputComponent, [
      'content',
    ]);
    factory.configureTestBed();
    const fixture = factory(params);
    await fixture.whenStable();
    const markForCheck = spyOn(
      fixture.changeDetectorRef,
      'markForCheck',
    ).and.callThrough();

    // A proxy write must notify Angular as well as invoke the saved setter.
    fixture.componentInstance.content = 'from wrapper';

    expect(params.content).toEqual('set:from wrapper');
    expect(writes).toEqual(['from wrapper']);
    expect(markForCheck).toHaveBeenCalledTimes(1);
    await fixture.whenStable();
    expect(fixture.point.componentInstance.content).toEqual(
      'set:from wrapper',
    );
    expect(ngMocks.formatText(fixture)).toEqual('set:from wrapper');

    params.content = 'from params';

    expect(fixture.componentInstance.content).toEqual(
      'set:from params',
    );
    expect(writes).toEqual(['from wrapper', 'from params']);
    expect(markForCheck).toHaveBeenCalledTimes(2);
    await fixture.whenStable();
    expect(fixture.point.componentInstance.content).toEqual(
      'set:from params',
    );
    expect(ngMocks.formatText(fixture)).toEqual('set:from params');

    fixture.componentInstance.content = 'from wrapper';

    expect(params.content).toEqual('set:from wrapper');
    expect(writes).toEqual([
      'from wrapper',
      'from params',
      'from wrapper',
    ]);
    expect(markForCheck).toHaveBeenCalledTimes(3);
    await fixture.whenStable();
    expect(fixture.point.componentInstance.content).toEqual(
      'set:from wrapper',
    );
    expect(ngMocks.formatText(fixture)).toEqual('set:from wrapper');
  });

  it('schedules both live fixtures when they share params', async () => {
    const params = {
      content: 'initial',
    };
    const factory = MockRenderFactory(ZonelessInputComponent, [
      'content',
    ]);
    factory.configureTestBed();
    const first = factory(params);
    const second = factory(params);
    await first.whenStable();
    await second.whenStable();

    expect(ngMocks.formatText(first)).toEqual('initial');
    expect(ngMocks.formatText(second)).toEqual('initial');

    // The older proxy must use the current setter shared by both fixtures.
    first.componentInstance.content = 'from older wrapper';
    await first.whenStable();
    await second.whenStable();

    expect(params.content).toEqual('from older wrapper');
    expect(first.point.componentInstance.content).toEqual(
      'from older wrapper',
    );
    expect(second.point.componentInstance.content).toEqual(
      'from older wrapper',
    );
    expect(ngMocks.formatText(first)).toEqual('from older wrapper');
    expect(ngMocks.formatText(second)).toEqual('from older wrapper');

    params.content = 'from params';
    await first.whenStable();
    await second.whenStable();

    expect(first.point.componentInstance.content).toEqual(
      'from params',
    );
    expect(second.point.componentInstance.content).toEqual(
      'from params',
    );
    expect(ngMocks.formatText(first)).toEqual('from params');
    expect(ngMocks.formatText(second)).toEqual('from params');
  });

  it('preserves shared params writes after a fixture is destroyed', async () => {
    let content = 'initial';
    const writes: string[] = [];
    const params = Object.defineProperty({}, 'content', {
      configurable: true,
      enumerable: true,
      get: () => content,
      set: (value: string) => {
        writes.push(value);
        content = `set:${value}`;
      },
    }) as {
      content: string;
    };
    const factory = MockRenderFactory(ZonelessInputComponent, [
      'content',
    ]);
    factory.configureTestBed();
    const first = factory(params);
    const second = factory(params);
    await first.whenStable();
    await second.whenStable();
    first.destroy();
    const destroyedMarkForCheck = spyOn(
      first.changeDetectorRef,
      'markForCheck',
    ).and.callThrough();

    params.content = 'updated';
    await second.whenStable();

    expect(writes).toEqual(['updated']);
    expect(content).toEqual('set:updated');
    expect(params.content).toEqual('set:updated');
    expect(second.point.componentInstance.content).toEqual(
      'set:updated',
    );
    expect(ngMocks.formatText(second)).toEqual('set:updated');
    expect(destroyedMarkForCheck).not.toHaveBeenCalled();
  });

  it('supports nonextensible partial params', () => {
    const factory = MockRenderFactory(ZonelessInputComponent, [
      'content',
    ]);
    factory.configureTestBed();
    const params = Object.freeze({}) as {
      content?: string;
    };

    expect(factory(params)).toBeTruthy();
  });

  it('uses the original setter when the params descriptor locks', () => {
    let content = 'initial';
    const params = Object.defineProperty({}, 'content', {
      configurable: true,
      get: () => {
        Object.defineProperty(params, 'content', {
          configurable: false,
          get: () => content,
          set: value => (content = value),
        });

        return content;
      },
      set: value => (content = value),
    }) as {
      content: string;
    };
    const factory = MockRenderFactory(ZonelessInputComponent, [
      'content',
    ]);
    factory.configureTestBed();
    const fixture = factory(params);

    fixture.componentInstance.content = 'updated';

    expect(params.content).toEqual('updated');
  });
});
