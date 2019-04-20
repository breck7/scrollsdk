#! /usr/local/bin/node --use_strict

const Quack = require("./quack.js")
const GrammarProgram = require("../index.js").getProgramConstructor(__dirname + "/../grammar.grammar")
const TreeNotationCodeMirrorMode = require("../built/grammar/TreeNotationCodeMirrorMode.js").default

class MockStream {
  constructor(str) {
    this._str = str
    this._position = -1
    this._last = 0
  }

  next() {
    this._position++
    const char = this._str[this._position]
    return char === "\n" ? undefined : char
  }

  current() {
    return this._str.substr(this._last, this._position - this._last)
  }

  skipToEnd() {
    while (!this.eol()) {
      this.next()
    }
  }

  eol() {
    const char = this._str[this._position]
    return char === "\n" || char === undefined
  }

  peek() {
    const char = this._str[this._position + 1]
    return char
  }

  isEndOfStream() {
    return this._position === this._str.length
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
    const tokens = []
    const lines = []
    while (!testStream.isEndOfStream()) {
      const token = mode.token(testStream, startState)
      tokens.push(token)
      if (testStream.eol()) {
        lines.push(tokens.join(" "))
        tokens.splice(0, tokens.length)
      }
    }
    return lines
  }
}

Quack.quickTest("code mirror test", equal => {
  const words = `@grammar test
 @version 1.0.0
@keyword foobar`
  const tokens = `keyword bracket string bracket keyword bracket semanticVersion keyword bracket keyword`

  const mode = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("grammar", () => GrammarProgram, () => words))
  const tokenLines = mode.getTokenLines(words)
  equal(tokenLines.length, 3)
  equal(tokenLines.join(" "), tokens)
})
