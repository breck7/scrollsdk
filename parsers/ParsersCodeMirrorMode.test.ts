#!/usr/bin/env ts-node

import { particlesTypes } from "../products/particlesTypes"
// Note: this is not isomorphic. We should probably just rewrite and use new version of CodeMirror
const path = require("path")
const stamp = require("../products/stamp.nodejs.js")
const ParsersProgram = require("../products/parsers.nodejs.js")
const DugProgram = require("../products/dug.nodejs.js")
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { HandParsersProgram } = require("../products/Parsers.js")
const { TestRacer } = require("../products/TestRacer.js")
const { ParsersCodeMirrorMode } = require("../products/ParsersCodeMirrorMode.js")

const irisPath = path.join(__dirname, "..", "langs", "iris", "iris.parsers")
const irisParsers = Disk.read(irisPath)

const testParticles: particlesTypes.testParticles = {}

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
      line: Utils.getLineIndexAtCharacterPosition(this._str, this._charPosition)
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

testParticles.codeMirrorTest = equal => {
  const code = `testParser
 root`

  const mock = new MockCodeMirror(
    () =>
      new ParsersCodeMirrorMode(
        "parsersParser",
        () => ParsersProgram,
        () => code
      )
  )
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.join(" "), `def bracket atom`)
}

testParticles.iris = equal => {
  const irisParser = new HandParsersProgram(irisParsers).compileAndReturnRootParser()
  const goodCode = `6.1 3 4.9 2 virginica`
  const codeWithMissingCell = `6.1 3 4.9  virginica`
  // Act
  const tokenLines = new MockCodeMirror(
    () =>
      new ParsersCodeMirrorMode(
        "irisParser",
        () => irisParser,
        () => goodCode
      )
  ).getTokenLines(goodCode)
  // Assert
  equal(tokenLines.join(" "), `number bracket number bracket number bracket number bracket atom`)

  // Act
  const tokenLines2 = new MockCodeMirror(
    () =>
      new ParsersCodeMirrorMode(
        "irisParser",
        () => irisParser,
        () => codeWithMissingCell
      )
  ).getTokenLines(codeWithMissingCell)
  // Assert
  equal(tokenLines2.join(" "), `number bracket number bracket number bracket bracket atom`)
}

testParticles.codeMirrorTest2 = equal => {
  const code = `testParser
 root
foobarParser`

  const mock = new MockCodeMirror(
    () =>
      new ParsersCodeMirrorMode(
        "parsersParser",
        () => ParsersProgram,
        () => code
      )
  )
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.length, 3)
  equal(tokenLines.join(" "), `def bracket atom def`)
}

testParticles.regressionTest = equal => {
  const code = Disk.read(__dirname + "/ParsersCodeMirrorMode.regression.stamp")

  const mock = new MockCodeMirror(
    () =>
      new ParsersCodeMirrorMode(
        "stampParser",
        () => stamp,
        () => code
      )
  )
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.length, 217)
}

testParticles.regression2 = equal => {
  const code = `object
 prettier
  object`

  const mock = new MockCodeMirror(
    () =>
      new ParsersCodeMirrorMode(
        "dugParser",
        () => DugProgram,
        () => code
      )
  )
  const tokenLines = mock.getTokenLines(code)
  equal(tokenLines.length, 3)
  equal(tokenLines.join(" "), `keyword bracket string bracket bracket keyword`)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
