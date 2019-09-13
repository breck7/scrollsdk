const { exec, execSync } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")

const { jtree } = require("../index.js")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
const { Disk } = require("../products/Disk.node.js")

import { treeNotationTypes } from "../products/treeNotationTypes"

const ts = require("typescript")

class AbstractBuilder extends jtree.TreeNode {
  private _typeScriptToJavascript(sourceCode: string, forBrowser = false) {
    // downlevelIteration: true, // todo: what is this again?
    const tsConfig: any = {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: "es2017", noImplicitAny: true }
    }
    if (forBrowser) {
      tsConfig.compilerOptions.moduleResolution = "node"
      tsConfig.compilerOptions.lib = ["es2017", "dom"]
    } else {
      tsConfig.compilerOptions.tiles = ["node"]
      tsConfig.compilerOptions.lib = ["es2017"]
    }
    const result = ts.transpileModule(sourceCode, tsConfig)
    return result.outputText
  }

  private _combineTypeScriptFilesForNode(typeScriptScriptsInOrder: treeNotationTypes.typeScriptFilePath[]) {
    // todo: prettify
    return typeScriptScriptsInOrder
      .map(src => this._read(src))
      .map(content =>
        new TypeScriptRewriter(content)
          //.removeRequires()
          .removeImports()
          .removeExports()
          .removeHashBang()
          .getString()
      )
      .join("\n")
  }

  private _prettifyFile(path: treeNotationTypes.filepath) {
    Disk.write(path, require("prettier").format(Disk.read(path), { semi: false, parser: "babel", printWidth: 160 }))
  }

  private _combineTypeScriptFilesForBrowser(typeScriptScriptsInOrder: treeNotationTypes.typeScriptFilePath[]) {
    return typeScriptScriptsInOrder
      .map(src => this._read(src))
      .map(content =>
        new TypeScriptRewriter(content)
          .removeRequires()
          .removeImports()
          .removeHashBang()
          .removeNodeJsOnlyLines()
          .changeDefaultExportsToWindowExports()
          .removeExports()
          .getString()
      )
      .join("\n")
  }

  private _buildBrowserTsc(sourceCode: string, outputFilePath: string) {
    return this._buildTsc(sourceCode, outputFilePath, true)
  }

  private _buildTsc(sourceCode: string, outputFilePath: string, forBrowser = false) {
    Disk.write(outputFilePath, this._typeScriptToJavascript(sourceCode, forBrowser))
  }

  // todo: cleanup
  _getOutputFilePath(outputFileName: string) {
    return __dirname + "/../products/" + outputFileName
  }

  async _produceBrowserProductFromTypeScript(files: treeNotationTypes.absoluteFilePath[] = [], outputFileName: treeNotationTypes.fileName) {
    const outputFilePath = this._getOutputFilePath(outputFileName)
    this._buildBrowserTsc(this._combineTypeScriptFilesForBrowser(files), outputFilePath)
    this._prettifyFile(outputFilePath)
  }

  _makeExecutable(file: treeNotationTypes.filepath) {
    Disk.makeExecutable(file)
  }

  _getProductFolder() {
    return __dirname
  }

  _getBundleFilePath(outputFileName: treeNotationTypes.fileName) {
    return this._getProductFolder() + `${outputFileName.replace(".js", ".ts")}`
  }

  async _produceNodeProductFromTypeScript(
    files: treeNotationTypes.absoluteFilePath[],
    outputFileName: treeNotationTypes.fileName,
    transformFn: (code: treeNotationTypes.javascriptCode) => string
  ) {
    const outputFilePath = this._getOutputFilePath(outputFileName)

    try {
      await this._buildTsc(this._combineTypeScriptFilesForNode(files), outputFilePath, false)
      Disk.write(outputFilePath, transformFn(Disk.read(outputFilePath)))
      this._prettifyFile(outputFilePath)
    } catch (error) {
      console.log(error)
    }

    return outputFilePath
  }

  _readJson(path: treeNotationTypes.filepath) {
    return JSON.parse(this._read(path))
  }

  _writeJson(path: treeNotationTypes.filepath, obj: any) {
    this._write(path, JSON.stringify(obj, null, 2))
  }

  _updatePackageJson(packagePath: treeNotationTypes.filepath, newVersion: treeNotationTypes.semanticVersion) {
    const packageJson = this._readJson(packagePath)
    packageJson.version = newVersion
    this._writeJson(packagePath, packageJson)
    console.log(`Updated ${packagePath} to ${newVersion}`)
  }

  _read(path: treeNotationTypes.filepath) {
    const fs = this.require("fs")
    return fs.readFileSync(path, "utf8")
  }

  _mochaTest(filepath: treeNotationTypes.filepath) {
    const reporter = require("tap-mocha-reporter")
    const proc = exec(`${filepath} _test`)

    proc.stdout.pipe(reporter("dot"))
    proc.stderr.on("data", (data: any) => console.error("stderr: " + data.toString()))
  }

  _write(path: treeNotationTypes.filepath, str: string) {
    const fs = this.require("fs")
    return fs.writeFileSync(path, str, "utf8")
  }

  _checkGrammarFile(grammarPath: treeNotationTypes.grammarFilePath) {
    // todo: test both with grammar.grammar and hard coded grammar program (eventually the latter should be generated from the former).
    const testTree: any = {}
    testTree[`hardCodedGrammarCheckOf${grammarPath}`] = (equal: Function) => {
      // Arrange/Act
      const program = new jtree.GrammarProgram(this._read(grammarPath))
      const errs = program.getAllErrors()
      const exampleErrors = program.getErrorsInGrammarExamples()

      //Assert
      equal(errs.length, 0, "should be no errors")
      if (errs.length) console.log(errs.join("\n"))

      if (exampleErrors.length) console.log(exampleErrors)
      equal(exampleErrors.length, 0, exampleErrors.length ? "examples errs: " + exampleErrors : "no example errors")
    }

    testTree[`grammarGrammarCheckOf${grammarPath}`] = (equal: Function) => {
      // Arrange/Act
      const program = jtree.makeProgram(grammarPath, __dirname + "/../langs/grammar/grammar.grammar")
      const errs = program.getAllErrors()

      //Assert

      equal(errs.length, 0, "should be no errors")
      if (errs.length) console.log(errs.join("\n"))
    }

    jtree.Utils.runTestTree(testTree)
  }

  _help(filePath = process.argv[1]) {
    const commands = this._getAllCommands()
    return `${commands.length} commands in ${filePath}:\n${commands.join("\n")}`
  }

  _getAllCommands() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(word => !word.startsWith("_") && word !== "constructor")
      .sort()
  }

  private _getPartialMatches(commandName: string) {
    return this._getAllCommands().filter(item => item.startsWith(commandName))
  }

  _main() {
    const action = process.argv[2]
    const paramOne = process.argv[3]
    const paramTwo = process.argv[4]
    const print = console.log
    const builder = <any>this
    const partialMatches = this._getPartialMatches(action)

    if (builder[action]) {
      builder[action](paramOne, paramTwo)
    } else if (!action) {
      print(this._help())
    } else if (partialMatches.length > 0) {
      if (partialMatches.length === 1) builder[partialMatches[0]](paramOne, paramTwo)
      else print(`Multiple matches for '${action}'. Options are:\n${partialMatches.join("\n")}`)
    } else print(`Unknown command '${action}'. Type 'jtree build' to see available commands.`)
  }
}

export { AbstractBuilder }
