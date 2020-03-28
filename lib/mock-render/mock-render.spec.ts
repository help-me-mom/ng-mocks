import createSpy = jasmine.createSpy;
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MockRender } from './mock-render';
import { RenderRealComponent } from './mock-render.fixtures';

describe('MockRender', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RenderRealComponent],
    });
  });

  it('renders any template and respects dynamic params', () => {
    const spy = createSpy('mockClick');
    const assertPayload = {
      magic: Math.random(),
    };

    // Rendering custom template.
    const fixture = MockRender(
      `
        before
        <render-real-component (click)="mockClick($event)" [content]="mockContent"></render-real-component>
        after
      `,
      {
        mockClick: spy,
        mockContent: 'injected content',
      }
    );
    expect(fixture).toBeTruthy();

    // Asserting inputs.
    expect(fixture.nativeElement.innerText).toEqual(`before injected content after`);

    // Asserting dynamic changes on inputs.
    fixture.componentInstance.mockContent = 'dynamic content';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual(`before dynamic content after`);

    // Asserting outputs.
    const spanElement = fixture.debugElement.query(By.css('render-real-component span'));
    expect(spanElement).toBeTruthy();
    spanElement.triggerEventHandler('click', assertPayload);
    expect(spy).toHaveBeenCalledWith(assertPayload);
  });

  it('does not detect changes on fixture if detectChanges arg is false', () => {
    const fixture = MockRender(
      `
        before
        <render-real-component [content]="mockContent"></render-real-component>
        after
      `,
      {
        mockContent: 'injected content',
      },
      false
    );
    expect(fixture.debugElement.nativeElement.innerText).not.toContain('injected content');
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toContain('injected content');
  });
});
