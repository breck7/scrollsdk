var _a
const fs = require("fs")
const path = require("path")
const { TreeNode } = require("./TreeNode.js")
const { Utils } = require("./Utils.js")
const { HandGrammarProgram } = require("./GrammarLanguage.js")
var CompileTarget
;(function(CompileTarget) {
  CompileTarget["nodejs"] = "nodejs"
  CompileTarget["browser"] = "browser"
})(CompileTarget || (CompileTarget = {}))
class GrammarCompiler {
  static compileGrammarForNodeJs(pathToGrammar, outputFolder, usePrettier = true, pathToJtree = path.join(__dirname, "..", "index.js")) {
    return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.nodejs, usePrettier, pathToJtree)
  }
  static _compileGrammar(pathToGrammar, outputFolder, target, usePrettier, pathToJtree) {
    const isNodeJs = CompileTarget.nodejs === target
    const grammarCode = TreeNode.fromDisk(pathToGrammar)
    const program = new HandGrammarProgram(grammarCode.toString())
    const outputFilePath = path.join(outputFolder, `${program.getGrammarName()}.${target}.js`)
    let result = isNodeJs ? program.toNodeJsJavascript(pathToJtree) : program.toBrowserJavascript()
    if (isNodeJs)
      result =
        "#! /usr/bin/env node\n" +
        result.replace(
          /}\s*$/,
          `
if (!module.parent) new ${program.getRootNodeTypeId()}(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
`
        )
    if (usePrettier) result = require("prettier").format(result, { semi: false, parser: "babel", printWidth: 160 })
    fs.writeFileSync(outputFilePath, result, "utf8")
    if (isNodeJs) fs.chmodSync(outputFilePath, 0o755)
    return outputFilePath
  }
  static compileGrammarForBrowser(pathToGrammar, outputFolder, usePrettier = true) {
    return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.browser, usePrettier)
  }
}
_a = GrammarCompiler
GrammarCompiler.compileGrammarAndCreateProgram = (programPath, grammarPath) => {
  // tod: remove?
  const programConstructor = _a.compileGrammarFileAtPathAndReturnRootConstructor(grammarPath)
  return new programConstructor(fs.readFileSync(programPath, "utf8"))
}
GrammarCompiler.formatCode = (programCode, grammarPath) => {
  // tod: remove?
  const programConstructor = _a.compileGrammarFileAtPathAndReturnRootConstructor(grammarPath)
  const program = new programConstructor(programCode)
  return program.format().toString()
}
GrammarCompiler.formatFileInPlace = (programPath, grammarPath) => {
  // tod: remove?
  const original = TreeNode.fromDisk(programPath)
  const formatted = _a.formatCode(original.toString(), grammarPath)
  if (original === formatted) return false
  new TreeNode(formatted).toDisk(programPath)
  return true
}
GrammarCompiler.compileGrammarFileAtPathAndReturnRootConstructor = grammarPath => {
  // todo: remove
  if (!fs.existsSync(grammarPath)) throw new Error(`Grammar file does not exist: ${grammarPath}`)
  const grammarCode = fs.readFileSync(grammarPath, "utf8")
  const grammarProgram = new HandGrammarProgram(grammarCode)
  return grammarProgram.compileAndReturnRootConstructor()
}
GrammarCompiler.combineFiles = globPatterns => {
  const glob = require("glob")
  const files = Utils.flatten(globPatterns.map(pattern => glob.sync(pattern)))
  const content = files.map(path => fs.readFileSync(path, "utf8")).join("\n")
  return new TreeNode(content)
}

module.exports = { GrammarCompiler }
