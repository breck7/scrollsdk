#!/usr/bin/env ts-node

const { exec } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")

const { jtree } = require("./index.js")
const { TypeScriptRewriter } = require("./products/TypeScriptRewriter.js")
const { AbstractBuilder } = require("./products/AbstractBuilder.node.js")
const { Disk } = require("./products/Disk.node.js")

import { treeNotationTypes } from "./products/treeNotationTypes"

class Builder extends AbstractBuilder {
  produce(outputFileName: string) {
    if (outputFileName)
      return this.produceProductFromInstructionsTree(
        this._getProductsTree()
          .where("outputFileName", "=", outputFileName)
          .nodeAt(0),
        __dirname
      )

    console.log(
      "Available options:\n" +
        this._getProductsTree()
          .getColumn("outputFileName")
          .join("\n")
    )
  }

  produceAll() {
    this._getProductsTree().forEach((node: any) => {
      this.produceProductFromInstructionsTree(node, __dirname)
    })
  }

  produceLang(langName: string) {
    jtree.compileGrammarForBrowser(`${__dirname}/langs/${langName}/${langName}.grammar`, this._getProductFolder(), true)
    jtree.compileGrammarForNodeJs(`${__dirname}/langs/${langName}/${langName}.grammar`, this._getProductFolder(), true, "../index.js")
  }

  private _getProductsTree() {
    return jtree.TreeNode.fromDisk(__dirname + "/products.tree")
  }

  buildJibJab() {
    const combined = jtree.combineFiles([__dirname + "/langs/jibberish/jibberish.grammar", __dirname + "/langs/jibjab/jibjab.gram"])
    combined.delete("tooling")
    const path = __dirname + "/langs/jibjab/jibjab.grammar"
    combined.toDisk(path)
    jtree.formatFileInPlace(path, __dirname + "/langs/grammar/grammar.grammar")
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
    console.log("Don't forget to update releaseNotes.scroll!")
  }

  startServer() {
    this._startServer(9999, __dirname + "/")
  }

  _makeTestTreeForFolder(dir: treeNotationTypes.absoluteFolderPath) {
    const allTestFiles = <string[]>recursiveReadSync(dir)
    const swarm = require("./products/swarm.nodejs.js")

    const fileTestTree: any = {}

    allTestFiles
      .filter(file => file.endsWith(".grammar"))
      .forEach(file => {
        fileTestTree[file] = this.makeGrammarFileTestTree(file)
      })

    allTestFiles
      .filter(file => file.endsWith(".test.js") || file.endsWith(".test.ts"))
      .forEach(file => {
        fileTestTree[file] = require(file).testTree
      })

    allTestFiles
      .filter(file => file.endsWith(".swarm"))
      .forEach(file => {
        Object.assign(fileTestTree, new swarm(Disk.read(file)).compileToRacer(file))
      })
    return fileTestTree
  }

  async test() {
    let folders = `jtable
langs
builder
commandLineApp
designer
sandbox
kitchen
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

if (!module.parent) new Builder().main(process.argv[2], process.argv[3], process.argv[4])
