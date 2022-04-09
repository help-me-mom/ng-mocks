import { Directive } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: 'div,span,[data-label],[data-span]',
})
class TargetDirective {}

describe('ng-mocks-reveal-all:317', () => {
  beforeEach(() => MockBuilder(TargetDirective));

  it('finds by css selector', () => {
    MockRender(`
      <div>
        <span>00</span>
        <span data-span>01</span>
      </div>
      <div data-label="1">
        <span data-span="10">10</span>
        <span data-span="11">11</span>
      </div>
      <div data-label="2">
        <span data-span="20">20</span>
        <span data-span="21">21</span>
      </div>
    `);

    expect(
      ngMocks.formatText(ngMocks.revealAll('div', 'span')),
    ).toEqual(['00', '01']);
    expect(
      ngMocks.formatText(
        ngMocks.revealAll(['data-label'], ['data-span']),
      ),
    ).toEqual(['10', '11']);
    expect(
      ngMocks.formatText(
        ngMocks.revealAll(['data-label', 2], ['data-span']),
      ),
    ).toEqual(['20', '21']);

    expect(ngMocks.revealAll(['data-label', 3], 'span')).toEqual([]);
  });
});
