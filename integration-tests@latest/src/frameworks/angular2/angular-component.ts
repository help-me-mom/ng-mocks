import { Component } from "@angular/core";

@Component({
    selector: "angular-app",
    template: "<h1>{{title}}</h1>",
    styles: [require("../../../assets/style/main.css")]
})

export class AngularComponent {
    title = "Hello :)";
}
