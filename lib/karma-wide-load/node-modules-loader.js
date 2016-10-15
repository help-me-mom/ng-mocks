var esprima = require("esprima"),
    fs = require("fs"),
    glob = require("glob"),
    os = require("os"),
    path = require("path"),
    tmp = require("tmp"),

    AstWalker = require("./ast-walker"),

    resolvedModuleNames = [],
    moduleFileBuffer;

function NodeModulesLoader(){

    var astWalker = new AstWalker(),
        tmpfile = tmp.fileSync();

    function loadModules(moduleName, source, requiredModules) {

        var i;

        moduleFileBuffer = "";

        for(i = 0; i < requiredModules.length; i++) {

            if(isNpmModule(requiredModules[i])) {

                resolveModules(moduleName, requiredModules[i]);
            }
            else {

                resolveStylesheet(moduleName, requiredModules[i]);
            }
        }

        fs.appendFileSync(tmpfile.name, moduleFileBuffer);

        return addLoaderFunction(moduleName, path.dirname(moduleName), source);
    }

    function addNpmMap(requiredModule, resolvedModulePath) {

        return "window.__monounity_commonjs_npm_map__ = window.__monounity_commonjs_npm_map__ || {};" +
               "window.__monounity_commonjs_npm_map__['" + requiredModule + "'] = '" + fixWindowsPath(resolvedModulePath) + "';" + os.EOL;
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

            resolvedModulePath = require.resolve(npmPath),

            moduleName = isNpmModule(requiredModule) ? requiredModule : npmPath,

            moduleSource = fs.readFileSync(resolvedModulePath).toString(),
            ast = esprima.parse(moduleSource),
            requireStatements = [];

        astWalker.walkSyntaxTree(ast, requireStatements);

        for(i = 0; i < requireStatements.length; i++) {

            resolveModules(resolvedModulePath, requireStatements[i].value);
        }

        if(isNpmModule(requiredModule)) {

            moduleFileBuffer += addNpmMap(requiredModule, resolvedModulePath);
        }

        moduleFileBuffer += addLoaderFunction(moduleName, path.dirname(resolvedModulePath), moduleSource);

        resolvedModuleNames.push(requiredModule);
    }

    function isNpmModule(moduleName) {

        return moduleName.charAt(0) !== ".";
    }

    this.location = tmpfile.name;
    this.loadModules = loadModules;
}

module.exports = NodeModulesLoader;
