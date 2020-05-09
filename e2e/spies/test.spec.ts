import { inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockModule, MockRender } from 'ng-mocks';

import { TargetComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';
import { TargetService } from './fixtures.providers';
import createSpyObj = jasmine.createSpyObj;
import Spy = jasmine.Spy;

describe('spies:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [TargetModule],
    }).compileComponents()
  );

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.debugElement.query(By.directive(TargetComponent)).componentInstance as TargetComponent;
    expect(component).toBeDefined();
    expect(component.echo()).toEqual('TargetComponent');
  });
});

describe('spies:manual-mock', () => {
  beforeEach(() => {
    const spy = createSpyObj<TargetService>('TargetService', ['echo']);
    spy.echo.and.returnValue('fake');

    return TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [MockModule(TargetModule)],
      providers: [
        {
          provide: TargetService,
          useValue: spy,
        },
      ],
    }).compileComponents();
  });

  it('should get manually mocked service', inject([TargetService], (targetService: TargetService) => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.debugElement.query(By.directive(TargetComponent)).componentInstance as TargetComponent;
    expect(component).toBeDefined();
    expect(targetService.echo).toHaveBeenCalledTimes(1);
    expect(targetService.echo).toHaveBeenCalledWith('constructor');
    expect(component.echo()).toEqual('fake');
    expect(targetService.echo).toHaveBeenCalledTimes(2); // tslint:disable-line:no-magic-numbers
  }));
});

describe('spies:auto-mock', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [MockModule(TargetModule)],
    }).compileComponents()
  );

  it('should get already mocked service', inject([TargetService], (targetService: TargetService) => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.debugElement.query(By.directive(TargetComponent)).componentInstance as TargetComponent;
    expect(component).toBeDefined();
    expect(targetService.echo).toHaveBeenCalledTimes(1);
    expect(targetService.echo).toHaveBeenCalledWith('constructor');
    (targetService.echo as Spy).and.returnValue('faked');
    expect(component.echo()).toEqual('faked');
    expect(targetService.echo).toHaveBeenCalledTimes(2); // tslint:disable-line:no-magic-numbers
  }));
});
