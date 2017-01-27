require("es6-promise").polyfill();

function Bundler(config) {

    var acorn = require("acorn"),
        builtins,
        browserResolve = require("browser-resolve"),
        debounce = require("lodash.debounce"),
        detective = require("detective"),
        fs = require("fs"),
        glob = require("glob"),
        os = require("os"),
        path = require("path"),
        tmp = require("tmp"),

        benchmark = require("./benchmark"),
        sourcemap = require("./sourcemap"),

        BUNDLE_DELAY = 500,

        bundleBuffer = "",
        bundleFile = tmp.fileSync({
            prefix: "karma-typescript-bundle-",
            postfix: ".js"
        }),
        bundleQueue = [],
        bundleQueuedModulesDeferred = debounce(bundleQueuedModulesAsync, BUNDLE_DELAY),
        bundleWithoutLoaderDeferred = debounce(bundleWithoutLoader, BUNDLE_DELAY),
        entrypointFilenames = [],
        filenameCacheAsync = [],
        log,
        lookupNameCacheAsync = {};

    function initialize(logger) {

        log = logger.create("bundler.karma-typescript");

        builtins = config.bundlerOptions.addNodeGlobals ?
            require("browserify/lib/builtins") : undefined;
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

    function bundle(file, source, emitOutput, shouldAddLoader, callback) {

        bundleQueue.push({
            moduleName: file.path,
            filename: file.originalPath,
            source: sourcemap.create(file, source, emitOutput),
            requiredModules: emitOutput.requiredModules,
            callback: callback
        });

        if(shouldAddLoader) {
            bundleQueuedModulesDeferred();
        }
        else {
            bundleWithoutLoaderDeferred();
        }
    }

    function bundleQueuedModulesAsync() {

        var dependencies = [],
            start = benchmark();

        bundleQueue.forEach(function(queued) {

            addEntrypointFilename(queued.filename);

            queued.requiredModules.forEach(function(requiredModule) {
                if(!requiredModule.isTypescriptFile &&
                   !(requiredModule.isTypingsFile && !isNpmModule(requiredModule.moduleName))) {
                    dependencies.push(resolveModulesAsync(queued.moduleName, requiredModule));
                }
            });
        });

        Promise
            .all(dependencies)
            .then(createGlobalsAsync)
            .then(writeBundleFileAsync)
            .then(flushAsync)
            .catch(function(error) {
                log.error(error);
            });

        function flushAsync() {
            
            log.info("Bundled imports for %s file(s) in %s ms.", bundleQueue.length, benchmark(start));

            bundleQueue.forEach(function(queued) {
                queued.callback(addLoaderFunction(queued, true));
            });

            log.debug("Karma callbacks for %s file(s) in %s ms.", bundleQueue.length, benchmark(start));

            bundleQueue.length = 0;
        }
    }

    function bundleWithoutLoader() {
        createGlobalsAsync()
            .then(writeBundleFileAsync)
            .then(function() {
                bundleQueue.forEach(function(queued) {
                    queued.callback(queued.source);
                });
            });
    }

    function addLoaderFunction(module, standalone) {

        var requiredModuleMap = {},
            moduleId = path.relative(config.basePath, module.filename);

        module.requiredModules.forEach(function(requiredModule) {
            requiredModuleMap[requiredModule.moduleName] = fixWindowsPath(requiredModule.filename);
        });

        return (standalone ? "(function(global){" : "") +
            "global.wrappers['" + fixWindowsPath(module.filename) + "']=" +
            "[function(require,module,exports,__dirname,__filename){ " + module.source +
            os.EOL + "},'" +
            fixWindowsPath(moduleId) + "'," +
            fixWindowsPath(JSON.stringify(requiredModuleMap))+ "];" +
            (standalone ? "})(this);" : "") + os.EOL;
    }

    function addEntrypointFilename(filename) {
        if(entrypointFilenames.indexOf(filename) === -1) {
            entrypointFilenames.push(filename);
        }
    }

    function writeBundleFileAsync(globals) {

        return new Promise(function(resolve, reject) {

            var bundle = "(function(global){" + os.EOL +
                        "global.wrappers={};" + os.EOL +
                        globals +
                        bundleBuffer +
                        createEntrypointFilenames() +
                        "})(this);";

            if(config.bundlerOptions.validateSyntax) {
                try {
                    acorn.parse(bundle);
                }
                catch(error) {
                    throw new Error("Invalid syntax in bundle: " + error.message + " in " + bundleFile.name);
                }
            }

            fs.writeFile(bundleFile.name, bundle, function(error) {
                if(error) {
                    reject(); return;
                }
                resolve();
            });
        });
    }

    function createGlobalsAsync() {

        if(!config.bundlerOptions.addNodeGlobals) {
            return Promise.resolve("");
        }

        var globals = {
                filename: "globals.js",
                source: os.EOL +
                        "global.process=require('process/browser');" + os.EOL +
                        "global.Buffer=require('buffer/').Buffer;",
                requiredModules: [
                    { moduleName: "process/browser" },
                    { moduleName: "buffer/" }
                ]
            },
            dependencies = [
                resolveModulesAsync(globals.filename, globals.requiredModules[0]),
                resolveModulesAsync(globals.filename, globals.requiredModules[1])
            ];

        return Promise
            .all(dependencies)
            .then(handleGlobals);

        function handleGlobals () {
            entrypointFilenames.unshift(globals.filename);
            return addLoaderFunction(globals, false) + os.EOL;  
        }
    }

    function createEntrypointFilenames() {

        if(entrypointFilenames.length > 0) {
            return "global.entrypointFilenames=['" + entrypointFilenames.join("','") + "'];" + os.EOL;
        }

        return "";
    }

    function resolveModulesAsync(requiringModule, requiredModule) {

        requiredModule.lookupName = isNpmModule(requiredModule.moduleName) ?
                requiredModule.moduleName :
                path.join(path.dirname(requiringModule), requiredModule.moduleName);

        if(lookupNameCacheAsync[requiredModule.lookupName]) {
            requiredModule.filename = lookupNameCacheAsync[requiredModule.lookupName];
            return Promise.resolve(requiredModule);
        }

        return resolveAsync(requiringModule, requiredModule)
            .then(handleResolve)
            .then(handleSource)
            .then(resolveDependencies)
            .then(done);
    }

    function resolveAsync(requiringModule, requiredModule) {

        return new Promise(function(resolve, reject) {

            var bopts = {
                extensions: config.bundlerOptions.resolve.extensions,
                filename: isNpmModule(requiredModule.moduleName) ? undefined : requiringModule,
                moduleDirectory: config.bundlerOptions.resolve.directories,
                modules: builtins
            };

            browserResolve(requiredModule.moduleName, bopts, function(error, filename) {
                if(error) {
                    reject(new Error("Unable to resolve module [" +
                        requiredModule.moduleName + "] from [" + requiringModule + "]"));
                    return;
                }
                requiredModule.filename = filename;
                resolve(requiredModule);
            });
        });
    }

    function handleResolve(requiredModule) {

        lookupNameCacheAsync[requiredModule.lookupName] = requiredModule.filename;

        if(filenameCacheAsync.indexOf(requiredModule.filename) !== -1) {
            return {};
        }
        else {
            filenameCacheAsync.push(requiredModule.filename);
        }

        return readSourceAsync(requiredModule);
    }

    function readSourceAsync(requiredModule) {

        return new Promise(function(resolve, reject) {

            if(config.bundlerOptions.ignore.indexOf(requiredModule.moduleName) !== -1) {
                resolve("module.exports={};");
            }
            else {
                fs.readFile(requiredModule.filename, function(error, data) {
                    if(error) {
                        reject(error); return;
                    }
                    requiredModule.source = data.toString() || "";
                    resolve(requiredModule);
                });
            }
        });
    }

    function handleSource(requiredModule) {

        if(typeof requiredModule.source === "string") {

            requiredModule.source = removeSourceMapUrl(requiredModule.source);

            if(!isScript(requiredModule.filename)) {
                if(isJson(requiredModule.filename)) {
                    requiredModule.source = os.EOL +
                        "module.isJSON = true;" + os.EOL +
                        "module.exports = JSON.parse(" + JSON.stringify(requiredModule.source) + ");";
                }
                else {
                    requiredModule.source = os.EOL + "module.exports = " + JSON.stringify(requiredModule.source) + ";";
                }
            }
        }
        return requiredModule || {};
    }

    function resolveDependencies(requiredModule) {

        requiredModule.requiredModules = [];

        if(requiredModule.source &&
           isScript(requiredModule.filename) &&
           config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) === -1) {

            var found = detective.find(requiredModule.source),
                moduleNames = [].concat(found.strings),
                promises = [];

            addDynamicDependencies(found.expressions, moduleNames, requiredModule);

            moduleNames.forEach(function(moduleName) {
                if(config.bundlerOptions.exclude.indexOf(moduleName) !== -1) {
                    log.debug("Excluding module %s from %s", moduleName, requiredModule.filename);
                }
                else {
                    var dependency = { moduleName: moduleName };
                    promises.push(resolveModulesAsync(requiredModule.filename, dependency));
                    requiredModule.requiredModules.push(dependency);
                }
            });

            return Promise
                .all(promises)
                .then(function() {
                    return requiredModule;
                });
        }

        return Promise.resolve(requiredModule);
    }

    function done(requiredModule) {

        if(typeof requiredModule.source === "string") {
            bundleBuffer += addLoaderFunction(requiredModule, false);
        }

        return requiredModule;
    }

    function addDynamicDependencies(expressions, moduleNames, requiredModule) {

        expressions.forEach(function(expression) {

            var dynamicModuleName = parseDynamicRequire(expression),
                directory = path.dirname(requiredModule.filename),
                pattern,
                files;

            if(dynamicModuleName && dynamicModuleName !== "*") {

                if(isNpmModule(dynamicModuleName)) {
                    moduleNames.push(dynamicModuleName);
                }
                else {

                    pattern = path.join(directory, dynamicModuleName);
                    files = glob.sync(pattern);

                    files.forEach(function(filename) {
                        log.debug("Dynamic require: \nexpression: [%s]\nfilename: %s\nrequired by %s\nglob: %s",
                                 expression, filename, requiredModule.filename, pattern);
                        moduleNames.push("./" + path.relative(directory, filename));
                    });
                }
            }
        });
    }

    function parseDynamicRequire(requireStatement) {

        var ast = acorn.parse(requireStatement);

        function visit(node) {
            switch(node.type) {
                case "BinaryExpression":
                    if(node.operator === "+") {
                        return visit(node.left) + visit(node.right);
                    }
                    break;
                case "ExpressionStatement":
                    return visit(node.expression);
                case "Literal":
                    return node.value + "";
                case "Identifier":
                    return "*";
                default:
                    return "";
            }
        }

        return visit(ast.body[0]);
    }

    function isNpmModule(moduleName) {
        return moduleName.charAt(0) !== "." &&
               moduleName.charAt(0) !== "/";
    }

    function isJson(resolvedModulePath) {
        return /\.json$/.test(resolvedModulePath);
    }

    function isScript(resolvedModulePath) {
        return /\.(js|jsx|ts|tsx)$/.test(resolvedModulePath);
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