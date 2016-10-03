import "reflect-metadata";
import "zone.js/dist/zone.js";
import "zone.js/dist/long-stack-trace-zone.js";
import "zone.js/dist/proxy.js";
import "zone.js/dist/sync-test.js";
import "zone.js/dist/jasmine-patch.js";
import "zone.js/dist/async-test.js";
import "zone.js/dist/fake-async-test.js";

import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { TestBed, async } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

import { BannerComponent } from "./component";

// Adapted from the official angular2 docs, https://angular.io/docs/ts/latest/guide/testing.html

describe("BannerComponent", () => {

    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

    let component;

    beforeEach(() => {

        TestBed.configureTestingModule({
            declarations: [BannerComponent]
        });

        TestBed.compileComponents();

        component = TestBed.createComponent(BannerComponent);
    });

    it("should display original title", () => {

        let debugElement = component.debugElement.query(By.css("h1"));
        component.detectChanges();

        expect(debugElement.nativeElement.textContent).toEqual("Test Tour of Heroes");
    });

    it("should display a different test title", () => {

        let debugElement = component.debugElement.query(By.css("h1"));

        component.componentInstance.title = "Test Title";
        component.detectChanges();

        expect(debugElement.nativeElement.textContent).toEqual("Test Title");
    });
});
