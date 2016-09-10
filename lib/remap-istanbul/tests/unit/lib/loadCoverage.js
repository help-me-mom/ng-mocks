define([
	'intern!object',
	'intern/chai!assert',
	'../../../lib/loadCoverage'
], function (registerSuite, assert, loadCoverage) {
	registerSuite({
		name: 'remap-istanbul/lib/loadCoverage',

		'single source': function () {
			var coverage = loadCoverage('tests/unit/support/coverage.json');
			assert.isObject(coverage, 'return should be instance of collector');
			assert(coverage['tests/unit/support/basic.js'], 'coverage should be in the collection');
			assert.strictEqual(Object.keys(coverage).length, 1, 'should only be one file in collection');
		},

		'multi source': function () {
			var coverage = loadCoverage([
				'tests/unit/support/coverage.json',
				'tests/unit/support/inline-coverage.json'
			]);
			assert.isObject(coverage, 'return should be instance of collector');
			assert(coverage['tests/unit/support/basic.js'], 'coverage should be in the collection');
			assert(coverage['tests/unit/support/inline.js'], 'coverage should be in the collection');
			assert.strictEqual(Object.keys(coverage).length, 2, 'should only be one file in collection');
		},

		'readJSON': function () {
			var called;
			loadCoverage('tests/unit/support/coverage.json', {
				readJSON: function () {
					called = true;
					return {};
				}
			});
			assert(called, 'A passed readJSON function should be used');
		},

		'bad source/warn': function () {
			var warnStack = [];
			loadCoverage('badsource.json', {
				warn: function () {
					warnStack.push(arguments);
				}
			});
			assert.strictEqual(warnStack.length, 1, 'warn should have been called once');
			assert.strictEqual(warnStack[0].length, 1, 'warn should have been called with one argument');
			assert.instanceOf(warnStack[0][0], Error, 'should have been called with an error');
			assert.strictEqual(warnStack[0][0].message, 'Cannot find file: "badsource.json"',
				'should have passed the right message');
		},

		'empty sources': function () {
			var warnStack = [];
			loadCoverage([], {
				warn: function () {
					warnStack.push(arguments);
				}
			});
			assert.strictEqual(warnStack.length, 1, 'warn should have been called once');
			assert.strictEqual(warnStack[0].length, 1, 'warn should have been called with one argument');
			assert.instanceOf(warnStack[0][0], SyntaxError, 'should have been called with an error');
			assert.strictEqual(warnStack[0][0].message, 'No coverage files supplied!',
				'should have passed the right message');
		}
	});
});
