// tslint:disable:ordered-imports
import "core-js";
import "zone.js/dist/zone";
import "zone.js/dist/long-stack-trace-zone";
import "zone.js/dist/proxy";
import "zone.js/dist/sync-test";
import "zone.js/dist/jasmine-patch";
import "zone.js/dist/async-test";
import "zone.js/dist/fake-async-test";
// tslint:enable:ordered-imports

import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

import { Angular2Tester } from "./angular2-tester";

describe("Angular2Tester", () => {

    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

    let fixture: ComponentFixture<Angular2Tester>;

    beforeEach(() => {

        TestBed.configureTestingModule({
            declarations: [Angular2Tester]
        });

        TestBed.compileComponents();

        fixture = TestBed.createComponent(Angular2Tester);
    });

    it("should display original title", () => {

        let debugElement = fixture.debugElement.query(By.css("h1"));
        fixture.detectChanges();

        expect(debugElement.nativeElement.textContent).toEqual("Hello :)");
    });

    it("should display a different test title", () => {

        let debugElement = fixture.debugElement.query(By.css("h1"));

        fixture.componentInstance.title = "Test Title";
        fixture.detectChanges();

        expect(debugElement.nativeElement.textContent).toEqual("Test Title");
    });
});
