const fs = require("fs")

import jtree from "./jtree"
import jTreeTypes from "./jTreeTypes"
import { GrammarProgram, AbstractRuntimeProgramRootNode } from "./GrammarLanguage"
import Upgrader from "./tools/Upgrader"

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

  static makeProgram = (programPath: jTreeTypes.filepath, grammarPath: jTreeTypes.filepath): AbstractRuntimeProgramRootNode => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath)
    return new programConstructor(fs.readFileSync(programPath, "utf8"))
  }

  static compileGrammar(pathToGrammar: jTreeTypes.absoluteFilePath, outputFolder: jTreeTypes.asboluteFolderPath) {
    const grammarCode = jtree.TreeNode.fromDisk(pathToGrammar)
    let name = grammarCode.get("grammar name")
    name = name[0].toUpperCase() + name.slice(1)
    const pathToJtree = __dirname + "/../index.js"
    const outputFilePath = outputFolder + `${name}Language.compiled.js`
    fs.writeFileSync(outputFilePath, new GrammarProgram(grammarCode.toString(), pathToGrammar).toNodeJsJavascriptPrettier(pathToJtree), "utf8")
    // fs.writeFileSync(name + ".expanded.grammar", GrammarProgram._condensedToExpanded(pathToGrammar), "utf8")
    return outputFilePath
  }

  // returns GrammarBackedProgramClass
  static getProgramConstructor = (grammarPath: jTreeTypes.filepath) => {
    const grammarCode = fs.readFileSync(grammarPath, "utf8")
    const grammarProgram = GrammarProgram.newFromCondensed(grammarCode, grammarPath)
    return <any>grammarProgram.getRootConstructor()
  }

  static combineFiles = (globPatterns: jTreeTypes.globPattern[]) => {
    const glob = require("glob")
    const files = (<any>globPatterns.map(pattern => glob.sync(pattern))).flat()
    const content = files.map((path: jTreeTypes.filepath) => fs.readFileSync(path, "utf8")).join("\n")

    return new jtree.TreeNode(content)
  }
}

export default jtreeNode
