import { Component } from "@angular/core";

// From the official angular2 docs, https://angular.io/docs/ts/latest/guide/testing.html

@Component({
    selector: "app-banner",
    template: "<h1>{{title}}</h1>"
})

export class BannerComponent {
    title = "Test Tour of Heroes";

    /*
    public log(y) {

        let x;

        return y;

        console.log(x);
    }
    //*/
}
