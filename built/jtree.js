"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeUtils_1 = require("./base/TreeUtils");
const TreeNode_1 = require("./base/TreeNode");
const AbstractRuntimeProgram_1 = require("./grammar/AbstractRuntimeProgram");
const GrammarBackedNonTerminalNode_1 = require("./grammar/GrammarBackedNonTerminalNode");
const GrammarBackedTerminalNode_1 = require("./grammar/GrammarBackedTerminalNode");
const GrammarBackedBlobNode_1 = require("./grammar/GrammarBackedBlobNode");
const GrammarProgram_1 = require("./grammar/GrammarProgram");
const UnknownGrammarProgram_1 = require("./grammar/UnknownGrammarProgram");
const TreeNotationCodeMirrorMode_1 = require("./grammar/TreeNotationCodeMirrorMode");
class jtree {
}
jtree.programRoot = AbstractRuntimeProgram_1.default;
jtree.Utils = TreeUtils_1.default;
jtree.TreeNode = TreeNode_1.default;
jtree.NonTerminalNode = GrammarBackedNonTerminalNode_1.default;
jtree.TerminalNode = GrammarBackedTerminalNode_1.default;
jtree.BlobNode = GrammarBackedBlobNode_1.default;
jtree.GrammarProgram = GrammarProgram_1.default;
jtree.UnknownGrammarProgram = UnknownGrammarProgram_1.default;
jtree.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode_1.default;
jtree.getVersion = () => "25.1.0";
exports.default = jtree;
