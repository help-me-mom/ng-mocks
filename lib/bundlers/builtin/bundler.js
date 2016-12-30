var acorn = require("acorn"),
    builtins = require("browserify/lib/builtins"),
    browserResolve = require("browser-resolve"),
    debounce = require("lodash.debounce"),
    detective = require("detective"),
    fs = require("fs"),
    glob = require("glob"),
    os = require("os"),
    path = require("path"),
    tmp = require("tmp"),

    benchmark = require("../../benchmark"),

    basePath,
    bundleBuffer = "",
    bundleQueue = [],
    directories,
    entrypointFilenames = [],
    exclude,
    extensions,
    filenameCache = [],
    ignore,
    log,
    lookupNameCache = {},
    nodeGlobals,
    noParse,

    BUNDLE_DELAY = 500;

function Bundler() {

    var bundleFile = tmp.fileSync( { prefix: "karma-typescript-bundle-", postfix: ".js" } ),
        bundleQueuedModulesDeferred = debounce(bundleQueuedModules, BUNDLE_DELAY),
        bundleWithoutLoaderDeferred = debounce(bundleWithoutLoader, BUNDLE_DELAY);

    function initialize(karmaConfig, bundlerOptions, logger) {

        log = logger.create("builtin-bundler.karma-typescript");
        basePath = karmaConfig.basePath;

        bundlerOptions = bundlerOptions || {};
        bundlerOptions.resolve = bundlerOptions.resolve || {};

        exclude = bundlerOptions.exclude || [];
        extensions = bundlerOptions.resolve.extensions || [".js", ".json"];
        ignore = bundlerOptions.ignore || [];
        directories = bundlerOptions.resolve.directories || ["node_modules"];
        nodeGlobals = bundlerOptions.nodeGlobals !== undefined ? bundlerOptions.nodeGlobals : true;
        noParse = bundlerOptions.noParse || [];

        if(bundlerOptions.ignoredModuleNames) {
            log.warn("bundlerOptions.ignoredModuleNames has been deprecated and will be removed " +
                "in future versions, please use bundlerOptions.exclude instead");
            exclude = bundlerOptions.ignoredModuleNames;
        }
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

        bundleQueue.push({
            moduleName: file.path,
            filename: file.originalPath,
            source: source,
            requiredModules: requiredModules,
            callback: callback
        });

        if(shouldAddLoader) {
            bundleQueuedModulesDeferred();
        }
        else {
            bundleWithoutLoaderDeferred();
        }
    }

    function bundleQueuedModules() {

        var start = benchmark();

        bundleQueue.forEach(function(queued) {

            addEntrypointFilename(queued.filename);

            queued.requiredModules.forEach(function(requiredModule) {

                if(isNpmModule(requiredModule.moduleName) && !requiredModule.isTypescriptFile) {
                    resolveModules(queued.moduleName, requiredModule);
                }
                else {
                    resolveRequiredNonModuleContent(queued.moduleName, requiredModule);
                }
            });
        });

        flushQueue(start);
    }

    function bundleWithoutLoader() {

        bundleQueue.forEach(function(queued) {
            queued.callback(queued.source);
        });

        writeBundleFile();
    }

    function addLoaderFunction(module, standalone) {

        var requiredModuleMap = {},
            moduleId = path.relative(basePath, module.filename);

        module.requiredModules.forEach(function(requiredModule) {
            requiredModuleMap[requiredModule.moduleName] = fixWindowsPath(requiredModule.filename);
        });

        if(!isScript(module.filename)) {
            if(isJson(module.filename)) {
                module.source = os.EOL +
                    "module.isJSON = true;" + os.EOL +
                    "module.exports = JSON.parse(" + JSON.stringify(module.source) + ");";
            }
            else {
                module.source = os.EOL + "module.exports = " + JSON.stringify(module.source) + ";";
            }
        }

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

    function flushQueue(start) {

        writeBundleFile();

        log.info("Bundled imports for %s file(s) in %s ms.", bundleQueue.length, benchmark(start));

        bundleQueue.forEach(function(queued) {
            queued.callback(addLoaderFunction(queued, true));
        });

        log.debug("Karma callbacks for %s file(s) in %s ms.", bundleQueue.length, benchmark(start));

        bundleQueue.length = 0;
    }

    function writeBundleFile() {

        var bundle = "(function(global){" + os.EOL +
                    "global.wrappers={};" + os.EOL +
                    createGlobals() +
                    bundleBuffer + 
                    createEntrypointFilenames() +
                    "})(this);";

        fs.writeFileSync(bundleFile.name, bundle);
    }

    function createEntrypointFilenames() {

        if(entrypointFilenames.length > 0) {
            return "global.entrypointFilenames=['" + entrypointFilenames.join("','") + "'];" + os.EOL;
        }

        return "";
    }

    function createGlobals() {

        if(!nodeGlobals) {
            return "";
        }

        var globals = {
            filename: "globals.js",
            source: "global.process=require('process/browser');" + os.EOL +
                    "global.Buffer=require('buffer/').Buffer;",
            requiredModules: [
                { moduleName: "process/browser" },
                { moduleName: "buffer/" }
            ]
        };

        resolveModules(globals.filename, globals.requiredModules[0]);
        resolveModules(globals.filename, globals.requiredModules[1]);
        entrypointFilenames.unshift(globals.filename);

        return addLoaderFunction(globals, false) + os.EOL;
    }

    function resolveRequiredNonModuleContent(moduleName, requiredModule) {

        if(!requiredModule.isTypescriptFile && !requiredModule.isTypingsFile) {

            var directory = path.dirname(moduleName);

            requiredModule.moduleName = requiredModule.moduleName;
            requiredModule.filename = requiredModule.filename ||
                fixWindowsPath(path.join(directory, requiredModule.moduleName));
            requiredModule.source = fs.readFileSync(requiredModule.filename).toString();
            requiredModule.requiredModules = [];

            bundleBuffer += addLoaderFunction(requiredModule, false);
        }
    }

    function resolveModules(requiringModule, requiredModule) {

        if(exclude.indexOf(requiredModule.moduleName) !== -1) {
            log.debug("Excluding module %s", requiredModule.moduleName);
            return requiredModule.moduleName;
        }

        var lookupName = isNpmModule(requiredModule.moduleName) ?
                requiredModule.moduleName :
                path.join(path.dirname(requiringModule), requiredModule.moduleName);

        if(lookupNameCache[lookupName]) {
            requiredModule.filename = lookupNameCache[lookupName];
            return requiredModule.filename;
        }

        resolve(requiringModule, requiredModule);

        lookupNameCache[lookupName] = requiredModule.filename;
        
        if(filenameCache.indexOf(requiredModule.filename) !== -1) {
            return requiredModule.filename;
        }
        else {
            filenameCache.push(requiredModule.filename);
        }

        readSource(requiredModule);
        addDependencies(requiredModule);

        bundleBuffer += addLoaderFunction(requiredModule, false);

        return requiredModule.filename;
    }

    function resolve(requiringModule, requiredModule) {

        requiredModule.filename = browserResolve.sync(requiredModule.moduleName, {
            extensions: extensions,
            filename: isNpmModule(requiredModule.moduleName) ? undefined : requiringModule,
            moduleDirectory: directories,
            modules: builtins
        });
    }

    function readSource(requiredModule) {

        if(ignore.indexOf(requiredModule.moduleName) !== -1) {
            requiredModule.source = "module.exports={};";
        }
        else {
            requiredModule.source = fs.readFileSync(requiredModule.filename).toString();
            requiredModule.source = removeSourceMapUrl(requiredModule.source);
        }
    }

    function addDependencies(requiredModule) {

        requiredModule.requiredModules = [];

        if(isScript(requiredModule.filename) && noParse.indexOf(requiredModule.moduleName) === -1) {

            var found = detective.find(requiredModule.source),
                moduleNames = [].concat(found.strings);

            addDynamicDependencies(found.expressions, moduleNames, requiredModule);

            moduleNames.forEach(function(moduleName) {
                requiredModule.requiredModules.push({
                    moduleName: moduleName,
                    filename: resolveModules(requiredModule.filename, { moduleName: moduleName })
                });
            });
        }
    }

    function addDynamicDependencies(expressions, moduleNames, requiredModule) {

        expressions.forEach(function(expression) {

            var dynamicModuleName = parseDynamicRequire(expression),
                directory = path.dirname(requiredModule.filename),
                pattern,
                files;

            if(dynamicModuleName) {

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
