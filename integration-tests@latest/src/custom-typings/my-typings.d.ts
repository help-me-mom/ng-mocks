import { Observable } from 'rxjs/Observable'

export type Foo = "Bar"

export interface MyInterface {
    value: Observable<string>;
}
