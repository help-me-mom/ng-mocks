import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Injectable,
  Input,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public constructor() {
    throw new Error('real constructor');
  }

  public echo(): string {
    throw new Error('real method');
  }
}

@Component({
  selector: 'target-14924',
  template: '',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ServiceToComponent extends TargetService {
  @Input() public plain = '';

  @Input('value')
  public get accessor(): string {
    throw new Error('real component getter');
  }

  public set accessor(value: string) {
    throw new Error(`real component setter: ${value}`);
  }
}

@Directive({
  selector: '[target14924]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ServiceToDirective extends TargetService {
  @Input() public plain = '';

  @Input('value')
  public get accessor(): string {
    throw new Error('real directive getter');
  }

  public set accessor(value: string) {
    throw new Error(`real directive setter: ${value}`);
  }
}

@Component({
  selector: 'host-14924',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <target-14924 [value]="left" [plain]="left"></target-14924>
    <target-14924 [value]="right" [plain]="right"></target-14924>
    <span target14924 [value]="left" [plain]="left"></span>
    <span target14924 [value]="right" [plain]="right"></span>
  `,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class HostComponent {
  public left = 'A';
  public right = 'B';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14924
describe('issue-14924', () => {
  for (const declaration of [
    ServiceToComponent,
    ServiceToDirective,
  ]) {
    describe(declaration.name, () => {
      beforeEach(() =>
        MockBuilder(HostComponent)
          .mock(ServiceToComponent)
          .mock(ServiceToDirective),
      );

      for (const injectSeed of [false, true]) {
        it(`keeps bound values independent with seed=${injectSeed}`, () => {
          const echo =
            typeof jest === 'undefined'
              ? jasmine.createSpy().and.returnValue('configured')
              : jest.fn().mockReturnValue('configured');
          const seed = injectSeed
            ? ngMocks.findInstance(declaration)
            : undefined;
          if (seed) {
            ngMocks.stub(seed, { echo });
          }

          const fixture = TestBed.createComponent(HostComponent);
          fixture.detectChanges();
          const nodes = ngMocks.findAll(fixture, declaration);
          const instances = nodes.map(node =>
            ngMocks.get(node, declaration),
          );

          expect(nodes.length).toEqual(2);
          expect(instances.length).toEqual(2);
          expect(instances[0]).not.toBe(instances[1]);
          for (const instance of instances) {
            expect(isMockOf(instance, declaration)).toEqual(true);
            if (seed) {
              expect(instance).not.toBe(seed);
              expect(instance.echo).toBe(echo);
              expect(instance.echo()).toEqual('configured');
            }
          }

          // Replaying a seed must not share its generated accessor's backing value.
          expect(instances[0].accessor).toEqual('A');
          expect(instances[1].accessor).toEqual('B');
          expect(ngMocks.input(nodes[0], 'value')).toEqual('A');
          expect(ngMocks.input(nodes[1], 'value')).toEqual('B');
          expect(instances[0].plain).toEqual('A');
          expect(instances[1].plain).toEqual('B');

          fixture.componentInstance.left = 'C';
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          expect(instances[0].accessor).toEqual('C');
          expect(instances[1].accessor).toEqual('B');
          expect(ngMocks.input(nodes[0], 'value')).toEqual('C');
          expect(ngMocks.input(nodes[1], 'value')).toEqual('B');
          expect(instances[0].plain).toEqual('C');
          expect(instances[1].plain).toEqual('B');
          if (seed) {
            expect(seed.accessor).toBeUndefined();
            expect(seed.plain).toBeUndefined();
            expect(echo).toHaveBeenCalledTimes(2);
          }
        });
      }

      it('preserves deliberately stubbed seed accessors', () => {
        const seed = ngMocks.findInstance(declaration);
        const get =
          typeof jest === 'undefined'
            ? jasmine.createSpy().and.returnValue('configured')
            : jest.fn().mockReturnValue('configured');
        const set =
          typeof jest === 'undefined'
            ? jasmine.createSpy()
            : jest.fn();
        ngMocks.stubMember(seed, 'accessor', get, 'get');
        ngMocks.stubMember(seed, 'accessor', set, 'set');

        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        const instances = ngMocks
          .findAll(fixture, declaration)
          .map(node => ngMocks.get(node, declaration));

        expect(instances.length).toEqual(2);
        expect(get).not.toHaveBeenCalled();
        expect(set).toHaveBeenCalledTimes(2);
        expect(set).toHaveBeenCalledWith('A');
        expect(set).toHaveBeenCalledWith('B');
        for (const instance of instances) {
          const descriptor = Object.getOwnPropertyDescriptor(
            instance,
            'accessor',
          );
          expect(descriptor && descriptor.get).toBe(get);
          expect(descriptor && descriptor.set).toBe(set);
          expect(instance.accessor).toEqual('configured');
        }
        expect(instances[0].plain).toEqual('A');
        expect(instances[1].plain).toEqual('B');

        fixture.componentInstance.left = 'C';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(set).toHaveBeenCalledTimes(3);
        expect(set).toHaveBeenCalledWith('C');
        expect(instances[1].plain).toEqual('B');
      });
    });
  }
});
