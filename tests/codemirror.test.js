#! /usr/local/bin/node --use_strict

const fs = require("fs")
const GrammarProgram = require("../index.js").getProgramConstructor(__dirname + "/../grammar.grammar")
const StampProgram = require("../langs/stamp/index.js")
const TreeNotationCodeMirrorMode = require("../built/grammar/TreeNotationCodeMirrorMode.js").default
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
  const words = `@grammar test
 @version`
  const tokens = `atom bracket def bracket atom`

  const mock = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("grammar", () => GrammarProgram, () => words))
  const tokenLines = mock.getTokenLines(words)
  equal(tokenLines.join(" "), tokens)
}

testTree.codeMirrorTest2 = equal => {
  const words = `@grammar test
 @version 1.0.0
@keyword foobar`
  const tokens = `atom bracket def bracket atom bracket number def bracket def`

  const mock = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("grammar", () => GrammarProgram, () => words))
  const tokenLines = mock.getTokenLines(words)
  equal(tokenLines.length, 3)
  equal(tokenLines.join(" "), tokens)
}

testTree.regressionTest = equal => {
  const words = fs.readFileSync(__dirname + "/code-mirror-regression.stamp", "utf8")

  const mock = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("stamp", () => StampProgram, () => words))
  const tokenLines = mock.getTokenLines(words)
  equal(tokenLines.length, 217)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)

module.exports = testTree
