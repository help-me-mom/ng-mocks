"use strict";
var platform_browser_1 = require("@angular/platform-browser");
var testing_1 = require("@angular/core/testing");
var testing_2 = require("@angular/platform-browser-dynamic/testing");
var component_1 = require("./component");
// Adapted from the official angular2 docs, https://angular.io/docs/ts/latest/guide/testing.html
describe("BannerComponent", function () {
    testing_1.TestBed.initTestEnvironment(testing_2.BrowserDynamicTestingModule, testing_2.platformBrowserDynamicTesting());
    var component;
    beforeEach(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [component_1.BannerComponent]
        });
        testing_1.TestBed.compileComponents();
        component = testing_1.TestBed.createComponent(component_1.BannerComponent);
    });
    it("should display original title", function () {
        var debugElement = component.debugElement.query(platform_browser_1.By.css("h1"));
        component.detectChanges();
        expect(debugElement.nativeElement.textContent).toEqual("Test Tour of Heroes");
    });
    it("should display a different test title", function () {
        var debugElement = component.debugElement.query(platform_browser_1.By.css("h1"));
        component.componentInstance.title = "Test Title";
        component.detectChanges();
        expect(debugElement.nativeElement.textContent).toEqual("Test Title");
    });
});
//# sourceMappingURL=component.spec.js.map