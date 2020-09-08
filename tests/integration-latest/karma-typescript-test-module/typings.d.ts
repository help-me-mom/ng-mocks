declare module 'karma-typescript-test-module' {
  function add(a: number, b: number): number
  namespace add {}
}

declare module 'karma-typescript-test-module/add' {
  import { add } from 'karma-typescript-test-module'
  export default add
}

declare module 'karma-typescript-test-module/esm' {
  function add(a: number, b: number): number
  namespace add {}
}

declare module 'karma-typescript-test-module/esm/add' {
  import { add } from 'karma-typescript-test-module/esm'
  export default add
}

interface karmaTypescriptTestModule {
  add(a: number, b: number): number
}
