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
