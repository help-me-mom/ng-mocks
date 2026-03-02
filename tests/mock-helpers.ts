import { MockedFunction } from 'ng-mocks';

import funcGetVitest from './func.get-vitest';
import funcHasVitest from './func.has-vitest';

export function createMock(): MockedFunction;
export function createMock(name: string): MockedFunction;
export function createMock(fakeImpl: (...args: any[]) => any): MockedFunction;
export function createMock(name: string, fakeImpl: (...args: any[]) => any): MockedFunction;
export function createMock(arg1?: string | ((...args: any[]) => any), arg2?: (...args: any[]) => any): MockedFunction {
  const name = typeof arg1 === 'string' ? arg1 : 'mock.fn()';
  const fakeImpl = typeof arg1 === 'function' ? arg1 : arg2;

  return handleMockProcessor({
    jasmine: () => (fakeImpl ? jasmine.createSpy(name).and.callFake(fakeImpl) : jasmine.createSpy(name)),
    jest: () => jest.fn(fakeImpl).mockName(name),
    vitest: () => funcGetVitest().fn(fakeImpl).mockName(name),
  });
}

export const mockReturnValue = (mock: MockedFunction, value: any): MockedFunction =>
  handleMockProcessor({
    jasmine: () => (mock as jasmine.Spy).and.returnValue(value),
    jest: () => (mock as jest.Mock).mockReturnValue(value),
    vitest: () => (mock as any).mockReturnValue(value),
  });

export const mockThrowError = (mock: MockedFunction, error: Error | string): MockedFunction =>
  handleMockProcessor({
    jasmine: () => (mock as jasmine.Spy).and.throwError(typeof error === 'string' ? error : error.message),
    jest: () =>
      (mock as jest.Mock).mockImplementation(() => {
        throw error instanceof Error ? error : new Error(error);
      }),
    vitest: () =>
      (mock as any).mockImplementation(() => {
        throw error instanceof Error ? error : new Error(error);
      }),
  });

export const clearMock = (mock: MockedFunction): void =>
  handleMockProcessor({
    jasmine: () => (mock as jasmine.Spy).calls.reset(),
    jest: () => (mock as jest.Mock).mockClear(),
    vitest: () => (mock as any).mockClear(),
  });

export const handleMockProcessor = (handlers: { jasmine: () => any; jest: () => any; vitest: () => any }) => {
  if (typeof jest !== 'undefined') {
    return handlers.jest();
  }

  if (funcHasVitest()) {
    return handlers.vitest();
  }

  if (typeof jasmine !== 'undefined') {
    return handlers.jasmine();
  }

  throw new Error('No supported testing framework found');
};
