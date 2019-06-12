"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeUtils_1 = require("./base/TreeUtils");
const TreeNode_1 = require("./base/TreeNode");
const AbstractRuntimeNodes_1 = require("./grammar/AbstractRuntimeNodes");
const GrammarBackedNodes_1 = require("./grammar/GrammarBackedNodes");
const GrammarProgram_1 = require("./grammar/GrammarProgram");
const UnknownGrammarProgram_1 = require("./grammar/UnknownGrammarProgram");
const TreeNotationCodeMirrorMode_1 = require("./grammar/TreeNotationCodeMirrorMode");
class jtree {
}
jtree.programRoot = AbstractRuntimeNodes_1.AbstractRuntimeProgramRootNode;
jtree.Utils = TreeUtils_1.default;
jtree.TreeNode = TreeNode_1.default;
jtree.NonTerminalNode = GrammarBackedNodes_1.GrammarBackedNonTerminalNode;
jtree.TerminalNode = GrammarBackedNodes_1.GrammarBackedTerminalNode;
jtree.BlobNode = GrammarBackedNodes_1.GrammarBackedBlobNode;
jtree.GrammarProgram = GrammarProgram_1.default;
jtree.UnknownGrammarProgram = UnknownGrammarProgram_1.default;
jtree.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode_1.default;
jtree.getVersion = () => "25.2.0";
exports.default = jtree;
