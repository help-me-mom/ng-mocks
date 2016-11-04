var builtins = require("browserify/lib/builtins"),
    browserResolve = require("browser-resolve"),
    debounce = require("lodash.debounce"),
    detective = require("detective"),
    fs = require("fs"),
    os = require("os"),
    path = require("path"),
    tmp = require("tmp"),

    benchmark = require("../../benchmark"),

    bundleQueue = [],
    log,
    moduleFileBuffer,
    resolvedModuleNames = [],

    BUNDLE_DELAY = 500;

function NodeModulesLoader(){

    var tmpfile = tmp.fileSync();

    function initialize(logger) {
        log = logger.create("builtin-bundler.karma-typescript");
    }

    function attach(files){

        files.unshift({
            pattern: tmpfile.name,
            included: true,
            served: true,
            watched: true
        });

        files.push({
            pattern: path.join(__dirname, "commonjs-bootstrap.js"),
            included: true,
            served: true,
            watched: false
        });
    }

    function bundle(moduleName, source, requiredModules, callback) {

        bundleQueue.push({
            moduleName: moduleName,
            source: source,
            requiredModules: requiredModules,
            callback: callback
        });

        deferredBundle();
    }

    var deferredBundle = debounce(function(){

        var start = benchmark();

        moduleFileBuffer = "";

        bundleQueue.forEach(function(queued){

            moduleFileBuffer += addBootstrappingModule(queued.moduleName);

            queued.requiredModules.forEach(function(requiredModule){

                if(isNpmModule(requiredModule.path)) {

                    resolveModules(queued.moduleName, requiredModule.path);
                }
                else {

                    resolveDummyRequire(queued.moduleName, requiredModule);
                }
            });
        });

        fs.writeFileSync(tmpfile.name, moduleFileBuffer);

        log.info("Bundled imports for %s file%s in %s ms.", bundleQueue.length, bundleQueue.length === 1 ? "" : "(s)", benchmark(start));

        bundleQueue.forEach(function(queued){
            queued.callback(addLoaderFunction(queued.moduleName, queued.moduleName, queued.source));
        });

        bundleQueue.length = 0;

    }, BUNDLE_DELAY);

    function addBootstrappingModule(moduleName) {

        return "window.__monounity_commonjs_bootstrap_modules__ = window.__monounity_commonjs_bootstrap_modules__ || {};" +
                           "window.__monounity_commonjs_bootstrap_modules__['" + moduleName + "'] = '" + fixWindowsPath(moduleName) + "';" + os.EOL;
    }

    function addNpmAliasMap(requiredModule, resolvedModulePath) {

        return "window.__monounity_commonjs_npm_alias_map__ = window.__monounity_commonjs_npm_alias_map__ || {};" +
               "window.__monounity_commonjs_npm_alias_map__['" + requiredModule + "'] = '" + fixWindowsPath(resolvedModulePath) + "';" + os.EOL;
    }

    function addLoaderFunction(moduleName, filename, source) {

        var dirname = path.dirname(filename);

        return "window.__monounity_commonjs_modules__ = window.__monounity_commonjs_modules__ || {}; " +
               "window.__monounity_commonjs_modules__['" + fixWindowsPath(moduleName) + "'] = function moduleLoader(require, module, exports) { var __dirname = '" + fixWindowsPath(dirname) + "'; var __filename = '" + fixWindowsPath(filename) + "';" +
                   source + os.EOL +
               "}" + os.EOL;
    }

    function fixWindowsPath(value) {
        return value.replace(/\\/g, "/");
    }

    function resolveDummyRequire(moduleName, requiredModule) {

        if(requiredModule.isDummy){

            var directory = path.dirname(moduleName),
                dummyPath = fixWindowsPath(path.join(directory, requiredModule.path));

            moduleFileBuffer += addLoaderFunction(dummyPath, directory, os.EOL + "/* non javascript content */");
        }
    }

    function resolveModules(requiringModule, requiredModule) {

        if(resolvedModuleNames.indexOf(requiredModule) !== -1) {
            return;
        }

        var i,
            npmPath = isNpmModule(requiredModule) ?
                requiredModule :
                path.join(path.dirname(requiringModule), requiredModule),

            resolvedModulePath = browserResolve.sync(requiredModule, { filename: requiringModule, modules: builtins}),

            moduleSource = fs.readFileSync(resolvedModulePath).toString(),
            requireStatements = detective(moduleSource);

        moduleSource = removeSourceMapUrl(moduleSource);

        for(i = 0; i < requireStatements.length; i++) {

            resolveModules(resolvedModulePath, requireStatements[i]);
        }

        if(isNpmModule(requiredModule)) {

            moduleFileBuffer += addNpmAliasMap(requiredModule, resolvedModulePath);
        }

        moduleFileBuffer += addLoaderFunction(npmPath, resolvedModulePath, moduleSource);

        resolvedModuleNames.push(requiredModule);
    }

    function isNpmModule(moduleName) {

        return moduleName.charAt(0) !== ".";
    }

    function removeSourceMapUrl(source) {

        return source.replace(/\/\/#\s?sourceMappingURL\s?=\s?.*\.map/g, "");
    }

    this.initialize = initialize;
    this.attach = attach;
    this.bundle = bundle;
}

module.exports = NodeModulesLoader;
