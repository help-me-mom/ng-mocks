import { Component } from "@angular/core";

@Component({
    selector: "app-banner",
    template: "<h1>{{title}}</h1>",
    styles: [require("../../assets/style/main.css")]
})

export class BannerComponent {
    title = "Test Tour of Heroes";
}
