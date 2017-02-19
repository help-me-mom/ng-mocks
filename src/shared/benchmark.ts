export class Benchmark {

    private start = process.hrtime();

    public elapsed(): number {
        let end = process.hrtime(this.start);
        return Math.round((end[0] * 1000) + (end[1] / 1000000));
    }
}
