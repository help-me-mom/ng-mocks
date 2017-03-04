import { EmitOutput } from "./emit-output";

export interface CompileCallback {
    (emitOutput: EmitOutput): void;
}
