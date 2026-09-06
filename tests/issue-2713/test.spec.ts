import { Component, Injectable, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockInstance, MockProvider } from 'ng-mocks';

@Injectable()
class TargetService {
  public readName(): string {
    return 'real';
  }

  public readRole(): string {
    return 'real';
  }
}

@Component({
  selector: 'target-2713',
  ['standalone' as never]: false,
  template: '{{ name }}',
  providers: [
    MockProvider(TargetService, {
      readName: () => 'default',
      readRole: () => 'viewer',
    }),
  ],
})
class TargetComponent implements OnInit {
  public name = 'not initialized';

  public constructor(public readonly service: TargetService) {}

  public ngOnInit(): void {
    this.name = this.service.readName();
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/2713
// Creating a component also creates its injected mocks. Later MockInstance
// customizations must reach those same objects before ngOnInit consumes them.
describe('issue-2713', () => {
  MockInstance.scope();

  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
    }).compileComponents(),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetComponent);
  });

  it('customizes an already injected mock before initialization', () => {
    const component = fixture.componentInstance;
    const service = component.service;
    expect(service.readName()).toEqual('default');

    const readName =
      typeof jest === 'undefined'
        ? MockInstance(
            TargetService,
            'readName',
            jasmine.createSpy('readName'),
          ).and.returnValue('Alice')
        : MockInstance(
            TargetService,
            'readName',
            jest.fn(),
          ).mockReturnValue('Alice');

    expect(component.service).toBe(service);
    expect(service.readName).toBe(readName);
    expect(service.readRole()).toEqual('viewer');
    expect(component.name).toEqual('not initialized');
    expect(readName).not.toHaveBeenCalled();

    fixture.detectChanges();

    expect(component.name).toEqual('Alice');
    expect(fixture.nativeElement.textContent).toEqual('Alice');
    expect(readName).toHaveBeenCalledTimes(1);
  });

  it('changes subsequent calls without repeating initialization', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance.name).toEqual('default');

    MockInstance(TargetService, () => ({ readName: () => 'Alice' }));

    expect(fixture.componentInstance.service.readName()).toEqual(
      'Alice',
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.name).toEqual('default');
    expect(fixture.nativeElement.textContent).toEqual('default');
  });
});
