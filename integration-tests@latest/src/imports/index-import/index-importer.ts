import { DependencyComponent } from "./dependency";
import { DependencyComponentWithSlash } from "./dependency/";

export class IndexImporter {

    public getMessageFromDependency(): string {

        return new DependencyComponent().dependOnMe();
    }

    public getMessageFromDependencyWithSlash(): string {

        return new DependencyComponentWithSlash().dependOnMe();
    }
}
