import { Component, Inject, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockModule } from 'ng-mocks';

export const TARGET_TOKEN = new InjectionToken('TARGET_TOKEN');

@NgModule()
export class TargetModule {
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

  public readonly targetToken: boolean = false;

  public constructor(@Inject(TARGET_TOKEN) targetToken: boolean) {
    this.targetToken = targetToken;
  }
}

@Component({
  selector: 'target',
  template: 'target',
})
export class TargetComponent {}

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
