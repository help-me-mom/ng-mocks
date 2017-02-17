import * as async from "async";
import { Logger } from "log4js";
import * as ts from "typescript";

import Configuration = require("../shared/configuration");
import Queued = require("./queued");

class Transformer {

    private log: Logger;
    private tsconfig: ts.ParsedCommandLine;

    constructor(private config: Configuration) { }

    public initialize(logger: any, tsconfig: ts.ParsedCommandLine): void {
        this.tsconfig = tsconfig;
        this.log = logger.create("transformer.karma-typescript");
        this.log.info("Beep, boop");
    }

    public applyTransforms(bundleQueue: Queued[], onTransformssApplied: ErrorCallback<Error>): void {

        let transforms = this.config.bundlerOptions.transforms;

        if (!transforms.length) {
            process.nextTick(() => {
                onTransformssApplied();
            });
            return;
        }

        async.eachSeries(bundleQueue, (queued: Queued, onQueueProcessed: ErrorCallback<Error>) => {

            let context = {
                basePath: this.config.karma.basePath,
                filename: queued.file.originalPath,
                fullText: queued.emitOutput.sourceFile.getFullText(),
                sourceFile: queued.emitOutput.sourceFile,
                urlRoot: this.config.karma.urlRoot
            };
            async.eachSeries(transforms, (transform: Function, onTransformApplied: Function) => {
                process.nextTick(() => {
                    transform(context, (changed: boolean) => {
                        if (changed) {
                            let transpiled = ts.transpileModule(context.fullText, {
                                compilerOptions: this.tsconfig.options,
                                fileName: queued.file.originalPath
                            });
                            queued.emitOutput.outputText = transpiled.outputText;
                            queued.emitOutput.sourceMapText = transpiled.sourceMapText;
                        }
                        onTransformApplied();
                    });
                });
            }, onQueueProcessed);
        }, onTransformssApplied);
    }
}

export = Transformer;
