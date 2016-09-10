define([
	'intern!object',
	'intern/chai!assert',
	'../../../lib/node!grunt',
	'../../../lib/node!fs'
], function (registerSuite, assert, grunt, fs) {

	/* creating a mock for logging */
	var logStack = [];
	var log = function log() {
		logStack.push(arguments);
	};
	log.logStack = logStack;

	function runGruntTask(taskName, callback) {
		var task = grunt.task._taskPlusArgs(taskName);
		task.task.fn.apply({
			nameArgs: task.nameArgs,
			name: task.task.name,
			args: task.args,
			flags: task.flags,
			async: function() { return callback; }
		}, task.args);
	}

	registerSuite({
		name: 'tasks/remapIstanbul',
		setup: function () {
			grunt.initConfig({
				remapIstanbul: {
					basic: {
						options: {
							reports: {
								'clover': 'tmp/remapIstanbul.clover.xml',
								'cobertura': 'tmp/remapIstanbul.cobertura.xml',
								'html': 'tmp/remap-html-report',
								'json-summary': 'tmp/remapInstanbul.coverage-summary.json',
								'json': 'tmp/remapIstanbul.coverage.json',
								'lcovonly': 'tmp/remapIstanbul.lcov.info',
								'teamcity': 'tmp/remapIstanbul.teamcity.txt',
								'text-lcov': log,
								'text-summary': 'tmp/remapIstanbul.text-summary.txt',
								'text': 'tmp/remapIstanbul.text.txt'
							}
						},
						src: 'tests/unit/support/coverage.json'
					},

					srcdest: {
						files: [ {
							src: 'tests/unit/support/coverage.json',
							dest: 'tmp/srcdest.coverage.json',
							type: 'json'
						} ]
					},

					inlineSource: {
						options: {
							reports: {
								'html': 'tmp/remap-html-report-inline'
							}
						},
						src: 'tests/unit/support/coverage-inlinesource.json'
					},

					nonTrans: {
						options: {
							reports: {
								'html': 'tmp/grunt-html-report-nontrans'
							}
						},
						src: 'tests/unit/support/coverage-import.json'
					},
					
					nonTransFail: {
						options: {
							fail: true,
							reports: {
								'html': 'tmp/grunt-html-report-fail'
							}
						},
						src: 'tests/unit/support/coverage-import.json'
					}

				}
			});
			grunt.loadTasks('tasks');
		},

		'basic': function () {
			var dfd = this.async();
			runGruntTask('remapIstanbul:basic', dfd.callback(function () {
				assert.isTrue(fs.existsSync('tmp/remapIstanbul.clover.xml'), 'file should exist');
			}));
		},

		'srcdest': function () {
			var dfd = this.async();
			runGruntTask('remapIstanbul:srcdest', dfd.callback(function () {
				assert.isTrue(fs.existsSync('tmp/srcdest.coverage.json'), 'file should exist');
			}));
		},

		'inline source': function () {
			var dfd = this.async();
			runGruntTask('remapIstanbul:inlineSource', dfd.callback(function () {
				assert.isTrue(fs.existsSync('tmp/remap-html-report-inline'), 'file should exist');
			}));
		},

		'non-transpiled coverage': {
			'non-fatal': function () {
				var dfd = this.async();
				runGruntTask('remapIstanbul:nonTrans', dfd.callback(function () {
					assert.isTrue(fs.existsSync('tmp/grunt-html-report-nontrans'), 'file should exist');
				}));
			},

			'fail': function () {
				var dfd = this.async();
				grunt.option('force', true);
				runGruntTask('remapIstanbul:nonTransFail', dfd.callback(function () {
					assert.isTrue(fs.existsSync('tmp/grunt-html-report-fail'), 'file should exist');
					grunt.option('force', false);
				}));
			}
		}

	});
});
