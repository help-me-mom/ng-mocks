import { Observable } from 'rxjs/Observable'
import { MyInterface } from "../../custom-typings/my-typings";

export class TypingsImportTester implements MyInterface {

    public value: Observable<string>;

    public constructor() {
        this.value = new Observable<string>();
    }
}
