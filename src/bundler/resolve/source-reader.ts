import * as acorn from "acorn";
import * as ESTree from "estree";
import * as fs from "fs";
import * as os from "os";

import { Logger } from "log4js";

import { Configuration } from "../../shared/configuration";
import { BundleItem } from "../bundle-item";
import { Transformer } from "../transformer";

export class SourceReader {

    constructor(private config: Configuration,
                private log: Logger,
                private transformer: Transformer) { }

    public read(bundleItem: BundleItem, onSourceRead: { (): void }) {

        this.readFile(bundleItem, (source: string) => {

            bundleItem.source = source;
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
                source = JSON.stringify(bundleItem.source);
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

        try {
            return acorn.parse(bundleItem.source, this.config.bundlerOptions.acornOptions);
        }
        catch (error) {
            this.log.error("Error parsing code: " + error.message + os.EOL +
                           "in " + bundleItem.filename + os.EOL +
                           "at line " + error.loc.line + ", column " + error.loc.column + ":" + os.EOL + os.EOL +
                           "... " + bundleItem.source.slice(error.pos, error.pos + 50) + " ...");
            process.exit(1);
        }
    }
}
