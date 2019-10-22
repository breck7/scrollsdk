import { TreeUtils } from "./TreeUtils"
import { treeNotationTypes } from "../products/treeNotationTypes"

// todo: ensure we have key features from http://testanything.org/tap-version-13-specification.html
// todo: be able to compile to TAP 13?

declare type fileTestTree = { [fileName: string]: treeNotationTypes.testTree }

class TestRacerTestBlock {
  constructor(testFile: TestRacerFile, testName: string, fn: Function) {
    this._parentFile = testFile
    this._testName = testName
    this._testFn = fn
  }

  private _emitMessage(message: string) {
    this._parentFile.getRunner()._emitMessage(message)
  }

  private _testName: string
  private _testFn: Function
  private _parentFile: TestRacerFile

  async execute() {
    let passes: string[] = []
    let failures: string[][] = []
    const assertEqual = (actual: any, expected: any, message: string) => {
      if (expected === actual) {
        passes.push(message)
      } else {
        failures.push([actual, expected, message])
      }
    }
    await this._testFn(assertEqual)
    failures.length ? this._emitBlockFailedMessage(failures) : this._emitBlockPassedMessage(passes)
    return {
      passes,
      failures
    }
  }

  private _emitBlockPassedMessage(passes: any) {
    this._emitMessage(`ok block ${this._testName} - ${passes.length} passed`)
  }

  private _emitBlockFailedMessage(failures: any) {
    // todo: should replace not replace last newline?
    this._emitMessage(`failed block ${this._testName}`)
    this._emitMessage(
      failures
        .map((failure: any) => {
          return ` assertion ${failure[2]}
 actual ${failure[0].toString().replace(/\n/g, "\n  ")}
 expected ${failure[1].toString().replace(/\n/g, "\n  ")}`
        })
        .join("\n")
    )
  }
}

class TestRacerFile {
  constructor(runner: TestRacer, testTree: treeNotationTypes.testTree, fileName: string) {
    this._runner = runner
    this._testTree = {}
    this._fileName = fileName
    Object.keys(testTree).forEach(key => {
      this._testTree[key] = new TestRacerTestBlock(this, key, testTree[key])
    })
  }

  getRunner() {
    return this._runner
  }

  get length() {
    return Object.values(this._testTree).length
  }

  get skippedLength() {
    return this.length - this._filterSkippedTests().length
  }

  private _emitMessage(message: string) {
    this.getRunner()._emitMessage(message)
  }

  private _runner: TestRacer
  private _fileName: string
  private _testTree: any

  private _filterSkippedTests() {
    const runOnlyTheseTestBlocks = Object.keys(this._testTree).filter(key => key.startsWith("_"))
    return runOnlyTheseTestBlocks.length ? runOnlyTheseTestBlocks : Object.keys(this._testTree)
  }

  async execute() {
    const tests = this._filterSkippedTests()
    this._emitStartFileMessage(tests.length)
    const fileTimer = new TreeUtils.Timer()
    const blockResults: any[] = []
    const blockPromises = tests.map(async testName => {
      const results = await this._testTree[testName].execute()
      blockResults.push(results)
    })

    await Promise.all(blockPromises)
    const fileStats = this._aggregateBlockResultsIntoFileResults(blockResults)
    const fileTimeElapsed = fileTimer.tick()
    fileStats.blocksFailed ? this._emitFileFailedMessage(fileStats, fileTimeElapsed, tests.length) : this._emitFilePassedMessage(fileStats, fileTimeElapsed, tests.length)
    return fileStats
  }

  private _aggregateBlockResultsIntoFileResults(fileBlockResults: any[]) {
    const fileStats = {
      assertionsPassed: 0,
      assertionsFailed: 0,
      blocksPassed: 0,
      blocksFailed: 0
    }
    fileBlockResults.forEach((results: any) => {
      fileStats.assertionsPassed += results.passes.length
      fileStats.assertionsFailed += results.failures.length
      if (results.failures.length) fileStats.blocksFailed++
      else fileStats.blocksPassed++
    })
    return fileStats
  }

  private _emitStartFileMessage(blockCount: treeNotationTypes.int) {
    this._emitMessage(`start file ${blockCount} test blocks in file ${this._fileName}`)
  }

  private _emitFilePassedMessage(fileStats: any, fileTimeElapsed: number, blockCount: number) {
    this._emitMessage(`ok file ${this._fileName} in ${fileTimeElapsed}ms. ${blockCount} blocks and ${fileStats.assertionsPassed} assertions passed.`)
  }

  private _emitFileFailedMessage(fileStats: any, fileTimeElapsed: number, blockCount: number) {
    this._emitMessage(
      `failed file ${this._fileName} over ${fileTimeElapsed}ms. ${fileStats.blocksFailed} blocks and ${fileStats.assertionsFailed} failed. ${blockCount - fileStats.blocksFailed} blocks and ${fileStats.assertionsPassed} assertions passed`
    )
  }
}

class TestRacer {
  constructor(fileTestTree: fileTestTree) {
    this._fileTestTree = {}
    Object.keys(fileTestTree).forEach(fileName => {
      this._fileTestTree[fileName] = new TestRacerFile(this, fileTestTree[fileName], fileName)
    })
  }

  setLogFunction(logFunction: Function) {
    this._logFunction = logFunction
  }

  private _fileTestTree: { [fileName: string]: TestRacerFile }
  private _logFunction: Function = console.log
  private _timer = new TreeUtils.Timer()
  private _sessionFilesPassed = 0
  private _sessionFilesFailed = 0
  private _sessionBlocksFailed = 0
  private _sessionBlocksPassed = 0
  private _sessionAssertionsFailed = 0
  private _sessionAssertionsPassed = 0

  _addFileResultsToSessionResults(fileStats: any) {
    this._sessionAssertionsPassed += fileStats.assertionsPassed
    this._sessionAssertionsFailed += fileStats.assertionsFailed
    this._sessionBlocksPassed += fileStats.blocksPassed
    this._sessionBlocksFailed += fileStats.blocksFailed
    if (!fileStats.blocksFailed) this._sessionFilesPassed++
    else this._sessionFilesFailed++
  }

  async execute() {
    this._emitSessionPlanMessage()
    const proms = Object.values(this._fileTestTree).map(async testFile => {
      const results = await testFile.execute()
      this._addFileResultsToSessionResults(results)
    })
    await Promise.all(proms)
    return this
  }

  finish() {
    this._emitSessionFinishMessage()
  }

  _emitMessage(message: string) {
    this._logFunction(message)
  }

  get length() {
    return Object.values(this._fileTestTree).length
  }

  private _emitSessionPlanMessage() {
    let blocks = 0
    let skippedLength = 0
    Object.values(this._fileTestTree).forEach(value => (blocks += value.length))
    Object.values(this._fileTestTree).forEach(value => (skippedLength += value.skippedLength))
    this._emitMessage(`${this.length} files and ${blocks} blocks to run. ${skippedLength} skipped blocks.`)
  }

  private _emitSessionFinishMessage() {
    this._emitMessage(`finished in ${this._timer.getTotalElapsedTime()}ms
 passed
  ${this._sessionFilesPassed} files
  ${this._sessionBlocksPassed} blocks
  ${this._sessionAssertionsPassed} assertions
 failed
  ${this._sessionFilesFailed} files
  ${this._sessionBlocksFailed} blocks
  ${this._sessionAssertionsFailed} assertions`)
  }

  static async testSingleFile(fileName: string, testTree: treeNotationTypes.testTree) {
    const obj: any = {}
    obj[fileName] = testTree
    const session = new TestRacer(obj)
    await session.execute()
    session.finish()
  }
}

export { TestRacer }
