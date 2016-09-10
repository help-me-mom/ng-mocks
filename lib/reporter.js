/*
    This code is HEAVILY based on the code found in the reporter of karma-remap-istanbul v0.2.1!
*/

var coverage = require("karma-coverage");
var istanbul = require("istanbul");
var path = require("path");
var remap = require("./remap-istanbul/lib/remap");
var writeReport = require("./remap-istanbul/lib/writeReport");

var preprocessor = require("./preprocessor");

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

function reporter(baseReporterDecorator, config, helper, logger, emitter) {

    baseReporterDecorator(this);

    var log = logger.create("reporter.remap-istanbul");
    var coverageMap;
    var reports = getReports(config);
    var remapOptions = getRemapOptions(config);

    if(!hasCoverageReporter(config)){

        coverage["reporter:coverage"][1](config, helper, logger, emitter);
    }

    var baseReporterOnRunStart = this.onRunStart;
    this.onRunStart = function () {

        baseReporterOnRunStart.apply(this, arguments);
        coverageMap = new WeakMap();
    };

    this.onBrowserComplete = function (browser, result) {

        if (!result || !result.coverage) {
            return;
        }

        coverageMap.set(browser, result.coverage);
    };

    var reportFinished = function () { /**/ };

    var baseReporterOnRunComplete = this.onRunComplete;
    this.onRunComplete = function (browsers) {

        var self = this;

        baseReporterOnRunComplete.apply(this, arguments);

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
                return preprocessor.transpiledFiles[filepath];
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

                    reportFinished();

                    this.onExit = function (done) {
                        done();
                    };
                }
                .bind(self));
        });
    };

    this.onExit = function (done) {
        reportFinished = done;
    };
}

reporter.$inject = ["baseReporterDecorator", "config", "helper", "logger", "emitter"];

module.exports = reporter;
