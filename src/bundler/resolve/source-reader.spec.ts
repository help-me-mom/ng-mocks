import * as log4js from "log4js";
import * as mock from "mock-require";
import * as os from "os";
import * as test from "tape";

let readFileCallback = [undefined, new Buffer("")];

mock("fs", {
    readFile: (filename: string, callback: Function) => {
        filename = filename;
        return callback(...readFileCallback);
    }
});

import { ConfigOptions } from "karma";

import { KarmaTypescriptConfig } from "../../api/configuration";
import { Configuration } from "../../shared/configuration";
import { Project } from "../../shared/project";
import { BundleItem } from "../bundle-item";
import { Transformer } from "../transformer";
import { SourceReader } from "./source-reader";

let configuration = new Configuration({});
let project = new Project(configuration, log4js.getLogger("project"));
let transformer = new Transformer(configuration, project);
let sourceReader = new SourceReader(configuration, log4js.getLogger("sourceReader"), transformer);

let karmaTypescriptConfig: KarmaTypescriptConfig = {
    bundlerOptions: {
        ignore: ["ignored"],
        noParse: ["noparse"]
    }
};

let karma: ConfigOptions = {};
(<any> karma).karmaTypescriptConfig = karmaTypescriptConfig;

configuration.initialize(karma);

test("source-reader should return an empty object literal for ignored modules", (t) => {

    t.plan(1);

    let bundleItem = new BundleItem("ignored", "ignored.js");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, "module.exports={};");
    });
});

test("source-reader should read source for module", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("var x;")];
    let bundleItem = new BundleItem("dummy", "dummy.js");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, "var x;");
    });
});

test("source-reader should create an AST", (t) => {

    t.plan(1);

    let bundleItem = new BundleItem("dummy", "dummy.js");

    sourceReader.read(bundleItem, () => {
        t.notEqual(bundleItem.ast.body, undefined);
    });
});

test("source-reader should create an empty dummy AST for non-script files (css, JSON...)", (t) => {

    t.plan(1);

    let bundleItem = new BundleItem("style", "style.css");

    sourceReader.read(bundleItem, () => {
        t.deepEqual(bundleItem.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});

test("source-reader should create an empty dummy AST for modules specified in the bundler option 'noParse'", (t) => {

    t.plan(1);

    let bundleItem = new BundleItem("noparse", "noparse.js");

    sourceReader.read(bundleItem, () => {
        t.deepEqual(bundleItem.ast, {
            body: undefined,
            sourceType: "script",
            type: "Program"
        });
    });
});

test("source-reader should prepend JSON source with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(JSON.stringify([1, 2, 3, "a", "b", "c"]))];
    let bundleItem = new BundleItem("json", "json.json");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = [1,2,3,\"a\",\"b\",\"c\"];");
    });
});

test("source-reader should prepend stylesheet source (original CSS) with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(".color { color: red; }")];
    let bundleItem = new BundleItem("style", "style.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = \".color { color: red; }\";");
    });
});

test("source-reader should prepend transformed stylesheet source (now JSON) with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(JSON.stringify({ color: "_color_xkpkl_5" }))];
    let bundleItem = new BundleItem("transformed", "transformed.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = {\"color\":\"_color_xkpkl_5\"};");
    });
});

test("source-reader should not prepend redundant 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("module.exports = '';")];
    let bundleItem = new BundleItem("redundant", "redundant.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, "module.exports = '';");
    });
});

test("source-reader should prepend 'module.exports =' to valid javascript with non-script extension, css", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("{ color: '_color_xkpkl_5'; }")];
    let bundleItem = new BundleItem("valid-js", "valid-js.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = \"{ color: \'_color_xkpkl_5\'; }\";");
    });
});

test("source-reader should prepend 'module.exports =' to valid javascript with non-script extension, txt", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("(function() {return {foo: 'baz',bork: true}})();")];
    let bundleItem = new BundleItem("valid-js", "valid-js.txt");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = \"(function() {return {foo: \'baz\',bork: true}})();\";");
    });
});
