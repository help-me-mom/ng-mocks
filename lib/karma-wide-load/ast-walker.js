function AstWalker() {

    function walkSyntaxTree(node, requireExpressions) {

        if(isArray(node)) {

            node.forEach(function(statement){

                walkSyntaxTree(statement, requireExpressions);
            });
        }

        if(isObject(node)) {

            storeRequireExpression(node, requireExpressions);

            for(var key in node) {

                if(node.hasOwnProperty(key)) {

                    walkSyntaxTree(node[key], requireExpressions);
                }
            }
        }
    }

    function storeRequireExpression(expression, requireExpressions) {

        if(expression && expression.arguments && expression.callee && expression.callee.name === "require") {

            requireExpressions.push(expression.arguments[0]);
        }
    }

    function isArray(obj) {

        return obj && Object.prototype.toString.call(obj) === "[object Array]";
    }

    function isObject(obj) {

        return obj && Object.prototype.toString.call(obj) === "[object Object]";
    }

    this.walkSyntaxTree = walkSyntaxTree;

}

module.exports = AstWalker;

// var recast = require("recast");
/* eslint quotes:0 */

// var source = "(function (global, factory) {\n" +
// "    typeof exports === \"object\" && typeof module !== \"undefined\" ? factory(exports, require(\"rxjs/Subject\"), require(\"rxjs/Observable\")) :\n" +
// "    typeof define === \"function\" && define.amd ? define([\"exports\", \"rxjs/Subject\", \"rxjs/Observable\"], factory) :\n" +
// "    (factory((global.ng = global.ng || {}, global.ng.core = global.ng.core || {}),global.Rx,global.Rx));\n" +
// "})();";

/* eslint quotes:1 */

// var source = "module.exports = require('./lib/React'); /*require some stuff*/ while(true) { require('jasmine'); } var x = require('@angular/core'); require('style/scss'); function foo(x) { require('@types/jasmine'); } if(1){ var x = require('react'); }";
// var ast = recast.parse(source);
// var requireExpressions = [];
// new AstWalker().walkSyntaxTree(ast.program, requireExpressions);
// console.log(requireExpressions);
// console.log(recast.print(ast.code));
