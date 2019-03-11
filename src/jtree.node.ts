const fs = require("fs")

import jtree from "./jtree"
import types from "./types"
import GrammarProgram from "./grammar/GrammarProgram"

jtree.executeFile = (programPath: types.filepath, grammarPath: types.filepath): Promise<any> =>
  jtree.makeProgram(programPath, grammarPath).execute(programPath)

// returns AbstractRuntimeProgram
jtree.makeProgram = (programPath: types.filepath, grammarPath: types.filepath) => {
  const programClass = jtree.getProgramConstructor(grammarPath)
  const code = fs.readFileSync(programPath, "utf8")
  return new programClass(code)
}

// returns GrammarBackedProgramClass
jtree.getProgramConstructor = (grammarPath: types.filepath) => {
  const grammarCode = fs.readFileSync(grammarPath, "utf8")
  const grammarProgram = GrammarProgram.newFromCondensed(grammarCode, grammarPath)
  return grammarProgram.getRootConstructor()
}

jtree.GrammarProgram = GrammarProgram

export default jtree
