const fs = require("fs")

import jtree from "./jtree"
import jTreeTypes from "./jTreeTypes"
import { GrammarProgram, GrammarBackedRootNode } from "./GrammarLanguage"
import Upgrader from "./tools/Upgrader"

enum CompileTarget {
  nodejs = "nodejs",
  browser = "browser"
}

class jtreeNode extends jtree {
  static Upgrader = Upgrader

  static executeFile = (programPath: jTreeTypes.filepath, grammarPath: jTreeTypes.filepath): Promise<any> =>
    jtreeNode.makeProgram(programPath, grammarPath).execute(programPath)

  static executeFiles = (programPaths: jTreeTypes.filepath[], grammarPath: jTreeTypes.filepath): Promise<any>[] => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath)
    return programPaths.map(programPath => new programConstructor(fs.readFileSync(programPath, "utf8")).execute(programPath))
  }

  static executeFileSync = (programPath: jTreeTypes.filepath, grammarPath: jTreeTypes.filepath): any =>
    jtreeNode.makeProgram(programPath, grammarPath).executeSync(programPath)

  static makeProgram = (programPath: jTreeTypes.filepath, grammarPath: jTreeTypes.filepath): GrammarBackedRootNode => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath)
    return new programConstructor(fs.readFileSync(programPath, "utf8"))
  }

  static compileGrammarForNodeJs(pathToGrammar: jTreeTypes.absoluteFilePath, outputFolder: jTreeTypes.asboluteFolderPath, usePrettier = true) {
    return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.nodejs, usePrettier)
  }

  private static _compileGrammar(
    pathToGrammar: jTreeTypes.absoluteFilePath,
    outputFolder: jTreeTypes.asboluteFolderPath,
    target: CompileTarget,
    usePrettier: boolean
  ) {
    const grammarCode = jtree.TreeNode.fromDisk(pathToGrammar)
    const program = new GrammarProgram(grammarCode.toString(), pathToGrammar)
    let name = program.getGrammarName()
    const pathToJtree = __dirname + "/../index.js"
    const outputFilePath = outputFolder + `${name}.${target}.js`

    let result = target === CompileTarget.nodejs ? program.toNodeJsJavascript(pathToJtree) : program.toBrowserJavascript()

    if (usePrettier) result = require("prettier").format(result, { semi: false, parser: "babel", printWidth: 160 })

    fs.writeFileSync(outputFilePath, result, "utf8")
    return outputFilePath
  }

  static compileGrammarForBrowser(pathToGrammar: jTreeTypes.absoluteFilePath, outputFolder: jTreeTypes.asboluteFolderPath, usePrettier = true) {
    return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.browser, usePrettier)
  }

  // returns GrammarBackedProgramClass
  static getProgramConstructor = (grammarPath: jTreeTypes.filepath) => {
    const grammarCode = fs.readFileSync(grammarPath, "utf8")
    const grammarProgram = new GrammarProgram(grammarCode, grammarPath)
    return <any>grammarProgram.getRootConstructor()
  }

  static combineFiles = (globPatterns: jTreeTypes.globPattern[]) => {
    const glob = require("glob")
    const files = jtree.Utils.flatten(<any>globPatterns.map(pattern => glob.sync(pattern)))
    const content = files.map((path: jTreeTypes.filepath) => fs.readFileSync(path, "utf8")).join("\n")

    return new jtree.TreeNode(content)
  }
}

export default jtreeNode
