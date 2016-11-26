import { Component } from "@angular/core";

@Component({
    selector: "app-hello",
    templateUrl: "app/hello.html",
    styles: [require("../../assets/style/main.css")]
})

export class HelloComponent {
    title = "Hello :)";
}
