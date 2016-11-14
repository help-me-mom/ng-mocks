require("htmlparser2");

export class CyclicReferencesComponent {

    public run(): string {

        return "I didn't crash the call stack :)";
    }
}
