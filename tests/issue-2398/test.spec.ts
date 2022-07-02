import { Pipe, PipeTransform } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Pipe({
  name: 'phone',
})
class PhonePipe implements PipeTransform {
  transform(value: string | number): string {
    const inputVal = value.toString();
    const slice1 = inputVal.slice(0, 3);
    const slice2 = inputVal.slice(3, 6);
    const slice3 = inputVal.slice(6);
    return `+1(${slice1})-${slice2}-${slice3}`;
  }
}

// https://github.com/help-me-mom/ng-mocks/issues/2398
describe('issue-2398', () => {
  describe('provided', () => {
    beforeEach(() => MockBuilder(PhonePipe).provide(PhonePipe));

    it('transforms the value as a generator', () => {
      // the pipe is present in component
      const fixture = MockRender(PhonePipe, {
        $implicit: '4161234567',
      });
      expect(ngMocks.formatText(fixture)).toEqual('+1(416)-123-4567');

      // point instance should be the pipe
      expect(
        fixture.point.componentInstance.transform('4161234568'),
      ).toEqual('+1(416)-123-4568');
    });

    it('transforms the value as a service', () => {
      // the pipe is present in component
      const fixture = MockRender(PhonePipe);
      expect(
        fixture.point.componentInstance.transform('4161234567'),
      ).toEqual('+1(416)-123-4567');
    });

    it('transforms the value as a template', () => {
      // the pipe is present in component
      const fixture = MockRender('{{ "4161234567" | phone }}');
      expect(ngMocks.formatText(fixture)).toBe('+1(416)-123-4567');
    });

    it('provides the service', () => {
      const fixture = MockRender();

      // the pipe is injected as service
      expect(() =>
        fixture.point.injector.get(PhonePipe),
      ).not.toThrow();
    });
  });

  describe('declared', () => {
    beforeEach(() => MockBuilder(PhonePipe));

    it('transforms the value as a generator', () => {
      // the pipe is present in component
      const fixture = MockRender(PhonePipe, {
        $implicit: '4161234567',
      });
      expect(ngMocks.formatText(fixture)).toEqual('+1(416)-123-4567');

      // point instance should be the pipe
      expect(
        fixture.point.componentInstance.transform('4161234568'),
      ).toEqual('+1(416)-123-4568');
    });

    it('fails on not provided pipes', () => {
      expect(() => MockRender(PhonePipe)).toThrowError(
        /Did you forget to set \$implicit param/,
      );
    });
  });
});
