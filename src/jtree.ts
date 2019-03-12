import TreeUtils from "./base/TreeUtils"
import TreeNode from "./base/TreeNode"

import AbstractRuntimeProgram from "./grammar/AbstractRuntimeProgram"
import GrammarBackedNonTerminalNode from "./grammar/GrammarBackedNonTerminalNode"
import GrammarBackedTerminalNode from "./grammar/GrammarBackedTerminalNode"
import GrammarBackedAnyNode from "./grammar/GrammarBackedAnyNode"

const jtree: any = {}

jtree.program = AbstractRuntimeProgram
jtree.Utils = TreeUtils
jtree.TreeNode = TreeNode
jtree.NonTerminalNode = GrammarBackedNonTerminalNode
jtree.TerminalNode = GrammarBackedTerminalNode
jtree.AnyNode = GrammarBackedAnyNode

jtree.getLanguage = name => require(__dirname + `/../langs/${name}/index.js`)

jtree.getVersion = () => "17.0.0"

export default jtree
