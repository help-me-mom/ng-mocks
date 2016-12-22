import { IndexImporter } from "./index-importer";

describe("IndexImporter", () => {

    let indexImporter = new IndexImporter();

    it("should import using index.ts", () => {

        expect(indexImporter.getMessageFromDependency()).toEqual("I'm in a file named index.ts");
    });

    it("should import using index.ts with a trailing slash", () => {

        expect(indexImporter.getMessageFromDependencyWithSlash()).toEqual("I was required using a trailing slash");
    });
});
