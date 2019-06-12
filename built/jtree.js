"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeUtils_1 = require("./base/TreeUtils");
const TreeNode_1 = require("./base/TreeNode");
const AbstractRuntimeNodes_1 = require("./grammar/AbstractRuntimeNodes");
const NodeDefinitionNodes_1 = require("./grammar/NodeDefinitionNodes");
const UnknownGrammarProgram_1 = require("./grammar/UnknownGrammarProgram");
const TreeNotationCodeMirrorMode_1 = require("./grammar/TreeNotationCodeMirrorMode");
class jtree {
}
jtree.programRoot = AbstractRuntimeNodes_1.AbstractRuntimeProgramRootNode;
jtree.Utils = TreeUtils_1.default;
jtree.TreeNode = TreeNode_1.default;
jtree.NonTerminalNode = AbstractRuntimeNodes_1.GrammarBackedNonTerminalNode;
jtree.TerminalNode = AbstractRuntimeNodes_1.GrammarBackedTerminalNode;
jtree.BlobNode = AbstractRuntimeNodes_1.GrammarBackedBlobNode;
jtree.GrammarProgram = NodeDefinitionNodes_1.GrammarProgram;
jtree.UnknownGrammarProgram = UnknownGrammarProgram_1.default;
jtree.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode_1.default;
jtree.getVersion = () => "25.2.0";
exports.default = jtree;
