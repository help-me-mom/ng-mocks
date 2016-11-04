var browserify = require("browserify"),
    debounce = require("lodash.debounce"),
    fs = require("fs"),
    path = require("path"),
    through = require("through"),
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

    function bundle(moduleName, source, requiredModules, callback) {

        bundleQueue.push({
            moduleName: moduleName,
            dirname: path.dirname(moduleName),
            source: source,
            requiredModules: requiredModules,
            callback: callback
        });

        deferredBundle();
    }

    var deferredBundle = debounce(function(){

        var start = benchmark();

        bundleQueue.forEach(function(queued){

            queued.requiredModules.forEach(function(module){

                if(isNpmModule(module.path) || module.isDummy) {
                    b.require(module.path, { basedir: queued.dirname });
                }
            });
        });

        b.transform(function(){

            var data = "";
            return through(write, end);

            function write(buffer) {
                data += buffer;
            }

            function end() {
                this.queue("module.exports = '" + JSON.stringify(data) + "'");
                this.queue(null);
            }
        });

        b.bundle(function(error, buffer){

            if(error) {
                throw new Error(error);
            }

            fs.writeFileSync(tmpfile.name, buffer);

            log.info("Bundled imports for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));

            bundleQueue.forEach(function(queued){

                queued.callback(queued.source || "/*" + queued.moduleName + "*/");
            });

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
