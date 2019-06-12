import TreeUtils from "./base/TreeUtils"
import TreeNode from "./base/TreeNode"

import { AbstractRuntimeProgramRootNode } from "./grammar/AbstractRuntimeNodes"
import { GrammarBackedTerminalNode, GrammarBackedNonTerminalNode, GrammarBackedBlobNode } from "./grammar/GrammarBackedNodes"
import GrammarProgram from "./grammar/GrammarProgram"
import UnknownGrammarProgram from "./grammar/UnknownGrammarProgram"
import TreeNotationCodeMirrorMode from "./grammar/TreeNotationCodeMirrorMode"

class jtree {
  static programRoot = AbstractRuntimeProgramRootNode
  static Utils = TreeUtils
  static TreeNode = TreeNode
  static NonTerminalNode = GrammarBackedNonTerminalNode
  static TerminalNode = GrammarBackedTerminalNode
  static BlobNode = GrammarBackedBlobNode
  static GrammarProgram = GrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => "25.2.0"
}

export default jtree
