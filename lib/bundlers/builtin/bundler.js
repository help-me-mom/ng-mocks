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
    resolvedModuleNames = [],

    BUNDLE_DELAY = 500;

function Bundler() {

    var bundleFile = tmp.fileSync( { prefix: "karma-typescript-bundle-", postfix: ".js" } ),
        globalsAppended = false;

    function initialize(karmaTypescriptConfig, logger) {

        ignoredModuleNames = (karmaTypescriptConfig.bundlerOptions &&
            karmaTypescriptConfig.bundlerOptions.ignoredModuleNames) || [];

        log = logger.create("builtin-bundler.karma-typescript");
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
                source: source,
                requiredModules: requiredModules,
                callback: callback
            });

            deferredBundle();
        }
        else {

            appendGlobals();
            callback(source);
        }
    }

    var deferredBundle = debounce(function() {

        var start = benchmark();

        appendGlobals();

        bundleQueue.forEach(function(queued) {

            bundleBuffer += addBootstrappingModule(queued.moduleName);

            queued.requiredModules.forEach(function(requiredModule) {

                if(isNpmModule(requiredModule.path)) {

                    resolveModules(queued.moduleName, requiredModule);
                }
                else {

                    resolveDummyRequire(queued.moduleName, requiredModule);
                }
            });
        });

        if(bundleBuffer) {
            fs.appendFileSync(bundleFile.name, bundleBuffer);
        }

        log.info("Bundled imports for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));

        bundleQueue.forEach(function(queued) {
            queued.callback(addLoaderFunction(queued.moduleName, queued.moduleName, queued.source));
        });

        log.debug("Karma callbacks for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));

        bundleQueue.length = 0;

    }, BUNDLE_DELAY);

    function appendGlobals() {

        bundleBuffer = "";

        if(!globalsAppended) {

            resolveModules("", { path: "buffer/" });
            resolveModules("", { path: "process/browser" });

            fs.appendFileSync(bundleFile.name, bundleBuffer);
            bundleBuffer = "";

            globalsAppended = true;
        }
    }

    function addBootstrappingModule(moduleName) {

        if(bootstrappingModules.indexOf(moduleName) === -1) {

            bootstrappingModules.push(moduleName);

            return "window.__monounity_commonjs_bootstrap_modules__ = window.__monounity_commonjs_bootstrap_modules__ || {};" +
                           "window.__monounity_commonjs_bootstrap_modules__['" + moduleName + "'] = '" + fixWindowsPath(moduleName) + "';" + os.EOL;

        }

        return "";
    }

    function addNpmAliasMap(requiredModule, resolvedModulePath) {

        return "window.__monounity_commonjs_npm_alias_map__ = window.__monounity_commonjs_npm_alias_map__ || {};" +
               "window.__monounity_commonjs_npm_alias_map__['" + requiredModule + "'] = '" + fixWindowsPath(resolvedModulePath) + "';" + os.EOL;
    }

    function addLoaderFunction(moduleName, filename, source) {

        var dirname = path.dirname(filename);

        return "window.__monounity_commonjs_modules__ = window.__monounity_commonjs_modules__ || {}; " +
               "window.__monounity_commonjs_modules__['" + fixWindowsPath(moduleName) + "'] = { moduleLoader: function(require, module, exports) { var __dirname = '" + fixWindowsPath(dirname) + "'; var __filename = '" + fixWindowsPath(filename) + "';" +
                   source + os.EOL +
               "}, map: { x: 'y' }}" + os.EOL;
    }

    function fixWindowsPath(value) {
        return value.replace(/\\/g, "/");
    }

    function resolveDummyRequire(moduleName, requiredModule) {

        if(!requiredModule.filename) {

            var directory = path.dirname(moduleName),
                dummyPath = fixWindowsPath(path.join(directory, requiredModule.path));

            requiredModule.filename = dummyPath;
            bundleBuffer += addLoaderFunction(dummyPath, directory, os.EOL + "module.exports = 'non javascript content';");
        }
    }

    var resolvedFilenames = {};

    function resolveModules(requiringModule, requiredModule) {

        var npmPath = isNpmModule(requiredModule.path) ?
                requiredModule.path :
                path.join(path.dirname(requiringModule), requiredModule.path),
            moduleSource,
            requireStatements;

        requiredModule.filename = resolvedFilenames[requiredModule.path];

        if(ignoredModuleNames.indexOf(npmPath) !== -1) {

            log.debug("Ignoring module %s", npmPath);
            return;
        }

        if(resolvedModuleNames.indexOf(npmPath) !== -1) {
            return;
        }

        resolvedModuleNames.push(npmPath);
        requiredModule.filename = browserResolve.sync(requiredModule.path, { filename: requiringModule, modules: builtins});
        resolvedFilenames[requiredModule.path] = requiredModule.filename;

        moduleSource = fs.readFileSync(requiredModule.filename).toString();
        requireStatements = detective(moduleSource);
        moduleSource = removeSourceMapUrl(moduleSource);

        requireStatements.forEach(function(requireStatement) {

            resolveModules(requiredModule.filename, { path: requireStatement });
        });

        if(isNpmModule(requiredModule.path)) {

            bundleBuffer += addNpmAliasMap(requiredModule.path, requiredModule.filename);
        }

        if(isJson(requiredModule.filename)) {

            moduleSource = "module.exports = " + JSON.stringify(moduleSource) + ";";
        }

        bundleBuffer += addLoaderFunction(npmPath, requiredModule.filename, moduleSource);
    }

    function isNpmModule(moduleName) {

        return moduleName.charAt(0) !== ".";
    }

    function isJson(resolvedModulePath) {
        return /\.json$/.test(resolvedModulePath);
    }

    function removeSourceMapUrl(source) {

        return source.replace(/\/\/#\s?sourceMappingURL\s?=\s?.*\.map/g, "");
    }

    this.initialize = initialize;
    this.attach = attach;
    this.bundle = bundle;
}

module.exports = Bundler;
