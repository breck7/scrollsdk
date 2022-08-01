import { TreeNode } from "./TreeNode"
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
    return message
  }

  private _testName: string
  private _testFn: Function
  private _parentFile: TestRacerFile

  async execute() {
    let passes: string[] = []
    let failures: string[][] = []
    const assertEqual = (actual: any, expected: any, message: string = "") => {
      if (expected === actual) {
        passes.push(message)
      } else {
        failures.push([actual, expected, message])
      }
    }
    try {
      await this._testFn(assertEqual)
    } catch (err) {
      failures.push([
        "1",
        "0",
        `Should not have uncaught errors but in ${this._testName} got error:
 toString:
  ${new TreeNode(err.toString()).toString(2)}
 stack:
  ${new TreeNode(err.stack).toString(2)}`
      ])
    }
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
    // todo: do side by side.
    // todo: add diff.
    this._emitMessage(`failed block ${this._testName}`)
    this._emitMessage(
      failures
        .map((failure: any) => {
          const actualVal = failure[0] === undefined ? "undefined" : failure[0].toString()
          const expectedVal = failure[1] === undefined ? "undefined" : failure[1].toString()
          const actual = new TreeNode(`actual\n${new TreeNode(actualVal).toString(1)}`)
          const expected = new TreeNode(`expected\n${new TreeNode(expectedVal.toString()).toString(1)}`)
          const comparison = actual.toComparison(expected)
          return new TreeNode(` assertion ${failure[2]}\n${comparison.toSideBySide([actual, expected]).toString(2)}`)
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

  getFileName() {
    return this._fileName
  }

  get length() {
    return Object.values(this._testTree).length
  }

  get skippedTestBlockNames() {
    const testsToRun = this._filterSkippedTestBlocks()
    return Object.keys(this._testTree).filter(blockName => !testsToRun.includes(blockName))
  }

  private _emitMessage(message: string) {
    this.getRunner()._emitMessage(message)
  }

  private _runner: TestRacer
  private _fileName: string
  private _testTree: any

  private _filterSkippedTestBlocks() {
    // _ prefix = run on these tests block
    // $ prefix = skip this test

    const runOnlyTheseTestBlocks = Object.keys(this._testTree).filter(key => key.startsWith("_"))
    if (runOnlyTheseTestBlocks.length) return runOnlyTheseTestBlocks

    return Object.keys(this._testTree).filter(key => !key.startsWith("$"))
  }

  async execute() {
    const testBlockNames = this._filterSkippedTestBlocks()
    this._emitStartFileMessage(testBlockNames.length)
    const fileTimer = new TreeUtils.Timer()
    const blockResults: { [blockName: string]: Object } = {}
    const blockPromises = testBlockNames.map(async testName => {
      const results = await this._testTree[testName].execute()
      blockResults[testName] = results
    })

    await Promise.all(blockPromises)
    const fileStats = this._aggregateBlockResultsIntoFileResults(blockResults)
    const fileTimeElapsed = fileTimer.tick()
    fileStats.blocksFailed ? this._emitFileFailedMessage(fileStats, fileTimeElapsed, testBlockNames.length) : this._emitFilePassedMessage(fileStats, fileTimeElapsed, testBlockNames.length)
    return fileStats
  }

  private _aggregateBlockResultsIntoFileResults(fileBlockResults: { [blockName: string]: Object }) {
    const fileStats: any = {
      assertionsPassed: 0,
      assertionsFailed: 0,
      blocksPassed: 0,
      blocksFailed: 0,
      failedBlocks: []
    }
    Object.keys(fileBlockResults).forEach((blockName: string) => {
      const results: any = fileBlockResults[blockName]
      fileStats.assertionsPassed += results.passes.length
      fileStats.assertionsFailed += results.failures.length
      if (results.failures.length) {
        fileStats.blocksFailed++
        fileStats.failedBlocks.push(blockName)
      } else fileStats.blocksPassed++
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
    return this
  }

  private _fileTestTree: { [fileName: string]: TestRacerFile }
  private _logFunction: Function = console.log
  private _timer = new TreeUtils.Timer()
  private _sessionFilesPassed = 0
  private _sessionFilesFailed: any = {}
  private _sessionBlocksFailed = 0
  private _sessionBlocksPassed = 0
  private _sessionAssertionsFailed = 0
  private _sessionAssertionsPassed = 0

  private _addFileResultsToSessionResults(fileStats: any, fileName: string) {
    this._sessionAssertionsPassed += fileStats.assertionsPassed
    this._sessionAssertionsFailed += fileStats.assertionsFailed
    this._sessionBlocksPassed += fileStats.blocksPassed
    this._sessionBlocksFailed += fileStats.blocksFailed
    if (!fileStats.blocksFailed) this._sessionFilesPassed++
    else {
      this._sessionFilesFailed[fileName] = fileStats.failedBlocks
    }
  }

  async execute() {
    this._emitSessionPlanMessage()
    const proms = Object.values(this._fileTestTree).map(async testFile => {
      const results = await testFile.execute()
      this._addFileResultsToSessionResults(results, testFile.getFileName())
    })
    await Promise.all(proms)
    return this
  }

  finish() {
    return this._emitSessionFinishMessage()
  }

  _emitMessage(message: string) {
    this._logFunction(message)
    return message
  }

  get length() {
    return Object.values(this._fileTestTree).length
  }

  private _emitSessionPlanMessage() {
    let blocks = 0
    Object.values(this._fileTestTree).forEach(value => (blocks += value.length))
    this._emitMessage(`${this.length} files and ${blocks} blocks to run. ${this._getSkippedBlockNames().length} skipped blocks.`)
  }

  private _getSkippedBlockNames() {
    const skippedBlocks: string[] = []
    Object.values(this._fileTestTree).forEach(file => {
      file.skippedTestBlockNames.forEach(blockName => {
        skippedBlocks.push(blockName)
      })
    })
    return skippedBlocks
  }

  private _getFailures() {
    if (!Object.keys(this._sessionFilesFailed).length) return ""
    return `
 failures
${new TreeNode(this._sessionFilesFailed).forEach(row => row.forEach((line: any) => line.deleteWordAt(0))).toString(2)}`
  }

  private _emitSessionFinishMessage() {
    const skipped = this._getSkippedBlockNames()
    return this._emitMessage(`finished in ${this._timer.getTotalElapsedTime()}ms
 skipped
  ${skipped.length} blocks${skipped ? " " + skipped.join(" ") : ""}
 passed
  ${this._sessionFilesPassed} files
  ${this._sessionBlocksPassed} blocks
  ${this._sessionAssertionsPassed} assertions
 failed
  ${Object.keys(this._sessionFilesFailed).length} files
  ${this._sessionBlocksFailed} blocks
  ${this._sessionAssertionsFailed} assertions${this._getFailures()}`)
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
