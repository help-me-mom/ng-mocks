define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!path',
	'../../../lib/node!istanbul/lib/collector',
	'../../../lib/node!istanbul/lib/store/memory',
	'../../../lib/loadCoverage',
	'../../../lib/remap'
], function (registerSuite, assert, path, Collector, MemoryStore, loadCoverage, remap) {
	registerSuite({
		name: 'remap-istanbul/lib/remap',

		'remapping': function () {
			var coverage = remap(loadCoverage('tests/unit/support/coverage.json'));
			assert.instanceOf(coverage, Collector, 'Return values should be instance of Collector');
			assert(coverage.store.map['tests/unit/support/basic.ts'],
				'The Collector should have a remapped key');
			assert.strictEqual(Object.keys(coverage.store.map).length, 1,
				'Collector should only have one map');
			var map = JSON.parse(coverage.store.map['tests/unit/support/basic.ts']);
			assert.strictEqual(map.path, 'tests/unit/support/basic.ts');
			assert.strictEqual(Object.keys(map.statementMap).length, 28, 'Map should have 28 statements');
			assert.strictEqual(Object.keys(map.fnMap).length, 6, 'Map should have 6 functions');
			assert.strictEqual(Object.keys(map.branchMap).length, 6, 'Map should have 6 branches');
		},

		'base64 source map': function () {
			var coverage = remap(loadCoverage('tests/unit/support/inline-coverage.json'));
			assert.instanceOf(coverage, Collector, 'Return values should be instance of Collector');
			assert(coverage.store.map['tests/unit/support/basic.ts'],
				'The Collector should have a remapped key');
			assert.strictEqual(Object.keys(coverage.store.map).length, 1,
				'Collector should only have one map');
			var map = JSON.parse(coverage.store.map['tests/unit/support/basic.ts']);
			assert.strictEqual(map.path, 'tests/unit/support/basic.ts');
			assert.strictEqual(Object.keys(map.statementMap).length, 28, 'Map should have 28 statements');
			assert.strictEqual(Object.keys(map.fnMap).length, 6, 'Map should have 6 functions');
			assert.strictEqual(Object.keys(map.branchMap).length, 6, 'Map should have 6 branches');
		},

		'base64 source map with sources': function () {
			var store = new MemoryStore();
			remap(loadCoverage('tests/unit/support/coverage-inlinesource.json'), {
				sources: store
			});
			assert(store.map['tests/unit/support/inlinesource.ts'], 'Source should have been retrieved from source map');
		},

		'coverage includes code': function () {
			var coverage = remap(loadCoverage('tests/unit/support/coverage-code.json'));
			assert.instanceOf(coverage, Collector, 'Return values should be instance of Collector');
			assert(coverage.store.map['tests/unit/support/basic-code.ts']);
			var map = JSON.parse(coverage.store.map['tests/unit/support/basic-code.ts']);
			assert.typeOf(map.code, 'string', 'should respect source mapping');
		},

		'coverage includes code as array': function () {
			var coverage = remap(loadCoverage('tests/unit/support/coverage-code-array.json'));
			assert.instanceOf(coverage, Collector, 'Return values should be instance of Collector');
			assert(coverage.store.map['tests/unit/support/basic-code.ts']);
			var map = JSON.parse(coverage.store.map['tests/unit/support/basic-code.ts']);
			assert.isTrue(Array.isArray(map.code));
		},

		'empty options': function () {
			assert.throws(remap, TypeError);
		},

		'basePath' : function() {
			var coverage = remap(loadCoverage('tests/unit/support/coverage.json'), {
				basePath : 'foo/bar'
			});

			assert(coverage.store.map['foo/bar/basic.ts'],  'The base path provided should have been used');
			assert.strictEqual(Object.keys(coverage.store.map).length, 1,
				'Collector should only have one map');
			var map = JSON.parse(coverage.store.map['foo/bar/basic.ts']);
			assert.strictEqual(map.path, 'foo/bar/basic.ts', 'The base path should be used in the map as well');
		},

		'missing coverage source': function () {
			var warnStack = [];
			function warn() {
				warnStack.push(arguments);
			}
			remap(loadCoverage('tests/unit/support/badcoverage.json'), {
				warn: warn
			});
			assert.strictEqual(warnStack.length, 2, 'warn should have been called twice');
			assert.instanceOf(warnStack[0][0], Error, 'should have been called with error');
			assert.strictEqual(warnStack[0][0].message, 'Could not find file: "tests/unit/support/bad.js"',
				'proper error message should have been returend');
			assert.instanceOf(warnStack[1][0], Error, 'should have been called with error');
			assert.strictEqual(warnStack[1][0].message, 'Could not find source map for: "tests/unit/support/bad.js"',
				'proper error message should have been returend');
		},

		'missing source map': function () {
			var coverage = loadCoverage('tests/unit/support/missingmapcoverage.json');
			assert.throws(function () {
				remap(coverage);
			}, Error);
		},

		'unicode in map': function () {
			var coverage = remap(loadCoverage('tests/unit/support/coverage-unicode.json'));

			assert(coverage.store.map['tests/unit/support/unicode.ts'], 'The file should have been properly mapped.');
			assert.strictEqual(Object.keys(coverage.store.map).length, 1,
				'Collector should have only one map.');
		},

		'skip in source map': function () {
			var coverage = remap(loadCoverage('tests/unit/support/coverage-skip.json'));

			var coverageData = JSON.parse(coverage.store.map['tests/unit/support/basic.ts']);
			assert.isTrue(coverageData.statementMap['18'].skip, 'skip is perpetuated');
			assert.isUndefined(coverageData.statementMap['1'].skip, 'skip is not present');
			assert.isTrue(coverageData.fnMap['5'].skip, 'skip is perpetuated');
			assert.isUndefined(coverageData.fnMap['1'].skip, 'skip is not present');
		},

		'lineless items in source map should not error': function () {
			remap(loadCoverage('tests/unit/support/nosourceline.json'));
		},

		'non transpiled coverage': function () {
			var warnStack = [];

			var coverage = remap(loadCoverage('tests/unit/support/coverage-import.json'), {
				warn: function () {
					warnStack.push(arguments);
				}
			});

			var coverageData = JSON.parse(coverage.store.map['tests/unit/support/foo.js']);
			assert.strictEqual(1, coverageData.statementMap['1'].start.line);
			assert.strictEqual(1, warnStack.length);
			assert.instanceOf(warnStack[0][0], Error, 'should have been called with error');
			assert.strictEqual(warnStack[0][0].message, 'Could not find source map for: "tests/unit/support/foo.js"',
				'proper error message should have been returend');
		},

		'exclude - string': function () {
			var warnStack = [];

			var coverage = remap(loadCoverage('tests/unit/support/coverage-import.json'), {
				warn: function () {
					warnStack.push(arguments);
				},
				exclude: 'foo.js'
			});

			assert.strictEqual(1, warnStack.length);
			assert.strictEqual(warnStack[0][0], 'Excluding: "tests/unit/support/foo.js"');
		},

		'exclude - RegEx': function () {
			var warnStack = [];

			remap(loadCoverage('tests/unit/support/coverage-import.json'), {
				warn: function () {
					warnStack.push(arguments);
				},
				exclude: /foo\.js$/
			});

			assert.strictEqual(1, warnStack.length);
			assert.strictEqual(warnStack[0][0], 'Excluding: "tests/unit/support/foo.js"');
		},

		'useAbsolutePaths': function () {
			var coverage = remap(loadCoverage('tests/unit/support/coverage.json'), {
				useAbsolutePaths: true
			});

			var absoluteKey = path.resolve(process.cwd(), 'tests/unit/support/basic.ts');
			assert(coverage.store.map[absoluteKey],
				'The Collector should have a key with absolute path');
			assert.strictEqual(Object.keys(coverage.store.map).length, 1,
				'Collector should only have one map');
		}
	});
});
