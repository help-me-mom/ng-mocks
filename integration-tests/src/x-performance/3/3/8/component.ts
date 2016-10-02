import { Component } from "@angular/core";

export class PerformanceComponent {

    public run(): string {

        Component.toString();

        return "I imported a node_modules module!";
    }
}
