import { Component } from "@angular/core";

@Component({
    selector: "app-banner",
    styles: [require("../../assets/style/main.css"), require("../style-import/test.css")],
    template: "<h1>{{title}}</h1>"
})

export class BannerComponent {
    public title = "Test Tour of Heroes";
}
