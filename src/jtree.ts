import TreeUtils from "./base/TreeUtils"
import TreeNode from "./base/TreeNode"

import { GrammarProgram, GrammarBackedRootNode, GrammarBackedNonRootNode, GrammarBackedBlobNode, GrammarBackedErrorNode } from "./GrammarLanguage"
import UnknownGrammarProgram from "./tools/UnknownGrammarProgram"
import TreeNotationCodeMirrorMode from "./codemirror/TreeNotationCodeMirrorMode"

class jtree {
  static GrammarBackedRootNode = GrammarBackedRootNode
  static GrammarBackedNonRootNode = GrammarBackedNonRootNode
  static Utils = TreeUtils
  static TreeNode = TreeNode
  static BlobNode = GrammarBackedBlobNode
  static ErrorNode = GrammarBackedErrorNode
  static GrammarProgram = GrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => "31.0.0"
}

export default jtree
