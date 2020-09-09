import * as log4js from "log4js";
import * as mock from "mock-require";
import * as os from "os";
import * as test from "tape";

let readFileCallback = [undefined, new Buffer("")];

mock("fs", {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    readFile: (filename: string, callback: (error: Error, buffer: Buffer) => void) => {
        return callback(undefined, readFileCallback[1]);
    }
});

import { ConfigOptions } from "karma";

import { KarmaTypescriptConfig } from "../../api/configuration";
import { Configuration } from "../../shared/configuration";
import { Project } from "../../shared/project";
import { BundleItem } from "../bundle-item";
import { Transformer } from "../transformer";
import { SourceReader } from "./source-reader";

const configuration = new Configuration({});
const project = new Project(configuration, log4js.getLogger("project"));
const transformer = new Transformer(configuration, log4js.getLogger("transformer"), project);
const sourceReader = new SourceReader(configuration, log4js.getLogger("sourceReader"), transformer);

const karmaTypescriptConfig: KarmaTypescriptConfig = {
    bundlerOptions: {
        ignore: ["ignored"],
        noParse: ["noparse"]
    }
};

const karma: ConfigOptions = {};
(karma as any).karmaTypescriptConfig = karmaTypescriptConfig;

configuration.initialize(karma);

test("source-reader should return an empty object literal for ignored modules", (t) => {

    t.plan(1);

    const bundleItem = new BundleItem("ignored", "ignored.js");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, "module.exports={};");
    });
});

test("source-reader should read source for module", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("var x;")];
    const bundleItem = new BundleItem("dummy", "dummy.js");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, "var x;");
    });
});

test("source-reader should create an AST", (t) => {

    t.plan(1);

    const bundleItem = new BundleItem("dummy", "dummy.js");

    sourceReader.read(bundleItem, () => {
        t.notEqual(bundleItem.ast, undefined);
    });
});

test("source-reader should create an empty dummy AST for non-script files (css, JSON...)", (t) => {

    t.plan(1);

    const bundleItem = new BundleItem("style", "style.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.ast, undefined);
    });
});

test("source-reader should create an empty dummy AST for modules specified in the bundler option 'noParse'", (t) => {

    t.plan(1);

    const bundleItem = new BundleItem("noparse", "noparse.js");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.ast, undefined);
    });
});

test("source-reader should prepend JSON source with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(JSON.stringify([1, 2, 3, "a", "b", "c"]))];
    const bundleItem = new BundleItem("json", "json.json");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = [1,2,3,\"a\",\"b\",\"c\"];");
    });
});

test("source-reader should prepend stylesheet source (original CSS) with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(".color { color: red; }")];
    const bundleItem = new BundleItem("style", "style.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = \".color { color: red; }\";");
    });
});

test("source-reader should prepend transformed stylesheet source (now JSON) with 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer(JSON.stringify({ color: "_color_xkpkl_5" }))];
    const bundleItem = new BundleItem("transformed", "transformed.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = {\"color\":\"_color_xkpkl_5\"};");
    });
});

test("source-reader should not prepend redundant 'module.exports ='", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("module.exports = '';")];
    const bundleItem = new BundleItem("redundant", "redundant.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, "module.exports = '';");
    });
});

test("source-reader should prepend 'module.exports =' to valid javascript with non-script extension, css", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("{ color: '_color_xkpkl_5'; }")];
    const bundleItem = new BundleItem("valid-js", "valid-js.css");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = \"{ color: '_color_xkpkl_5'; }\";");
    });
});

test("source-reader should prepend 'module.exports =' to valid javascript with non-script extension, txt", (t) => {

    t.plan(1);

    readFileCallback = [undefined, new Buffer("(function() {return {foo: 'baz', bork: true}})();")];
    const bundleItem = new BundleItem("valid-js", "valid-js.txt");

    sourceReader.read(bundleItem, () => {
        t.equal(bundleItem.source, os.EOL + "module.exports = \"(function() {return {foo: 'baz', bork: true}})();\";");
    });
});
