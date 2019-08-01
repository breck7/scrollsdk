"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeUtils_1 = require("./base/TreeUtils");
const TreeNode_1 = require("./base/TreeNode");
const GrammarLanguage_1 = require("./GrammarLanguage");
const UnknownGrammarProgram_1 = require("./tools/UnknownGrammarProgram");
const TreeNotationCodeMirrorMode_1 = require("./codemirror/TreeNotationCodeMirrorMode");
class jtree {
}
jtree.GrammarBackedRootNode = GrammarLanguage_1.GrammarBackedRootNode;
jtree.GrammarBackedNonRootNode = GrammarLanguage_1.GrammarBackedNonRootNode;
jtree.Utils = TreeUtils_1.default;
jtree.TreeNode = TreeNode_1.default;
jtree.GrammarProgram = GrammarLanguage_1.GrammarProgram;
jtree.UnknownGrammarProgram = UnknownGrammarProgram_1.default;
jtree.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode_1.default;
jtree.getVersion = () => "36.2.0";
exports.default = jtree;
