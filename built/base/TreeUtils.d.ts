declare class TreeUtils {
    static getPathWithoutFileName(path: any): any;
    static getClassNameFromFilePath(filename: any): any;
    static getLineIndexAtCharacterPosition(str: string, index: number): number;
    static resolvePath(filePath: string, programFilepath: string): any;
    static getFileExtension(url?: string): string;
    static resolveProperty(obj: Object, path: string | string[], separator?: string): any;
    static formatStr(str: any, listDelimiter: string, parameterMap: any): any;
    static stripHtml(text: any): any;
    static getUniqueWordsArray(allWords: string): {
        word: string;
        count: any;
    }[];
    static getRandomString(length?: number, letters?: string[]): string;
    static makeRandomTree(lines?: number): string;
    static arrayToMap(arr: any): {};
    static mapValues<T>(object: Object, fn: (key: string) => T): {
        [key: string]: T;
    };
    static sortByAccessor(accessor: any): (objectA: any, objectB: any) => number;
    static makeGraphSortFunction(thisColumnIndex: number, extendsColumnIndex: number): (nodeA: any, nodeB: any) => 1 | 0 | -1;
    static BrowserScript: {
        new (fileStr: string): {
            _str: string;
            addUseStrict(): any;
            removeRequires(): any;
            _removeAllLinesStartingWith(prefix: string): any;
            removeNodeJsOnlyLines(): any;
            removeHashBang(): any;
            removeImports(): any;
            removeExports(): any;
            changeDefaultExportsToWindowExports(): any;
            changeNodeExportsToWindowExports(): any;
            getString(): string;
        };
    };
}
export default TreeUtils;
