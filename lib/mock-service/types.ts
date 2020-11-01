export type MockedFunction = (...args: any[]) => any;

export type CustomMockFunction = (mockName: string) => MockedFunction;
