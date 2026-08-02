import {
  Component,
  input,
  isSignal,
  reflectComponentType,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, ngMocks } from 'ng-mocks';

interface Task {
  completed: boolean;
  id: string;
  name: string;
}

@Component({
  selector: 'target-8887-list-item',
  standalone: true,
  template: '',
})
class ListItemComponent {
  public readonly task = input.required<Task>();
}

@Component({
  imports: [ListItemComponent],
  standalone: true,
  template: ` <target-8887-list-item [task]="task" /> `,
})
class ListComponent {
  public readonly task: Task = {
    completed: true,
    id: '1',
    name: 'Buy milk',
  };
}

// @see https://github.com/help-me-mom/ng-mocks/issues/8887
describe('issue-8887', () => {
  if (
    !reflectComponentType(ListItemComponent)?.inputs.some(
      inputMetadata => inputMetadata.propName === 'task',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ListComponent],
    })
      .overrideComponent(ListComponent, {
        add: {
          imports: [MockComponent(ListItemComponent)],
        },
        remove: {
          imports: [ListItemComponent],
        },
      })
      .compileComponents(),
  );

  it('keeps required signal inputs callable on mocked components', () => {
    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    const mocked = ngMocks.find(ListItemComponent).componentInstance;

    expect(isSignal(mocked.task)).toBe(true);
    expect(mocked.task()).toEqual(fixture.componentInstance.task);
  });
});
