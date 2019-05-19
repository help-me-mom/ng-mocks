((global: any) => {
    "use strict";
    global.__karmaTypescriptModules__ =  {};
    const fn = 0;
    const id = 1;
    const map = 2;
    const require = (filename: any, requiring: any, required: any) => {
        let wrapper: any;
        let module = global.__karmaTypescriptModules__ [filename];
        if (!module) {
            wrapper = global.wrappers[filename];
            if (!wrapper) {
                throw new Error("Can't find " + required + " [" + filename + "] (required by " + requiring + ")");
            }
            module = { exports: {}, id: wrapper[id], uri: filename };
            global.__karmaTypescriptModules__ [filename] = module;
            wrapper[fn].call(module.exports, (dependency: any) => {
                return require(wrapper[map][dependency], filename, dependency);
            }, module, module.exports, filename.slice(0, filename.lastIndexOf("/")), filename);
            if (module.exports && isExtensible(module.exports) && (
                (typeof module.exports === "function" && module.exports !== module.exports.default)
                    || !module.exports.default)
            ) {
                if (!module.exports.__esModule) {
                    Object.defineProperty(module.exports, "__esModule", {
                        configurable: true, enumerable: false, value: true, writable: true
                    });
                }
                Object.defineProperty(module.exports, "default", {
                    configurable: true, enumerable: false, value: module.exports, writable: true
                });
            }
        }
        return module.exports;
    };
    const isExtensible = (obj: any) => {
        return (typeof obj === "function" || typeof obj === "object") && Object.isExtensible(obj);
    };
    (global.entrypointFilenames || []).forEach((filename: any) => {
        require(filename, "commonjs.js", "entrypoint");
    });
})(this);
