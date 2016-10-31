var builtins = require("browserify/lib/builtins"),
    detective = require("detective"),
    fs = require("fs"),
    glob = require("glob"),
    os = require("os"),
    path = require("path"),
    browserResolve = require("browser-resolve"),
    tmp = require("tmp"),

    log,
    resolvedModuleNames = [],
    moduleFileBuffer;

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

        var i;

        moduleFileBuffer = addBootstrappingModule(moduleName);

        for(i = 0; i < requiredModules.length; i++) {

            if(isNpmModule(requiredModules[i])) {

                resolveModules(moduleName, requiredModules[i]);
            }
            else {

                resolveStylesheet(moduleName, requiredModules[i]);
            }
        }

        fs.appendFileSync(tmpfile.name, moduleFileBuffer);

        callback(addLoaderFunction(moduleName, path.dirname(moduleName), source));
    }

    function addBootstrappingModule(moduleName) {

        return "window.__monounity_commonjs_bootstrap_modules__ = window.__monounity_commonjs_bootstrap_modules__ || {};" +
                           "window.__monounity_commonjs_bootstrap_modules__['" + moduleName + "'] = '" + fixWindowsPath(moduleName) + "';" + os.EOL;
    }

    function addNpmAliasMap(requiredModule, resolvedModulePath) {

        return "window.__monounity_commonjs_npm_alias_map__ = window.__monounity_commonjs_npm_alias_map__ || {};" +
               "window.__monounity_commonjs_npm_alias_map__['" + requiredModule + "'] = '" + fixWindowsPath(resolvedModulePath) + "';" + os.EOL;
    }

    function addLoaderFunction(moduleName, dirname, source) {

        return "window.__monounity_commonjs_modules__ = window.__monounity_commonjs_modules__ || {}; " +
               "window.__monounity_commonjs_modules__['" + fixWindowsPath(moduleName) + "'] = function moduleLoader(require, module, exports) { var __dirname = '" + fixWindowsPath(dirname) + "'; " +
                   source + os.EOL +
               "}" + os.EOL;
    }

    function fixWindowsPath(value) {
        return value.replace(/\\/g, "/");
    }

    function resolveStylesheet(moduleName, requiredModule) {

        var directory = path.dirname(moduleName),
            styleSheetFiles = glob.sync(directory + "/!(node_modules)/**/*.+(css|less|sass|scss)"),
            stylesheetPath = fixWindowsPath(path.join(directory, requiredModule));

        if(styleSheetFiles.indexOf(stylesheetPath) !== -1) {

            moduleFileBuffer += addLoaderFunction(stylesheetPath, directory, os.EOL + "/* non javascript content */");
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

        moduleFileBuffer += addLoaderFunction(npmPath, path.dirname(resolvedModulePath), moduleSource);

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
