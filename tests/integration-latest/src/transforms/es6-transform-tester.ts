import add from "karma-typescript-test-module/esm/add";

export class Es6TransformTester {

    public testEs6Transform(): number {
        return add(1, 2);
    }
}
