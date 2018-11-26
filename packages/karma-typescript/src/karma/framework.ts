import { ConfigOptions } from "karma";
import { Logger } from "log4js";

import { Bundler } from "../bundler/bundler";
import { Resolver } from "../bundler/resolve/resolver";
import { Configuration } from "../shared/configuration";

export class Framework {

    public create: (karmaConfig: ConfigOptions, helper: any, logger: any) => void;
    private log: Logger;
    private stringify = require("json-stringify-safe");

    constructor(bundler: Bundler, config: Configuration, resolver: Resolver) {

        this.create = (karmaConfig: ConfigOptions, logger: any) => {
            this.log = logger.create("framework.karma-typescript");

            config.initialize(karmaConfig);
            resolver.initialize();

            if (!config.hasFramework("commonjs")) {
                bundler.attach((karmaConfig.files as any));
            }

            config.bundlerOptions.transforms.forEach((t) => {
                if (t.initialize) {
                    t.initialize({
                        appenders: config.logAppenders,
                        level: karmaConfig.logLevel
                    });
                }
            });

            this.log.debug("Configuration:\n", this.stringify(config, this.replacer, 3));
        };

        (this.create as any).$inject = ["config", "logger"];
    }

    private replacer(key: string, value: string) {
        if (key && typeof value === "function") {
            return (value + "").substr(0, 100) + "...";
        }
        return value;
    }
}
