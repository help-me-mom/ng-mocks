import {
  Component,
  ElementRef,
  Input,
  contentChild,
  contentChildren,
  input,
  viewChild,
  viewChildren,
} from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'app-nested',
  standalone: true,
  template: `
    <div #meow>Nested content</div>

    <h3>Queries:</h3>
    <ul>
      <li>meowViewChild: {{ !!meowViewChild() }}</li>
      <li>meowViewChildren: {{ !!meowViewChildren() }}</li>
      <li>meowContentChild: {{ !!meowContentChild() }}</li>
      <li>meowContentChildren: {{ !!meowContentChildren() }}</li>
    </ul>
  `,
})
class NestedComponent {
  readonly meowViewChild = viewChild<ElementRef>('meow');
  readonly meowViewChildren = viewChildren<ElementRef>('meow');
  readonly meowContentChild = contentChild<ElementRef>('meow');
  readonly meowContentChildren = contentChildren<ElementRef>('meow');

  readonly name = input.required<string>();
}

@Component({
  selector: 'app-target',
  standalone: true,
  imports: [NestedComponent],
  template: `
    <app-nested></app-nested>
    <div>name: {{ name }}</div>
  `,
})
class TargetComponent {
  @Input() public readonly name: string = '';
}

@Component({
  selector: 'app-separate',
  standalone: true,
  template: `
    <div>Is odd: {{ count() % 2 === 1 }}</div>

    <h3>Queries:</h3>
    <ul>
      <li>meowViewChild: {{ !!meowViewChild() }}</li>
      <li>meowViewChildren: {{ !!meowViewChildren() }}</li>
      <li>meowContentChild: {{ !!meowContentChild() }}</li>
      <li>meowContentChildren: {{ !!meowContentChildren() }}</li>
    </ul>
  `,
})
class SeparateComponent {
  readonly count = input.required();

  readonly meowViewChild = viewChild<ElementRef>('meow');
  readonly meowViewChildren = viewChildren<ElementRef>('meow');
  readonly meowContentChild = contentChild<ElementRef>('meow');
  readonly meowContentChildren = contentChildren<ElementRef>('meow');
}

describe('issue-8634', () => {
  describe('child component', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('should not fail because of the usage of viewChild/contendChild', () => {
      const fixture = MockRender(TargetComponent, {
        name: 'sandbox',
      });
      expect(fixture.nativeElement.innerHTML).toContain(
        'name: sandbox',
      );
    });
  });

  describe('referenced component', () => {
    beforeEach(() => MockBuilder(SeparateComponent));

    it('should not fail because of the usage of viewChild/contendChild', () => {
      const fixture = MockRender(SeparateComponent, {
        count: 3,
      });
      expect(fixture.nativeElement.innerHTML).toContain(
        'Is odd: true',
      );
    });
  });
});
