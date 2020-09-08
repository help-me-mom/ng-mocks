import * as VendorApi from "./vendor-api";

export class JsImportTester {

    public testImportJavascript(): any {

        return VendorApi.list("secret", "data");
    }
}
