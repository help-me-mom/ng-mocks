/**
 * MockedFunction describes the interface of a function which can be used as a spy.
 * For example, jasmine.createSpy() and jest.fn() are MockedFunction.
 *
 * @see https://ng-mocks.sudo.eu/extra/auto-spy
 */
export type MockedFunction = (...args: any[]) => any;

/**
 * CustomMockFunction describes the interface of a factory which should produce MockFunction.
 * It accepts a label / name and should return a spy / mock function.
 *
 * @see https://ng-mocks.sudo.eu/extra/auto-spy
 */
export type CustomMockFunction = (mockName: string) => MockedFunction;
