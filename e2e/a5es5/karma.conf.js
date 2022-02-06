// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('@angular/cli/plugins/karma'),
      require('karma-chrome-launcher'),
      require('karma-ie-launcher'),
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false,
      },
    },
    customLaunchers: {
      ChromeCi: {
        base: 'ChromeHeadless',
        flags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
      },
      IECi: {
        base: 'IE',
        flags: ['-extoff'],
      },
    },
    angularCli: {
      environment: 'dev',
    },
    reporters: ['kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: [process.env.IE_BIN ? 'IECi' : 'ChromeCi'],
    singleRun: true,
  });
};
