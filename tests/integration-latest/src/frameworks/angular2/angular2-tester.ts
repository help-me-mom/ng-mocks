import { Component } from "@angular/core";

@Component({
    selector: "angular-app",
    styles: [require("../../../assets/style/main.css")],
    template: "<h1>{{title}}</h1>"
})
export class Angular2Tester {
    public title = "Hello :)";
}
