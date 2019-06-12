const fs = require("fs")

import jtree from "./jtree"
import jTreeTypes from "./jTreeTypes"
import { GrammarProgram } from "./grammar/NodeDefinitionNodes"
import { AbstractRuntimeProgramRootNode } from "./grammar/AbstractRuntimeNodes"
import Upgrader from "./grammar/Upgrader"

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

  // returns GrammarBackedProgramClass
  static getProgramConstructor = (grammarPath: jTreeTypes.filepath) => {
    const grammarCode = fs.readFileSync(grammarPath, "utf8")
    const grammarProgram = GrammarProgram.newFromCondensed(grammarCode, grammarPath)
    return grammarProgram.getRootConstructor()
  }

  static combineFiles = (globPatterns: jTreeTypes.globPattern[]) => {
    const glob = require("glob")
    const files = (<any>globPatterns.map(pattern => glob.sync(pattern))).flat()
    const content = files.map((path: jTreeTypes.filepath) => fs.readFileSync(path, "utf8")).join("\n")

    return new jtree.TreeNode(content)
  }
}

export default jtreeNode
