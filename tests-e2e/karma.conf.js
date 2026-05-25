// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const { executablePath } = require('puppeteer');

module.exports = async function (config) {
  process.env.CHROME_BIN = await executablePath();

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
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
    },
    reporters: ['dots', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeCi'],
    singleRun: true,
  });
};
