import { IInterfaceMockingTester } from "./interface-mocking-tester.interface";

export class InterfaceMockingTester {

    constructor(private interfaceMockingTester: IInterfaceMockingTester) {}

    public test(): string {

        return this.interfaceMockingTester.test();
    }
}
