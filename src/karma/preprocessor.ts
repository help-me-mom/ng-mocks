import path = require("path");

import { ConfigOptions } from "karma";
import { Logger } from "log4js";

import Compiler = require("../compiler");
import Configuration = require("../configuration");
import Coverage = require("../coverage");
import File = require("../file");
import SharedProcessedFiles = require("../shared-processed-files");

class Preprocessor {

    public create: { (karmaConfig: ConfigOptions, helper: any, logger: any): void };
    private log: Logger;

    constructor(bundler: any, private compiler: Compiler, private config: Configuration,
                coverage: Coverage, sharedProcessedFiles: SharedProcessedFiles) {

        this.create = (karmaConfig: ConfigOptions, helper: any, logger: any) => {
            this.log = logger.create("preprocessor.karma-typescript");
            config.initialize(karmaConfig, logger);
            coverage.initialize(helper, logger);

            return (content: string, file: File, done: { (e: any, c: string): void}) => {
                try {
                    this.log.debug("Processing \"%s\".", file.originalPath);
                    file.path = config.transformPath(file.originalPath);
                    this.compiler.compile(file, (emitOutput) => {

                        if (emitOutput.isDeclarationFile) {
                            done(null, " ");
                        }
                        else {
                            bundler.bundle(file, content, emitOutput, this.shouldAddLoader(), (bundled: string) => {
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

    private shouldAddLoader() {
        return this.compiler.getModuleFormat().toLowerCase() === "commonjs" &&
               this.compiler.getRequiredModulesCount() > 0 &&
               !this.config.hasPreprocessor("commonjs");
    }
}

export = Preprocessor;
