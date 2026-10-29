import {
  Component,
  Directive,
  Input,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  MockDirective,
  MockPipe,
  ngMocks,
} from 'ng-mocks';

@Directive({ selector: '[mixedOriginal]', standalone: true })
class OriginalDirective {
  public static constructed = 0;
  @Input() public value = '';

  public constructor() {
    OriginalDirective.constructed += 1;
  }
}

@Pipe({ name: 'mixedOriginal', standalone: true })
class OriginalPipe implements PipeTransform {
  public static calls = 0;

  public transform(value: string): string {
    OriginalPipe.calls += 1;

    return `real:${value}`;
  }
}

@Component({
  selector: 'mixed-declaration-host',
  standalone: true,
  imports: [OriginalDirective, OriginalPipe],
  template:
    '<span mixedOriginal [value]="value">{{ value | mixedOriginal }}</span>',
})
class HostComponent {
  public value = 'bound';
}

describe('MockComponent:mixed standalone declarations', () => {
  beforeEach(() => {
    OriginalDirective.constructed = 0;
    OriginalPipe.calls = 0;
  });

  it('retains supplied directive and pipe classes and the pipe transform', async () => {
    const directive = MockDirective(OriginalDirective);
    const pipe = MockPipe(OriginalPipe, value => `mock:${value}`);
    await TestBed.configureTestingModule({
      imports: [HostComponent, directive, pipe],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = ngMocks.find(fixture, OriginalDirective);

    expect(ngMocks.formatText(fixture)).toBe('mock:bound');
    expect(ngMocks.get(element, OriginalDirective).value).toBe(
      'bound',
    );
    expect(OriginalDirective.constructed).toBe(0);
    expect(OriginalPipe.calls).toBe(0);
    expect(getMockedNgDefOf(OriginalDirective, 'd')).toBe(directive);
    expect(getMockedNgDefOf(OriginalPipe, 'p')).toBe(pipe);
    expect(element.providerTokens).toContain(directive);
    expect(element.injector.get(directive, null)).toBe(
      ngMocks.get(element, OriginalDirective),
    );
  });
});
