const abstractJBuild = require("./jbuild/abstractJBuild.js")
const jtree = require("./index.js")

class jbuild extends abstractJBuild {
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
      const file = new abstractJBuild.BrowserScript(this._read(outputJsFile))
      this._write(outputJsFile, file.getString())
    })
  }

  buildChex() {
    const chexDir = __dirname + "/treeComponent/chex/"
    const chexPath = chexDir + "ChexTreeComponent.js"
    this._write(chexDir + "index.html", new (require(chexPath))().compile())
    this._write(
      __dirname + "/built/ChexTreeComponent.browser.js",
      new abstractJBuild.BrowserScript(this._read(chexPath))
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
      const file = new abstractJBuild.BrowserScript(this._read(outputJsFile).replace(/[^\n]*jTreeTypes[^\n]*/g, ""))
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
    const testFile = new abstractJBuild.BrowserScript(this._read(__dirname + "/tests/base.test.js"))
      .removeRequires()
      .removeHashBang()
      .removeNodeJsOnlyLines()
      .changeNodeExportsToWindowExports()
      .getString()

    this._write(__dirname + "/sandbox/base.tests.es6.js", testFile)
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
}

module.exports = jbuild
