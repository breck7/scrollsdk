declare class TreeUtils {
    static getPathWithoutFileName(path: any): any;
    static getClassNameFromFilePath(filename: any): any;
    static resolvePath(filePath: string, programFilepath: string): any;
    static getFileExtension(url?: string): string;
    static resolveProperty(obj: Object, path: string | string[], separator?: string): any;
    static formatStr(str: any, listDelimiter: string, parameterMap: any): any;
    static stripHtml(text: any): any;
    static getUniqueWordsArray(allWords: string): {
        word: string;
        count: any;
    }[];
    static makeRandomTree(lines?: number): string;
    static arrayToMap(arr: any): {};
    static mapValues(object: any, fn: any): {};
    static sortByAccessor(accessor: any): (objectA: any, objectB: any) => number;
    static BrowserScript: {
        new (fileStr: string): {
            _str: string;
            addUseStrict(): any;
            removeRequires(): any;
            removeImports(): any;
            removeExports(): any;
            changeDefaultExportsToWindowExports(): any;
            changeNodeExportsToWindowExports(): any;
            getString(): string;
        };
    };
}
export default TreeUtils;
