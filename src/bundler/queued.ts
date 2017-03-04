import { EmitOutput } from "../compiler/emit-output";
import { File } from "../shared/file";
import { BundleCallback } from "./bundle-callback";
import { RequiredModule } from "./required-module";

export interface Queued {
    callback: BundleCallback;
    emitOutput: EmitOutput;
    file: File;
    module?: RequiredModule;
}
