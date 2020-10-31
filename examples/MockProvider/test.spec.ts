import { Component, Inject, Injectable, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

const DEPENDENCY_TOKEN = new InjectionToken('TARGET_TOKEN');

@Injectable()
class DependencyService {
  public name = 'target';
}

@Component({
  selector: 'target',
  template: `{{ service.name }} {{ token }}`,
})
class TargetComponent {
  public readonly service: DependencyService;
  public readonly token: string;

  constructor(service: DependencyService, @Inject(DEPENDENCY_TOKEN) token: string) {
    this.service = service;
    this.token = token;
  }
}

describe('MockProvider', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [MockProvider(DependencyService), MockProvider(DEPENDENCY_TOKEN, 'mocked token')],
    }).compileComponents()
  );

  it('mocks providers', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).not.toContain('target');
    expect(fixture.nativeElement.innerHTML).toContain('mocked token');
  });
});
