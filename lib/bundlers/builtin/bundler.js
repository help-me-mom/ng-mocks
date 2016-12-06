var builtins = require("browserify/lib/builtins"),
    browserResolve = require("browser-resolve"),
    debounce = require("lodash.debounce"),
    detective = require("detective"),
    fs = require("fs"),
    os = require("os"),
    path = require("path"),
    tmp = require("tmp"),

    benchmark = require("../../benchmark"),

    bootstrappingModules = [],
    bundleBuffer,
    bundleQueue = [],
    ignoredModuleNames,
    log,

    BUNDLE_DELAY = 500;

function Bundler() {

    var bundleFile = tmp.fileSync( { prefix: "karma-typescript-bundle-", postfix: ".js" } );

    function initialize(karmaTypescriptConfig, logger) {

        ignoredModuleNames = (karmaTypescriptConfig.bundlerOptions &&
            karmaTypescriptConfig.bundlerOptions.ignoredModuleNames) || [];

        log = logger.create("builtin-bundler.karma-typescript");

        bundleBuffer = "window.wrappers={};" + os.EOL+
                       "window.filenames=[];" + os.EOL;

        bundleQueue.unshift({
            moduleName: "globals",
            filename: "globals",
            source: "window.global={};" + os.EOL +
                    "window.process=require('process/browser');" + os.EOL +
                    "window.Buffer=require('buffer/').Buffer;",
            requiredModules: [
                { moduleName: "process/browser" },
                { moduleName: "buffer/" }
            ],
            callback: function(bundled) {
                fs.appendFileSync(bundleFile.name, bundled);
            }
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

            bundleQueue.push({
                moduleName: file.path,
                filename: file.originalPath,
                source: source,
                requiredModules: requiredModules,
                callback: callback
            });

            bundleQueuedModulesDeferred();
        }
        else {

            bundleQueuedModules();
            callback(source);
        }
    }

    function addLoaderFunction(module) {

        var requiredModuleMap = {};

        module.requiredModules.forEach(function(requiredModule) {
            requiredModuleMap[requiredModule.moduleName] = fixWindowsPath(requiredModule.filename);
        });

        if(isJson(module.filename)) {

            module.source = os.EOL + "module.exports = JSON.parse(" + JSON.stringify(module.source) + ");";
        }

        return "window.wrappers['" + fixWindowsPath(module.filename) + "']=" +
                   "[function(require,module,exports,__dirname,__filename){ " +
                       module.source + os.EOL +
                   "}," + fixWindowsPath(JSON.stringify(requiredModuleMap))+ "]" + os.EOL;
    }

    function addBootstrappingModule(filename) {

        if(bootstrappingModules.indexOf(filename) === -1) {

            bootstrappingModules.push(filename);
            bundleBuffer += "window.filenames.push('" + filename + "');" + os.EOL;
        }
    }

    var bundleQueuedModulesDeferred = debounce(bundleQueuedModules, BUNDLE_DELAY);

    function bundleQueuedModules() {

        var start = benchmark();

        bundleQueue.forEach(function(queued) {

            addBootstrappingModule(queued.filename);

            queued.requiredModules.forEach(function(requiredModule) {

                if(isNpmModule(requiredModule.moduleName) && !requiredModule.filename) {

                    resolveModules(queued.moduleName, requiredModule);
                }
                else {

                    resolveDummyRequire(queued.moduleName, requiredModule);
                }
            });
        });

        flush(start);
    }

    function flush(start) {

        if(bundleBuffer) {

            bundleBuffer += "window.filenames=['" + bootstrappingModules.join("'," + os.EOL +"'") + "'];" + os.EOL + bundleBuffer;

            fs.appendFileSync(bundleFile.name, bundleBuffer);

            log.info("Bundled imports for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));
        }

        bundleQueue.forEach(function(queued) {
            queued.callback(addLoaderFunction(queued));
        });

        log.debug("Karma callbacks for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));

        bundleQueue.length = 0;
        bundleBuffer = "";
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

    var resolvedFilenames = {};

    function resolveModules(requiringModule, requiredModule) {

        if(ignoredModuleNames.indexOf(requiredModule.moduleName) !== -1) {

            log.debug("Ignoring module %s", requiredModule.moduleName);
            return requiredModule.moduleName;
        }

        var cacheLookupName = isNpmModule(requiredModule.moduleName) ?
                requiredModule.moduleName :
                path.join(path.dirname(requiringModule), requiredModule.moduleName);

        if(resolvedFilenames[cacheLookupName]) {
            requiredModule.filename = resolvedFilenames[cacheLookupName];
            return requiredModule.filename;
        }

        resolve(requiringModule, requiredModule, cacheLookupName);
        readSource(requiredModule);
        addDependencies(requiredModule);

        bundleBuffer += addLoaderFunction(requiredModule);

        return requiredModule.filename;
    }

    function resolve(requiringModule, requiredModule, cacheLookupName) {

        requiredModule.filename = browserResolve.sync(requiredModule.moduleName, {
            filename: requiringModule, modules: builtins
        });

        resolvedFilenames[cacheLookupName] = requiredModule.filename;
    }

    function readSource(requiredModule) {

        requiredModule.source = fs.readFileSync(requiredModule.filename).toString();
        requiredModule.source = removeSourceMapUrl(requiredModule.source);
    }

    function addDependencies(requiredModule) {

        var requireStatements = detective(requiredModule.source);
        requiredModule.requiredModules = [];

        requireStatements.forEach(function(requireStatement) {

            var filename = resolveModules(requiredModule.filename, { moduleName: requireStatement });

            requiredModule.requiredModules.push({
                moduleName: requireStatement,
                filename: filename
            });
        });
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
    this.addLoaderFunction = addLoaderFunction;
}

module.exports = Bundler;
