#!/usr/bin/env ts-node

import jTreeTypes from "./core/jTreeTypes"
import jtree from "./core/jtree.node"

import { AbstractBuilder } from "./builder/AbstractBuilder"
import { TestTreeRunner } from "./builder/TestTreeRunner"
import { TypeScriptRewriter } from "./builder/TypeScriptRewriter"

import { exec } from "child_process"

const recursiveReadSync = require("recursive-readdir-sync")

class Builder extends AbstractBuilder {
  produceTreeComponentFramework() {
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
    exec("tsc -p tsconfig.browser.json", { cwd: __dirname + "/treeComponentFramework/" }, (err, stdout, stderr) => {
      if (stderr || err) return console.error(err, stdout, stderr)

      // This solves the wierd TS insertin
      // todo: remove
      const file = new TypeScriptRewriter(this._read(outputJsFile))
      this._write(outputJsFile, file.getString())
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
    const CLI = require("./cli/cli.js")

    const combined = jtree.combineFiles([__dirname + "/langs/jibberish/jibberish.grammar", __dirname + "/langs/jibjab/jibjab.gram"])

    combined.delete("tooling")
    const path = __dirname + "/langs/jibjab/jibjab.grammar"
    combined.toDisk(path)

    new CLI().prettify(path)
  }

  produceBrowserLibrary() {
    this._produceBrowserProductFromTypeScript(__dirname + "/core/", "jtree.browser")
    // this._buildBrowserTestFile()
  }

  produceNodeLibrary() {
    this._produceNodeProductFromTypeScript(__dirname + "/core/", [], "jtree.node", (code: string) => code + "\nmodule.exports = jtreeNode")
  }

  buildBuilder() {
    this._buildTsc(__dirname + "/builder/")
  }

  produceDesigner() {
    this._buildTsc(__dirname + "/designer/")
  }

  produceSandbox() {
    this._buildTsc(__dirname + "/sandbox/")
    this._buildTsc(__dirname + "/sandboxServer/")
  }

  produceCli() {
    const file = this._produceNodeProductFromTypeScript(
      __dirname + "/cli/",
      [__dirname + "/core/jTreeTypes.ts"],
      "cli.node",
      (code: string) => `#! /usr/bin/env node\n` + code + "\nmodule.exports = CLI"
    )
    this._makeExecutable(file)
  }

  produceTreeBase() {
    this._buildTsc(__dirname + "/cli/")
  }

  _buildBrowserTestFile() {
    const testFile = new TypeScriptRewriter(this._read(__dirname + "/tests/base.test.js"))
      .removeRequires()
      .removeHashBang()
      .removeNodeJsOnlyLines()
      .changeNodeExportsToWindowExports()
      .getString()

    this._write(__dirname + "/sandbox/base.tests.es6.js", testFile)
  }

  cover() {
    // todo: fix. should we have some type of arg delimiter? somewhat like infix? splitFix perhaps?
    exec("tap --cov --coverage-report=lcov ./tasks/testAll.js")
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

  _test() {
    const allLangFiles = <string[]>recursiveReadSync(__dirname + "/langs/")
    allLangFiles.filter(file => file.endsWith(".grammar")).forEach(file => this._checkGrammarFile(file))
    allLangFiles.filter(file => file.endsWith(".test.ts")).forEach(file => new TestTreeRunner().run(require(file)))
    allLangFiles.filter(file => file.endsWith(".swarm")).forEach(file => jtree.executeFile(file, __dirname + "/langs/swarm/swarm.grammar"))

    const allTestFiles = <string[]>recursiveReadSync(__dirname + "/tests/")
    allTestFiles.filter(file => file.endsWith(".test.js")).forEach(file => new TestTreeRunner().run(require(file)))
    allTestFiles.filter(file => file.endsWith(".swarm")).forEach(file => jtree.executeFile(file, __dirname + "/langs/swarm/swarm.grammar"))

    const files = <string[]>recursiveReadSync(__dirname + "/treeBase/")

    files.filter(file => file.endsWith(".test.js")).forEach(file => new TestTreeRunner().run(require(file)))

    const tcfFiles = <string[]>recursiveReadSync(__dirname + "/treeComponentFramework/")

    tcfFiles.filter(file => file.endsWith(".test.js")).forEach(file => new TestTreeRunner().run(require(file)))
  }
}

export { Builder }

if (!module.parent) new Builder()._main()
