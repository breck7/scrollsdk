const fs = require("fs")

import jtree from "./jtree"
import types from "./types"
import GrammarProgram from "./grammar/GrammarProgram"
import AbstractRuntimeProgram from "./grammar/AbstractRuntimeProgram"

class jtreeNode extends jtree {
  static executeFile = (programPath: types.filepath, grammarPath: types.filepath): Promise<any> =>
    jtreeNode.makeProgram(programPath, grammarPath).execute(programPath)

  // returns AbstractRuntimeProgram
  static makeProgram = (programPath: types.filepath, grammarPath: types.filepath): AbstractRuntimeProgram => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath)
    const code = fs.readFileSync(programPath, "utf8")
    return new programConstructor(code)
  }

  // returns GrammarBackedProgramClass
  static getProgramConstructor = (grammarPath: types.filepath) => {
    const grammarCode = fs.readFileSync(grammarPath, "utf8")
    const grammarProgram = GrammarProgram.newFromCondensed(grammarCode, grammarPath)
    return grammarProgram.getRootConstructor()
  }

  static combineFiles = (globPatterns: types.globPattern[]) => {
    const glob = require("glob")
    const files = (<any>globPatterns.map(pattern => glob.sync(pattern))).flat()
    const content = files.map((path: types.filepath) => fs.readFileSync(path, "utf8")).join("\n")

    return new jtree.TreeNode(content)
  }
}

export default jtreeNode
