#!/usr/bin/env ts-node

const { exec } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")

const { jtree } = require("./index.js")
const { TypeScriptRewriter } = require("./products/TypeScriptRewriter.js")
const { AbstractBuilder } = require("./products/AbstractBuilder.node.js")
const { Disk } = require("./products/Disk.node.js")

import { treeNotationTypes } from "./products/treeNotationTypes"

class Builder extends AbstractBuilder {
  private _getTypesPath() {
    return __dirname + "/products/treeNotationTypes.ts"
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
    const shipped = ["hakon", "dumbdown", "stump", "fire"]
    shipped.forEach(lang => {
      jtree.compileGrammarForBrowser(`${__dirname}/langs/${lang}/${lang}.grammar`, this._getProductFolder(), true)
      jtree.compileGrammarForNodeJs(`${__dirname}/langs/${lang}/${lang}.grammar`, this._getProductFolder(), true)
    })
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
    const lastLine = productNode.get("lastLine") ? productNode.get("lastLine") : ""
    const removeAll = productNode.getNodesByGlobPath("removeAll")
    const transformFn = (code: string) => {
      removeAll.forEach((node: any) => {
        code = jtree.Utils.removeAll(code, node.getContent())
      })
      return firstLine + code + "\n" + lastLine
    }
    if (productNode.getLine() === "browserProduct") this._produceBrowserProductFromTypeScript(inputFiles, outputFileName, transformFn)
    else this._produceNodeProductFromTypeScript(inputFiles, outputFileName, transformFn)
    if (productNode.has("executable")) Disk.makeExecutable(__dirname + "/products/" + outputFileName)
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
    const code = Disk.read(codePath).replace(/\"\d+\.\d+\.\d+\"/, `"${newVersion}"`)
    Disk.write(codePath, code)
    console.log(`Updated ${codePath} to version ${newVersion}`)
    this.produceAll()
    console.log("Don't forget to update releaseNotes.md!")
  }

  _makeTestTreeForFolder(dir: treeNotationTypes.absoluteFolderPath) {
    const allTestFiles = <string[]>recursiveReadSync(dir)

    const testTree: any = {}

    allTestFiles
      .filter(file => file.endsWith(".grammar"))
      .forEach(file => {
        testTree[file] = this.makeGrammarFileTestTree(file)
      })
    allTestFiles
      .filter(file => file.endsWith(".test.js") || file.endsWith(".test.ts"))
      .forEach(file => {
        testTree[file] = require(file).testTree
      })

    // for (let file of allTestFiles.filter(file => file.endsWith(".swarm"))) {
    //   await jtree.executeFile(file, __dirname + "/langs/swarm/swarm.grammar")
    // }
    return testTree
  }

  async test() {
    let folders = `jtable
langs
builder
commandLineApp
designer
sandbox
sandboxServer
core
coreTests
treeBase
treeComponentFramework`.split("\n")
    const fileTree = {}
    folders.forEach(folder => Object.assign(fileTree, this._makeTestTreeForFolder(__dirname + `/${folder}/`)))
    const runner = new jtree.TestRacer(fileTree)
    await runner.execute()
    runner.finish()
  }
}

export { Builder }

if (!module.parent) new Builder()._main()
