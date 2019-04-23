import types from "../types"
import textMateScopeToCodeMirrorStyle from "./textMateScopeToCodeMirrorStyle"

/*FOR_TYPES_ONLY*/ import AbstractRuntimeProgram from "./AbstractRuntimeProgram"

declare type codeMirrorLibType = any
declare type codeMirrorInstanceType = any

// import * as CodeMirrorLib from "codemirror"

class TreeNotationCodeMirrorMode {
  constructor(
    name: string,
    getProgramConstructorMethod: () => types.TreeProgramConstructor,
    getProgramCodeMethod: (instance: codeMirrorInstanceType) => string,
    codeMirrorLib: codeMirrorLibType = undefined
  ) {
    this._name = name
    this._getProgramConstructorMethod = getProgramConstructorMethod
    this._getProgramCodeMethod =
      getProgramCodeMethod || (instance => (instance ? <string>instance.getValue() : this._originalValue))
    this._codeMirrorLib = codeMirrorLib
  }

  private _name: string
  private _getProgramCodeMethod: (cmInstance: codeMirrorInstanceType) => string
  private _getProgramConstructorMethod: () => types.TreeProgramConstructor
  private _codeMirrorLib: any
  private _cachedSource: string
  private _cachedProgram: types.treeProgram
  private _cmInstance: codeMirrorInstanceType
  private _originalValue: string

  _getParsedProgram(): AbstractRuntimeProgram {
    const source = this._getProgramCodeMethod(this._cmInstance) || ""
    if (!this._cachedProgram || this._cachedSource !== source) {
      this._cachedSource = source
      this._cachedProgram = new (<any>this._getProgramConstructorMethod())(source)
    }
    return this._cachedProgram
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
    }
  }

  token(stream, state) {
    return this._advanceStreamAndGetTokenType(stream, state)
  }

  fromTextAreaWithAutocomplete(area, options) {
    this._originalValue = area.value
    const defaultOptions = {
      lineNumbers: true,
      mode: this._name,
      tabSize: 1,
      indentUnit: 1,
      hintOptions: { hint: (cmInstance, option) => this.codeMirrorAutocomplete(cmInstance, option) }
    }

    Object.assign(defaultOptions, options)

    this._cmInstance = this._getCodeMirrorLib().fromTextArea(area, defaultOptions)
    this._enableAutoComplete(this._cmInstance)
    return this._cmInstance
  }

  _enableAutoComplete(cmInstance) {
    const excludedKeys = this._getExcludedIntelliSenseTriggerKeys()
    const codeMirrorLib = this._getCodeMirrorLib()
    cmInstance.on("keyup", (cm, event) => {
      // https://stackoverflow.com/questions/13744176/codemirror-autocomplete-after-any-keyup
      if (!cm.state.completionActive && !excludedKeys[event.keyCode.toString()])
        codeMirrorLib.commands.autocomplete(cm, null, { completeSingle: false })
    })
  }

  _getCodeMirrorLib() {
    return this._codeMirrorLib
  }

  async codeMirrorAutocomplete(cmInstance, option) {
    const cursor = cmInstance.getCursor()
    const codeMirrorLib = this._getCodeMirrorLib()
    const result = await this._getParsedProgram().getAutocompleteResultsAt(cursor.line, cursor.ch)

    return result.matches.length
      ? {
          list: result.matches,
          from: codeMirrorLib.Pos(cursor.line, result.startCharIndex),
          to: codeMirrorLib.Pos(cursor.line, result.endCharIndex)
        }
      : null
  }

  register() {
    const codeMirrorLib = this._getCodeMirrorLib()
    codeMirrorLib.defineMode(this._name, () => this)
    codeMirrorLib.defineMIME("text/" + this._name, this._name)
    return this
  }

  _advanceStreamAndGetTokenType(stream, state) {
    let next = stream.next()
    while (typeof next === "string") {
      const peek = stream.peek()
      if (next === " ") {
        if (peek === undefined || peek === "\n") {
          stream.skipToEnd() // advance string to end
          this._incrementLine(state)
        }
        return "bracket"
      }
      if (peek === " ") {
        state.words.push(stream.current())
        return this._getWordStyle(state.lineIndex, state.words.length)
      }
      next = stream.next()
    }

    state.words.push(stream.current())
    const style = this._getWordStyle(state.lineIndex, state.words.length)

    this._incrementLine(state)
    return style
  }

  _getWordStyle(lineIndex, wordIndex): string {
    const program = this._getParsedProgram()

    // todo: if the current word is an error, don't show red?
    const highlightScope = program.getWordHighlightScopeAtPosition(lineIndex, wordIndex)
    return program ? <string>textMateScopeToCodeMirrorStyle(highlightScope.split(".")) : undefined
  }

  startState() {
    return {
      words: [],
      lineIndex: 1
    }
  }

  blankLine(state) {
    this._incrementLine(state)
  }

  _incrementLine(state) {
    state.words.splice(0, state.words.length)
    state.lineIndex++
  }
}

export default TreeNotationCodeMirrorMode
