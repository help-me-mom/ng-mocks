import * as angular from "angular";
import { Controller } from "./controller";
import { Service } from "./service";

angular
  .module("app", [])
  .service("service", Service)
  .controller("controller", Controller);
