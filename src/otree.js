const TreeUtils = require("./base/TreeUtils.js")
const TreeNode = require("./base/TreeNode.js")

const AbstractGrammarBackedProgram = require("./grammar/AbstractGrammarBackedProgram.js")
const GrammarBackedNonTerminalNode = require("./grammar/GrammarBackedNonTerminalNode.js")
const GrammarBackedTerminalNode = require("./grammar/GrammarBackedTerminalNode.js")

const otree = {}

otree.program = AbstractGrammarBackedProgram
otree.Utils = TreeUtils
otree.TreeNode = TreeNode
otree.NonTerminalNode = GrammarBackedNonTerminalNode
otree.TerminalNode = GrammarBackedTerminalNode

otree.getVersion = () => "11.2.1"

module.exports = otree
