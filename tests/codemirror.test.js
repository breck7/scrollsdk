#! /usr/bin/env node

// todo: make isomorphic

const fs = require("fs")
const GrammarProgram = require("../index.js").getProgramConstructor(__dirname + "/../langs/grammar/grammar.grammar")
const stamp = require("../langs/stamp/stamp.js")
const TreeNotationCodeMirrorMode = require("../built/codemirror/TreeNotationCodeMirrorMode.js").default
const TreeUtils = require("../built/base/TreeUtils.js").default

const testTree = {}

class MockStream {
  constructor(str) {
    this._str = str
    this._charPosition = -1
    this._last = 0
  }

  next() {
    this._charPosition++
    const char = this._str[this._charPosition]
    return char === "\n" ? undefined : char
  }

  get lineOracle() {
    return {
      line: TreeUtils.getLineIndexAtCharacterPosition(this._str, this._charPosition)
    }
  }

  current() {
    return this._str.substr(this._last, this._charPosition - this._last)
  }

  skipToEnd() {
    while (!this.eol()) {
      this.next()
    }
  }

  eol() {
    const char = this._str[this._charPosition]
    return char === "\n" || char === undefined
  }

  peek() {
    const char = this._str[this._charPosition + 1]
    return char
  }

  isEndOfStream() {
    return this._charPosition === this._str.length
  }
}

class MockCodeMirror {
  constructor(mode) {
    this._mode = mode()
  }

  getTokenLines(words) {
    const mode = this._mode
    const testStream = new MockStream(words)
    const startState = mode.startState()
    let tokens = []
    const lines = []
    while (!testStream.isEndOfStream()) {
      const token = mode.token(testStream, startState)
      tokens.push(token)
      if (testStream.eol()) {
        lines.push(tokens.join(" "))
        tokens = []
      }
    }
    return lines
  }
}

testTree.codeMirrorTest = equal => {
  const code = `testNode
 root
 version`

  const mock = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("grammarNode", () => GrammarProgram, () => code))
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.join(" "), `def bracket atom bracket atom`)
}

testTree.codeMirrorTest2 = equal => {
  const code = `testNode
 root
 version 1.0.0
foobarNode`

  const mock = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("grammarNode", () => GrammarProgram, () => code))
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.length, 4)
  equal(tokenLines.join(" "), `def bracket atom bracket atom bracket number def`)
}

testTree.regressionTest = equal => {
  const code = fs.readFileSync(__dirname + "/code-mirror-regression.stamp", "utf8")

  const mock = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("stampNode", () => stamp, () => code))
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.length, 217)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../builder/testTreeRunner.js")(testTree)

module.exports = testTree
