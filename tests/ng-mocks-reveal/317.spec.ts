import { Directive } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: 'div,span,[data-label],[data-span]',
})
class TargetDirective {}

describe('ng-mocks-reveal:317', () => {
  beforeEach(() => MockBuilder(TargetDirective));

  it('finds by css selector', () => {
    MockRender(`
      <div>
        <span>00</span>
        <span data-span>01</span>
      </div>
      <div data-label="1">
        <span>10</span>
        <span data-span>11</span>
      </div>
      <div data-label="2">
        <span>20</span>
        <span data-span>21</span>
      </div>
    `);

    expect(ngMocks.formatText(ngMocks.reveal('div', 'span'))).toEqual(
      '00',
    );
    expect(
      ngMocks.formatText(ngMocks.reveal(['data-label'], 'span')),
    ).toEqual('10');
    expect(
      ngMocks.formatText(ngMocks.reveal(['data-label', 2], 'span')),
    ).toEqual('20');

    expect(() =>
      ngMocks.reveal(['data-label', 3], 'span'),
    ).toThrowError(
      'Cannot find a DebugElement via ngMocks.reveal(span)',
    );
  });
});
