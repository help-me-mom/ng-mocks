import { IndexComponent } from "./dependency";
import { IndexComponentWithSlash } from "./dependency";

export class IndexImportTester {

    public testImportIndex(): IndexComponent {

        return new IndexComponent();
    }

    public testImportIndexWithSlash(): IndexComponentWithSlash {

        return new IndexComponentWithSlash();
    }
}
