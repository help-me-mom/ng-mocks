import { MockBuilder,MockedComponentFixture, MockInstance, MockRender, } from 'ng-mocks';

import { <%= classify(name)%>Service } from './<%= dasherize(name)%>.service';

describe('<%= classify(name)%>Service', () => {
  let service: <%= classify(name)%>Service;
  let fixture: MockedComponentFixture<<%= classify(name)%>Service>;

  MockInstance.scope();
  
  beforeEach(() => MockBuilder(<%= classify(name)%>Service));

  beforeEach(() => {
    fixture = MockRender(<%= classify(name)%>Service);
    service = fixture.point.componentInstance;
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});