import { TreeUtils } from "./TreeUtils"
import { TreeNode, ExtendibleTreeNode } from "./TreeNode"

import { GrammarProgram, GrammarBackedRootNode, GrammarBackedNonRootNode } from "./GrammarLanguage"
import { UnknownGrammarProgram } from "./UnknownGrammarProgram"
import { TreeNotationCodeMirrorMode } from "./TreeNotationCodeMirrorMode"

class jtree {
  static GrammarBackedRootNode = GrammarBackedRootNode
  static GrammarBackedNonRootNode = GrammarBackedNonRootNode
  static Utils = TreeUtils
  static TreeNode = TreeNode
  static ExtendibleTreeNode = ExtendibleTreeNode
  static GrammarProgram = GrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => TreeNode.getVersion()
}

export { jtree }
