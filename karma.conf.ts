// Karma configuration
// Generated on Mon Dec 25 2017 20:41:30 GMT-0800 (PST)

module.exports = (config: any) => {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/proxy.js',
      'node_modules/zone.js/dist/sync-test.js',
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',
      { pattern: 'lib/**/*.ts' }
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    reporters: ['dots', 'karma-typescript', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,

    karmaTypescriptConfig: {
      compilerOptions: {
        lib: ['ES2015', 'DOM']
      }
    }
  })
}
