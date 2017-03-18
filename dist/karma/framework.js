"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Framework = (function () {
    function Framework(bundler, config, coverage, resolver) {
        var _this = this;
        this.create = function (karmaConfig, helper, logger) {
            _this.log = logger.create("framework.karma-typescript");
            config.initialize(karmaConfig);
            coverage.initialize(helper, logger);
            resolver.initialize();
            if (!config.hasFramework("commonjs")) {
                bundler.attach(karmaConfig.files);
            }
            config.bundlerOptions.transforms.forEach(function (t) {
                if (t.initialize) {
                    t.initialize({
                        appenders: karmaConfig.loggers,
                        level: karmaConfig.logLevel
                    });
                }
            });
            _this.log.debug("Configuration:\n", JSON.stringify(config, null, 3));
        };
        this.create.$inject = ["config", "helper", "logger"];
    }
    return Framework;
}());
exports.Framework = Framework;
