import { MockDirectiveResolver, MockNgModuleResolver, MockPipeResolver } from '@angular/compiler/testing';
import { JitReflector } from './jit-reflector';

export const jitReflector = new JitReflector();
export const directiveResolver = new MockDirectiveResolver(jitReflector);
export const pipeResolver = new MockPipeResolver(jitReflector);
export const ngModuleResolver = new MockNgModuleResolver(jitReflector);
