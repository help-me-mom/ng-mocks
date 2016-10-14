var esprima = require("esprima"),
    fs = require("fs"),
    glob = require("glob"),
    os = require("os"),
    path = require("path"),
    tmp = require("tmp"),

    AstWalker = require("./ast-walker"),

    modulesCache = [];

function NodeModulesLoader(){

    var astWalker = new AstWalker(),
        tmpfile = tmp.fileSync();

    function loadModules(moduleName, source, requiredModules) {

        appendToFile("window.__monounity_commonjs_path_separator__ = '" + escapeWindowsPath(path.sep) + "';" + os.EOL);

        requiredModules.forEach(function(requiredModule){

            if(isNpmModule(requiredModule)) {

                resolveModules(moduleName, requiredModule);
            }
            else {

                resolveStylesheet(moduleName, requiredModule);
            }
        });

        var result = addLoaderFunction(moduleName, path.dirname(moduleName), source);

        return result;
    }

    function appendToFile(content) {

        fs.appendFileSync(tmpfile.name, content);
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

        if(modulesCache.indexOf(requiredModule) !== -1) {
            return;
        }

        var npmPath = isNpmModule(requiredModule) ?
            requiredModule :
            path.join(path.dirname(requiringModule), requiredModule),

            resolvedModulePath = require.resolve(npmPath),

            moduleName = isNpmModule(requiredModule) ? requiredModule : npmPath,

            moduleSource = fs.readFileSync(resolvedModulePath).toString(),
            ast = esprima.parse(moduleSource),
            requireStatements = [];

        astWalker.walkSyntaxTree(ast, requireStatements);

        requireStatements.forEach(function(requireStatement){
            resolveModules(resolvedModulePath, requireStatement.value);
        });

        if(isNpmModule(requiredModule)) {
            appendToFile(addNpmMap(requiredModule, resolvedModulePath));
        }

        appendToFile(addLoaderFunction(moduleName, path.dirname(resolvedModulePath), moduleSource));

        modulesCache.push(requiredModule);
    }

    function isNpmModule(moduleName) {

        return moduleName.charAt(0) !== ".";
    }

    this.location = tmpfile.name;
    this.loadModules = loadModules;
}

module.exports = NodeModulesLoader;
