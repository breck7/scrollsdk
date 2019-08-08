//tooling product jtree.node.js
//tooling product jtree.browser.js

import TreeUtils from "./TreeUtils"
import TreeNode from "./TreeNode"

import { GrammarProgram, GrammarBackedRootNode, GrammarBackedNonRootNode } from "./GrammarLanguage"
import { UnknownGrammarProgram } from "./UnknownGrammarProgram"
import { TreeNotationCodeMirrorMode } from "./TreeNotationCodeMirrorMode"

class jtree {
  static GrammarBackedRootNode = GrammarBackedRootNode
  static GrammarBackedNonRootNode = GrammarBackedNonRootNode
  static Utils = TreeUtils
  static TreeNode = TreeNode
  static GrammarProgram = GrammarProgram
  static UnknownGrammarProgram = UnknownGrammarProgram
  static TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode
  static getVersion = () => "37.0.0"
}

export default jtree
