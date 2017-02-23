import { Component } from "@angular/core";

@Component({
    // use moduleId with proxies: { "/src/app/": "/base/src/app/" } in karma.conf.js
    // moduleId: module.id,
    selector: "app-hello",
    styleUrls: ["../assets/style/main.css", "../assets/style/main.less", "../assets/style/main.scss"],
    // use templateUrl without moduleId + karma-typescript/transforms/angular2-transform in karma.conf.js
    templateUrl: "hello.html"
    // use templateUrl without moduleId + proxies: {"/app/": "/base/src/app"} in karma.conf.js
    // templateUrl: "app/hello.html",
})
export class HelloComponent {
    public title = "Hello :)";
}
