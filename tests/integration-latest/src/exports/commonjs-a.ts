import B from "./commonjs-b";
export default class A extends B {

    public hello(): string {

        return `Hello from A! ${super.hello()}`;
    }
}
