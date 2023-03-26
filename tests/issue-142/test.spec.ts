import {
  Component,
  Inject,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule } from 'ng-mocks';

const TARGET_TOKEN = new InjectionToken('TARGET_TOKEN');

@NgModule()
class TargetModule {
  public static forRoot() {
    return {
      ngModule: TargetModule,
      providers: [
        {
          multi: true,
          provide: TARGET_TOKEN,
          useValue: true,
        },
      ],
    };
  }

  public constructor(
    @Inject(TARGET_TOKEN) public readonly targetToken: boolean,
  ) {}
}

@Component({
  selector: 'target-142',
  template: 'target',
})
class TargetComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/142
describe('issue-142', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [MockModule(TargetModule.forRoot())],
    }).compileComponents(),
  );

  it('test', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    expect(fixture).toBeDefined();
  });
});
