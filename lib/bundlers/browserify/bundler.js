var browserify = require("browserify"),
    debounce = require("lodash.debounce"),
    fs = require("fs"),
    tmp = require("tmp"),

    benchmark = require("../../benchmark"),

    b = browserify(),
    bundleQueue = [],
    log,

    BUNDLE_DELAY = 500;

function Browserify(){

    var tmpfile = tmp.fileSync();

    function initialize(logger) {
        log = logger.create("browserify-bundler.karma-typescript");
    }

    function attach(files) {

        files.unshift({
            pattern: tmpfile.name,
            included: true,
            served: true,
            watched: true
        });
    }

    function bundle(requiredModules, callback) {

        var npmModules = requiredModules.filter(function(module){
            return isNpmModule(module);
        });

        if(npmModules.length > 0) {

            bundleQueue.push({
                modules: npmModules,
                callback: callback
            });

            deferredBundle();
        }
        else {
            callback();
        }
    }

    var deferredBundle = debounce(function(){

        var start = benchmark();

        bundleQueue.forEach(function(queued){

            b.require(queued.modules);
        });

        b.bundle(function(error, buffer){

            if(error) {
                throw new Error(error);
            }

            fs.writeFileSync(tmpfile.name, buffer);

            bundleQueue.forEach(function(queued){

                queued.callback();
            });

            log.info("Bundled imports for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));

            b.reset();
            bundleQueue.length = 0;
        });

    }, BUNDLE_DELAY);

    function isNpmModule(moduleName) {

        return moduleName.charAt(0) !== ".";
    }

    this.attach = attach;
    this.initialize = initialize;
    this.bundle = bundle;
}

module.exports = Browserify;
