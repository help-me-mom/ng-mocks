import {
  Component,
  input,
  isSignal,
  reflectComponentType,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponents, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-9684-fallheader-iconbar',
  standalone: false,
  template: '',
})
class FallheaderIconbarComponent {
  public readonly hasLocalChangesInput = input(false, {
    alias: 'hasLocalChanges',
  });
}

@Component({
  selector: 'target-9684-fallheader',
  standalone: false,
  template: `
    <target-9684-fallheader-iconbar
      [hasLocalChanges]="hasLocalChanges"
    />
  `,
})
class FallheaderComponent {
  public readonly hasLocalChanges = true;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/9684
describe('issue-9684', () => {
  if (
    !reflectComponentType(FallheaderIconbarComponent)?.inputs.some(
      inputMetadata =>
        inputMetadata.propName === 'hasLocalChangesInput',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [
        FallheaderComponent,
        ...MockComponents(FallheaderIconbarComponent),
      ],
    }).compileComponents(),
  );

  it('keeps aliased signal inputs on mocked components', () => {
    const fixture = TestBed.createComponent(FallheaderComponent);
    fixture.detectChanges();

    const mocked = ngMocks.find(
      FallheaderIconbarComponent,
    ).componentInstance;

    expect(isSignal(mocked.hasLocalChangesInput)).toBe(true);
    expect(mocked.hasLocalChangesInput()).toBe(
      fixture.componentInstance.hasLocalChanges,
    );
  });
});
