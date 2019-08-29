#!/usr/bin/env ts-node

const { exec } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")

const jtree = require("./products/jtree.node.js")
const { TypeScriptRewriter } = require("./products/TypeScriptRewriter.js")
const { AbstractBuilder } = require("./products/AbstractBuilder.node.js")

import treeNotationTypes from "./worldWideTypes/treeNotationTypes"

class Builder extends AbstractBuilder {
  produceTreeComponentFramework() {
    this._produceBrowserProductFromTypeScript(__dirname + "/treeComponentFramework/", "TreeComponentFramework.browser", [this._getTypesPath()])
    this._produceNodeProductFromTypeScript(
      __dirname + "/treeComponentFramework/",
      [this._getTypesPath()],
      "TreeComponentFramework.node",
      (code: string) => code + "\nmodule.exports = { AbstractTreeComponentRootNode, AbstractTreeComponent, AbstractCommander }"
    )
  }

  private _getTypesPath() {
    return __dirname + "/worldWideTypes/treeNotationTypes.ts"
  }

  produceAll() {
    Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(word => word.startsWith("produce") && word !== "produceAll")
      .forEach(command => {
        ;(<any>this)[command]()
      })
  }

  produceLangs() {
    jtree.compileGrammarForBrowser(__dirname + "/langs/hakon/hakon.grammar", this._getProductFolder(), true)
    jtree.compileGrammarForBrowser(__dirname + "/langs/stump/stump.grammar", this._getProductFolder(), true)
  }

  produceSweeperCraft() {
    this._produceBrowserProductFromTypeScript(__dirname + "/treeComponentFramework/sweepercraft/", "SweeperCraft.browser")
  }

  buildJibJab() {
    const CommandLineApp = require("./commandLineApp/commandLineApp.js")

    const combined = jtree.combineFiles([__dirname + "/langs/jibberish/jibberish.grammar", __dirname + "/langs/jibjab/jibjab.gram"])

    combined.delete("tooling")
    const path = __dirname + "/langs/jibjab/jibjab.grammar"
    combined.toDisk(path)

    new CommandLineApp().prettify(path)
  }

  produceBrowserLibrary() {
    this._produceBrowserProductFromTypeScript(__dirname + "/core/", "jtree.browser")
  }

  produceNodeLibrary() {
    this._produceNodeProductFromTypeScript(__dirname + "/core/", [], "jtree.node", (code: string) => code + "\nmodule.exports = jtreeNode")
  }

  produceNodeDisk() {
    this._produceNodeProductFromTypeScript(__dirname + "/disk/", [], "Disk.node", (code: string) => code + "\nmodule.exports = {Disk}")
  }

  produceDesigner() {
    this._produceBrowserProductFromTypeScript(__dirname + "/designer/", "DesignerApp.browser")
  }

  produceSandbox() {
    this._produceBrowserProductFromTypeScript(__dirname + "/sandbox/", "SandboxApp.browser")
    this._produceNodeProductFromTypeScript(
      __dirname + "/sandboxServer/",
      [this._getTypesPath(), __dirname + "/typeScriptRewriter/TypeScriptRewriter.ts"],
      "SandboxServer.node",
      (code: string) => code + "\nmodule.exports = {SandboxServer}"
    )
  }

  produceCommandLineApp() {
    const file = this._produceNodeProductFromTypeScript(
      __dirname + "/commandLineApp/",
      [this._getTypesPath()],
      "commandLineApp.node",
      (code: string) => `#! /usr/bin/env node\n` + code + "\nmodule.exports = CommandLineApp"
    )
    this._makeExecutable(file)
  }

  produceTreeBase() {
    const file = this._produceNodeProductFromTypeScript(
      __dirname + "/treeBase/",
      [this._getTypesPath()],
      "treeBase.node",
      (code: string) => code + "\nmodule.exports = {TreeBaseFile, TreeBaseFolder}"
    )
  }

  _getProductFolder() {
    return __dirname + "/products/"
  }

  produceBuilder() {
    const file = this._produceNodeProductFromTypeScript(
      __dirname + "/builder/",
      [this._getTypesPath()],
      "AbstractBuilder.node",
      (code: string) => code + "\nmodule.exports = {AbstractBuilder}"
    )
  }

  produceBrowserTests() {
    this._produceBrowserProductFromTypeScript(__dirname + "/coreTests/", "core.test.browser", [this._getTypesPath()])
  }

  cover() {
    // todo: fix. should we have some type of arg delimiter? somewhat like infix? splitFix perhaps?
    exec(`tap --cov --coverage-report=lcov ${__filename} test`)
  }

  updateVersion(newVersion: treeNotationTypes.semanticVersion) {
    this._updatePackageJson(__dirname + "/package.json", newVersion)
    this._updatePackageJson(__dirname + "/package-lock.json", newVersion)

    const codePath = __dirname + "/core/TreeNode.ts"
    const code = this._read(codePath).replace(/\"\d+\.\d+\.\d+\"/, `"${newVersion}"`)
    this._write(codePath, code)
    console.log(`Updated ${codePath} to version ${newVersion}`)
    this.produceBrowserLibrary()
    console.log("Don't forget to update releaseNotes.md!")
  }

  test() {
    this._mochaTest(__filename)
  }

  async _testDir(dir: treeNotationTypes.absoluteFolderPath) {
    const allTestFiles = <string[]>recursiveReadSync(dir)
    allTestFiles.filter(file => file.endsWith(".grammar")).forEach(file => this._checkGrammarFile(file))

    for (let file of allTestFiles.filter(file => file.endsWith(".test.js"))) {
      await jtree.Utils.runTestTree(require(file))
    }

    for (let file of allTestFiles.filter(file => file.endsWith(".test.ts"))) {
      await jtree.Utils.runTestTree(require(file).testTree)
    }

    for (let file of allTestFiles.filter(file => file.endsWith(".swarm"))) {
      await jtree.executeFile(file, __dirname + "/langs/swarm/swarm.grammar")
    }
  }

  async _test() {
    let folders = `langs
builder
commandLineApp
designer
sandbox
sandboxServer
core
coreTests
treeBase`.split("\n") // treeComponentFramework
    for (let folder of folders) {
      await this._testDir(__dirname + `/${folder}/`)
    }
  }
}

export { Builder }

if (!module.parent) new Builder()._main()
