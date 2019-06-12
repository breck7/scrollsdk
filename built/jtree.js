"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeUtils_1 = require("./base/TreeUtils");
const TreeNode_1 = require("./base/TreeNode");
const GrammarLanguage_1 = require("./grammar/GrammarLanguage");
const UnknownGrammarProgram_1 = require("./tools/UnknownGrammarProgram");
const TreeNotationCodeMirrorMode_1 = require("./codemirror/TreeNotationCodeMirrorMode");
class jtree {
}
jtree.programRoot = GrammarLanguage_1.AbstractRuntimeProgramRootNode;
jtree.Utils = TreeUtils_1.default;
jtree.TreeNode = TreeNode_1.default;
jtree.NonTerminalNode = GrammarLanguage_1.GrammarBackedNonTerminalNode;
jtree.TerminalNode = GrammarLanguage_1.GrammarBackedTerminalNode;
jtree.BlobNode = GrammarLanguage_1.GrammarBackedBlobNode;
jtree.GrammarProgram = GrammarLanguage_1.GrammarProgram;
jtree.UnknownGrammarProgram = UnknownGrammarProgram_1.default;
jtree.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode_1.default;
jtree.getVersion = () => "25.2.0";
exports.default = jtree;
