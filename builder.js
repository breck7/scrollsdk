#! /usr/bin/env node

const AbstractBuilder = require("./builder/AbstractBuilder.js")
const jtree = require("./index.js")
const exec = require("child_process").exec
const recursiveReadSync = require("recursive-readdir-sync")
const runTestTree = require("./builder/testTreeRunner.js")

class Builder extends AbstractBuilder {
  buildTreeComponentFramework() {
    const path = __dirname + "/treeComponent/"
    this._buildTsc(path)

    this._write(
      __dirname + `/ignore/treeComponentFramework.browser.ts`,
      `"use strict"\n` +
        this._combineTypeScriptFiles([
          __dirname + "/treeComponent/TreeComponentFramework.ts",
          __dirname + "/treeComponent/willow/Willow.ts",
          __dirname + "/treeComponent/willow/WillowBrowser.ts"
        ])
    )

    jtree.compileGrammarForBrowser(__dirname + "/langs/stump/stump.grammar", __dirname + "/built/", true)
    jtree.compileGrammarForBrowser(__dirname + "/langs/hakon/hakon.grammar", __dirname + "/built/", true)

    const outputJsFile = __dirname + `/built/treeComponentFramework.browser.js`
    exec("tsc -p tsconfig.browser.json", { cwd: __dirname + "/treeComponent/" }, (err, stdout, stderr) => {
      if (stderr || err) return console.error(err, stdout, stderr)

      // This solves the wierd TS insertin
      // todo: remove
      const file = new AbstractBuilder.BrowserScript(this._read(outputJsFile))
      this._write(outputJsFile, file.getString())
    })
  }

  buildChex() {
    const chexDir = __dirname + "/treeComponent/chex/"
    const chexPath = chexDir + "ChexTreeComponent.js"
    this._write(chexDir + "index.html", new (require(chexPath))().compile())
    this._write(
      __dirname + "/built/ChexTreeComponent.browser.js",
      new AbstractBuilder.BrowserScript(this._read(chexPath))
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

  buildBrowserVersion() {
    // Compile regular version to make sure no errors:
    const path = __dirname + "/src"
    this._buildBrowserVersionFromTypeScriptFiles(
      path,
      recursiveReadSync(__dirname + "/src").filter(file => file.includes(".ts")),
      __dirname + `/built/jtree.browser.js`,
      __dirname + `/ignore/jtree.browser.ts`
    )

    this._buildBrowserTestFile()
  }

  _buildNodeVersion() {
    this._buildTsc(__dirname + "/")
  }

  buildBuilder() {
    this._buildTsc(__dirname + "/builder/")
  }

  buildCli() {
    this._buildTsc(__dirname + "/cli/")
  }

  _buildBrowserTestFile() {
    const testFile = new AbstractBuilder.BrowserScript(this._read(__dirname + "/tests/base.test.js"))
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

  updateVersion(newVersion) {
    this._updatePackageJson(__dirname + "/package.json", newVersion)
    this._updatePackageJson(__dirname + "/package-lock.json", newVersion)

    const codePath = __dirname + "/src/jtree.ts"
    const code = this._read(codePath).replace(/\"\d+\.\d+\.\d+\"/, `"${newVersion}"`)
    this._write(codePath, code)
    console.log(`Updated ${codePath} to version ${newVersion}`)
    this.buildBrowserVersion()
    console.log("Don't forget to update releaseNotes.md!")
  }

  test() {
    this._mochaTest(__filename)
  }

  _test() {
    const allLangFiles = recursiveReadSync(__dirname + "/langs/")
    allLangFiles.filter(file => file.endsWith(".grammar")).forEach(file => this._checkGrammarFile(file))
    allLangFiles.filter(file => file.endsWith(".test.js")).forEach(file => runTestTree(require(file)))
    allLangFiles.filter(file => file.endsWith(".swarm")).forEach(file => jtree.executeFile(file, __dirname + "/langs/swarm/swarm.grammar"))

    const allTestFiles = recursiveReadSync(__dirname + "/tests/")
    allTestFiles.filter(file => file.endsWith(".test.js")).forEach(file => runTestTree(require(file)))
    allTestFiles.filter(file => file.endsWith(".swarm")).forEach(file => jtree.executeFile(file, __dirname + "/langs/swarm/swarm.grammar"))

    recursiveReadSync(__dirname + "/treeBase/")
      .filter(file => file.endsWith(".test.js"))
      .forEach(file => runTestTree(require(file)))

    recursiveReadSync(__dirname + "/treeComponent/")
      .filter(file => file.endsWith(".test.js"))
      .forEach(file => runTestTree(require(file)))
  }
}

module.exports = Builder

if (!module.parent) new Builder()._main()
