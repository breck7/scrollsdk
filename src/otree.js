const TreeUtils = require("./base/TreeUtils.js")
const TreeNode = require("./base/TreeNode.js")

const GrammarBackedProgram = require("./grammar/GrammarBackedProgram.js")
const GrammarBackedNonTerminalNode = require("./grammar/GrammarBackedNonTerminalNode.js")
const GrammarBackedTerminalNode = require("./grammar/GrammarBackedTerminalNode.js")

const otree = {}

otree.GrammarBackedProgram = GrammarBackedProgram
otree.Utils = TreeUtils
otree.TreeNode = TreeNode
otree.NonTerminalNode = GrammarBackedNonTerminalNode
otree.TerminalNode = GrammarBackedTerminalNode

otree.getVersion = () => "10.1.2"

module.exports = otree
