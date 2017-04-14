"use strict";
var acorn = require("acorn");
var babel = require("babel-core");
var log4js = require("log4js");
var log;
var isEs6 = function (ast) {
    if (ast.body) {
        for (var _i = 0, _a = ast.body; _i < _a.length; _i++) {
            var statement = _a[_i];
            switch (statement.type) {
                case "ExportAllDeclaration":
                case "ExportDefaultDeclaration":
                case "ExportNamedDeclaration":
                case "ImportDeclaration":
                    return true;
                default:
            }
        }
    }
    return false;
};
var configure = function (options) {
    options = options || {};
    if (!options.presets || options.presets.length === 0) {
        options.presets = ["es2015"];
    }
    var transform = function (context, callback) {
        if (!context.js) {
            return callback(undefined, false);
        }
        if (isEs6(context.js.ast)) {
            if (!options.filename) {
                options.filename = context.filename;
            }
            log.debug("Transforming %s", options.filename);
            try {
                context.source = babel.transform(context.source, options).code;
                context.js.ast = acorn.parse(context.source, { sourceType: "module" });
                return callback(undefined, true);
            }
            catch (error) {
                return callback(error, false);
            }
        }
        else {
            return callback(undefined, false);
        }
    };
    var initialize = function (logOptions) {
        log4js.setGlobalLogLevel(logOptions.level);
        log4js.configure({ appenders: logOptions.appenders });
        log = log4js.getLogger("es6-transform.karma-typescript");
    };
    return Object.assign(transform, { initialize: initialize });
};
module.exports = configure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkJBQStCO0FBQy9CLGtDQUFvQztBQUVwQywrQkFBaUM7QUFJakMsSUFBSSxHQUFrQixDQUFDO0FBRXZCLElBQUksS0FBSyxHQUFHLFVBQUMsR0FBbUI7SUFDNUIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDWCxHQUFHLENBQUMsQ0FBa0IsVUFBUSxFQUFSLEtBQUEsR0FBRyxDQUFDLElBQUksRUFBUixjQUFRLEVBQVIsSUFBUTtZQUF6QixJQUFJLFNBQVMsU0FBQTtZQUNkLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixLQUFLLHNCQUFzQixDQUFDO2dCQUM1QixLQUFLLDBCQUEwQixDQUFDO2dCQUNoQyxLQUFLLHdCQUF3QixDQUFDO2dCQUM5QixLQUFLLG1CQUFtQjtvQkFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEIsUUFBUTtZQUNaLENBQUM7U0FDSjtJQUNMLENBQUM7SUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUVGLElBQUksU0FBUyxHQUFHLFVBQUMsT0FBZ0M7SUFFN0MsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFFeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFJLFNBQVMsR0FBaUIsVUFBQyxPQUE0QixFQUFFLFFBQThCO1FBRXZGLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhCLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUN4QyxDQUFDO1lBRUQsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDO2dCQUNELE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDL0QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFDRCxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNYLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBRUYsSUFBSSxVQUFVLEdBQTJCLFVBQUMsVUFBNEM7UUFDbEYsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDO0lBRUYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxZQUFBLEVBQUUsQ0FBQyxDQUFDO0FBQ3BELENBQUMsQ0FBQztBQUVGLGlCQUFTLFNBQVMsQ0FBQyJ9