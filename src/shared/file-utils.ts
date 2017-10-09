import * as path from "path";

export class FileUtils {
    public static getRelativePath(filename: string, basePath: string) {
        let relativePath = path.isAbsolute(filename) ?
            path.relative(basePath, filename) :
            filename;
        return path.normalize(relativePath);
    }
}
