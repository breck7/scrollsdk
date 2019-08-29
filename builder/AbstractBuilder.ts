//tooling product abstractBuilder.node.js

const { exec, execSync } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")

const jtree = require("../products/jtree.node.js")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
const { Disk } = require("../products/Disk.node.js")

import jTreeTypes from "../core/jTreeTypes"

class AbstractBuilder extends jtree.TreeNode {
  private _bundleBrowserTypeScriptFilesIntoOneTypeScriptFile(typeScriptSrcFiles: jTreeTypes.typeScriptFilePath[], folder: string, outputFilePath: string) {
    this._write(outputFilePath, this._combineTypeScriptFilesForBrowser(this._getOrderedTypeScriptFiles(typeScriptSrcFiles, outputFilePath)))
  }

  private _getNodeTsConfig(outDir = "", inputFilePath = "") {
    return {
      compilerOptions: {
        types: ["node"],
        outDir: outDir,
        lib: ["es2017"],
        noImplicitAny: true,
        downlevelIteration: true, // todo: what is this again?
        target: "es2017",
        module: "commonjs"
      },
      include: [inputFilePath]
    }
  }

  private _getBrowserTsConfig(outDir = "", inputFilePath = "") {
    return {
      compilerOptions: {
        outDir: outDir,
        lib: ["es2017", "dom"],
        moduleResolution: "node",
        noImplicitAny: true,
        declaration: false,
        target: "es2017"
      },
      include: [inputFilePath]
    }
  }

  private _bundleNodeTypeScriptFilesIntoOne(typeScriptSrcFiles: jTreeTypes.typeScriptFilePath[], folder: string, outputFilePath: string) {
    const code = this._combineTypeScriptFilesForNode(this._getOrderedTypeScriptFiles(typeScriptSrcFiles, outputFilePath))
    this._write(outputFilePath, code)
  }

  private _getOrderedTypeScriptFiles(typeScriptSrcFiles: jTreeTypes.typeScriptFilePath[], outputFilePath: jTreeTypes.typeScriptFilePath) {
    const project = this.require("project", __dirname + "/../langs/project/project.node.js")
    const projectCode = new jtree.TreeNode(project.makeProjectProgramFromArrayOfScripts(typeScriptSrcFiles))
    projectCode
      .getTopDownArray()
      .filter((node: jTreeTypes.treeNode) => node.getFirstWord() === "relative") // todo: cleanup
      .forEach((node: jTreeTypes.treeNode) => {
        const line = node.getLine()
        if (line.endsWith("js")) node.setWord(0, "external")
        else node.setLine(line + ".ts")
      })

    // this._write(outputFilePath + ".project", projectCode.toString()) // Write to disk to inspect if something goes wrong.
    return new project(projectCode.toString()).getScriptPathsInCorrectDependencyOrder()
  }

  private _combineTypeScriptFilesForNode(typeScriptScriptsInOrder: jTreeTypes.typeScriptFilePath[]) {
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

  private _prettifyFile(path: jTreeTypes.filepath) {
    Disk.write(path, require("prettier").format(Disk.read(path), { semi: false, parser: "babel", printWidth: 160 }))
  }

  private _combineTypeScriptFilesForBrowser(typeScriptScriptsInOrder: jTreeTypes.typeScriptFilePath[]) {
    const typeScriptScriptsInOrderBrowserOnly = typeScriptScriptsInOrder.filter((file: string) => !file.includes(".node."))
    return typeScriptScriptsInOrderBrowserOnly
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

  private async _buildBrowserTsc(folder: jTreeTypes.absoluteFolderPath, inputFilePath: string) {
    return this._buildTsc(folder, inputFilePath, true)
  }

  private async _buildTsc(folder: jTreeTypes.absoluteFolderPath, inputFilePath: string, forBrowser = false) {
    const outputFolder = this._getProductFolder()
    const configPath = folder + "tsconfig.json"
    Disk.writeJson(configPath, forBrowser ? this._getBrowserTsConfig(outputFolder, inputFilePath) : this._getNodeTsConfig(outputFolder, inputFilePath))
    const prom = new Promise((resolve, reject) => {
      exec("tsc", { cwd: folder }, (err: any, stdout: any, stderr: any) => {
        if (stderr || err) {
          console.error(err, stdout, stderr)
          return reject()
        }
        resolve(stdout)
      })
    })
    await prom
    Disk.rm(configPath)
    return prom
  }

  // todo: cleanup
  _getProductPath(productId: string) {
    return __dirname + "/../products/" + productId + ".js"
  }

  async _produceBrowserProductFromTypeScript(
    folder: jTreeTypes.absoluteFolderPath,
    productId: jTreeTypes.fileName,
    extraFiles: jTreeTypes.absoluteFilePath[] = []
  ) {
    const bundleFilePath = folder + `/${productId}.ts`
    this._bundleBrowserTypeScriptFilesIntoOneTypeScriptFile(this._getFilesForProduction(folder, extraFiles, productId), folder, bundleFilePath)
    try {
      await this._buildBrowserTsc(folder, bundleFilePath)
    } catch (err) {
      console.log(err)
    }
    this._prettifyFile(this._getProductPath(productId))
  }

  _getFilesForProduction(folder: jTreeTypes.absoluteFolderPath, files: jTreeTypes.absoluteFilePath[], productId: jTreeTypes.fileName) {
    return files
      .concat(recursiveReadSync(folder))
      .filter((file: string) => file.includes(".ts"))
      .filter((file: string) => Disk.read(file).includes(`//tooling product ${productId}.js`))
  }

  _makeExecutable(file: jTreeTypes.filepath) {
    Disk.makeExecutable(file)
  }

  _getProductFolder() {
    return __dirname
  }

  async _produceNodeProductFromTypeScript(
    folder: jTreeTypes.absoluteFolderPath,
    extraFiles: jTreeTypes.absoluteFilePath[],
    productId: jTreeTypes.fileName,
    transformFn: (code: jTreeTypes.javascriptCode) => string
  ) {
    const bundleFilePath = folder + `/${productId}.ts`
    const files = this._getFilesForProduction(folder, extraFiles, productId)
    this._bundleNodeTypeScriptFilesIntoOne(files, folder, bundleFilePath)
    const outputFilePath = this._getProductPath(productId)

    try {
      this._buildTsc(folder, bundleFilePath, false)
    } catch (error) {
      console.log(error.status)
      console.log(error.message)
      console.log(error.stderr)
      console.log(error.stdout)
    }

    Disk.write(outputFilePath, transformFn(Disk.read(outputFilePath)))
    this._prettifyFile(outputFilePath)
    return outputFilePath
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
    const proc = exec(`${filepath} _test`)

    proc.stdout.pipe(reporter("dot"))
    proc.stderr.on("data", (data: any) => console.error("stderr: " + data.toString()))
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
