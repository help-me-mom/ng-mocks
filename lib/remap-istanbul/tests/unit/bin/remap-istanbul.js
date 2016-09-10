define([
	'intern!object',
	'intern/chai!assert',
	'../../../lib/node!fs',
	'../../../lib/node!../../../bin/remap-istanbul'
], function (registerSuite, assert, fs, remapIstanbul) {
	registerSuite({
		name: 'bin/remapIstanbul',
		'terse args': function () {
			remapIstanbul([ '-i', 'tests/unit/support/coverage.json', '-o', 'tmp/coverage-cli-1.json', '-t', 'json' ]);
		},
		'full args': function () {
			remapIstanbul([
				'--input', 'tests/unit/support/coverage.json',
				'--output', 'tmp/coverage-cli-2.json',
				'--type', 'json'
			]);
		},
		'equals args': function () {
			remapIstanbul([
				'--input=tests/unit/support/coverage.json',
				'--output=tmp/coverage-cli-3.json',
				'--type=json'
			]);
		},
		'basePath': {
			'terse': function () {
				remapIstanbul([
					'-i', 'tests/unit/support/coverage.json',
					'-o', 'tmp/coverage-cli-4.json',
					'-b', 'app/src',
					'-t', 'json'
				]);
			},
			'full': function () {
				remapIstanbul([
					'--input', 'tests/unit/support/coverage.json',
					'--output', 'tmp/coverage-cli-4.json',
					'--basePath', 'app/src',
					'--type', 'json'
				]);
			}
		},
		'exclude': {
			'terse': function () {
				remapIstanbul([
					'-i', 'tests/unit/support/coverage.json',
					'-o', 'tmp/coverage-cli-4.json',
					'-e', 'node_modules',
					'-t', 'json'
				]);
			},
			'full': function () {
				remapIstanbul([
					'--input', 'tests/unit/support/coverage.json',
					'--output', 'tmp/coverage-cli-4.json',
					'--exclude', 'node_modules',
					'--type', 'json'
				]);
			},
			'regex': function () {
				remapIstanbul([
					'--input', 'tests/unit/support/coverage.json',
					'--output', 'tmp/coverage-cli-4.json',
					'--exclude', 'node_modules,bower_components',
					'--type', 'json'
				]);
			}
		},
		'html with inlined sources': function () {
			remapIstanbul([
				'--input', 'tests/unit/support/coverage-inlinesource.json',
				'--output', 'tmp/cli-coverage-inline',
				'--type', 'html'
			]);
		},
		'bad argument': function () {
			assert.throws(function () {
				remapIstanbul([
					'--outupt=tmp/coverage-cli-4.json'
				]);
			});
		}
	});
});
