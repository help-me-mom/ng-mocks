import { Component } from "@angular/core";

@Component({

    // use moduleId with proxies: { "/src/app/": "/base/src/app/" } in karma.conf.js
    // moduleId: module.id,
    selector: "app-hello",

    styleUrls: ["../assets/style/main.css"],

    // use templateUrl without moduleId + karma-typescript/transforms/angular2-template-url-rewriter in karma.conf.js
    templateUrl: "hello.html"

    // use templateUrl without moduleId + proxies: {"/app/": "/base/src/app"} in karma.conf.js
    // templateUrl: "app/hello.html",
})
export class HelloComponent {
    public title = "Hello :)";
}
