
export class JsonComponent {

    public getLocalJson(): any {

        return require("./component.json");
    }

    public getPackageJson(): any {

        return require("stream-http/package").version;
    }
}
