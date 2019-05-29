import TreeUtils from "./base/TreeUtils"
import TreeNode from "./base/TreeNode"

import AbstractRuntimeProgram from "./grammar/AbstractRuntimeProgram"
import GrammarBackedNonTerminalNode from "./grammar/GrammarBackedNonTerminalNode"
import GrammarBackedTerminalNode from "./grammar/GrammarBackedTerminalNode"
import GrammarBackedBlobNode from "./grammar/GrammarBackedBlobNode"
import GrammarProgram from "./grammar/GrammarProgram"
import UnknownGrammarProgram from "./grammar/UnknownGrammarProgram"
import TreeNotationCodeMirrorMode from "./grammar/TreeNotationCodeMirrorMode"

class jtree {
  static programRoot = AbstractRuntimeProgram
  static Utils = TreeUtils
  static TreeNode = TreeNode
  static NonTerminalNode = GrammarBackedNonTerminalNode
  static TerminalNode = GrammarBackedTerminalNode
  static BlobNode = GrammarBackedBlobNode
  static GrammarProgram = GrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => "25.1.0"
}

export default jtree
