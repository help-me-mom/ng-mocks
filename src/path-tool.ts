export function fixWindowsPath(value: string): string {
    return value.replace(/\\/g, "/");
}
