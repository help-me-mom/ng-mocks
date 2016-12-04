
export class JsonComponent {

    public run(): string {

        let json = require("./component.json");

        return json.name;
    }
}
