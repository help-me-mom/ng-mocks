module.exports = function(config) {
    config.set({

        frameworks: ["jasmine", "karma-typescript"],

        files: [
            { pattern: "base.spec.ts" },
            { pattern: "src/app/**/*.+(ts|html)" }
        ],

        //proxies: {
            //"/src/app/": "/base/src/app/" // use this with moduleId + templateUrl: "hello.html"
            //"/app/": "/base/src/app/" // use this without moduleId + templateUrl: "app/hello.html"
        //},

        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },

        karmaTypescriptConfig: {
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/,
                transforms: [
                    require("karma-typescript/transforms/angular2-transform")
                ]
            },
            coverageOptions: {
                instrumentation: true
            }
        },

        reporters: ["progress", "karma-typescript"],

        browsers: ["Chrome"]
    });
};
