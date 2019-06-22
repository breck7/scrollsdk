import TreeUtils from "./base/TreeUtils"
import TreeNode from "./base/TreeNode"

import {
  GrammarProgram,
  GrammarBackedRootNode,
  GrammarBackedTerminalNode,
  GrammarBackedNonTerminalNode,
  GrammarBackedBlobNode,
  GrammarBackedErrorNode
} from "./GrammarLanguage"
import UnknownGrammarProgram from "./tools/UnknownGrammarProgram"
import TreeNotationCodeMirrorMode from "./codemirror/TreeNotationCodeMirrorMode"

class jtree {
  static GrammarBackedRootNode = GrammarBackedRootNode
  static Utils = TreeUtils
  static TreeNode = TreeNode
  static NonTerminalNode = GrammarBackedNonTerminalNode
  static BlobNode = GrammarBackedBlobNode
  static ErrorNode = GrammarBackedErrorNode
  static TerminalNode = GrammarBackedTerminalNode
  static GrammarProgram = GrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => "26.1.0"
}

export default jtree
