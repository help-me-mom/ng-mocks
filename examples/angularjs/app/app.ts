import * as angular from "angular";

import { Service } from "./service";
import { Controller } from "./controller";

angular
  .module("app", [])
  .service("service", Service)
  .controller("controller", Controller);
