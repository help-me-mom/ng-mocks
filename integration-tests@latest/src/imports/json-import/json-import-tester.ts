
export class JsonImportTester {

    public testLocalJSON(): Object {

        return require("./json-import-tester.json");
    }

    public testPackageJSON(): string {

        return require("stream-http/package").version.toString();
    }
}
