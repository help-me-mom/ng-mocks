// Dirty 'any' hack to avoid issues to run tests on angular 8 when the 'static' key is required.
export const staticFalse: any = {
    static: false,
};
export const staticTrue: any = {
    static: true,
};
