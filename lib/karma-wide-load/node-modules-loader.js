var fs = require("fs"),
    os = require("os"),
    path = require("path"),
    recast = require("recast"),
    tmp = require("tmp"),

    AstWalker = require("./ast-walker"),

    moduleCache = {};

function NodeModulesLoader(transformPathFn){

    var astWalker = new AstWalker(),
        tmpfile = tmp.fileSync();

    function loadModules(requiringModule, requiringModuleSource) {

        requiringModule = path.normalize(requiringModule);

        var ast = recast.parse(requiringModuleSource),
            requireExpressions = [];

        astWalker.walkSyntaxTree(ast, requireExpressions);

        requireExpressions.forEach(function(requireExpression){

            var requiredModule = requireExpression.value,
                resolvedModule = resolveModule(requiringModule, requiredModule);

            requireExpression.value = resolvedModule.name;

            if(resolvedModule.loadContent && !moduleCache[resolvedModule.name]) {

                var moduleSource = fs.readFileSync(resolvedModule.path).toString();

                if(path.extname(resolvedModule.path) === ".js"){

                    var generatedSource = loadModules(resolvedModule.name, moduleSource);
                    moduleCache[resolvedModule.name] = generatedSource;

                    fs.appendFileSync(tmpfile.name, generatedSource + os.EOL);
                }
                else {

                    var nonJavascriptContent = addLoaderFunction(resolvedModule.name, "/* non-javascript content omitted */");
                    moduleCache[resolvedModule.name] = nonJavascriptContent;

                    fs.appendFileSync(tmpfile.name, nonJavascriptContent + os.EOL);
                }
            }
        });

        return addLoaderFunction(requiringModule, recast.print(ast).code);
    }

    function addLoaderFunction(moduleName, source) {

        var escapedModuleName = escapeWindowsPath(moduleName);

        return "window.__monounity_commonjs_modules__ = window.__monounity_commonjs_modules__ || {}; " +
           "window.__monounity_commonjs_modules__['" + escapedModuleName + "'] = function moduleLoader(require, module, exports) { var __dirname = '" + escapedModuleName + "'; " +
               source + os.EOL +
           "}";
    }

    function escapeWindowsPath(value) {
        return value.replace(/\\/g, "\\\\");
    }

    function resolveModule(requiringModule, requiredModule) {

        if (isNpmModule(requiredModule)){

            return resolveNpmModule(requiredModule);
        }
        else {

            var relativePath = path.dirname(requiringModule),

                name = relativePath.endsWith(path.sep + "node_modules") ?
                path.join(requiringModule, requiredModule) :
                path.join(relativePath, requiredModule),

                isRelativeToNpm = name.indexOf(path.sep + "node_modules") !== -1,

                fullpath = isRelativeToNpm ? require.resolve(name) : resolveLocalModule(name);

            return {
                path: fullpath,
                name: assertModuleName(name),
                loadContent: isRelativeToNpm || path.extname(fullpath) !== ".js"
            };
        }
    }

    function isNpmModule(module) {

        return module.charAt(0) !== ".";
    }

    function resolveNpmModule(name) {

        var resolvedPath = require.resolve(name),
            moduleIndex = resolvedPath.lastIndexOf(path.join("node_modules", name)),
            moduleBasePath = resolvedPath.substring(0, moduleIndex);

        return {
            path: resolvedPath,
            name: path.join(path.normalize(moduleBasePath), "node_modules", name),
            loadContent: true
        };
    }

    function resolveLocalModule(name) {

        var directory = path.dirname(name),
            filenames = fs.readdirSync(directory),
            fullpath,
            fullpathMinusExtension,
            i;

        for(i = 0; i < filenames.length; i++) {

            fullpath = path.join(directory, filenames[i]);
            fullpathMinusExtension = fullpath.substring(0, fullpath.lastIndexOf("."));

            if(name === fullpath || name === fullpathMinusExtension) {

                return transformPathFn(fullpath);
            }
        }

        throw new Error("No file found for module " + name);
    }

    function assertModuleName(name) {

        return name.replace(/\.(ts|js)$/, "");
    }

    this.location = tmpfile.name;
    this.loadModules = loadModules;
}

module.exports = NodeModulesLoader;
