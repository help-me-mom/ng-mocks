module Foo {
    describe('Foo', () => {
        var foo:FooClass;

        beforeEach(() => {
            foo = new FooClass();
        });

        it('should works - it would be nice', () => {
            expect(foo.getUselessLorem()).toBe('Lorem ipsum...');
        });
    });
}
