const TreeUtils = require("./base/TreeUtils.js")
const TreeNode = require("./base/TreeNode.js")

const AbstractGrammarBackedProgram = require("./grammar/AbstractGrammarBackedProgram.js")
const GrammarBackedNonTerminalNode = require("./grammar/GrammarBackedNonTerminalNode.js")
const GrammarBackedTerminalNode = require("./grammar/GrammarBackedTerminalNode.js")

const jtree = {}

jtree.program = AbstractGrammarBackedProgram
jtree.Utils = TreeUtils
jtree.TreeNode = TreeNode
jtree.NonTerminalNode = GrammarBackedNonTerminalNode
jtree.TerminalNode = GrammarBackedTerminalNode

jtree.getVersion = () => "15.0.1"

module.exports = jtree
