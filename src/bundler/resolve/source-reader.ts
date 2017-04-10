import * as acorn from "acorn";
import * as ESTree from "estree";
import * as fs from "fs";
import * as os from "os";

import { Configuration } from "../../shared/configuration";
import { BundleItem } from "../bundle-item";
import SourceMap = require("../source-map");
import { Transformer } from "../transformer";

export class SourceReader {

    constructor(private config: Configuration,
                private transformer: Transformer) { }

    public read(bundleItem: BundleItem, onSourceRead: { (): void }) {

        this.readFile(bundleItem, (source: string) => {

            bundleItem.source = SourceMap.deleteComment(source);
            bundleItem.ast = this.createAbstractSyntaxTree(bundleItem);

            this.transformer.applyTransforms(bundleItem, () => {
                this.assertValidNonScriptSource(bundleItem);
                onSourceRead();
            });
        });
    }

    private readFile(bundleItem: BundleItem, onSourceRead: { (source: string): void }) {

        if (this.config.bundlerOptions.ignore.indexOf(bundleItem.moduleName) !== -1) {
            onSourceRead("module.exports={};");
        }
        else {
            fs.readFile(bundleItem.filename, (error, data) => {
                if (error) {
                    throw error;
                }
                onSourceRead(data.toString());
            });
        }
    }

    private assertValidNonScriptSource(bundleItem: BundleItem): void {
        if (!bundleItem.isScript() &&
            !bundleItem.source.match(/^\s*module\.exports\s*=/)) {

            let source = bundleItem.source;

            try{
                JSON.parse(bundleItem.source);
            }
            catch (jsonError) {
                try {
                    acorn.parse(bundleItem.source, this.config.bundlerOptions.acornOptions);
                }
                catch (acornError) {
                    source = JSON.stringify(bundleItem.source);
                }
            }

            bundleItem.source = os.EOL + "module.exports = " + source + ";";
        }
    }

    private createAbstractSyntaxTree(bundleItem: BundleItem): ESTree.Program {

        if (!bundleItem.isScript() ||
            this.config.bundlerOptions.noParse.indexOf(bundleItem.moduleName) !== -1) {
            return {
                body: undefined,
                sourceType: "script",
                type: "Program"
            };
        }

        return acorn.parse(bundleItem.source, this.config.bundlerOptions.acornOptions);
    }
}
