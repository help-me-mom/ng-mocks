import { InjectionToken } from '@angular/core';

import { MockInstance } from 'ng-mocks';

const TOKEN = new InjectionToken('token');

class TargetService {
  public name = 'target';

  public echo1(): string {
    return this.name;
  }
}

// @ts-expect-error: tokens can be set only by a callback
MockInstance(TOKEN, '123');
// accepts callbacks
MockInstance(TOKEN, () => '123');

// @ts-expect-error: wrong type
MockInstance(TargetService, 'name', 123);
MockInstance(TargetService, 'name', 'mock');
// @ts-expect-error: expects a getter
MockInstance(TargetService, 'name', 'mock', 'get');
MockInstance(TargetService, 'name', () => 'mock', 'get');
// @ts-expect-error: expects a setter
MockInstance(TargetService, 'name', 'mock', 'set');
MockInstance(TargetService, 'name', () => {}, 'set');

// allows chaining
MockInstance(TargetService, 'echo1', jasmine.createSpy()).and.returnValue('123');
MockInstance(TargetService, 'echo1', jest.fn()).mockReturnValue(123);
MockInstance(TargetService, 'name', jasmine.createSpy(), 'get').and.returnValue('123');
MockInstance(TargetService, 'name', jest.fn(), 'get').mockReturnValue(123);

// @ts-expect-error: knows its type
MockInstance(TargetService, 'name', jasmine.createSpy(), 'get').mockReturnValue(123);
// @ts-expect-error: knows its type
MockInstance(TargetService, 'name', jest.fn(), 'get').and.returnValue('123');
