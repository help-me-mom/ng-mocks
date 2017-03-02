import { ConfigOptions } from "karma";
import { Logger } from "log4js";

import { Bundler } from "../bundler/bundler";
import { DependencyWalker } from "../bundler/dependency-walker";
import { Transformer } from "../bundler/transformer";
import { Compiler } from "../compiler/compiler";
import { Project } from "../compiler/project";
import { Coverage } from "../istanbul/coverage";
import { Configuration } from "../shared/configuration";

export class Framework {

    public create: { (karmaConfig: ConfigOptions, helper: any, logger: any): void };
    private log: Logger;

    constructor(bundler: Bundler, compiler: Compiler, config: Configuration, coverage: Coverage,
                dependencyWalker: DependencyWalker, project: Project, transformer: Transformer) {

        this.create = (karmaConfig: ConfigOptions, helper: any, logger: any) => {
            config.initialize(karmaConfig, logger);
            coverage.initialize(helper, logger);
            project.initialize(logger);
            this.log = logger.create("framework.karma-typescript");

            let tsconfig = project.resolveTsconfig(config.karma.basePath);

            bundler.initialize(logger);
            compiler.initialize(logger, tsconfig);
            dependencyWalker.initialize(logger);
            transformer.initialize(logger, tsconfig);

            if (!config.hasFramework("commonjs")) {
                bundler.attach((<any> karmaConfig.files));
            }

            this.log.debug("Karma config:\n", JSON.stringify(karmaConfig, null, 3));
        };

        (<any> this.create).$inject = ["config", "helper", "logger"];
    }
}
