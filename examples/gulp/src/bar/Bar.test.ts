module Bar {
    describe('Bar', () => {
        var bar:BarClass;

        beforeEach(() => {
            bar = new BarClass();
        });

        it('should return correct answer', () => {
            expect(bar.getAnswerForUltimateQuestionOfLifeTheUniverseAndEverything()).toBe(42);
        });

        it('should works - it would be nice', () => {
            expect(bar.returnLastElement([1,2,3,42])).toBe(42);
        });
    });
}
