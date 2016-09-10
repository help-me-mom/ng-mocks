define({
	loaderOptions: {
		packages: [
			{ name: 'remap-istanbul', location: '.' }
		]
	},

	suites: [ 'remap-istanbul/tests/unit/all' ],

	excludeInstrumentation: /^(?:tests|node_modules)\//
});
