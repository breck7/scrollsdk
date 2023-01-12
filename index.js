// WARNING: This file will be removed.
// Instead of using this file, import the products you want to use directly from the products folder.
const { Utils } = require("./products/Utils.js")
const { TreeNode, ExtendibleTreeNode, TreeEvents } = require("./products/TreeNode.js")
const { TestRacer } = require("./products/TestRacer.node.js")
const { HandGrammarProgram, GrammarBackedNode, GrammarConstants, UnknownNodeTypeError, UnknownGrammarProgram } = require("./products/GrammarLanguage.js")
const { TreeNotationCodeMirrorMode } = require("./products/TreeNotationCodeMirrorMode.js")

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

module.exports = { jtree, Utils }
