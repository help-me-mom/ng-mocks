import { ElementRef } from '@angular/core';

import { MockRender } from '../../mock-render/mock-render';
import { ngMocks } from '../mock-helper';

import mockHelperFindInstances from './mock-helper.find-instances';

describe('mock-helper.find-instances:performance', () => {
  it('does not crawl a completed subtree again for an overlapping context', () => {
    const fixture = MockRender(
      '<div class="context"><section class="context"><span></span></section></div>',
    );
    const [outer, inner] = ngMocks.findAll('.context');
    const children = spyOnProperty(
      inner,
      'childNodes',
      'get',
    ).and.callThrough();

    const single = mockHelperFindInstances<ElementRef>(
      outer,
      ElementRef,
    );
    const reads = children.calls.count();
    children.calls.reset();
    // Selector discovery is outside this comparison: count only the instance crawl.
    const query = spyOn(
      fixture.debugElement,
      'queryAll',
    ).and.returnValue([outer, inner]);

    const overlapping = mockHelperFindInstances<ElementRef>(
      '.context',
      ElementRef,
    );

    expect(
      overlapping.map(instance => instance.nativeElement),
    ).toEqual(single.map(instance => instance.nativeElement));
    expect(single.length).toBe(3);
    expect(reads).toBeGreaterThan(0);
    expect(query).toHaveBeenCalledTimes(1);
    expect(children.calls.count()).toBe(reads);
  });
});
