import { IndexComponent } from "./dependency";
import { IndexComponentWithSlash } from "./dependency/";

export class IndexImportTester {

    public testImportIndex(): string {

        return new IndexComponent().Name;
    }

    public testImportIndexWithSlash(): string {

        return new IndexComponentWithSlash().Name;
    }
}
