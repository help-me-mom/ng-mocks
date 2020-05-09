import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { FakeComponent, RealComponent, TargetComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('normal-usage-after-mock-builder:real1', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents()
  );

  it('renders real component because we did not use MockBuilder.replace yet', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.debugElement.nativeElement.innerHTML).toEqual('<root><internal>real</internal>1</root>');
  });
});

describe('normal-usage-after-mock-builder:mock', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(
      MockBuilder().keep(TargetModule).replace(RealComponent, FakeComponent, { dependency: true }).build()
    ).compileComponents()
  );

  it('renders fake component because we used MockBuilder.replace', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.debugElement.nativeElement.innerHTML).toEqual('<root><internal>fake</internal>1</root>');
  });
});

describe('normal-usage-after-mock-builder:real2', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents()
  );

  it('has to render real component after MockBuilder.replace', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.debugElement.nativeElement.innerHTML).toEqual('<root><internal>real</internal>1</root>');
  });
});
