import types from "../types";
declare class TreeUtils {
    static getPathWithoutFileName(path: string): string;
    static getClassNameFromFilePath(filename: string): string;
    static didYouMean(str?: string, options?: string[], caseSensitive?: boolean, threshold?: number, thresholdAbsolute?: number): string;
    private static MAX_INT;
    private static _getEditDistance;
    static getLineIndexAtCharacterPosition(str: string, index: number): number;
    static resolvePath(filePath: string, programFilepath: string): any;
    static getFileExtension(url?: string): string;
    static resolveProperty(obj: Object, path: string | string[], separator?: string): any;
    static formatStr(str: string, listDelimiter: string, parameterMap: types.stringMap): string;
    static stripHtml(text: string): string;
    static getUniqueWordsArray(allWords: string): {
        word: string;
        count: any;
    }[];
    static getRandomString(length?: number, letters?: string[]): string;
    static makeRandomTree(lines?: number): string;
    static arrayToMap(arr: Array<any>): types.stringMap;
    static mapValues<T>(object: Object, fn: (key: string) => T): {
        [key: string]: T;
    };
    static sortByAccessor(accessor: Function): (objectA: Object, objectB: Object) => number;
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
