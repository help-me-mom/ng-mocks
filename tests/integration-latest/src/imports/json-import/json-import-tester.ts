export class JsonImportTester {

    public testLocalJSON(): Object {

        return require("./json-import-tester.json");
    }

    public testPackageJSON(): string {

        return require("stream-http/package").version.toString();
    }

    public testRequireModuleRequiringJSON(): any {

        // globals@9.14.0 requires a JSON file
        return require("globals");
    }

    public testTSImportJSON(): any {

        return require("./json-direct-import");
    }
}
