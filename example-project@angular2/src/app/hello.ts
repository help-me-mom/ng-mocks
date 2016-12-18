import { Component } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "app-hello",
    templateUrl: "hello.html",
    //templateUrl: "app/hello.html", // use this without moduleId + proxies: {"/app/": "/base/src/app"} in karma.conf.js
    styles: [require("../assets/style/main.css")]
})
export class HelloComponent {
    title = "Hello :)";
}
