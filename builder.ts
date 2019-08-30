#!/usr/bin/env ts-node

const { exec } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")

const jtree = require("./products/jtree.node.js")
const { TypeScriptRewriter } = require("./products/TypeScriptRewriter.js")
const { AbstractBuilder } = require("./products/AbstractBuilder.node.js")

import treeNotationTypes from "./worldWideTypes/treeNotationTypes"

class Builder extends AbstractBuilder {
  private _getTypesPath() {
    return __dirname + "/worldWideTypes/treeNotationTypes.ts"
  }

  produce(outputFileName: string) {
    if (outputFileName) return this._produce(outputFileName)

    console.log(
      "Available options:\n" +
        this._getProductsTree()
          .getColumn("outputFileName")
          .join("\n")
    )
  }

  produceAll() {
    this._getProductsTree()
      .getColumn("outputFileName")
      .forEach((outputFileName: any) => {
        this._produce(outputFileName)
      })
  }

  produceLangs() {
    jtree.compileGrammarForBrowser(__dirname + "/langs/hakon/hakon.grammar", this._getProductFolder(), true)
    jtree.compileGrammarForBrowser(__dirname + "/langs/stump/stump.grammar", this._getProductFolder(), true)
  }

  private _getProductsTree() {
    return jtree.TreeNode.fromDisk(__dirname + "/products.tree")
  }

  private _produce(outputFileName: string) {
    const tree = this._getProductsTree()
    const productNode = tree.where("outputFileName", "=", outputFileName).nodeAt(0)
    const inputFiles = productNode
      .getNode("files")
      .getWordsFrom(1)
      .map((path: string) => __dirname + "/" + path)
    const firstLine = productNode.get("firstLine") ? productNode.get("firstLine") + "\n" : ""
    if (productNode.getLine() === "browserProduct") this._produceBrowserProductFromTypeScript(inputFiles, outputFileName)
    else
      this._produceNodeProductFromTypeScript(
        inputFiles,
        outputFileName,
        (code: string) => firstLine + code + "\n" + (productNode.get("lastLine") ? productNode.get("lastLine") : "")
      )
    if (productNode.has("executable")) this._makeExecutable(__dirname + "/products/" + outputFileName)
  }

  buildJibJab() {
    const CommandLineApp = require("./products/commandLineApp.node.js")
    const combined = jtree.combineFiles([__dirname + "/langs/jibberish/jibberish.grammar", __dirname + "/langs/jibjab/jibjab.gram"])
    combined.delete("tooling")
    const path = __dirname + "/langs/jibjab/jibjab.grammar"
    combined.toDisk(path)
    new CommandLineApp().prettify(path)
  }

  _getProductFolder() {
    return __dirname + "/products/"
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
