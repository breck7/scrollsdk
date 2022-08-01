#!/usr/bin/env ts-node

// todo: make isomorphic

const stamp = require("../products/stamp.nodejs.js")
const GrammarProgram = require("../products/grammar.nodejs.js")
const DugProgram = require("../products/dug.nodejs.js")
const { Disk } = require("../products/Disk.node.js")

const { jtree } = require("../index.js")

const irisPath = __dirname + "/../langs/iris/iris.grammar"
const irisGrammar = Disk.read(irisPath)

import { treeNotationTypes } from "../products/treeNotationTypes"

const TreeNotationCodeMirrorMode = jtree.TreeNotationCodeMirrorMode
const TreeUtils = jtree.Utils

const testTree: treeNotationTypes.testTree = {}

class MockStream {
  constructor(str: string) {
    this._str = str
    this._charPosition = -1
    this._last = 0
  }

  private _str: string
  private _charPosition: number
  private _last: number

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
  constructor(mode: any) {
    this._mode = mode()
  }

  private _mode: any

  getTokenLines(words: any) {
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

testTree.iris = equal => {
  const irisConstructor = new jtree.HandGrammarProgram(irisGrammar).compileAndReturnRootConstructor()
  const goodCode = `6.1 3 4.9 2 virginica`
  const codeWithMissingCell = `6.1 3 4.9  virginica`
  // Act
  const tokenLines = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("irisNode", () => irisConstructor, () => goodCode)).getTokenLines(goodCode)
  // Assert
  equal(tokenLines.join(" "), `number bracket number bracket number bracket number bracket atom`)

  // Act
  const tokenLines2 = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("irisNode", () => irisConstructor, () => codeWithMissingCell)).getTokenLines(codeWithMissingCell)
  // Assert
  equal(tokenLines2.join(" "), `number bracket number bracket number bracket bracket atom`)
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
  const code = Disk.read(__dirname + "/TreeNotationCoreMirrorMode.regression.stamp")

  const mock = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("stampNode", () => stamp, () => code))
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.length, 217)
}

testTree.regression2 = equal => {
  const code = `object
 prettier
  object`

  const mock = new MockCodeMirror(() => new TreeNotationCodeMirrorMode("dugNode", () => DugProgram, () => code))
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.length, 3)
  equal(tokenLines.join(" "), `keyword bracket string bracket bracket keyword`)
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)

export { testTree }
