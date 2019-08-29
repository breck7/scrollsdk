"use strict"
//tooling product jtree.node.js
//tooling product jtree.browser.js
//tooling product commandLineApp.node.js
//tooling product treeBase.node.js
//tooling product SandboxServer.node.js
//tooling product core.test.browser.js
//tooling product abstractBuilder.node.js
//tooling product TreeComponentFramework.browser.js
//tooling product TreeComponentFramework.node.js
Object.defineProperty(exports, "__esModule", { value: true })
//tooling product treeBase.node.js
//tooling product abstractBuilder.node.js
const fs = require("fs")
class Disk {}
Disk.getTreeNode = () => require("../products/jtree.node.js").TreeNode // todo: cleanup
Disk.rm = path => fs.unlinkSync(path)
Disk.getCleanedString = str => str.replace(/[\,\t\n]/g, " ")
Disk.makeExecutable = path => fs.chmodSync(path, 0o755)
Disk.strCount = (str, reg) => (str.match(new RegExp(reg, "gi")) || []).length
Disk.read = path => fs.readFileSync(path, "utf8")
Disk.touch = path => (Disk.exists(path) ? true : Disk.write(path, ""))
Disk.mkdir = path => require("mkdirp").sync(path)
Disk.getRecursive = path => require("recursive-readdir-sync")(path)
Disk.readJson = path => JSON.parse(Disk.read(path))
Disk.getFileNameWithoutExtension = path => Disk.getFileName(path).replace(/\.[^\.]+$/, "")
Disk.write = (path, content) => fs.writeFileSync(path, content, "utf8")
Disk.writeJson = (path, content) => fs.writeFileSync(path, JSON.stringify(content, null, 2), "utf8")
Disk.exists = path => fs.existsSync(path)
Disk.dir = dir => fs.readdirSync(dir).filter(file => file !== ".DS_Store")
Disk.getFullPaths = dir => Disk.dir(dir).map(file => dir.replace(/\/$/, "") + "/" + file)
Disk.getFiles = dir => Disk.getFullPaths(dir).filter(file => fs.statSync(file).isFile())
Disk.getFolders = dir => Disk.getFullPaths(dir).filter(file => fs.statSync(file).isDirectory())
Disk.getFileName = path => path.split("/").pop()
Disk.append = (path, content) => fs.appendFileSync(path, content, "utf8")
Disk.readCsvAsTree = path => Disk.getTreeNode().fromCsv(Disk.read(path))
Disk.readSsvAsTree = path => Disk.getTreeNode().fromSsv(Disk.read(path))
Disk.readTsvAsTree = path => Disk.getTreeNode().fromTsv(Disk.read(path))
Disk.insertIntoFile = (path, content, delimiter) => Disk.write(path, Disk.stickBetween(content, Disk.read(path), delimiter))
Disk.detectAndReadAsTree = path => Disk.detectDelimiterAndReadAsTree(Disk.read(path))
Disk.getAllOf = (node, prop) => node.filter(node => node.getWord(0) === prop)
Disk.getDelimitedChildrenAsTree = (node, delimiter = undefined) => Disk.detectDelimiterAndReadAsTree(node.childrenToString())
Disk.sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
Disk.readTree = path => new (Disk.getTreeNode())(Disk.read(path))
Disk.sizeOf = path => fs.statSync(path).size
Disk.stripHtml = text => (text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text)
Disk.stripParentheticals = text => (text && text.replace ? text.replace(/\((?:.|\n)*?\)/gm, "") : text)
Disk.escape = str => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
Disk.hasLine = (path, line) => Disk.read(path).includes(line)
Disk.mv = (source, dest) => {
  if (Disk.exists(dest) && false) {
    console.log(`${dest} exists. Skipping`)
  } else {
    Disk.write(dest, Disk.read(source))
    Disk.rm(source)
  }
}
Disk.stickBetween = (content, dest, delimiter) => {
  const parts = dest.split(delimiter)
  return [parts[0], content, parts[2]].join(delimiter)
}
// todo: move to tree base class
Disk.detectDelimiterAndReadAsTree = str => {
  const line1 = str.split("\n")[0]
  const TreeNode = Disk.getTreeNode()
  if (line1.includes("\t")) return TreeNode.fromTsv(str)
  else if (line1.includes(",")) return TreeNode.fromCsv(str)
  else if (line1.includes("|")) return TreeNode.fromDelimited(str, "|")
  else if (line1.includes(";")) return TreeNode.fromDelimited(str, ";")
  // todo: add more robust. align with choose delimiter
  return TreeNode.fromSsv(str)
}
Disk.deleteDuplicates = (node, prop1, prop2, reverse = false) => {
  const map = {}
  Disk.getAllOf(node, prop1).forEach(node => {
    const val = node.get(prop2)
    console.log(val)
    if (map[val] && reverse) {
      map[val].destroy()
      map[val] = node
    } else if (map[val]) {
      node.destroy()
    } else map[val] = node
  })
}
Disk.getLastFolderName = path => {
  const parts = path.replace(/\/$/, "").split("/")
  const last = parts.pop()
  return fs.statSync(path).isDirectory() ? last : parts.pop()
}
Disk.appendUniqueLine = (path, line) => {
  const file = Disk.read(path)
  if (file.match(new RegExp("^" + Disk.escape(line), "m"))) return true
  const prefix = !file || file.endsWith("\n") ? "" : "\n"
  return Disk.append(path, prefix + line + "\n")
}
Disk.move = (node, newPosition) => {
  node.getParent().insertLineAndChildren(node.getLine(), node.childrenToString(), newPosition)
  node.destroy()
}
Disk._getTextUrl = async url => {
  // todo: https://visionmedia.github.io/superagent/
  // build well tested version of this.
  // have a mock server returning with all sorts of things.
  const res = await Disk.getUrl(url)
  // todo: leave it up to user to specfiy text ro body
  return res.body || res.text || ""
}
Disk.getUrl = async url => {
  const superagent = require("superagent")
  const agent = superagent.agent()
  const res = await agent.get(url)
  return res
}
Disk.download = async (url, destination) => {
  const result = await Disk._getTextUrl(url)
  Disk.write(destination, result)
}
Disk.downloadPlain = async (url, destination) => {
  const result = await Disk.getUrl(url)
  Disk.write(destination, result.text)
}
Disk.downloadJson = async (url, destination) => {
  const result = await Disk._getTextUrl(url)
  if (destination) Disk.writeJson(destination, result)
  return result
}
Disk.buildMapFrom = (tree, key, value) => {
  const map = {}
  tree.forEach(child => {
    map[child.get(key)] = child.get(value)
  })
  return map
}
Disk.csvToMap = (path, columnName) => {
  const tree = Disk.readCsvAsTree(path)
  const map = {}
  tree.forEach(child => {
    const key = child.get(columnName)
    map[key] = child.toObject()
  })
  return map
}
//tooling product abstractBuilder.node.js
const { exec, execSync } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")
const jtree = require("../products/jtree.node.js")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
class AbstractBuilder extends jtree.TreeNode {
  _bundleBrowserTypeScriptFilesIntoOneTypeScriptFile(typeScriptSrcFiles, folder) {
    const outputFilePath = folder + `/combined.browser.temp.ts`
    this._write(outputFilePath, this._combineTypeScriptFilesForBrowser(this._getOrderedTypeScriptFiles(typeScriptSrcFiles, outputFilePath)))
  }
  _getNodeTsConfig(outDir = "") {
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
      include: ["combined.node.temp.ts"]
    }
  }
  _getBrowserTsConfig(outDir = "") {
    return {
      compilerOptions: {
        outDir: outDir,
        lib: ["es2017", "dom"],
        moduleResolution: "node",
        noImplicitAny: true,
        declaration: false,
        target: "es2017"
      },
      include: ["combined.browser.temp.ts"]
    }
  }
  _bundleNodeTypeScriptFilesIntoOne(typeScriptSrcFiles, folder) {
    const outputFilePath = folder + `/combined.node.temp.ts`
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
    this._write(outputFilePath + ".project", projectCode.toString()) // Write to disk to inspect if something goes wrong.
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
  async _buildBrowserTsc(folder) {
    return this._buildTsc(folder, true)
  }
  async _buildTsc(folder, forBrowser = false) {
    const outputFolder = this._getProductFolder()
    const configPath = folder + "tsconfig.json"
    Disk.writeJson(configPath, forBrowser ? this._getBrowserTsConfig(outputFolder) : this._getNodeTsConfig(outputFolder))
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
    this._bundleBrowserTypeScriptFilesIntoOneTypeScriptFile(this._getFilesForProduction(folder, extraFiles, productId), folder)
    try {
      await this._buildBrowserTsc(folder)
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
    const files = this._getFilesForProduction(folder, extraFiles, productId)
    this._bundleNodeTypeScriptFilesIntoOne(files, folder)
    const outputFilePath = this._getProductPath(productId)
    try {
      this._buildTsc(folder, false)
      execSync("tsc", { cwd: folder, encoding: "utf8" })
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
