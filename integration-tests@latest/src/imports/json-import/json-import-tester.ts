
export class JsonImporter {

    public getLocalJson(): any {

        return require("./json-importer.json");
    }

    public getPackageJson(): any {

        return require("stream-http/package").version;
    }
}
