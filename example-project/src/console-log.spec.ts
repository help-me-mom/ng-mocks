import { ConsoleLog } from "./console-log";

describe("ConsoleLog", () => {

    it("should log to the console and not duplicate output", () => {

        let consoleLog = new ConsoleLog();
        consoleLog.logSomething();
    });
});
