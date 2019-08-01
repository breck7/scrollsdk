#! /usr/bin/env node

const AbstractBuilder = require("./builder/AbstractBuilder.js")
const jtree = require("./index.js")

class Builder extends AbstractBuilder {
  buildTreeComponentFramework() {
    const exec = this.require("exec")
    const execOptions = { cwd: __dirname + "/treeComponent/" }
    exec("tsc", execOptions)

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
    exec("tsc -p tsconfig.browser.json", execOptions, (err, stdout, stderr) => {
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
    const recursiveReadSync = this.require("recursive-readdir-sync")
    const exec = this.require("child_process").exec
    const execOptions = { cwd: __dirname + "/" }
    // Compile regular version to make sure no errors:
    this._buildNodeVersion()

    this._bundleBrowserTypeScriptFilesIntoOne(
      recursiveReadSync(__dirname + "/src").filter(file => file.includes(".ts")),
      __dirname + `/ignore/jtree.browser.ts`
    )

    const outputJsFile = __dirname + `/built/jtree.browser.js`
    exec("tsc -p tsconfig.browser.json", execOptions, (err, stdout, stderr) => {
      if (stderr || err) return console.error(err, stdout, stderr)

      // This solves the wierd TS insertin
      // todo: remove
      const file = new AbstractBuilder.BrowserScript(this._read(outputJsFile).replace(/[^\n]*jTreeTypes[^\n]*/g, ""))
      this._write(outputJsFile, file.getString())
    })

    this._buildBrowserTestFile()
  }

  _buildNodeVersion() {
    const execOptions = { cwd: __dirname + "/" }
    // Compile regular version to make sure no errors:
    const exec = this.require("child_process").exec
    exec("tsc", execOptions)
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
    const exec = this.require("child_process").exec
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
    const reporter = require("tap-mocha-reporter")
    const exec = require("child_process").exec

    const proc = exec("node " + __dirname + "/builder.js _test")

    proc.stdout.pipe(reporter("dot"))
    proc.stderr.on("data", data => console.error("stderr: " + data.toString()))
  }

  _test() {
    const jtree = require("./index.js")
    const fs = require("fs")
    const recursiveReadSync = require("recursive-readdir-sync")
    const runTestTree = require("./builder/testTreeRunner.js")

    // todo: test both with grammar.grammar and hard coded grammar program (eventually the latter should be generated from the former).
    const checkGrammarFile = grammarPath => {
      const testTree = {}
      testTree[`hardCodedGrammarCheckOf${grammarPath}`] = equal => {
        // Arrange/Act
        const program = new jtree.GrammarProgram(fs.readFileSync(grammarPath, "utf8"))
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
        const program = jtree.makeProgram(grammarPath, __dirname + "/langs/grammar/grammar.grammar")
        const errs = program.getAllErrors()

        //Assert

        equal(errs.length, 0, "should be no errors")
        if (errs.length) console.log(errs.join("\n"))
      }

      runTestTree(testTree)
    }

    const allLangFiles = recursiveReadSync(__dirname + "/langs/")
    allLangFiles.filter(file => file.endsWith(".grammar")).forEach(checkGrammarFile)
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
