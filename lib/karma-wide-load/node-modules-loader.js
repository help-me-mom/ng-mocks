var esprima = require("esprima"),
    fs = require("fs"),
    glob = require("glob"),
    os = require("os"),
    path = require("path"),
    tmp = require("tmp"),

    AstWalker = require("./ast-walker"),

    resolvedModuleNames = [];

function NodeModulesLoader(){

    var astWalker = new AstWalker(),
        pathSeparatorAdded,
        tmpfile = tmp.fileSync();

    function loadModules(moduleName, source, requiredModules) {

        var i;

        addPathSeparator();

        for(i = 0; i < requiredModules.length; i++) {

            if(isNpmModule(requiredModules[i])) {

                resolveModules(moduleName, requiredModules[i]);
            }
            else {

                resolveStylesheet(moduleName, requiredModules[i]);
            }
        }

        return addLoaderFunction(moduleName, path.dirname(moduleName), source);
    }

    function appendToFile(content) {

        fs.appendFileSync(tmpfile.name, content);
    }

    function addPathSeparator() {

        if(!pathSeparatorAdded) {

            appendToFile("window.__monounity_commonjs_path_separator__ = '" + escapeWindowsPath(path.sep) + "';" + os.EOL);
            pathSeparatorAdded = true;
        }
    }

    function addNpmMap(requiredModule, resolvedModulePath) {

        return "window.__monounity_commonjs_npm_map__ = window.__monounity_commonjs_npm_map__ || {};" +
               "window.__monounity_commonjs_npm_map__['" + requiredModule + "'] = '" + resolvedModulePath + "';" + os.EOL;
    }

    function addLoaderFunction(moduleName, dirname, source) {

        return "window.__monounity_commonjs_modules__ = window.__monounity_commonjs_modules__ || {}; " +
               "window.__monounity_commonjs_modules__['" + escapeWindowsPath(moduleName) + "'] = function moduleLoader(require, module, exports) { var __dirname = '" + escapeWindowsPath(dirname) + "'; " +
                   source + os.EOL +
               "}" + os.EOL;
    }

    function escapeWindowsPath(value) {
        return value.replace(/\\/g, "\\\\");
    }

    function resolveStylesheet(moduleName, requiredModule) {

        var directory = path.dirname(moduleName),
            styleSheetFiles = glob.sync(directory + "/!(node_modules)/**/*.+(css|less|sass|scss)"),
            stylesheetPath = path.join(directory, requiredModule);

        if(styleSheetFiles.indexOf(stylesheetPath) !== -1) {

            appendToFile(addLoaderFunction(stylesheetPath, directory, os.EOL + "/* non javascript content */"));
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

            resolvedModulePath = require.resolve(npmPath),

            moduleName = isNpmModule(requiredModule) ? requiredModule : npmPath,

            moduleSource = fs.readFileSync(resolvedModulePath).toString(),
            ast = esprima.parse(moduleSource),
            requireStatements = [];

        astWalker.walkSyntaxTree(ast, requireStatements, "", requiredModule === "@angular/core");

        for(i = 0; i < requireStatements.length; i++) {

            resolveModules(resolvedModulePath, requireStatements[i].value);
        }

        if(isNpmModule(requiredModule)) {
            appendToFile(addNpmMap(requiredModule, resolvedModulePath));
        }

        appendToFile(addLoaderFunction(moduleName, path.dirname(resolvedModulePath), moduleSource));

        resolvedModuleNames.push(requiredModule);
    }

    function isNpmModule(moduleName) {

        return moduleName.charAt(0) !== ".";
    }

    this.location = tmpfile.name;
    this.loadModules = loadModules;
}

module.exports = NodeModulesLoader;
