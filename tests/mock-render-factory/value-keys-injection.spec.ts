import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public receiver?: TargetService;
  public value = () => 'default';

  public readValue(): string {
    this.receiver = this;

    return this.value();
  }
}

@Pipe({
  name: 'targetValueKeysInjection',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public receiver?: TargetPipe;
  public value = () => 'default';

  public transform(prefix: string): string {
    this.receiver = this;

    return `${prefix}:${this.value()}`;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14913
describe('mock-render-factory:value-keys-injection', () => {
  beforeEach(() =>
    MockBuilder([TargetService, TargetPipe]).provide(TargetPipe),
  );

  it('preserves service callable values while keeping method proxies bound to the service', () => {
    const value = () => 'initial';
    const params: Partial<TargetService> = { value };
    const options = { detectChanges: true, valueKeys: ['value'] };
    const fixture = MockRender(TargetService, params, options);
    const service = fixture.point.componentInstance;
    const readValue = fixture.componentInstance.readValue;

    expect(ngMocks.get(TargetService)).toBe(service);
    expect(fixture.componentInstance.value).toBe(value);
    expect(service.value).toBe(value);
    expect(readValue).not.toBe(service.readValue);
    expect(fixture.componentInstance.readValue).toBe(readValue);
    expect(fixture.componentInstance.readValue!()).toEqual('initial');
    expect(service.receiver).toBe(service);

    const replacement = () => 'replacement';
    fixture.componentInstance.value = replacement;

    expect(fixture.componentInstance.value).toBe(replacement);
    expect(service.value).toBe(replacement);
    expect(params.value).toBe(value);
    expect(fixture.componentInstance.readValue).toBe(readValue);
    expect(fixture.componentInstance.readValue!()).toEqual(
      'replacement',
    );
    expect(service.receiver).toBe(service);
  });

  it('preserves callable values when a provided pipe is rendered without an implicit value', () => {
    const value = () => 'initial';
    const params: Partial<TargetPipe> = { value };
    const options = { detectChanges: true, valueKeys: ['value'] };
    const fixture = MockRender(TargetPipe, params, options);
    const pipe = fixture.point.componentInstance;
    const transform = fixture.componentInstance.transform;

    expect(ngMocks.get(TargetPipe)).toBe(pipe);
    expect(fixture.componentInstance.value).toBe(value);
    expect(pipe.value).toBe(value);
    expect(transform).not.toBe(pipe.transform);
    expect(fixture.componentInstance.transform).toBe(transform);
    expect(fixture.componentInstance.transform!('pipe')).toEqual(
      'pipe:initial',
    );
    expect(pipe.receiver).toBe(pipe);

    const replacement = () => 'replacement';
    fixture.componentInstance.value = replacement;

    expect(fixture.componentInstance.value).toBe(replacement);
    expect(pipe.value).toBe(replacement);
    expect(params.value).toBe(value);
    expect(fixture.componentInstance.transform).toBe(transform);
    expect(fixture.componentInstance.transform!('pipe')).toEqual(
      'pipe:replacement',
    );
    expect(pipe.receiver).toBe(pipe);
  });
});
