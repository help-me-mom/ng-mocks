import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  Self,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import coreDefineProperty from '../common/core.define-property';
import coreForm from '../common/core.form';
import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { Type } from '../common/core.types';
import { LegacyControlValueAccessor } from '../common/mock-control-value-accessor';
import decorateDeclaration from '../mock/decorate-declaration';
import getMock from '../mock/get-mock';

import { MockedDirective } from './types';

class DirectiveMockBase extends LegacyControlValueAccessor implements OnInit {
  // istanbul ignore next
  public constructor(
    injector: Injector,
    ngControl: any, // NgControl
    cdr: ChangeDetectorRef,
    vcr: ViewContainerRef,
    element: ElementRef | null = null,
    template: TemplateRef<any> | null = null,
  ) {
    super(injector, ngControl);
    this.__ngMocksInstall(vcr, cdr, element, template);
  }

  public ngOnInit(): void {
    const config = (this.__ngMocksConfig as any).config;
    if (config?.render) {
      const { $implicit, variables } =
        config.render === true
          ? {
              $implicit: undefined,
              variables: {},
            }
          : config.render;
      (this as any).__render($implicit, variables);
    }
  }

  private __ngMocksInstall(
    vcr: ViewContainerRef,
    cdr: ChangeDetectorRef,
    element: ElementRef | null,
    template: TemplateRef<any> | null,
  ): void {
    // Basically any directive on ng-template is treated as structural, even it does not control render process.
    // In our case we do not if we should render it or not and due to this we do nothing.
    coreDefineProperty(this, '__element', element);
    coreDefineProperty(this, '__template', template);
    coreDefineProperty(this, '__viewContainer', vcr);
    coreDefineProperty(this, '__vcr', vcr);
    coreDefineProperty(this, '__cdr', cdr);
    coreDefineProperty(this, '__isStructural', template && vcr);

    // Providing method to render mock values.
    coreDefineProperty(this, '__render', ($implicit?: any, variables?: Record<keyof any, any>) => {
      if (vcr && template) {
        vcr.clear();
        vcr.createEmbeddedView(template, { ...variables, $implicit });
        cdr.detectChanges();
      }
    });
  }
}

coreDefineProperty(DirectiveMockBase, 'parameters', [
  [Injector],
  [coreForm.NgControl || /* istanbul ignore next */ (() => undefined), new Optional(), new Self()],
  [ChangeDetectorRef],
  [ViewContainerRef],
  [ElementRef, new Optional(), new Self()],
  [TemplateRef, new Optional(), new Self()],
]);

const decorateClass = (directive: Type<any>, mock: Type<any>): void => {
  const meta = coreReflectDirectiveResolve(directive);
  const options = decorateDeclaration(directive, mock, meta, {});
  Directive(options)(mock);
};

/**
 * MockDirectives creates an array of mock directive classes out of directives passed as parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockDirective
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   declarations: MockDirectives(
 *     Dep1Directive,
 *     Dep2Directive,
 *   ),
 * });
 * ```
 */
export function MockDirectives(...directives: Array<Type<any>>): Array<Type<MockedDirective<any>>> {
  return directives.map(MockDirective);
}

/**
 * MockDirective creates a mock directive class out of an arbitrary directive.
 *
 * @see https://ng-mocks.sudo.eu/api/MockDirective
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   declarations: [
 *     MockDirective(Dep1Directive),
 *     MockDirective(Dep2Directive),
 *   ],
 * });
 * ```
 */
export function MockDirective<TDirective>(directive: Type<TDirective>): Type<MockedDirective<TDirective>> {
  return getMock(directive, 'd', 'MockDirective', 'cacheDirective', DirectiveMockBase, decorateClass);
}
