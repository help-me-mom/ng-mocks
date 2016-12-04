var async = require("async"),
    builtins = require("browserify/lib/builtins"),
    browserResolve = require("browser-resolve"),
    detective = require("detective"),
    fs = require("fs"),
    os = require("os"),
    path = require("path"),
    tmp = require("tmp"),

    bootstrappingModules = [],
    bundleBuffer,
    ignoredModuleNames,
    log,
    resolvedFilenames = {};

function Bundler() {

    var bundleFile = tmp.fileSync( { prefix: "karma-typescript-bundle-", postfix: ".js" } );

    function initialize(karmaTypescriptConfig, logger) {

        ignoredModuleNames = (karmaTypescriptConfig.bundlerOptions &&
            karmaTypescriptConfig.bundlerOptions.ignoredModuleNames) || [];

        log = logger.create("builtin-bundler.karma-typescript");

        bundleBuffer = "window.wrappers={};" + os.EOL+
                       "window.filenames=[];" + os.EOL;

        var requiredModules = [
            { moduleName: "process/browser" },
            { moduleName: "buffer/" }
        ];

        async.each(requiredModules, function(requiredModule, callback) {
            resolve("globals", requiredModule, function() {
                callback();
            });
        }, function() {
            addBootstrappingModule("globals");
            bundleBuffer += addLoaderFunction({
                filename: "globals",
                source: "window.global={};" + os.EOL +
                        "window.process=require('process/browser');" + os.EOL +
                        "window.Buffer=require('buffer/').Buffer;",
                requiredModules: requiredModules
            });
        });
    }

    function attach(files) {

        files.unshift({
            pattern: bundleFile.name,
            included: true,
            served: true,
            watched: true
        });

        files.push({
            pattern: path.join(__dirname, "commonjs.js"),
            included: true,
            served: true,
            watched: false
        });
    }

    function bundle(file, source, requiredModules, shouldAddLoader, callback) {

        if(shouldAddLoader) {

            async.eachSeries(requiredModules, function(requiredModule, requiredModuleCallback) {

                if(isNpmModule(requiredModule.moduleName)) {
                    resolve(file.originalPath, requiredModule, function() {
                        requiredModuleCallback();
                    });
                }
                else {
                    resolveDummyRequire(file.originalPath, requiredModule);
                    requiredModuleCallback();
                }

            }, function requiredModuleCallback() {

                addBootstrappingModule(file.originalPath);

                if(bundleBuffer) {
                    fs.appendFileSync(bundleFile.name, bundleBuffer);
                    bundleBuffer = "";
                }

                callback(addLoaderFunction({
                    filename: file.originalPath,
                    source: source,
                    requiredModules: requiredModules
                }));
            });
        }
        else {

            callback(source);
        }
    }

    function resolve(requiringModule, requiredModule, done) {

        var cacheLookupName = isNpmModule(requiredModule.moduleName) ?
                    requiredModule.moduleName :
                    path.join(path.dirname(requiringModule), requiredModule.moduleName);

        if(ignoredModuleNames.indexOf(requiredModule.moduleName) !== -1) {

            log.debug("Ignoring module %s", requiredModule.moduleName);
            done(requiredModule.moduleName);
        }
        else if(resolvedFilenames[cacheLookupName]) {

            requiredModule.filename = resolvedFilenames[cacheLookupName];
            done(requiredModule.filename);
        }
        else {

            browserResolve(requiredModule.moduleName, {
                filename: requiringModule,
                modules: builtins
            }, function(error, resolvedFileName) {

                requiredModule.filename = resolvedFileName;
                resolvedFilenames[cacheLookupName] = requiredModule.filename;

                fs.readFile(requiredModule.filename, "utf-8", function(error, source) {

                    source = removeSourceMapUrl(source);

                    if(isJson(requiredModule.filename)) {
                        source = "module.exports = " + JSON.stringify(source) + ";";
                    }

                    requiredModule.source = source;
                    requiredModule.requiredModules = [];

                    async.each(detective(source), function(moduleName, callback) {

                        resolve(requiredModule.filename, { moduleName: moduleName }, function(filename){

                            requiredModule.requiredModules.push({
                                moduleName: moduleName,
                                filename: filename
                            });

                            callback();
                        });

                    }, function callback() {
                        bundleBuffer += addLoaderFunction(requiredModule);
                        done(requiredModule.filename);
                    });
                });
            });
        }
    }

    function addBootstrappingModule(filename) {

        if(bootstrappingModules.indexOf(filename) === -1) {

            bootstrappingModules.push(filename);
            bundleBuffer += "window.filenames.push('" + filename + "');" + os.EOL;
        }
    }

    function addLoaderFunction(module) {

        var requiredModuleMap = {};

        module.requiredModules.forEach(function(requiredModule) {
            requiredModuleMap[requiredModule.moduleName] = requiredModule.filename;
        });

        return "window.wrappers['" + fixWindowsPath(module.filename) + "']=" +
               "[function(require,module,exports,__dirname,__filename){ " +
                   module.source + os.EOL +
               "}," + JSON.stringify(requiredModuleMap) + "]" + os.EOL;
    }

    function resolveDummyRequire(moduleName, requiredModule) {

        if(!requiredModule.filename) {

            var directory = path.dirname(moduleName),
                dummyPath = fixWindowsPath(path.join(directory, requiredModule.moduleName));

            requiredModule.moduleName = requiredModule.moduleName;
            requiredModule.filename = dummyPath;
            requiredModule.source = os.EOL + "module.exports = 'non javascript content';";
            requiredModule.requiredModules = [];

            bundleBuffer += addLoaderFunction(requiredModule);
        }
    }

    function isNpmModule(moduleName) {
        return moduleName.charAt(0) !== "." &&
               moduleName.charAt(0) !== "/";
    }

    function isJson(resolvedModulePath) {
        return /\.json$/.test(resolvedModulePath);
    }

    function removeSourceMapUrl(source) {
        return source.replace(/\/\/#\s?sourceMappingURL\s?=\s?.*\.map/g, "");
    }

    function fixWindowsPath(value) {
        return value.replace(/\\/g, "/");
    }

    this.initialize = initialize;
    this.attach = attach;
    this.bundle = bundle;
}

module.exports = Bundler;
