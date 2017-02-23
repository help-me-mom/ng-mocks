"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Framework = (function () {
    function Framework(bundler, compiler, config, coverage, dependencyWalker, project, transformer) {
        var _this = this;
        this.create = function (karmaConfig, helper, logger) {
            config.initialize(karmaConfig, logger);
            coverage.initialize(helper, logger);
            project.initialize(logger);
            _this.log = logger.create("framework.karma-typescript");
            var tsconfig = project.resolveTsconfig(config.karma.basePath);
            bundler.initialize(logger);
            compiler.initialize(logger, tsconfig);
            dependencyWalker.initialize(logger);
            transformer.initialize(logger, tsconfig);
            if (!config.hasFramework("commonjs")) {
                bundler.attach(karmaConfig.files);
            }
            _this.log.debug("Karma config:\n", JSON.stringify(karmaConfig, null, 3));
        };
        this.create.$inject = ["config", "helper", "logger"];
    }
    return Framework;
}());
exports.Framework = Framework;
