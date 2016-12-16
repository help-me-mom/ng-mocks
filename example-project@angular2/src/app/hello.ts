import { Component } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "app-hello",
    templateUrl: "hello.html",
    styles: [require("../assets/style/main.css")]
})
export class HelloComponent {
    title = "Hello :)";
}
