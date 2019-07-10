"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const textMateScopeToCodeMirrorStyle_1 = require("./textMateScopeToCodeMirrorStyle");
class TreeNotationCodeMirrorMode {
    constructor(name, getProgramConstructorMethod, getProgramCodeMethod, codeMirrorLib = undefined) {
        this._name = name;
        this._getProgramConstructorMethod = getProgramConstructorMethod;
        this._getProgramCodeMethod = getProgramCodeMethod || (instance => (instance ? instance.getValue() : this._originalValue));
        this._codeMirrorLib = codeMirrorLib;
    }
    _getParsedProgram() {
        const source = this._getProgramCodeMethod(this._cmInstance) || "";
        if (!this._cachedProgram || this._cachedSource !== source) {
            this._cachedSource = source;
            this._cachedProgram = new (this._getProgramConstructorMethod())(source);
        }
        return this._cachedProgram;
    }
    _getExcludedIntelliSenseTriggerKeys() {
        return {
            "8": "backspace",
            "9": "tab",
            "13": "enter",
            "16": "shift",
            "17": "ctrl",
            "18": "alt",
            "19": "pause",
            "20": "capslock",
            "27": "escape",
            "33": "pageup",
            "34": "pagedown",
            "35": "end",
            "36": "home",
            "37": "left",
            "38": "up",
            "39": "right",
            "40": "down",
            "45": "insert",
            "46": "delete",
            "91": "left window key",
            "92": "right window key",
            "93": "select",
            "112": "f1",
            "113": "f2",
            "114": "f3",
            "115": "f4",
            "116": "f5",
            "117": "f6",
            "118": "f7",
            "119": "f8",
            "120": "f9",
            "121": "f10",
            "122": "f11",
            "123": "f12",
            "144": "numlock",
            "145": "scrolllock"
        };
    }
    token(stream, state) {
        return this._advanceStreamAndReturnTokenType(stream, state);
    }
    fromTextAreaWithAutocomplete(area, options) {
        this._originalValue = area.value;
        const defaultOptions = {
            lineNumbers: true,
            mode: this._name,
            tabSize: 1,
            indentUnit: 1,
            hintOptions: {
                hint: (cmInstance, options) => this.codeMirrorAutocomplete(cmInstance, options)
            }
        };
        Object.assign(defaultOptions, options);
        this._cmInstance = this._getCodeMirrorLib().fromTextArea(area, defaultOptions);
        this._enableAutoComplete(this._cmInstance);
        return this._cmInstance;
    }
    _enableAutoComplete(cmInstance) {
        const excludedKeys = this._getExcludedIntelliSenseTriggerKeys();
        const codeMirrorLib = this._getCodeMirrorLib();
        cmInstance.on("keyup", (cm, event) => {
            // https://stackoverflow.com/questions/13744176/codemirror-autocomplete-after-any-keyup
            if (!cm.state.completionActive && !excludedKeys[event.keyCode.toString()])
                // Todo: get typings for CM autocomplete
                codeMirrorLib.commands.autocomplete(cm, null, { completeSingle: false });
        });
    }
    _getCodeMirrorLib() {
        return this._codeMirrorLib;
    }
    async codeMirrorAutocomplete(cmInstance, options) {
        const cursor = cmInstance.getDoc().getCursor();
        const codeMirrorLib = this._getCodeMirrorLib();
        const result = await this._getParsedProgram().getAutocompleteResultsAt(cursor.line, cursor.ch);
        // It seems to be better UX if there's only 1 result, and its the word the user entered, to close autocomplete
        if (result.matches.length === 1 && result.matches[0].text === result.word)
            return null;
        return result.matches.length
            ? {
                list: result.matches,
                from: codeMirrorLib.Pos(cursor.line, result.startCharIndex),
                to: codeMirrorLib.Pos(cursor.line, result.endCharIndex)
            }
            : null;
    }
    register() {
        const codeMirrorLib = this._getCodeMirrorLib();
        codeMirrorLib.defineMode(this._name, () => this);
        codeMirrorLib.defineMIME("text/" + this._name, this._name);
        return this;
    }
    _advanceStreamAndReturnTokenType(stream, state) {
        let nextCharacter = stream.next();
        const lineNumber = stream.lineOracle.line + 1; // state.lineIndex
        while (typeof nextCharacter === "string") {
            const peek = stream.peek();
            if (nextCharacter === " ") {
                if (peek === undefined || peek === "\n") {
                    stream.skipToEnd(); // advance string to end
                    this._incrementLine(state);
                }
                return "bracket";
            }
            if (peek === " ") {
                state.cellIndex++;
                return this._getCellStyle(lineNumber, state.cellIndex);
            }
            nextCharacter = stream.next();
        }
        state.cellIndex++;
        const style = this._getCellStyle(lineNumber, state.cellIndex);
        this._incrementLine(state);
        return style;
    }
    _getCellStyle(lineIndex, cellIndex) {
        const program = this._getParsedProgram();
        // todo: if the current word is an error, don't show red?
        const highlightScope = program.getCellHighlightScopeAtPosition(lineIndex, cellIndex);
        const style = highlightScope ? textMateScopeToCodeMirrorStyle_1.default(highlightScope.split(".")) : undefined;
        return style || "noHighlightScopeDefinedInGrammar";
    }
    // todo: remove.
    startState() {
        return {
            cellIndex: 0
        };
    }
    _incrementLine(state) {
        state.cellIndex = 0;
    }
}
exports.default = TreeNotationCodeMirrorMode;
