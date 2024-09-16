"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
// Adapted from https://github.com/NeekSandhu/codemirror-textmate/blob/master/src/tmToCm.ts
var CmToken
;(function (CmToken) {
  CmToken["Atom"] = "atom"
  CmToken["Attribute"] = "attribute"
  CmToken["Bracket"] = "bracket"
  CmToken["Builtin"] = "builtin"
  CmToken["Comment"] = "comment"
  CmToken["Def"] = "def"
  CmToken["Error"] = "error"
  CmToken["Header"] = "header"
  CmToken["HR"] = "hr"
  CmToken["Keyword"] = "keyword"
  CmToken["Link"] = "link"
  CmToken["Meta"] = "meta"
  CmToken["Number"] = "number"
  CmToken["Operator"] = "operator"
  CmToken["Property"] = "property"
  CmToken["Qualifier"] = "qualifier"
  CmToken["Quote"] = "quote"
  CmToken["String"] = "string"
  CmToken["String2"] = "string-2"
  CmToken["Tag"] = "tag"
  CmToken["Type"] = "type"
  CmToken["Variable"] = "variable"
  CmToken["Variable2"] = "variable-2"
  CmToken["Variable3"] = "variable-3"
})(CmToken || (CmToken = {}))
const tmToCm = {
  comment: {
    $: CmToken.Comment
  },
  constant: {
    // TODO: Revision
    $: CmToken.Def,
    character: {
      escape: {
        $: CmToken.String2
      }
    },
    language: {
      $: CmToken.Atom
    },
    numeric: {
      $: CmToken.Number
    },
    other: {
      email: {
        link: {
          $: CmToken.Link
        }
      },
      symbol: {
        // TODO: Revision
        $: CmToken.Def
      }
    }
  },
  entity: {
    name: {
      class: {
        $: CmToken.Def
      },
      function: {
        $: CmToken.Def
      },
      tag: {
        $: CmToken.Tag
      },
      type: {
        $: CmToken.Type,
        class: {
          $: CmToken.Variable
        }
      }
    },
    other: {
      "attribute-name": {
        $: CmToken.Attribute
      },
      "inherited-class": {
        // TODO: Revision
        $: CmToken.Def
      }
    },
    support: {
      function: {
        // TODO: Revision
        $: CmToken.Def
      }
    }
  },
  invalid: {
    $: CmToken.Error,
    illegal: { $: CmToken.Error },
    deprecated: {
      $: CmToken.Error
    }
  },
  keyword: {
    $: CmToken.Keyword,
    operator: {
      $: CmToken.Operator
    },
    other: {
      "special-method": CmToken.Def
    }
  },
  punctuation: {
    $: CmToken.Operator,
    definition: {
      comment: {
        $: CmToken.Comment
      },
      tag: {
        $: CmToken.Bracket
      }
      // 'template-expression': {
      //     $: CodeMirrorToken.Operator,
      // },
    }
    // terminator: {
    //     $: CodeMirrorToken.Operator,
    // },
  },
  storage: {
    $: CmToken.Keyword
  },
  string: {
    $: CmToken.String,
    regexp: {
      $: CmToken.String2
    }
  },
  support: {
    class: {
      $: CmToken.Def
    },
    constant: {
      $: CmToken.Variable2
    },
    function: {
      $: CmToken.Def
    },
    type: {
      $: CmToken.Type
    },
    variable: {
      $: CmToken.Variable2,
      property: {
        $: CmToken.Property
      }
    }
  },
  variable: {
    $: CmToken.Def,
    language: {
      // TODO: Revision
      $: CmToken.Variable3
    },
    other: {
      object: {
        $: CmToken.Variable,
        property: {
          $: CmToken.Property
        }
      },
      property: {
        $: CmToken.Property
      }
    },
    parameter: {
      $: CmToken.Def
    }
  }
}
const textMateScopeToCodeMirrorStyle = (scopeSegments, style = tmToCm) => {
  const matchingBranch = style[scopeSegments.shift()]
  return matchingBranch ? textMateScopeToCodeMirrorStyle(scopeSegments, matchingBranch) || matchingBranch.$ || null : null
}
class ParsersCodeMirrorMode {
  constructor(name, getRootParserFn, getProgramCodeFn, codeMirrorLib = undefined) {
    this._name = name
    this._getRootParserFn = getRootParserFn
    this._getProgramCodeFn = getProgramCodeFn || (instance => (instance ? instance.getValue() : this._originalValue))
    this._codeMirrorLib = codeMirrorLib
  }
  _getParsedProgram() {
    const source = this._getProgramCodeFn(this._cmInstance) || ""
    if (!this._cachedProgram || this._cachedSource !== source) {
      this._cachedSource = source
      this._cachedProgram = new (this._getRootParserFn())(source)
    }
    return this._cachedProgram
  }
  _getExcludedIntelliSenseTriggerKeys() {
    return {
      8: "backspace",
      9: "tab",
      13: "enter",
      16: "shift",
      17: "ctrl",
      18: "alt",
      19: "pause",
      20: "capslock",
      27: "escape",
      33: "pageup",
      34: "pagedown",
      35: "end",
      36: "home",
      37: "left",
      38: "up",
      39: "right",
      40: "down",
      45: "insert",
      46: "delete",
      91: "left window key",
      92: "right window key",
      93: "select",
      112: "f1",
      113: "f2",
      114: "f3",
      115: "f4",
      116: "f5",
      117: "f6",
      118: "f7",
      119: "f8",
      120: "f9",
      121: "f10",
      122: "f11",
      123: "f12",
      144: "numlock",
      145: "scrolllock"
    }
  }
  token(stream, state) {
    return this._advanceStreamAndReturnTokenType(stream, state)
  }
  fromTextAreaWithAutocomplete(area, options) {
    this._originalValue = area.value
    const defaultOptions = {
      lineNumbers: true,
      mode: this._name,
      tabSize: 1,
      indentUnit: 1,
      hintOptions: {
        hint: (cmInstance, options) => this.codeMirrorAutocomplete(cmInstance, options)
      }
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
        // Todo: get typings for CM autocomplete
        codeMirrorLib.commands.autocomplete(cm, null, { completeSingle: false })
    })
  }
  _getCodeMirrorLib() {
    return this._codeMirrorLib
  }
  async codeMirrorAutocomplete(cmInstance, options) {
    const cursor = cmInstance.getDoc().getCursor()
    const codeMirrorLib = this._getCodeMirrorLib()
    const result = await this._getParsedProgram().getAutocompleteResultsAt(cursor.line, cursor.ch)
    // It seems to be better UX if there's only 1 result, and its the atom the user entered, to close autocomplete
    if (result.matches.length === 1 && result.matches[0].text === result.atom) return null
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
  _advanceStreamAndReturnTokenType(stream, state) {
    let nextCharacter = stream.next()
    const lineNumber = stream.lineOracle.line + 1 // state.lineIndex
    const AtomBreakSymbol = " "
    const ParticleBreakSymbol = "\n"
    while (typeof nextCharacter === "string") {
      const peek = stream.peek()
      if (nextCharacter === AtomBreakSymbol) {
        if (peek === undefined || peek === ParticleBreakSymbol) {
          stream.skipToEnd() // advance string to end
          this._incrementLine(state)
        }
        if (peek === AtomBreakSymbol && state.atomIndex) {
          // If we are missing a atom.
          // TODO: this is broken for a blank 1st atom. We need to track AtomBreakSymbol level.
          state.atomIndex++
        }
        return "bracket"
      }
      if (peek === AtomBreakSymbol) {
        state.atomIndex++
        return this._getAtomStyle(lineNumber, state.atomIndex)
      }
      nextCharacter = stream.next()
    }
    state.atomIndex++
    const style = this._getAtomStyle(lineNumber, state.atomIndex)
    this._incrementLine(state)
    return style
  }
  _getAtomStyle(lineIndex, atomIndex) {
    const program = this._getParsedProgram()
    // todo: if the current atom is an error, don't show red?
    if (!program.getAtomPaintAtPosition) console.log(program)
    const paint = program.getAtomPaintAtPosition(lineIndex, atomIndex)
    const style = paint ? textMateScopeToCodeMirrorStyle(paint.split(".")) : undefined
    return style || "noPaintDefinedInParsers"
  }
  // todo: remove.
  startState() {
    return {
      atomIndex: 0
    }
  }
  _incrementLine(state) {
    state.atomIndex = 0
  }
}

module.exports = { ParsersCodeMirrorMode }
