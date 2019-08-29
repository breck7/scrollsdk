"use strict"
//tooling product jtree.node.js
//tooling product jtree.browser.js
//tooling product commandLineApp.node.js
//tooling product treeBase.node.js
//tooling product SandboxServer.node.js
//tooling product core.test.browser.js
//tooling product AbstractBuilder.node.js
//tooling product TreeComponentFramework.browser.js
//tooling product TreeComponentFramework.node.js
//tooling product Disk.node.js
Object.defineProperty(exports, "__esModule", { value: true })
//tooling product AbstractBuilder.node.js
const { exec, execSync } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")
const jtree = require("../products/jtree.node.js")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
const { Disk } = require("../products/Disk.node.js")
class AbstractBuilder extends jtree.TreeNode {
  _bundleBrowserTypeScriptFilesIntoOneTypeScriptFile(typeScriptSrcFiles, folder, outputFilePath) {
    this._write(outputFilePath, this._combineTypeScriptFilesForBrowser(this._getOrderedTypeScriptFiles(typeScriptSrcFiles, outputFilePath)))
  }
  _getNodeTsConfig(outDir = "", inputFilePath = "") {
    return {
      compilerOptions: {
        types: ["node"],
        outDir: outDir,
        lib: ["es2017"],
        noImplicitAny: true,
        downlevelIteration: true,
        target: "es2017",
        module: "commonjs"
      },
      include: [inputFilePath]
    }
  }
  _getBrowserTsConfig(outDir = "", inputFilePath = "") {
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
  _bundleNodeTypeScriptFilesIntoOne(typeScriptSrcFiles, folder, outputFilePath) {
    const code = this._combineTypeScriptFilesForNode(this._getOrderedTypeScriptFiles(typeScriptSrcFiles, outputFilePath))
    this._write(outputFilePath, code)
  }
  _getOrderedTypeScriptFiles(typeScriptSrcFiles, outputFilePath) {
    const project = this.require("project", __dirname + "/../langs/project/project.node.js")
    const projectCode = new jtree.TreeNode(project.makeProjectProgramFromArrayOfScripts(typeScriptSrcFiles))
    projectCode
      .getTopDownArray()
      .filter(node => node.getFirstWord() === "relative") // todo: cleanup
      .forEach(node => {
        const line = node.getLine()
        if (line.endsWith("js")) node.setWord(0, "external")
        else node.setLine(line + ".ts")
      })
    // this._write(outputFilePath + ".project", projectCode.toString()) // Write to disk to inspect if something goes wrong.
    return new project(projectCode.toString()).getScriptPathsInCorrectDependencyOrder()
  }
  _combineTypeScriptFilesForNode(typeScriptScriptsInOrder) {
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
  _prettifyFile(path) {
    Disk.write(path, require("prettier").format(Disk.read(path), { semi: false, parser: "babel", printWidth: 160 }))
  }
  _combineTypeScriptFilesForBrowser(typeScriptScriptsInOrder) {
    const typeScriptScriptsInOrderBrowserOnly = typeScriptScriptsInOrder.filter(file => !file.includes(".node."))
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
  async _buildBrowserTsc(folder, inputFilePath) {
    return this._buildTsc(folder, inputFilePath, true)
  }
  async _buildTsc(folder, inputFilePath, forBrowser = false) {
    const outputFolder = this._getProductFolder()
    const configPath = folder + "tsconfig.json"
    Disk.writeJson(configPath, forBrowser ? this._getBrowserTsConfig(outputFolder, inputFilePath) : this._getNodeTsConfig(outputFolder, inputFilePath))
    const prom = new Promise((resolve, reject) => {
      exec("tsc", { cwd: folder }, (err, stdout, stderr) => {
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
  _getProductPath(productId) {
    return __dirname + "/../products/" + productId + ".js"
  }
  async _produceBrowserProductFromTypeScript(folder, productId, extraFiles = []) {
    const bundleFilePath = folder + `/${productId}.ts`
    this._bundleBrowserTypeScriptFilesIntoOneTypeScriptFile(this._getFilesForProduction(folder, extraFiles, productId), folder, bundleFilePath)
    try {
      await this._buildBrowserTsc(folder, bundleFilePath)
    } catch (err) {
      console.log(err)
    }
    this._prettifyFile(this._getProductPath(productId))
  }
  _getFilesForProduction(folder, files, productId) {
    return files
      .concat(recursiveReadSync(folder))
      .filter(file => file.includes(".ts"))
      .filter(file => Disk.read(file).includes(`//tooling product ${productId}.js`))
  }
  _makeExecutable(file) {
    Disk.makeExecutable(file)
  }
  _getProductFolder() {
    return __dirname
  }
  async _produceNodeProductFromTypeScript(folder, extraFiles, productId, transformFn) {
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
  _readJson(path) {
    return JSON.parse(this._read(path))
  }
  _writeJson(path, obj) {
    this._write(path, JSON.stringify(obj, null, 2))
  }
  _updatePackageJson(packagePath, newVersion) {
    const packageJson = this._readJson(packagePath)
    packageJson.version = newVersion
    this._writeJson(packagePath, packageJson)
    console.log(`Updated ${packagePath} to ${newVersion}`)
  }
  _read(path) {
    const fs = this.require("fs")
    return fs.readFileSync(path, "utf8")
  }
  _mochaTest(filepath) {
    const reporter = require("tap-mocha-reporter")
    const proc = exec(`${filepath} _test`)
    proc.stdout.pipe(reporter("dot"))
    proc.stderr.on("data", data => console.error("stderr: " + data.toString()))
  }
  _write(path, str) {
    const fs = this.require("fs")
    return fs.writeFileSync(path, str, "utf8")
  }
  _checkGrammarFile(grammarPath) {
    // todo: test both with grammar.grammar and hard coded grammar program (eventually the latter should be generated from the former).
    const testTree = {}
    testTree[`hardCodedGrammarCheckOf${grammarPath}`] = equal => {
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
    testTree[`grammarGrammarCheckOf${grammarPath}`] = equal => {
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
  _getPartialMatches(commandName) {
    return this._getAllCommands().filter(item => item.startsWith(commandName))
  }
  _main() {
    const action = process.argv[2]
    const paramOne = process.argv[3]
    const paramTwo = process.argv[4]
    const print = console.log
    const builder = this
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

module.exports = { AbstractBuilder }
