import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MockBuilder, MockRender } from 'ng-mocks';

@NgModule({
  imports: [ReactiveFormsModule],
})
export class TestModule {}

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

describe('issue-377:classic', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [ReactiveFormsModule, TestModule],
    }).compileComponents(),
  );

  it('sets TestBed correctly', () => {
    expect(() => MockRender(FormComponent)).not.toThrow();
  });
});

describe('issue-377:mock', () => {
  beforeEach(() =>
    MockBuilder(FormComponent)
      .keep(ReactiveFormsModule)
      .mock(TestModule),
  );

  it('sets TestBed correctly', () => {
    expect(() => MockRender(FormComponent)).not.toThrow();
  });
});
