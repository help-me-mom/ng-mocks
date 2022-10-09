import { MockBuilder, MockRender } from 'ng-mocks';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';

describe('AppComponent', () => {
  beforeEach(() => MockBuilder(AppComponent, AppModule));

  it('should create the app', () => {
    const fixture = MockRender(AppComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should have a title', () => {
    const fixture = MockRender(AppComponent);
    expect(fixture.point.componentInstance.title).toEqual('hello');
  });

  it('should render title', () => {
    const fixture = MockRender(AppComponent);
    expect(fixture.nativeElement.textContent).toContain(
      fixture.point.componentInstance.title,
    );
  });
});
