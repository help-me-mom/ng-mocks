module.exports = function (config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            "node_modules/lodash/lodash.js",
            "src/bar/typings/index.d.ts",
            "src/bar/*.ts"
        ],
        preprocessors: {
            "src/bar/*.ts": ["karma-typescript"]
        },
        karmaTypescriptConfig: {
            compilerOptions: {
                noImplicitAny: false,
                target: "ES5",
                module: "amd",
                removeComments: true,
                declaration: true,
                experimentalDecorators: true
            },
            include: ["src/bar/**/*.ts"],
            reports: {
                "html": "src/bar/coverage"
            }
        },
        singleRun: true,
        port: 9876,
        colors: true,
        reporters: ["dots", "karma-typescript"],
        browsers: ["PhantomJS"],
        logLevel: config.LOG_INFO, //config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        autoWatch: false,
        concurrency: Infinity
    });
};
