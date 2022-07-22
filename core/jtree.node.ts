const fs = require("fs")
const path = require("path")

import { jtree } from "./jtree"
import { treeNotationTypes } from "../products/treeNotationTypes"
import { HandGrammarProgram, GrammarBackedNode } from "./GrammarLanguage"
import { Upgrader } from "./Upgrader"

enum CompileTarget {
  nodejs = "nodejs",
  browser = "browser"
}

class jtreeNode extends jtree {
  static Upgrader = Upgrader

  static compileGrammarAndCreateProgram = (programPath: treeNotationTypes.filepath, grammarPath: treeNotationTypes.filepath): GrammarBackedNode => {
    // tod: remove?
    const programConstructor = jtreeNode.compileGrammarFileAtPathAndReturnRootConstructor(grammarPath)
    return new programConstructor(fs.readFileSync(programPath, "utf8"))
  }

  static compileGrammarForNodeJs(pathToGrammar: treeNotationTypes.absoluteFilePath, outputFolder: treeNotationTypes.absoluteFolderPath, usePrettier = true, pathToJtree = path.join(__dirname, "..", "index.js")) {
    return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.nodejs, usePrettier, pathToJtree)
  }

  static formatCode = (programCode: string, grammarPath: treeNotationTypes.filepath): GrammarBackedNode => {
    // tod: remove?
    const programConstructor = jtreeNode.compileGrammarFileAtPathAndReturnRootConstructor(grammarPath)
    const program = new programConstructor(programCode)
    return program.format().toString()
  }

  static formatFileInPlace = (programPath: treeNotationTypes.filepath, grammarPath: treeNotationTypes.filepath) => {
    // tod: remove?
    const original = jtree.TreeNode.fromDisk(programPath)
    const formatted = jtreeNode.formatCode(original.toString(), grammarPath)
    if (original === formatted) return false
    new jtree.TreeNode(formatted).toDisk(programPath)
    return true
  }

  private static _compileGrammar(pathToGrammar: treeNotationTypes.absoluteFilePath, outputFolder: treeNotationTypes.absoluteFolderPath, target: CompileTarget, usePrettier: boolean, pathToJtree?: treeNotationTypes.requirePath) {
    const isNodeJs = CompileTarget.nodejs === target
    const grammarCode = jtree.TreeNode.fromDisk(pathToGrammar)
    const program = new HandGrammarProgram(grammarCode.toString())
    const outputFilePath = outputFolder + `${program.getGrammarName()}.${target}.js`

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

  static compileGrammarForBrowser(pathToGrammar: treeNotationTypes.absoluteFilePath, outputFolder: treeNotationTypes.absoluteFolderPath, usePrettier = true) {
    return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.browser, usePrettier)
  }

  static compileGrammarFileAtPathAndReturnRootConstructor = (grammarPath: treeNotationTypes.filepath) => {
    // todo: remove
    if (!fs.existsSync(grammarPath)) throw new Error(`Grammar file does not exist: ${grammarPath}`)
    const grammarCode = fs.readFileSync(grammarPath, "utf8")
    const grammarProgram = new HandGrammarProgram(grammarCode)
    return <any>grammarProgram.compileAndReturnRootConstructor()
  }

  static combineFiles = (globPatterns: treeNotationTypes.globPattern[]) => {
    const glob = require("glob")
    const files = jtree.Utils.flatten(<any>globPatterns.map(pattern => glob.sync(pattern)))
    const content = files.map((path: treeNotationTypes.filepath) => fs.readFileSync(path, "utf8")).join("\n")

    return new jtree.TreeNode(content)
  }
}

export { jtreeNode }
