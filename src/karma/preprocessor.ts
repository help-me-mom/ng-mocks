import path = require("path");

import { ConfigOptions } from "karma";
import { Logger } from "log4js";

import { Bundler } from "../bundler/bundler";
import { Compiler } from "../compiler/compiler";
import { Coverage } from "../istanbul/coverage";
import { Configuration } from "../shared/configuration";
import { File } from "../shared/file";
import { SharedProcessedFiles } from "../shared/shared-processed-files";

export class Preprocessor {

    public create: { (karmaConfig: ConfigOptions, helper: any, logger: any): void };
    private log: Logger;

    constructor(bundler: Bundler, compiler: Compiler, config: Configuration,
                coverage: Coverage, sharedProcessedFiles: SharedProcessedFiles) {

        this.create = (karmaConfig: ConfigOptions, helper: any, logger: any) => {
            this.log = logger.create("preprocessor.karma-typescript");
            config.initialize(karmaConfig, logger);
            coverage.initialize(helper, logger);

            return (content: string, file: File, done: { (e: any, c: string): void}) => {
                try {
                    this.log.debug("Processing \"%s\". %s", file.originalPath, content.length);
                    file.path = config.transformPath(file.originalPath);

                    compiler.compile(file, (emitOutput) => {
                        if (emitOutput.isDeclarationFile) {
                            done(null, " ");
                        }
                        else {
                            bundler.bundle(file, emitOutput, (bundled: string) => {
                                sharedProcessedFiles[path.normalize(file.originalPath)] = bundled;
                                coverage.instrument(file, bundled, emitOutput, (result) => {
                                    done(null, result);
                                });
                            });
                        }
                    });
                }
                catch (e) {
                    this.log.error("%s\n processing %s\n%s", e.message, file.originalPath, e.stack);
                    done(e, null);
                }
            };
        };

        (<any> this.create).$inject = ["config", "helper", "logger"];
    }
}
