import TreeUtils from "./base/TreeUtils"
import TreeNode from "./base/TreeNode"

import { GrammarProgram, GrammarBackedRootNode, GrammarBackedNonRootNode } from "./GrammarLanguage"
import UnknownGrammarProgram from "./tools/UnknownGrammarProgram"
import TreeNotationCodeMirrorMode from "./codemirror/TreeNotationCodeMirrorMode"

class jtree {
  static GrammarBackedRootNode = GrammarBackedRootNode
  static GrammarBackedNonRootNode = GrammarBackedNonRootNode
  static Utils = TreeUtils
  static TreeNode = TreeNode
  static GrammarProgram = GrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => "36.2.0"
}

export default jtree
