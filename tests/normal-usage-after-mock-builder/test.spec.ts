import { Component, Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
export class TargetService {
  public called = 0;

  public call(): void {
    this.called += 1;
  }
}

@Component({
  selector: 'root-normal-usage-after-mock-builder',
  template:
    '<internal-normal-usage-after-mock-builder></internal-normal-usage-after-mock-builder>{{ service.called }}',
})
export class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@Component({
  selector: 'internal-normal-usage-after-mock-builder',
  template: 'real',
})
export class RealComponent {}

@Component({
  selector: 'internal-normal-usage-after-mock-builder',
  template: 'fake',
})
export class FakeComponent {}

@NgModule({
  declarations: [TargetComponent, RealComponent],
  exports: [TargetComponent],
  providers: [TargetService],
})
export class TargetModule {
  public constructor(protected service: TargetService) {
    this.service.call();
  }
}

describe('normal-usage-after-mock-builder:real1', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('renders real component because we did not use MockBuilder.replace yet', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<root-normal-usage-after-mock-builder><internal-normal-usage-after-mock-builder>real</internal-normal-usage-after-mock-builder>1</root-normal-usage-after-mock-builder>',
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
      '<root-normal-usage-after-mock-builder><internal-normal-usage-after-mock-builder>fake</internal-normal-usage-after-mock-builder>1</root-normal-usage-after-mock-builder>',
    );
  });
});

describe('normal-usage-after-mock-builder:real2', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('has to render real component after MockBuilder.replace', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<root-normal-usage-after-mock-builder><internal-normal-usage-after-mock-builder>real</internal-normal-usage-after-mock-builder>1</root-normal-usage-after-mock-builder>',
    );
  });
});
