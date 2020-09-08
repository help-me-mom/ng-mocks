import { MyInterface } from "../../custom-typings/my-typings";

export class TypingsImportTester implements MyInterface {

    public value: string;

    public constructor() {
        this.value = "Hello!";
    }
}
