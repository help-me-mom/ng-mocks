declare module './foo' {
	interface Foo {
		foo(): string;
	}
	let foo: Foo;
	export = foo;
}