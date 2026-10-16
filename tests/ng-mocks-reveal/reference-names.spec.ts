import { Component } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <ng-template #first>first</ng-template>
    <ng-template #expectedConstructor #constructor
      >constructor</ng-template
    >
    <ng-template #expectedToString #toString>toString</ng-template>
  `,
})
class TargetComponent {}

describe('ng-mocks-reveal:reference-names', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('does not find Object.prototype names without a declared reference', () => {
    const fixture = MockRender(TargetComponent);

    for (const id of ['hasOwnProperty', 'valueOf']) {
      expect(ngMocks.reveal(fixture, `#${id}`, null)).toBeNull();
      expect(ngMocks.revealAll(fixture, `#${id}`)).toEqual([]);
      expect(ngMocks.findTemplateRef(fixture, id, null)).toBeNull();
      expect(ngMocks.findTemplateRefs(fixture, id)).toEqual([]);

      let message = '';
      try {
        ngMocks.reveal(fixture, `#${id}`);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).toBe(
        `Cannot find a DebugElement via ngMocks.reveal(#${id})`,
      );
    }
  });

  it('finds own references that shadow Object.prototype names', () => {
    const fixture = MockRender(TargetComponent);

    for (const [id, expected] of [
      ['constructor', 'expectedConstructor'],
      ['toString', 'expectedToString'],
    ]) {
      const node = ngMocks.reveal(fixture, `#${expected}`);
      const template = ngMocks.findTemplateRef(fixture, expected);

      expect(ngMocks.reveal(fixture, `#${id}`)).toBe(node);
      expect(ngMocks.revealAll(fixture, `#${id}`)).toEqual([node]);
      expect(
        ngMocks.findTemplateRef(fixture, id).elementRef.nativeElement,
      ).toBe(template.elementRef.nativeElement);
      expect(
        ngMocks
          .findTemplateRefs(fixture, id)
          .map(result => result.elementRef.nativeElement),
      ).toEqual([template.elementRef.nativeElement]);
    }
  });
});
