import { TreeUtils } from "./TreeUtils"
import { TreeNode, ExtendibleTreeNode, TreeEvents } from "./TreeNode"

import { GrammarProgram, GrammarBackedNode } from "./GrammarLanguage"
import { UnknownGrammarProgram } from "./UnknownGrammarProgram"
import { TreeNotationCodeMirrorMode } from "./TreeNotationCodeMirrorMode"

class jtree {
  static GrammarBackedNode = GrammarBackedNode
  static Utils = TreeUtils
  static TreeEvents = TreeEvents
  static TreeNode = TreeNode
  static ExtendibleTreeNode = ExtendibleTreeNode
  static GrammarProgram = GrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => TreeNode.getVersion()
}

export { jtree }
