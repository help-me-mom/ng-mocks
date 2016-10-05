/*
    This code is HEAVILY based on the code found in the reporter of karma-remap-istanbul v0.2.1!
*/

function Reporter(transpiledFiles) {

    var coverage = require("karma-coverage"),
        istanbul = require("istanbul"),
        path = require("path"),
        remap = require("./remap-istanbul/lib/remap"),
        writeReport = require("./remap-istanbul/lib/writeReport");

    function hasCoverageReporter(config) {

        return config.reporters.indexOf("coverage") !== -1;
    }

    function getReports(config) {

        return config.karmaTypescriptConfig && config.karmaTypescriptConfig.reports ?
            config.karmaTypescriptConfig.reports :
            {
                html: "coverage"
            };
    }

    function getRemapOptions(config) {

        return config.karmaTypescriptConfig && config.karmaTypescriptConfig.remapOptions ?
            config.karmaTypescriptConfig.remapOptions : {};
    }

    function create(config, helper, logger, emitter) {

        var log = logger.create("reporter.karma-typescript");
        var coverageMap;
        var reports = getReports(config);
        var remapOptions = getRemapOptions(config);

        if(!hasCoverageReporter(config)){

            coverage["reporter:coverage"][1](config, helper, logger, emitter);
        }

        this.onRunStart = function () {

            coverageMap = new WeakMap();
        };

        this.onBrowserComplete = function (browser, result) {

            if (!result || !result.coverage) {
                return;
            }

            coverageMap.set(browser, result.coverage);
        };

        this.onRunComplete = function (browsers) {

            var self = this;

            browsers.forEach(function (browser) {

                var coverage = coverageMap.get(browser);
                var unmappedCollector = new istanbul.Collector();

                if (!coverage) {
                    return;
                }

                unmappedCollector.add(coverage);

                var sourceStore = istanbul.Store.create("memory");
                remapOptions.sources = sourceStore;
                remapOptions.readFile = function(filepath){
                    return transpiledFiles[filepath];
                };

                var collector = remap(unmappedCollector.getFinalCoverage(), remapOptions);

                Promise
                    .all(Object.keys(reports).map(function (reportType) {

                        var destination = reports[reportType] ? path.join(reports[reportType], browser.name, reportType) : null;

                        if(destination) {
                            log.debug("Writing coverage to %s", destination);
                        }

                        return writeReport(collector, reportType, {}, destination, sourceStore);
                    }))
                    .catch(function (error) {
                        log.error(error);
                    })
                    .then(function () {

                        collector.dispose();
                        coverageMap = null;
                    }
                    .bind(self));
            });
        };
    }

    this.create = create;

    this.create.$inject = ["config", "helper", "logger", "emitter"];
}

module.exports = Reporter;
