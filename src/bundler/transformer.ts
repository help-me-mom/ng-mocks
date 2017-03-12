import * as async from "async";
import * as os from "os";
import * as ts from "typescript";

import { Logger } from "log4js";

import { Transform, TransformContext } from "../api";
import { Configuration } from "../shared/configuration";
import { Queued } from "./queued";
import { RequiredModule } from "./required-module";

export class Transformer {

    private tsconfig: ts.ParsedCommandLine;

    constructor(private config: Configuration, private log: Logger) { }

    public initialize(tsconfig: ts.ParsedCommandLine): void {
        this.tsconfig = tsconfig;
        this.log.debug("initialize");
    }

    public applyTsTransforms(bundleQueue: Queued[], onTransformssApplied: ErrorCallback<Error>): void {

        let transforms = this.config.bundlerOptions.transforms;

        if (!transforms.length) {
            process.nextTick(() => {
                onTransformssApplied();
            });
            return;
        }

        async.eachSeries(bundleQueue, (queued: Queued, onQueueProcessed: ErrorCallback<Error>) => {

            let context: TransformContext = {
                config: this.config,
                filename: queued.file.originalPath,
                module: queued.file.originalPath,
                source: queued.emitOutput.sourceFile.getFullText(),
                ts: {
                    ast: queued.emitOutput.sourceFile,
                    version: ts.version
                }
            };
            async.eachSeries(transforms, (transform: Transform, onTransformApplied: Function) => {
                process.nextTick(() => {
                    transform(context, (error: Error, dirty: boolean) => {
                        this.handleError(error, transform);
                        if (dirty) {
                            let transpiled = ts.transpileModule(context.source, {
                                compilerOptions: this.tsconfig.options,
                                fileName: context.filename
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

    public applyTransforms(requiredModule: RequiredModule, onTransformssApplied: ErrorCallback<Error>): void {

        let transforms = this.config.bundlerOptions.transforms;

        if (!transforms.length) {
            process.nextTick(() => {
                onTransformssApplied();
            });
            return;
        }

        let context: TransformContext = {
            config: this.config,
            filename: requiredModule.filename,
            js: {
                ast: requiredModule.ast
            },
            module: requiredModule.moduleName,
            source: requiredModule.source
        };
        async.eachSeries(transforms, (transform: Transform, onTransformApplied: Function) => {
            process.nextTick(() => {
                transform(context, (error: Error, dirty: boolean) => {
                    this.handleError(error, transform);
                    if (dirty) {
                        requiredModule.ast = context.js.ast;
                        requiredModule.source = context.source;
                    }
                    onTransformApplied();
                });
            });
        }, onTransformssApplied);
    }

    private handleError(error: Error, transform: Transform): void {
        if (error) {
            throw new Error("Unable to run transform: " + os.EOL + os.EOL +
                transform + os.EOL + os.EOL +
                "callback error parameter: " + error + os.EOL);
        }
    }
}
