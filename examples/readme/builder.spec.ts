import {
  Component,
  HostListener,
  Injectable,
  Input,
  NgModule,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

// remove with A5
export const EMPTY = new Subject<any>();
EMPTY.complete();

interface User {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

@Injectable()
class AuthService {
  public readonly currentUser?: User;
  public readonly isLoggedIn$ = new Subject<boolean>();
}

@Injectable()
class StorageService {
  public user?: User;

  public save(user: User): void {
    this.user = user;
  }
}

@Component({
  selector: 'profile',
  template: `<form [formGroup]="form">
    <input type="text" name="email" formControlName="email" />
    <input type="text" name="firstName" formControlName="firstName" />
    <input type="text" name="lastName" formControlName="lastName" />
  </form>`,
})
class ProfileComponent implements OnInit {
  public readonly form = new FormGroup({
    email: new FormControl('', Validators.required),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
  });

  @Input() public readonly profile: User | null = null;

  public constructor(private readonly storage: StorageService) {}

  public ngOnInit(): void {
    if (this.profile) {
      this.form.patchValue(this.profile);
    }
  }

  @HostListener('keyup.control.s')
  public save(): void {
    this.storage.save(this.form.value);
  }
}

@NgModule({
  declarations: [ProfileComponent],
  imports: [ReactiveFormsModule],
  providers: [AuthService, StorageService],
})
class ProfileModule {}

ngMocks.defaultMock(AuthService, () => ({
  isLoggedIn$: EMPTY,
}));

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// Let's imagine that there is a ProfileComponent
// and it has 3 text fields: email, firstName,
// lastName, and a user can edit them.
// In the following test suite, we would like to
// cover behavior of the component.
describe('profile:builder', () => {
  // First of all, we want to avoid creation of
  // the same TestBed for every test, because it
  // is not going to be changed from test to test.
  // https://ng-mocks.sudo.eu/api/ngMocks/faster
  ngMocks.faster();

  // Helps to reset customizations after each test.
  MockInstance.scope();

  // Let's configure TestBed via MockBuilder.
  // The code below says to mock everything in
  // ProfileModule except ProfileComponent and
  // ReactiveFormsModule.
  beforeAll(() => {
    // The result of MockBuilder should be returned.
    // https://ng-mocks.sudo.eu/api/MockBuilder
    return MockBuilder(ProfileComponent, ProfileModule).keep(
      ReactiveFormsModule,
    );
    // // or old fashion way
    // return TestBed.configureTestingModule({
    //   imports: [
    //     MockModule(SharedModule), // mock
    //     ReactiveFormsModule, // real
    //   ],
    //   declarations: [
    //     ProfileComponent, // real
    //     MockPipe(CurrencyPipe), // mock
    //     MockDirective(HoverDirective), // mock
    //   ],
    //   providers: [
    //     MockProvider(AuthService), // mock
    //   ],
    // }).compileComponents();
  });

  // A test to ensure that ProfileComponent
  // can be created.
  it('should be created', () => {
    // MockRender is an advanced version of
    // TestBed.createComponent.
    // It respects all lifecycle hooks,
    // onPush change detection, and creates a
    // wrapper component with a template like
    // <app-root ...allInputs></profile>
    // and renders it.
    // It also respects all lifecycle hooks.
    // https://ng-mocks.sudo.eu/api/MockRender
    const fixture = MockRender(ProfileComponent);

    expect(fixture.point.componentInstance).toEqual(
      assertion.any(ProfileComponent),
    );
  });

  // A test to ensure that internal form controls
  // are populated with provided @Input value.
  it('prefills profile', () => {
    // A fake profile.
    const profile = {
      email: 'test1@email.com',
      firstName: 'testFirst1',
      lastName: 'testLast1',
    };

    // In such a case, MockRender creates
    // a template like:
    // <profile [profile]="params.profile">
    // </profile>
    // https://ng-mocks.sudo.eu/api/MockRender
    const fixture = MockRender(ProfileComponent, { profile });

    // `point` is the access point to the debug
    // node with the real component instance.
    // Let's assert the form value.
    const inst = fixture.point.componentInstance;
    expect(inst.form.value).toEqual(profile);
  });

  // A test to ensure that the component listens
  // on ctrl+s hotkey.
  it('saves on ctrl+s hot key', () => {
    // A fake profile.
    const profile = {
      email: 'test2@email.com',
      firstName: 'testFirst2',
      lastName: 'testLast2',
    };

    // A spy to track save calls.
    // MockInstance helps to configure mock
    // providers, declarations and modules
    // before their initialization and usage.
    // https://ng-mocks.sudo.eu/api/MockInstance
    const spySave = MockInstance(
      StorageService,
      'save',
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),
    );

    // Renders <profile [profile]="params.profile">
    // </profile>.
    // https://ng-mocks.sudo.eu/api/MockRender
    const { point } = MockRender(ProfileComponent, { profile });

    // Let's change the value of the form control
    // for email addresses with a random value.
    // ngMocks.change finds a related control
    // value accessor and updates it properly.
    // https://ng-mocks.sudo.eu/api/ngMocks/change
    ngMocks.change(
      '[name=email]', // css selector
      'test3@em.ail', // an email address
    );

    // Let's ensure that nothing has been called.
    expect(spySave).not.toHaveBeenCalled();

    // Let's assume that there is a host listener
    // for a keyboard combination of ctrl+s,
    // and we want to trigger it.
    // ngMocks.trigger helps to emit events via
    // simple interface.
    // https://ng-mocks.sudo.eu/api/ngMocks/trigger
    ngMocks.trigger(point, 'keyup.control.s');

    // The spy should be called with the user
    // and the random email address.
    expect(spySave).toHaveBeenCalledWith({
      email: 'test3@em.ail',
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  });
});
