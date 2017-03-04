module Bar {
    export class BarClass {
        private answer = 42;

        public getAnswerForUltimateQuestionOfLifeTheUniverseAndEverything():number {
            return this.answer;
        }

        public returnLastElement(elements:number[]):number {
            return _.last(elements);
        }
    }
}
