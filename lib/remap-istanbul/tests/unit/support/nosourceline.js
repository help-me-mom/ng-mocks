'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (cb) {
  try {
    _fs2.default.statSync('./manual');
  } catch (err) {
    cb();
    return;
  }

  // The below is required inline because of issues with Gitbook.
  var gitbook = require('gitbook'); // eslint-disable-line global-require
  var book = new gitbook.Book('./manual', {
    config: {
      output: './docs/manual'
    }
  });
  book.parse().then(function () {
    return book.generate('website');
  }).then(function () {
    return cb();
  }).catch(function (err) {
    return cb(err);
  });
};

module.exports = exports['default'];
//# sourceMappingURL=nosourceline.js.map
