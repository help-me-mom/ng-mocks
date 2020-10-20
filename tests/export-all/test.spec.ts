import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, Pipe, PipeTransform } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  protected readonly name = 'pipe';
  public transform(value: string): string {
    return `${this.name}:${value}`;
  }
}

@Component({
  selector: 'target',
  template: `<ng-container *ngIf="value">{{ value | target }}</ng-container>`,
})
class TargetComponent {
  @Input() public readonly value: string | null = null;
}

@NgModule({
  declarations: [TargetPipe, TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

// The goal is to get access to declarations of mocked TargetModule
// when TargetComponent is used externally.
describe('export-all:valid', () => {
  beforeEach(() => {
    const ngModule = MockBuilder()
      .mock(TargetModule, {
        exportAll: true,
      })
      .exclude(TargetComponent)
      .build();

    return TestBed.configureTestingModule({
      ...ngModule,
      declarations: [...ngModule.declarations, TargetComponent],
    }).compileComponents();
  });

  it('renders component', () => {
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});

describe('export-all:no-export', () => {
  it('fails on no exportAll due to lack of access to non-exported declarations', () => {
    const ngModule = MockBuilder().mock(TargetModule).exclude(TargetComponent).build();
    const testBed = TestBed.configureTestingModule({
      ...ngModule,
      declarations: [...ngModule.declarations, TargetComponent],
    });

    expect(async(() => testBed.compileComponents())).toThrowError(/The pipe 'target' could not be found/);
  });
});

describe('export-all:no-exclude', () => {
  beforeEach(() => {
    const ngModule = MockBuilder()
      .mock(TargetModule, {
        exportAll: true,
      })
      .build();

    return TestBed.configureTestingModule({
      ...ngModule,
      declarations: [...ngModule.declarations, TargetComponent],
    }).compileComponents();
  });

  it('fails on no exclude due to a conflict in declarations', () => {
    expect(() => MockRender(TargetComponent)).toThrowError(
      /Conflicting components: MockOfTargetComponent,TargetComponent/
    );
  });
});
