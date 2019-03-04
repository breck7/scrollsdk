const fs = require("fs")

import jtree from "./jtree"
import * as types from "./types"
import { filepath } from "./types"
import GrammarProgram from "./grammar/GrammarProgram"

jtree.executeFile = (programPath: filepath, grammarPath: filepath): Promise<any> =>
  jtree.makeProgram(programPath, grammarPath).execute(programPath)

// returns AbstractRuntimeProgram
jtree.makeProgram = (programPath: filepath, grammarPath: filepath) => {
  const programClass = jtree.getParser(grammarPath)
  const code = fs.readFileSync(programPath, "utf8")
  return new programClass(code)
}

// returns GrammarBackedProgramClass
jtree.getParser = (grammarPath: filepath) => {
  const grammarCode = fs.readFileSync(grammarPath, "utf8")
  const grammarProgram = GrammarProgram.newFromCondensed(grammarCode, grammarPath)
  return grammarProgram.getRootParserClass()
}

jtree.GrammarProgram = GrammarProgram

export default jtree
