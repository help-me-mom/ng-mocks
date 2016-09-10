import * as foo from './foo';

let value = foo.foo();

export = function() {
	if (value) {
		console.log(value);
	}
	else {
		console.log('no value');
	}
};
