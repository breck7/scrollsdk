import types from "../types";
declare type codeMirrorLibType = any;
declare type codeMirrorInstanceType = any;
declare class TreeNotationCodeMirrorMode {
    constructor(name: string, getProgramConstructorMethod: () => types.TreeProgramConstructor, getProgramCodeMethod: (instance: codeMirrorInstanceType) => string, codeMirrorLib?: codeMirrorLibType);
    private _name;
    private _getProgramCodeMethod;
    private _getProgramConstructorMethod;
    private _codeMirrorLib;
    private _cachedSource;
    private _cachedProgram;
    private _cmInstance;
    private _originalValue;
    _getParsedProgram(): any;
    _getExcludedIntelliSenseTriggerKeys(): {
        "8": string;
        "9": string;
        "13": string;
        "16": string;
        "17": string;
        "18": string;
        "19": string;
        "20": string;
        "27": string;
        "33": string;
        "34": string;
        "35": string;
        "36": string;
        "37": string;
        "38": string;
        "39": string;
        "40": string;
        "45": string;
        "46": string;
        "91": string;
        "92": string;
        "93": string;
        "112": string;
        "113": string;
        "114": string;
        "115": string;
        "116": string;
        "117": string;
        "118": string;
        "119": string;
        "120": string;
        "121": string;
        "122": string;
        "123": string;
        "144": string;
        "145": string;
    };
    token(stream: any, state: any): string;
    fromTextAreaWithAutocomplete(area: any, options: any): any;
    _enableAutoComplete(cmInstance: any): void;
    _getCodeMirrorLib(): any;
    codeMirrorAutocomplete(cmInstance: any, option: any): Promise<{
        list: {
            text: string;
            displayText: string;
        }[];
        from: any;
        to: any;
    }>;
    autocomplete(line: string, lineIndex: types.int, charIndex: types.int): Promise<{
        startCharIndex: number;
        endCharIndex: number;
        matches: {
            text: string;
            displayText: string;
        }[];
    }>;
    register(): this;
    _advanceStreamAndGetTokenType(stream: any, state: any): string;
    _getWordStyle(lineIndex: any, wordIndex: any): string;
    startState(): {
        words: any[];
        lineIndex: number;
    };
    blankLine(state: any): void;
    _incrementLine(state: any): void;
}
export default TreeNotationCodeMirrorMode;
