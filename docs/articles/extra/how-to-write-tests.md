---
title: Proposal how to write tests in Angular
description: Proposal how to write tests in Angular
sidebar_label: How to write tests
---

After years of writing code and covering it with unit tests,
I've found out that default suggestion with scoped variables simply causes more issues
later on when we need to add one more test to a spec written long time ago, or to refactor something.

Let's take a look at an example of the default suggestion, but to make it more realistic, let's add some spies to it:

```ts
describe('BannerComponent', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  
  // added for spies
  let userService: UserService;
  let userSaveSpy: Spy<UserService['save']>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BannerComponent],
      providers: [UserService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    
    // some spies    
    userService = TestBed.inject(UserService);
    userSaveSpy = spyOn(userService, 'save');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
```

Let's review the test.
Just for 1 component, 1 fixture, 1 service and only 1 spy we already have around 15 lines of code.

What if we need to spy more methods, and we need access to more services?
The answer is: the boilerplate will grow so much that at some point we will be lost among all scoped variables
and links between each other.
Also, to make the situation even worse,
some spies will be definitely customized there,
whereas the customization doesn't fit our slightly different requirements.
And of course, if we touch them, other tests will fail.

To solve that we need to "Reduce the setup" and isolate each test.
Luckily, Angular docs already have this suggestion, but, unfortunately,
it's not very emphasized, whereas this is the key to maintainable specs.

## Maintainable Proposal

The proposal is to write tests without scoped variables and with the next structure:

```ts
describe('suite', () => {
  beforeEach(() => {
    // 1. configuring TestBed for all tests in the suite
  });

  it('test', () => {
    // 2. customizing mocks, configuring inputs, etc
    // 3. creating a fixture
    // 4. asserting expectations
  });
});
```

With such an approach, the test will look like:

```ts
describe('BannerComponent', () => {
  beforeEach(waitForAsync(() => {
    // 1. configuring TestBed for all tests in the suite
    TestBed.configureTestingModule({
      declarations: [BannerComponent],
      providers: [UserService],
    }).compileComponents();
  }));

  it('should create', () => {    
    // 2. customizing mocks, configuring inputs, etc
    // nothing to do
    
    // 3. creating a fixture
    const fixture = TestBed.createComponent(BannerComponent);
    fixture.detectChanges();

    // 4. asserting expectations
    expect(fixture.componentInstance).toBeDefined();
  });
  
  it('should do something with a service', () => {
    // 2. customizing mocks, configuring inputs, etc
    const userService = TestBed.inject(UserService);
    const userSaveSpy = spyOn(userService, 'save');

    // 3. creating a fixture
    const fixture = TestBed.createComponent(BannerComponent);
    const component = fixture.componentInstance;
    component.action = 'save-user';
    fixture.detectChanges();
    
    // 4. asserting expectations
    expect(userSaveSpy).toHaveBeenCalled();
  });
});
```

Now, each test is self-sufficient and does not rely on scoped variables.
"should create" doesn't have spies anymore, because they are redundant for it.
"should do something with a service" defines spies and customizations which are only available for its test-case. 

Now, let's use `ng-mocks` to reduce code even more:

```ts
describe('BannerComponent', () => {
  // 1. configuring TestBed for all tests in the suite
  beforeEach(() => MockBuilder(BannerComponent, BannerModule));

  it('should create', () => {    
    // 2. customizing mocks, configuring inputs, etc
    // nothing to do
    
    // 3. creating a fixture
    const fixture = MockRender(BannerComponent);

    // 4. asserting expectations
    expect(fixture.point.componentInstance).toBeDefined();
  });
  
  it('should do something with a service', () => {
    // 2. customizing mocks, configuring inputs, etc
    const userSaveSpy = MockInstance(UserService, 'save', jasmine.createSpy());

    // 3. creating a fixture
    const fixture = MockRender(BannerComponent, {
      action: 'save-user',
    });
    
    // 4. asserting expectations
    expect(userSaveSpy).toHaveBeenCalled();
  });
});
```

As you can see, tests require even less code for assertion, and the most important: now, it's really easy to read them,
because each test is like a story, you read them from top to bottom without a need to jump outside to understand
what should happen next.

Unfortunately, not all tests in other articles on `ng-mocks` documentation follow this approach.
That has been done to simplify understanding of `ng-mocks` features in familiar code, so developers
wouldn't be confused by the new structure.

So my recommendation is: always follow the structure above,
and read the rest of documentation as a reference of `ng-mocks` features.
Also, feel free ping our community if [you need help with `ng-mocks`](/need-help.md).
