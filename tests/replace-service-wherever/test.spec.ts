import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class TargetService {
  public called = false;
  public readonly name = 'target';

  public echo(): string {
    this.called = true;

    return this.name;
  }
}

@Injectable()
class ReplacementService {
  public called = false;
  public readonly name = 'replacement';

  public echo(): string {
    this.called = true;

    return this.name;
  }
}

@Component({
  selector: 'target-replace-server-wherever',
  template: "{{ service.name }} {{ service.called ? 'called' : '' }}",
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {
  public constructor(protected service: TargetService) {
    this.service.echo();
  }
}

describe('replace-service-wherever:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('uses service everywhere', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('target');
    expect(fixture.nativeElement.innerHTML).toContain('called');
  });
});

describe('replace-service-wherever:mock', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).provide({
      provide: TargetService,
      useClass: ReplacementService,
    }),
  );

  it('uses service everywhere', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain('replacement');
    // The module is replaced with a mock copy, its ctor does nothing.
    expect(fixture.nativeElement.innerHTML).not.toContain('called');
  });
});
