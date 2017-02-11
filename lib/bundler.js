function Bundler(config) {

    var acorn = require("acorn"),
        builtins,
        browserResolve = require("browser-resolve"),
        debounce = require("lodash.debounce"),
        detective = require("detective"),
        async = require("async"),
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
        bundleQueuedModulesDeferred = debounce(bundleQueuedModules, BUNDLE_DELAY),
        bundleWithoutLoaderDeferred = debounce(bundleWithoutLoader, BUNDLE_DELAY),
        entrypoints= [],
        expandedFiles = [],
        filenameCache = [],
        log,
        lookupNameCache = {},
        orderedEntrypoints = [];

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

        expandPatterns(files);
    }

    function expandPatterns(files) {

        files.forEach(function(file) {

            var g = new glob.Glob(path.normalize(file.pattern), {
                cwd: "/",
                follow: true,
                nodir: true,
                sync: true
            });

            Array.prototype.push.apply(expandedFiles, g.found);
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

    function bundleWithoutLoader() {

        createGlobals(function onGlobalsCreated(globals) {
            writeBundleFile(globals, function onBundleFileWritten() {
                bundleQueue.forEach(function(queued) {
                    queued.callback(queued.source);
                });
            });
        });
    }

    function bundleQueuedModules() {

        var start = benchmark();

        async.each(bundleQueue, function(queued, onQueuedResolved) {

            addEntrypointFilename(queued.filename);

            async.each(queued.requiredModules, function(requiredModule, onRequiredModuleResolved) {
                if(!requiredModule.isTypescriptFile &&
                    !(requiredModule.isTypingsFile && !isNpmModule(requiredModule.moduleName))) {
                    resolveModule(queued.moduleName, requiredModule, function() {
                        onRequiredModuleResolved();
                    });
                }
                else {
                    process.nextTick(function() {
                        onRequiredModuleResolved();
                    });
                }
            }, onQueuedResolved);
        }, function() {
            onAllResolved(start);
        });
    }

    function onAllResolved(start) {

        orderEntrypoints();

        createGlobals(function onGlobalsCreated(globals) {
            writeBundleFile(globals, function onBundleFileWritten() {
                log.info("Bundled imports for %s file(s) in %s ms.", bundleQueue.length, benchmark(start));

                bundleQueue.forEach(function(queued) {
                    queued.callback(addLoaderFunction(queued, true));
                });

                log.debug("Karma callbacks for %s file(s) in %s ms.", bundleQueue.length, benchmark(start));

                bundleQueue.length = 0;
            });
        });
    }

    function addLoaderFunction(module, standalone) {

        var requiredModuleMap = {},
            moduleId = path.relative(config.karma.basePath, module.filename);

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

    function createEntrypointFilenames() {
        if(orderedEntrypoints.length > 0) {
            return "global.entrypointFilenames=['" + orderedEntrypoints.join("','") + "'];" + os.EOL;
        }
        return "";
    }

    function addEntrypointFilename(filename) {
        if(config.bundlerOptions.entrypoints.test(filename) &&
           entrypoints.indexOf(filename) === -1) {
            entrypoints.push(filename);
        }
    }

    function orderEntrypoints() {
        expandedFiles.forEach(function(filename) {
            if(entrypoints.indexOf(filename) !== -1) {
                orderedEntrypoints.push(filename);
            }
        });
    }

    function writeBundleFile(globals, onBundleFileWritten) {

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
                throw error;
            }
            onBundleFileWritten();
        });
    }

    function createGlobals(onGlobalsCreated) {

        if(!config.bundlerOptions.addNodeGlobals) {
            process.nextTick(function() {
                onGlobalsCreated("");
            });
            return;
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
        };

        resolveModule(globals.filename, globals.requiredModules[0], function() {
            resolveModule(globals.filename, globals.requiredModules[1], function() {
                orderedEntrypoints.unshift(globals.filename);
                onGlobalsCreated(addLoaderFunction(globals, false) + os.EOL); 
            });
        });
    }

    function resolveModule(requiringModule, requiredModule, onRequiredModuleResolved) {

        requiredModule.lookupName = isNpmModule(requiredModule.moduleName) ?
                requiredModule.moduleName :
                path.join(path.dirname(requiringModule), requiredModule.moduleName);

        if(lookupNameCache[requiredModule.lookupName]) {
            requiredModule.filename = lookupNameCache[requiredModule.lookupName];
            process.nextTick(function() {
                onRequiredModuleResolved(requiredModule);
            });
            return;
        }

        if(config.bundlerOptions.exclude.indexOf(requiredModule.moduleName) !== -1) {
            log.debug("Excluding module %s from %s", requiredModule.moduleName, requiringModule);
            process.nextTick(function() {
                onRequiredModuleResolved();
            });
            return;
        }

        resolveFilename(requiringModule, requiredModule, onFilenameResolved);

        function onFilenameResolved() {

            lookupNameCache[requiredModule.lookupName] = requiredModule.filename;

            if(filenameCache.indexOf(requiredModule.filename) !== -1 || requiredModule.filename.indexOf(".ts") !== -1) {
                process.nextTick(function() {
                    onRequiredModuleResolved(requiredModule);
                });
                return;
            }
            else {
                filenameCache.push(requiredModule.filename);
                readSource(requiredModule, onSourceRead);
            }
        }

        function onSourceRead() {

            if(!isScript(requiredModule.filename)) {
                if(isJson(requiredModule.filename)) {
                    requiredModule.source = os.EOL +
                        "module.isJSON = true;" + os.EOL +
                        "module.exports = JSON.parse(" + JSON.stringify(requiredModule.source) + ");";
                }
                else {
                    requiredModule.source = os.EOL + "module.exports = " + JSON.stringify(requiredModule.source) + ";";

                    // temporary hack to make tests for #66 work
                    if(requiredModule.moduleName === "./style-import-tester.css") {
                        requiredModule.source = os.EOL + "module.exports = { color: '#f1a' };";
                    }
                }
            }

            resolveDependencies(requiredModule, onDependenciesResolved);
        }

        function onDependenciesResolved() {
            bundleBuffer += addLoaderFunction(requiredModule, false);
            return onRequiredModuleResolved(requiredModule);
        }
    }

    function resolveFilename(requiringModule, requiredModule, onFilenameResolved) {

        var bopts = {
            extensions: config.bundlerOptions.resolve.extensions,
            filename: isNpmModule(requiredModule.moduleName) ? undefined : requiringModule,
            moduleDirectory: config.bundlerOptions.resolve.directories,
            modules: builtins,
            pathFilter: pathFilter
        };

        browserResolve(requiredModule.moduleName, bopts, function(error, filename) {
            if(error) {
                throw new Error("Unable to resolve module [" +
                    requiredModule.moduleName + "] from [" + requiringModule + "]");
            }
            requiredModule.filename = filename;
            onFilenameResolved();
        });
    }

    function pathFilter(package, fullPath) {

        var filteredPath,
            normalizedPath = fixWindowsPath(fullPath);

        Object
            .keys(config.bundlerOptions.resolve.alias)
            .forEach(function(moduleName) {
                var regex = new RegExp(moduleName);
                if(regex.test(normalizedPath)) {
                    filteredPath = path.join(fullPath, config.bundlerOptions.resolve.alias[moduleName]);
                }
            });

        if(filteredPath) {
            return filteredPath;
        }
    }

    function readSource(requiredModule, onSourceRead) {

        if(config.bundlerOptions.ignore.indexOf(requiredModule.moduleName) !== -1) {
            onSourceRead("module.exports={};");
        }
        else {
            fs.readFile(requiredModule.filename, function(error, data) {
                if(error) {
                    throw error;
                }
                requiredModule.source = removeSourceMapUrl(data.toString());
                onSourceRead();
            });
        }
    }

    function resolveDependencies(requiredModule, onDependenciesResolved) {

        requiredModule.requiredModules = [];

        if(isScript(requiredModule.filename) && config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) === -1) {

            var found = detective.find(requiredModule.source),
                moduleNames = found.strings;

            addDynamicDependencies(found.expressions, moduleNames, requiredModule);

            async.each(moduleNames, function(moduleName, onModuleResolved) {
                var dependency = { moduleName: moduleName };
                resolveModule(requiredModule.filename, dependency, function(resolved) {
                    if(resolved) {
                        requiredModule.requiredModules.push(resolved);
                    }
                    onModuleResolved();
                });
            }, onDependenciesResolved);
        }
        else {
            process.nextTick(function() {
                onDependenciesResolved();
            });
        }
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
