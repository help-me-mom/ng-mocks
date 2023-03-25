import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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
  selector: 'target-export-all',
  template: `<ng-container *ngIf="!value">{{
    value | target
  }}</ng-container>`,
})
class TargetComponent {
  @Input() public readonly value: string | null = null;
}

@NgModule({
  declarations: [TargetPipe, TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

describe('export-all', () => {
  ngMocks.throwOnConsole();

  // The goal is to get access to declarations of the mock TargetModule
  // when TargetComponent is used externally.
  describe('valid', () => {
    beforeEach(async () => {
      // Thanks A5 for any
      const ngModule: any = MockBuilder()
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

  describe('no-export', () => {
    it('fails on no exportAll due to lack of access to non-exported declarations', async () => {
      // Thanks A5 for any
      const ngModule: any = MockBuilder()
        .mock(TargetModule)
        .exclude(TargetComponent)
        .build();
      const testBed = TestBed.configureTestingModule({
        ...ngModule,
        declarations: [...ngModule.declarations, TargetComponent],
      });

      try {
        await testBed.compileComponents();
        MockRender(TargetComponent);
        fail('an error expected');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toMatch(
            /Multiple components match node with tagname target|The pipe 'target' could not be found/,
          );
        } else {
          fail('should fail');
        }
      }
    });
  });

  describe('no-exclude', () => {
    beforeEach(async () => {
      // Thanks A5 for any
      const ngModule: any = MockBuilder()
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
        /Multiple components match node with tagname target|Conflicting components: MockOfTargetComponent,TargetComponent/,
      );
    });
  });
});
