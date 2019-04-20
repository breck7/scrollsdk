"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TreeNotationCodeMirrorMode {
    constructor(name, getProgramConstructorMethod, getProgramCodeMethod, codeMirrorLib = undefined) {
        this._name = name;
        this._getProgramConstructorMethod = getProgramConstructorMethod;
        this._getProgramCodeMethod =
            getProgramCodeMethod || (instance => (instance ? instance.getValue() : this._originalValue));
        this._codeMirrorLib = codeMirrorLib;
    }
    _getParsedProgram() {
        const source = this._getProgramCodeMethod(this._cmInstance);
        if (this._cachedSource !== source) {
            this._cachedSource = source;
            this._cachedProgram = new (this._getProgramConstructorMethod())(source);
        }
        return this._cachedProgram;
    }
    _wordTypeToCMStyle(wordType) {
        const cmStyles = {
            comment: "comment",
            atom: "atom",
            number: "number",
            attribute: "attribute",
            keyword: "keyword",
            string: "string",
            meta: "meta",
            variable: "variable",
            "variable-2": "variable-2",
            tag: "tag",
            "variable-3": "variable-3",
            def: "def",
            type: "type",
            bracket: "bracket",
            builtin: "builtin",
            special: "special",
            link: "link",
            error: "error",
            word: "string",
            int: "number",
            identifier: "variable-2",
            functionIdentifier: "def",
            space: "bracket",
            parameter: "attribute"
        };
        return cmStyles[wordType] || wordType;
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
        return this._advanceStreamAndGetTokenType(stream, state);
    }
    fromTextAreaWithAutocomplete(area, options) {
        this._originalValue = area.value;
        const defaultOptions = {
            lineNumbers: true,
            mode: this._name,
            tabSize: 1,
            indentUnit: 1,
            hintOptions: { hint: (cmInstance, option) => this.autocomplete(cmInstance, option) }
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
                codeMirrorLib.commands.autocomplete(cm, null, { completeSingle: false });
        });
    }
    _getCodeMirrorLib() {
        return this._codeMirrorLib;
    }
    autocomplete(cmInstance, option) {
        const mode = this;
        const codeMirrorLib = this._getCodeMirrorLib();
        return new Promise(function (accept) {
            setTimeout(function () {
                const cursor = cmInstance.getCursor();
                const line = cmInstance.getLine(cursor.line);
                let start = cursor.ch;
                let end = cursor.ch;
                while (start && /[^\s]/.test(line.charAt(start - 1)))
                    --start;
                while (end < line.length && /[^\s]/.test(line.charAt(end)))
                    ++end;
                const input = line.slice(start, end).toLowerCase();
                // For now: we only autocomplete if its the first word on the line
                if (start > 0 && line.slice(0, start).match(/[a-z]/i))
                    return [];
                const program = mode._getParsedProgram();
                const isChildNode = start > 0 && cursor.line > 0;
                const nodeInScope = isChildNode ? program.getTopDownArray()[cursor.line].getParent() : program;
                const grammarNode = nodeInScope.getDefinition();
                // todo: add more tests
                // todo: second param this.childrenToString()
                // todo: change to getAutocomplete definitions
                let matching = grammarNode.getAutocompleteWords(input);
                matching = matching.map(str => {
                    return {
                        text: str,
                        displayText: str
                    };
                });
                const result = matching.length
                    ? {
                        list: matching,
                        from: codeMirrorLib.Pos(cursor.line, start),
                        to: codeMirrorLib.Pos(cursor.line, end)
                    }
                    : null;
                return accept(result);
            }, 100);
        });
    }
    register() {
        const codeMirrorLib = this._getCodeMirrorLib();
        codeMirrorLib.defineMode(this._name, () => this);
        codeMirrorLib.defineMIME("text/" + this._name, this._name);
        return this;
    }
    _advanceStreamAndGetTokenType(stream, state) {
        let next = stream.next();
        while (typeof next === "string") {
            const peek = stream.peek();
            if (next === " ") {
                const style = this._wordTypeToCMStyle("space");
                if (peek === undefined || peek === "\n") {
                    stream.skipToEnd(); // advance string to end
                    this._incrementLine(state);
                }
                return style;
            }
            if (peek === " ") {
                state.words.push(stream.current());
                return this._getWordStyle(state.lineIndex, state.words.length);
            }
            next = stream.next();
        }
        state.words.push(stream.current());
        const style = this._getWordStyle(state.lineIndex, state.words.length);
        this._incrementLine(state);
        return style;
    }
    _getWordStyle(lineIndex, wordIndex) {
        const program = this._getParsedProgram();
        // todo: if the current word is an error, don't show red?
        return program ? this._wordTypeToCMStyle(program.getWordTypeAtPosition(lineIndex, wordIndex)) : undefined;
    }
    startState() {
        return {
            words: [],
            lineIndex: 1
        };
    }
    blankLine(state) {
        this._incrementLine(state);
    }
    _incrementLine(state) {
        state.words.splice(0, state.words.length);
        state.lineIndex++;
    }
}
exports.default = TreeNotationCodeMirrorMode;
