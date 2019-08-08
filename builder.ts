#!/usr/bin/env ts-node

const { exec } = require("child_process")
const recursiveReadSync = require("recursive-readdir-sync")

const jtree = require("./products/jtree.node.js")
const { TypeScriptRewriter } = require("./products/TypeScriptRewriter.js")

import jTreeTypes from "./core/jTreeTypes"
import { AbstractBuilder } from "./builder/AbstractBuilder"

class Builder extends AbstractBuilder {
  async _produceTreeComponentFramework() {
    // todo: Finish
    const path = __dirname + "/treeComponentFramework/"
    this._buildTsc(path)

    this._write(
      __dirname + `/ignore/treeComponentFramework.browser.ts`,
      `"use strict"\n` +
        this._combineTypeScriptFilesForBrowser([
          __dirname + "/treeComponentFramework/TreeComponentFramework.ts",
          __dirname + "/treeComponentFramework/Willow.ts",
          __dirname + "/treeComponentFramework/WillowBrowser.ts"
        ])
    )

    jtree.compileGrammarForBrowser(__dirname + "/langs/stump/stump.grammar", __dirname + "/products/", true)
    jtree.compileGrammarForBrowser(__dirname + "/langs/hakon/hakon.grammar", __dirname + "/products/", true)

    const outputJsFile = __dirname + `/products/treeComponentFramework.browser.js`

    await this._buildBrowserTsc(__dirname)

    // This solves the wierd TS insertin
    // todo: remove
    const file = new TypeScriptRewriter(this._read(outputJsFile))
    this._write(outputJsFile, file.getString())
  }

  produceAll() {
    Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(word => word.startsWith("produce") && word !== "produceAll")
      .forEach(command => {
        ;(<any>this)[command]()
      })
  }

  buildChex() {
    const chexDir = __dirname + "/treeComponentFramework/chex/"
    const chexPath = chexDir + "ChexTreeComponent.js"
    this._write(chexDir + "index.html", new (require(chexPath))().compile())
    this._write(
      __dirname + "/products/ChexTreeComponent.browser.js",
      new TypeScriptRewriter(this._read(chexPath))
        .removeRequires()
        .changeNodeExportsToWindowExports()
        .getString()
    )
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

  produceDesigner() {
    this._produceBrowserProductFromTypeScript(__dirname + "/designer/", "DesignerApp.browser")
  }

  produceSandbox() {
    this._produceBrowserProductFromTypeScript(__dirname + "/sandbox/", "SandboxApp.browser")
    this._produceNodeProductFromTypeScript(
      __dirname + "/sandboxServer/",
      [__dirname + "/core/jTreeTypes.ts", __dirname + "/typeScriptRewriter/TypeScriptRewriter.ts"],
      "SandboxServer.node",
      (code: string) => code + "\nmodule.exports = {SandboxServer}"
    )
  }

  produceCommandLineApp() {
    const file = this._produceNodeProductFromTypeScript(
      __dirname + "/commandLineApp/",
      [__dirname + "/core/jTreeTypes.ts"],
      "commandLineApp.node",
      (code: string) => `#! /usr/bin/env node\n` + code + "\nmodule.exports = CommandLineApp"
    )
    this._makeExecutable(file)
  }

  produceTreeBase() {
    const file = this._produceNodeProductFromTypeScript(
      __dirname + "/treeBase/",
      [__dirname + "/core/jTreeTypes.ts", __dirname + "/core/Disk.node.ts"],
      "treeBase.node",
      (code: string) => code + "\nmodule.exports = {TreeBaseFile, TreeBaseFolder}"
    )
  }

  produceBrowserTests() {
    this._produceBrowserProductFromTypeScript(__dirname + "/coreTests/", "core.test.browser", [__dirname + "/core/jTreeTypes.ts"])
  }

  cover() {
    // todo: fix. should we have some type of arg delimiter? somewhat like infix? splitFix perhaps?
    exec(`tap --cov --coverage-report=lcov ${__filename} test`)
  }

  updateVersion(newVersion: jTreeTypes.semanticVersion) {
    this._updatePackageJson(__dirname + "/package.json", newVersion)
    this._updatePackageJson(__dirname + "/package-lock.json", newVersion)

    const codePath = __dirname + "/core/jtree.ts"
    const code = this._read(codePath).replace(/\"\d+\.\d+\.\d+\"/, `"${newVersion}"`)
    this._write(codePath, code)
    console.log(`Updated ${codePath} to version ${newVersion}`)
    this.produceBrowserLibrary()
    console.log("Don't forget to update releaseNotes.md!")
  }

  test() {
    this._mochaTest(__filename)
  }

  async _testDir(dir: jTreeTypes.absoluteFolderPath) {
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
treeBase`.split("\n")
    //treeComponentFramework` // todo: finish
    for (let folder of folders) {
      await this._testDir(__dirname + `/${folder}/`)
    }
  }
}

export { Builder }

if (!module.parent) new Builder()._main()
