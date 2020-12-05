import { MockBuilder, MockRender } from 'ng-mocks';

import {
  FakeComponent,
  RealComponent,
  TargetComponent,
  TargetModule,
} from './fixtures';

describe('normal-usage-after-mock-builder:real1', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('renders real component because we did not use MockBuilder.replace yet', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<root><internal>real</internal>1</root>',
    );
  });
});

describe('normal-usage-after-mock-builder:mock', () => {
  beforeEach(() =>
    MockBuilder()
      .keep(TargetModule)
      .replace(RealComponent, FakeComponent, { dependency: true }),
  );

  it('renders fake component because we used MockBuilder.replace', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<root><internal>fake</internal>1</root>',
    );
  });
});

describe('normal-usage-after-mock-builder:real2', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('has to render real component after MockBuilder.replace', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<root><internal>real</internal>1</root>',
    );
  });
});
