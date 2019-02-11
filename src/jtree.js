const TreeUtils = require("./base/TreeUtils.js")
const TreeNode = require("./base/TreeNode.js")

const AbstractGrammarBackedProgram = require("./grammar/AbstractGrammarBackedProgram.js")
const GrammarBackedNonTerminalNode = require("./grammar/GrammarBackedNonTerminalNode.js")
const GrammarBackedTerminalNode = require("./grammar/GrammarBackedTerminalNode.js")
const GrammarBackedAnyNode = require("./grammar/GrammarBackedAnyNode.js")

const jtree = {}

jtree.program = AbstractGrammarBackedProgram
jtree.Utils = TreeUtils
jtree.TreeNode = TreeNode
jtree.NonTerminalNode = GrammarBackedNonTerminalNode
jtree.TerminalNode = GrammarBackedTerminalNode
jtree.AnyNode = GrammarBackedAnyNode

jtree.getVersion = () => "15.2.0"

module.exports = jtree
