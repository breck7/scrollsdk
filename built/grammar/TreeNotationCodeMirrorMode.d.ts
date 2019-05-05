import types from "../types";
import AbstractRuntimeProgram from "./AbstractRuntimeProgram";
import * as CodeMirrorLib from "codemirror";
interface treeNotationCodeMirrorState {
    cellIndex: number;
}
declare class TreeNotationCodeMirrorMode {
    constructor(name: string, getProgramConstructorMethod: () => types.TreeProgramConstructor, getProgramCodeMethod: (instance: CodeMirrorLib.EditorFromTextArea) => string, codeMirrorLib?: typeof CodeMirrorLib);
    private _name;
    private _getProgramCodeMethod;
    private _getProgramConstructorMethod;
    private _codeMirrorLib;
    private _cachedSource;
    private _cachedProgram;
    private _cmInstance;
    private _originalValue;
    _getParsedProgram(): AbstractRuntimeProgram;
    private _getExcludedIntelliSenseTriggerKeys;
    token(stream: CodeMirrorLib.StringStream, state: treeNotationCodeMirrorState): string;
    fromTextAreaWithAutocomplete(area: HTMLTextAreaElement, options: any): CodeMirrorLib.EditorFromTextArea;
    _enableAutoComplete(cmInstance: CodeMirrorLib.EditorFromTextArea): void;
    _getCodeMirrorLib(): typeof CodeMirrorLib;
    codeMirrorAutocomplete(cmInstance: CodeMirrorLib.EditorFromTextArea, options: any): Promise<{
        list: {
            text: string;
            displayText: string;
        }[];
        from: CodeMirrorLib.Position;
        to: CodeMirrorLib.Position;
    }>;
    register(): this;
    private _advanceStreamAndReturnTokenType;
    private _getLineNumber;
    private _getCellStyle;
    startState(): treeNotationCodeMirrorState;
    _incrementLine(state: treeNotationCodeMirrorState): void;
}
export default TreeNotationCodeMirrorMode;
