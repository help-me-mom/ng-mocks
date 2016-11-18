var browserify = require("browserify"),
    debounce = require("lodash.debounce"),
    fs = require("fs"),
    path = require("path"),
    tmp = require("tmp"),
    through = require("through"),

    benchmark = require("../../benchmark"),
    bundleQueue = [],
    log,

    _buffer = require.resolve("buffer/"),
    _process = require.resolve("process/browser"),

    BUNDLE_DELAY = 500;

function Browserify(){

    var b = browserify({ fullPaths: true, insertGlobals: true, transform: transform }),
        bundleFile = tmp.fileSync(),
        entryPointFile = tmp.fileSync(),
        entryPointFileFilter = /\.(spec|test)\.ts/;

    b.require(path.join(__dirname, "empty.js"));

    function initialize(_karmaTypescriptConfig, logger) {
        log = logger.create("browserify-bundler.karma-typescript");
    }

    function attach(files) {

        files.unshift({
            pattern: bundleFile.name,
            included: true,
            served: true,
            watched: true
        });

        files.push({
            pattern: entryPointFile.name,
            included: true,
            served: true,
            watched: true
        });
    }

    function bundle(file, source, requiredModules, callback) {

        bundleQueue.push({
            moduleName: file.path,
            filename: file.originalPath,
            dirname: path.dirname(file.path),
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

        b.bundle(function(error, buffer){

            if(error) {
                throw new Error(error);
            }

            var entryPointFileBuffer = "";

            fs.appendFileSync(bundleFile.name, buffer);

            log.info("Bundled imports for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));

            bundleQueue.forEach(function(queued){

                if(entryPointFileFilter.test(queued.filename)){

                    entryPointFileBuffer += "require(\"" + queued.moduleName.replace(".js", "") + "\");\n";
                }

                // Franken-browser-pack below...
                // Module-deps creates its source maps and adds
                // new lines which messes up remap-istanbul.
                // TODO: read _prelude from browser-pack
                // TODO: arguments[1], arguments[2]...
                var packed = "require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s;})({\"" +
                queued.moduleName.replace(".js", "") + "\":[function(require,module,exports){ " +

                "(function (process,global,Buffer,__dirname,__filename){" +
                (queued.source || "") +
                "\n}).call(this,require('_process')," +
                "typeof global !== \"undefined\" ? global : typeof self !== \"undefined\" ? self : typeof window !== \"undefined\" ? window : {}," +
                "require(\"buffer\").Buffer," +
                "\"" + queued.dirname + "\"," +
                "\"" + queued.moduleName + "\")" +
                "},{ \"_process\":\"" + _process + "\"," +
                "\"buffer\":\"" + _buffer + "\"," +
                getLocalDependencies(queued.dirname, queued.requiredModules) + "}]},{},[]);";

                queued.callback(packed);
            });

            fs.appendFileSync(entryPointFile.name, entryPointFileBuffer);

            log.info("Karma callbacks for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));

            b.reset();
            bundleQueue.length = 0;
        });
    }, BUNDLE_DELAY);

    function transform(){

        var data = "";
        return through(write, end);

        function write (buffer) {
            data += buffer;
        }

        function end () {
            this.queue("module.exports = '" + JSON.stringify(data) + "';");
            this.queue(null);
        }
    }

    function getLocalDependencies(dirname, requiredModules){

        return requiredModules
            .filter(function(requiredModule){
                return !isNpmModule(requiredModule.path);
            })
            .map(function(requiredModule){
                return JSON.stringify(requiredModule.path) + ":" + JSON.stringify(path.join(dirname, requiredModule.path));
            }).join(",");
    }

    function isNpmModule(moduleName) {

        return moduleName.charAt(0) !== ".";
    }

    this.attach = attach;
    this.initialize = initialize;
    this.bundle = bundle;
}

module.exports = Browserify;
