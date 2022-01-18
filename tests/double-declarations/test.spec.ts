// tslint:disable cyclomatic-complexity

import { EventEmitter } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  BaseCls,
  BaseCls1,
  BaseCls2,
  BaseCls3,
  DivCls,
  OverrideCls,
  OverrideCls1,
  OverrideCls2,
  OverrideCls3,
} from './fixtures';

describe('double-declarations', () => {
  const cases: Array<[string, any[], any[]]> = [
    [
      'real',
      [
        [
          BaseCls,
          BaseCls1,
          BaseCls2,
          BaseCls3,
          OverrideCls1,
          OverrideCls2,
          OverrideCls3,
        ],
      ],
      [
        [
          OverrideCls,
          DivCls,
          BaseCls1,
          BaseCls2,
          BaseCls3,
          OverrideCls1,
          OverrideCls2,
          OverrideCls3,
        ],
      ],
    ],
    [
      'mock',
      [
        [
          BaseCls1,
          BaseCls2,
          BaseCls3,
          OverrideCls1,
          OverrideCls2,
          OverrideCls3,
        ],
        BaseCls,
      ],
      [
        [
          DivCls,
          BaseCls1,
          BaseCls2,
          BaseCls3,
          OverrideCls1,
          OverrideCls2,
          OverrideCls3,
        ],
        OverrideCls,
      ],
    ],
  ];

  for (const [contextName, case1, case2] of cases) {
    describe(contextName, () => {
      describe('base', () => {
        beforeEach(() =>
          MockBuilder.apply(MockBuilder, case1 as any),
        );

        it('renders base1', () => {
          MockRender(`<base1>test</base1>`);
          const instance = ngMocks.findInstance(BaseCls, undefined);
          expect(instance).toBeDefined();
        });

        it('fails on base2', () => {
          MockRender(`<base2>test</base2>`);
          const instance = ngMocks.findInstance(BaseCls, undefined);
          expect(instance).not.toBeDefined();
        });

        it('fails on base3', () => {
          MockRender(`<base3>test</base3>`);
          const instance = ngMocks.findInstance(BaseCls, undefined);
          expect(instance).not.toBeDefined();
        });

        it('uses mix1 as an input', () => {
          MockRender(`<base1 [mix1]="'mix1'"></base1>`);
          const instance = ngMocks.findInstance(BaseCls);
          expect(instance.mix1).toEqual('mix1');
        });

        it('uses mix1 as an output', () => {
          const data = { value: '' };
          MockRender(`<base1 (mix1)="value = 'mix1'"></base1>`, data);
          const instance = ngMocks.findInstance(BaseCls);
          (instance.mix1 as EventEmitter<void>).emit();
          expect(data.value).toEqual('mix1');
        });

        it('uses mix2 as an input', () => {
          MockRender(`<base1 [mix2]="'mix2'"></base1>`);
          const instance = ngMocks.findInstance(BaseCls);
          expect(instance.mix2).toEqual('mix2');
        });

        it('uses mix2 as an output', () => {
          const data = { value: '' };
          MockRender(`<base1 (mix2)="value = 'mix2'"></base1>`, data);
          const instance = ngMocks.findInstance(BaseCls);
          (instance.mix2 as EventEmitter<void>).emit();
          expect(data.value).toEqual('mix2');
        });
      });

      describe('override', () => {
        beforeEach(() =>
          MockBuilder.apply(MockBuilder, case2 as any),
        );

        it('renders override1', () => {
          const fixture = MockRender(`<override1>test</override1>`);
          const instance = ngMocks.findInstance(OverrideCls);
          expect(instance).toBeDefined();
          ngMocks.stub(instance, {
            hostBase1: 'base1',
            hostBase2: 'override2',
            hostOverride1: 'override1',
          });
          fixture.detectChanges();

          // renders component
          const html = ngMocks.formatHtml(fixture);
          if (contextName === 'real') {
            expect(html).toContain('base1="base1"');
            expect(html).toContain('base2="override2"');
            expect(html).toContain('override2="override2"');
            expect(html).toContain('override1="override1"');
          } else {
            // but doesn't not render host bindings in mock declarations.
            expect(html).not.toContain('base1="base1"');
            expect(html).not.toContain('base2="override2"');
            expect(html).not.toContain('override2="override2"');
            expect(html).not.toContain('override1="override1"');
          }
        });

        it('fails on override2', () => {
          const fixture = MockRender(`<override2>test</override2>`);
          const instance = ngMocks.findInstance(
            OverrideCls,
            undefined,
          );
          expect(instance).not.toBeDefined();

          // renders what it has accepted
          expect(ngMocks.formatHtml(fixture)).toEqual(
            '<override2>test</override2>',
          );
        });

        it('fails on override3', () => {
          const fixture = MockRender(`<override3>test</override3>`);
          const instance = ngMocks.findInstance(
            OverrideCls,
            undefined,
          );
          expect(instance).not.toBeDefined();

          // renders what it has accepted
          expect(ngMocks.formatHtml(fixture)).toEqual(
            '<override3>test</override3>',
          );
        });

        it('fails on base1', () => {
          MockRender(`<base1>test</base1>`);
          const instance = ngMocks.findInstance(BaseCls, undefined);
          expect(instance).not.toBeDefined();
        });

        it('fails on base2', () => {
          MockRender(`<base2>test</base2>`);
          const instance = ngMocks.findInstance(BaseCls, undefined);
          expect(instance).not.toBeDefined();
        });

        describe('props', () => {
          ngMocks.ignoreOnConsole('error');

          it('respects inputs', () => {
            MockRender(
              `<override1
                [prop1]="'prop1'"
                [override2alias]="'override2alias'"
                [override3alias]="'override3alias'"
                [propBase1]="'propBase1'"
                [propOverride1]="'propOverride1'"
              ></override1>`,
            );
            const instance = ngMocks.findInstance(OverrideCls);
            expect(instance.prop1).toEqual('prop1');
            expect(instance.prop2).toEqual('override2alias');
            expect(instance.prop3).toEqual('override3alias');
            expect(instance.propBase1).toEqual('propBase1');
            expect(instance.propOverride1).toEqual('propOverride1');
          });
        });

        it('respects outputs', () => {
          const data = { value: '' };
          MockRender(
            `<override1
          (prop1)="value = 'prop1'"
          (propBase2)="value = 'propBase2'"
          (propOverride2)="value = 'propOverride2'"
        ></override1>`,
            data,
          );
          const instance = ngMocks.findInstance(OverrideCls);
          (instance.prop1 as EventEmitter<void>).emit();
          expect(data.value).toEqual('prop1');
          instance.propBase2.emit();
          expect(data.value).toEqual('propBase2');
          instance.propOverride2.emit();
          expect(data.value).toEqual('propOverride2');
        });

        it('respects host listeners', () => {
          MockRender(`<override1></override1>`);
          const instanceEl = ngMocks.find(OverrideCls);
          const instance = ngMocks.get(instanceEl, OverrideCls);

          let triggers = 0;
          ngMocks.stubMember(instance, 'hostBaseHandler3', () => {
            triggers += 1;
          });
          expect(triggers).toEqual(0);
          ngMocks.trigger(instanceEl, 'focus');
          // host listeners are not triggered in mock declarations
          expect(triggers).toEqual(contextName === 'real' ? 1 : 0);
          ngMocks.trigger(instanceEl, 'click');
          expect(triggers).toEqual(contextName === 'real' ? 2 : 0);
        });

        it('respects content injections', () => {
          const fixture = MockRender(
            `<override1><div [prop]="value"></div></override1>`,
            { value: 1 },
          );
          const instance = ngMocks.findInstance(OverrideCls);

          expect(
            instance.contentChildBase &&
              instance.contentChildBase.prop,
          ).toEqual(1);
          expect(
            instance.contentChildrenBase &&
              instance.contentChildrenBase.first.prop,
          ).toEqual(1);
          expect(
            instance.contentChildrenBase &&
              instance.contentChildrenBase.length,
          ).toEqual(1);

          expect(
            instance.contentChildOverride &&
              instance.contentChildOverride.prop,
          ).toEqual(1);
          expect(
            instance.contentChildrenOverride &&
              instance.contentChildrenOverride.first.prop,
          ).toEqual(1);
          expect(
            instance.contentChildrenOverride &&
              instance.contentChildrenOverride.length,
          ).toEqual(1);

          fixture.componentInstance.value = 2;
          fixture.detectChanges();

          expect(
            instance.contentChildBase &&
              instance.contentChildBase.prop,
          ).toEqual(2);
          expect(
            instance.contentChildrenBase &&
              instance.contentChildrenBase.first.prop,
          ).toEqual(2);
          expect(
            instance.contentChildrenBase &&
              instance.contentChildrenBase.length,
          ).toEqual(1);

          expect(
            instance.contentChildOverride &&
              instance.contentChildOverride.prop,
          ).toEqual(2);
          expect(
            instance.contentChildrenOverride &&
              instance.contentChildrenOverride.first.prop,
          ).toEqual(2);
          expect(
            instance.contentChildrenOverride &&
              instance.contentChildrenOverride.length,
          ).toEqual(1);
        });
      });
    });
  }
});
