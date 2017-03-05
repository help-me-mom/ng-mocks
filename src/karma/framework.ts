import { ConfigOptions } from "karma";
import { Logger } from "log4js";

import { Bundler } from "../bundler/bundler";
import { Transformer } from "../bundler/transformer";
import { Compiler } from "../compiler/compiler";
import { Project } from "../compiler/project";
import { Coverage } from "../istanbul/coverage";
import { Configuration } from "../shared/configuration";

export class Framework {

    public create: { (karmaConfig: ConfigOptions, helper: any, logger: any): void };
    private log: Logger;

    constructor(bundler: Bundler, compiler: Compiler, config: Configuration,
                coverage: Coverage, project: Project, transformer: Transformer) {

        this.create = (karmaConfig: ConfigOptions, helper: any, logger: any) => {
            this.log = logger.create("framework.karma-typescript");

            config.initialize(karmaConfig);
            project.initialize();
            bundler.initialize(project.getModuleFormat());
            compiler.initialize(project.getTsconfig());
            coverage.initialize(helper, logger);
            transformer.initialize(project.getTsconfig());

            if (!config.hasFramework("commonjs")) {
                bundler.attach((<any> karmaConfig.files));
            }

            config.bundlerOptions.transforms.forEach((t) => {
                if (t.initialize) {
                    t.initialize({
                        appenders: karmaConfig.loggers,
                        level: karmaConfig.logLevel
                    });
                }
            });

            this.log.debug("Karma config:\n", JSON.stringify(karmaConfig, null, 3));
        };

        (<any> this.create).$inject = ["config", "helper", "logger"];
    }
}
