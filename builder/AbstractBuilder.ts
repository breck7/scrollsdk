import { exec } from "child_process"
import jtree from "../core/jtree.node"
import jTreeTypes from "../core/jTreeTypes"

import { TestTreeRunner } from "./TestTreeRunner"
import { TypeScriptRewriter } from "./TypeScriptRewriter"

class AbstractBuilder extends jtree.TreeNode {
  _bundleBrowserTypeScriptFilesIntoOne(typeScriptSrcFiles: jTreeTypes.typeScriptFilePath[], outputFilePath: jTreeTypes.typeScriptFilePath) {
    const project = this.require("project", __dirname + "/../langs/project/project.js")
    const projectCode = new jtree.TreeNode(project.makeProjectProgramFromArrayOfScripts(typeScriptSrcFiles))
    projectCode
      .getTopDownArray()
      .filter(node => node.getFirstWord() === "relative")
      .forEach(node => node.setLine(node.getLine() + ".ts"))
    const projectFilePath = outputFilePath + ".project"
    this._write(projectFilePath, projectCode.toString()) // Write to disk to inspect if something goes wrong.
    const typeScriptScriptsInOrderBrowserOnly = new project(projectCode.toString())
      .getScriptPathsInCorrectDependencyOrder()
      .filter((file: string) => !file.includes(".node."))

    const combinedTypeScriptScript = this._combineTypeScriptFiles(typeScriptScriptsInOrderBrowserOnly)

    this._write(outputFilePath, `"use strict"\n` + combinedTypeScriptScript)
  }

  _combineTypeScriptFiles(typeScriptScriptsInOrderBrowserOnly: jTreeTypes.typeScriptFilePath[]) {
    return typeScriptScriptsInOrderBrowserOnly
      .map(src => this._read(src))
      .map(content =>
        new TypeScriptRewriter(content)
          .removeRequires()
          .removeImports()
          .changeDefaultExportsToWindowExports()
          .removeExports()
          .getString()
      )
      .join("\n")
  }

  _buildBrowserVersionFromTypeScriptFiles(
    folder: jTreeTypes.asboluteFolderPath,
    typeScriptFiles: jTreeTypes.typeScriptFilePath[],
    outputFilePath: jTreeTypes.filepath,
    combinedTempFilePath: jTreeTypes.filepath
  ) {
    // Compile regular version to make sure no errors:
    this._buildTsc(folder)

    this._bundleBrowserTypeScriptFilesIntoOne(typeScriptFiles, combinedTempFilePath)

    exec("tsc -p tsconfig.browser.json", { cwd: folder }, (err, stdout, stderr) => {
      if (stderr || err) return console.error(err, stdout, stderr)

      // This solves the wierd TS insertin
      // todo: remove
      const file = new TypeScriptRewriter(this._read(outputFilePath).replace(/[^\n]*jTreeTypes[^\n]*/g, ""))
      this._write(outputFilePath, file.getString())
    })
  }

  _buildTsc(folder: jTreeTypes.asboluteFolderPath) {
    exec("tsc", { cwd: folder })
  }

  _readJson(path: jTreeTypes.filepath) {
    return JSON.parse(this._read(path))
  }

  _writeJson(path: jTreeTypes.filepath, obj: any) {
    this._write(path, JSON.stringify(obj, null, 2))
  }

  _updatePackageJson(packagePath: jTreeTypes.filepath, newVersion: jTreeTypes.semanticVersion) {
    const packageJson = this._readJson(packagePath)
    packageJson.version = newVersion
    this._writeJson(packagePath, packageJson)
    console.log(`Updated ${packagePath} to ${newVersion}`)
  }

  _read(path: jTreeTypes.filepath) {
    const fs = this.require("fs")
    return fs.readFileSync(path, "utf8")
  }

  _mochaTest(filepath: jTreeTypes.filepath) {
    const reporter = require("tap-mocha-reporter")
    const proc = exec(`node ${filepath} _test`)

    proc.stdout.pipe(reporter("dot"))
    proc.stderr.on("data", data => console.error("stderr: " + data.toString()))
  }

  _write(path: jTreeTypes.filepath, str: string) {
    const fs = this.require("fs")
    return fs.writeFileSync(path, str, "utf8")
  }

  _checkGrammarFile(grammarPath: jTreeTypes.grammarFilePath) {
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

    new TestTreeRunner().run(testTree)
  }

  _help(filePath = process.argv[1]) {
    const commands = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(word => !word.startsWith("_") && word !== "constructor")
      .sort()
    return `${commands.length} commands in ${filePath}:\n${commands.join("\n")}`
  }

  _main() {
    const action = process.argv[2]
    const paramOne = process.argv[3]
    const paramTwo = process.argv[4]
    const print = console.log
    const builder = <any>this

    if (builder[action]) {
      builder[action](paramOne, paramTwo)
    } else if (!action) {
      print(this._help())
    } else print(`Unknown command '${action}'. Type 'jtree build' to see available commands.`)
  }
}

export { AbstractBuilder }
