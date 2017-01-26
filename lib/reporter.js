/*
    This code is HEAVILY based on the code found in the reporter of karma-remap-istanbul v0.2.1!
*/
function Reporter(config, sharedProcessedFiles) {

    var coverageReporter = require("karma-coverage/lib/reporter"),
        isPlainObject = require("lodash.isplainobject"),
        isString = require("lodash.isstring"),
        istanbul = require("istanbul"),
        path = require("path"),
        remap = require("remap-istanbul/lib/remap"),
        writeReport = require("remap-istanbul/lib/writeReport"),
        
        log;

    function getReportDestination(browser, reports, reportType) {

        var reportConfig = reports[reportType];

        if(isPlainObject(reportConfig)) {
            return path.join(reportConfig.directory || "coverage",
                             reportConfig.subdirectory || browser.name,
                             reportConfig.filename || reportType);
        }

        if(isString(reportConfig) && reportConfig.length > 0) {
            return path.join(reportConfig, browser.name, reportType);
        }

        return null;
    }

    function create(karmaConfig, helper, logger, emitter) {

        var coverageMap,
            remapOptions = config.remapOptions;

        log = logger.create("reporter.karma-typescript");

        config.initialize(karmaConfig, logger);

        if(!config.hasReporter("coverage")) {
            coverageReporter(karmaConfig, helper, logger, emitter);
        }

        this.adapters = [];

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

                var coverage = coverageMap.get(browser),
                    unmappedCollector = new istanbul.Collector();

                if (!coverage) {
                    return;
                }

                unmappedCollector.add(coverage);

                var sourceStore = istanbul.Store.create("memory");
                remapOptions.sources = sourceStore;
                remapOptions.readFile = function(filepath) {
                    return sharedProcessedFiles[filepath];
                };
                var collector = remap(unmappedCollector.getFinalCoverage(), remapOptions);

                Promise
                    .all(Object.keys(config.reports)
                    .map(function (reportType) {

                        var destination = getReportDestination(browser, config.reports, reportType);

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
