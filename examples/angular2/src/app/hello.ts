import { Component } from "@angular/core";

@Component({
    //moduleId: module.id, // use this with proxies: { "/src/app/": "/base/src/app/" } in karma.conf.js
    selector: "app-hello",
    templateUrl: "hello.html", // use this without moduleId + karma-typescript/transforms/angular2-template-url-rewriter in karma.conf.js
    //templateUrl: "app/hello.html", // use this without moduleId + proxies: {"/app/": "/base/src/app"} in karma.conf.js
    styles: [require("../assets/style/main.css")]
})
export class HelloComponent {
    title = "Hello :)";
}
