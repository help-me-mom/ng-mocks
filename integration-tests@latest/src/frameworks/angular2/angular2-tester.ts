import { Component } from "@angular/core";
import "@angular/upgrade";

@Component({
    selector: "angular-app",
    template: "<h1>{{title}}</h1>",
    styles: [require("../../../assets/style/main.css")]
})

export class Angular2Tester {
    title = "Hello :)";
}
