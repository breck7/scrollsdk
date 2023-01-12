import { Utils } from "./Utils"
import { TreeNode, ExtendibleTreeNode, TreeEvents } from "./TreeNode"
import { TestRacer } from "./TestRacer"

import { HandGrammarProgram, GrammarBackedNode, GrammarConstants, UnknownNodeTypeError, UnknownGrammarProgram } from "./GrammarLanguage"
import { TreeNotationCodeMirrorMode } from "./TreeNotationCodeMirrorMode"

class jtree {
  static GrammarBackedNode = GrammarBackedNode
  static GrammarConstants = GrammarConstants
  static Utils = Utils
  static UnknownNodeTypeError = UnknownNodeTypeError
  static TestRacer = TestRacer
  static TreeEvents = TreeEvents
  static TreeNode = TreeNode
  static ExtendibleTreeNode = ExtendibleTreeNode
  static HandGrammarProgram = HandGrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => TreeNode.getVersion()
}

export { jtree }
