import * as acorn from "acorn";
import * as ESTree from "estree";
import * as fs from "fs";
import * as os from "os";

import { Configuration } from "../../shared/configuration";
import { RequiredModule } from "../required-module";
import SourceMap = require("../source-map");
import { Transformer } from "../transformer";

export class SourceReader {

    constructor(private config: Configuration,
                private transformer: Transformer) { }

    public read(requiredModule: RequiredModule, onSourceRead: { (): void }) {

        this.readFile(requiredModule, (source: string) => {

            requiredModule.source = SourceMap.deleteComment(source);
            requiredModule.ast = this.createAbstractSyntaxTree(requiredModule);

            this.transformer.applyTransforms(requiredModule, () => {
                this.assertValidNonScriptSource(requiredModule);
                onSourceRead();
            });
        });
    }

    private readFile(requiredModule: RequiredModule, onSourceRead: { (source: string): void }) {

        if (this.config.bundlerOptions.ignore.indexOf(requiredModule.moduleName) !== -1) {
            onSourceRead("module.exports={};");
        }
        else {
            fs.readFile(requiredModule.filename, (error, data) => {
                if (error) {
                    throw error;
                }
                onSourceRead(data.toString());
            });
        }
    }

    private assertValidNonScriptSource(requiredModule: RequiredModule): void {
        if (!requiredModule.isScript() &&
            !requiredModule.source.match(/^\s*module\.exports\s*=/)) {

            let source = requiredModule.source;

            try{
                JSON.parse(requiredModule.source);
            }
            catch (jsonError) {
                try {
                    acorn.parse(requiredModule.source, this.config.bundlerOptions.acornOptions);
                }
                catch (acornError) {
                    source = JSON.stringify(requiredModule.source);
                }
            }

            requiredModule.source = os.EOL + "module.exports = " + source + ";";
        }
    }

    private createAbstractSyntaxTree(requiredModule: RequiredModule): ESTree.Program {

        if (!requiredModule.isScript() ||
            this.config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) !== -1) {
            return {
                body: undefined,
                sourceType: "script",
                type: "Program"
            };
        }

        return acorn.parse(requiredModule.source, this.config.bundlerOptions.acornOptions);
    }
}
