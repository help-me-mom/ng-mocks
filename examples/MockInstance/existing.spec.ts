import { Component, Injectable, OnInit } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, MockProvider, ngMocks } from 'ng-mocks';

@Injectable()
class UserService {
  public getName(): string {
    return 'real';
  }
}

@Component({
  selector: 'user-profile',
  ['standalone' as never]: false,
  template: '{{ name }}',
})
class ProfileComponent implements OnInit {
  public name = '';

  public constructor(public readonly user: UserService) {}

  public ngOnInit(): void {
    this.name = this.user.getName();
  }
}

describe('MockInstance:existing', () => {
  MockInstance.scope();

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      providers: [
        MockProvider(UserService, { getName: () => 'default' }),
      ],
    }).compileComponents(),
  );

  it('customizes an injected mock before ngOnInit uses it', () => {
    // Creating the real component also creates its mocked dependency.
    const fixture = TestBed.createComponent(ProfileComponent);
    const user = fixture.componentInstance.user;

    const getName =
      typeof jest === 'undefined'
        ? MockInstance(
            UserService,
            'getName',
            jasmine.createSpy(),
          ).and.returnValue('Alice')
        : MockInstance(
            UserService,
            'getName',
            jest.fn(),
          ).mockReturnValue('Alice');

    // The component still holds the same service instance.
    expect(fixture.componentInstance.user).toBe(user);
    expect(user.getName).toBe(getName);
    expect(getName).not.toHaveBeenCalled();

    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toEqual('Alice');
    expect(getName).toHaveBeenCalledTimes(1);
  });

  it('changes future calls without repeating initialization', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('default');

    MockInstance(UserService, 'getName', () => 'Alice');
    expect(fixture.componentInstance.user.getName()).toEqual('Alice');

    // ngOnInit already copied the earlier value into the component.
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('default');
  });
});
