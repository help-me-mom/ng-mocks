import { inject, TestBed } from '@angular/core/testing';
import { MockModule, MockRender, ngMocks } from 'ng-mocks';

import { TargetComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';
import { TargetService } from './fixtures.providers';

describe('spies:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [TargetModule],
    }).compileComponents()
  );

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.find(fixture.debugElement, TargetComponent).componentInstance;
    expect(component).toBeDefined();
    expect(component.echo()).toEqual('TargetComponent');
  });
});

describe('spies:manual-mock', () => {
  beforeEach(() => {
    const spy = jasmine.createSpyObj<TargetService>('TargetService', ['echo']);
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
    const component = ngMocks.find(fixture.debugElement, TargetComponent).componentInstance;
    expect(component).toBeDefined();
    expect(targetService.echo).toHaveBeenCalledTimes(1);
    expect(targetService.echo).toHaveBeenCalledWith('constructor');
    expect(component.echo()).toEqual('fake');
    expect(targetService.echo).toHaveBeenCalledTimes(2);
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
    const component = ngMocks.find(fixture.debugElement, TargetComponent).componentInstance;
    expect(component).toBeDefined();
    expect(targetService.echo).toHaveBeenCalledTimes(1);
    expect(targetService.echo).toHaveBeenCalledWith('constructor');
    ngMocks.stub<jasmine.Spy>(targetService, 'echo').and.returnValue('faked');
    expect(component.echo()).toEqual('faked');
    expect(targetService.echo).toHaveBeenCalledTimes(2);
  }));
});
