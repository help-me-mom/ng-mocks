import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'app-form',
  template: `
    <form [formGroup]="form">
      <input type="text" formGroupName="name" />
    </form>
  `,
})
class FormComponent {
  public form = this.fb.group({
    name: [],
  });

  public constructor(private readonly fb: FormBuilder) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/377
describe('issue-377:classic', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents(),
  );

  it('sets TestBed correctly', () => {
    expect(() => MockRender(FormComponent)).not.toThrow();
  });
});

describe('issue-377:mock', () => {
  beforeEach(() =>
    MockBuilder(FormComponent).keep(ReactiveFormsModule),
  );

  it('sets TestBed correctly', () => {
    expect(() => MockRender(FormComponent)).not.toThrow();
  });
});
