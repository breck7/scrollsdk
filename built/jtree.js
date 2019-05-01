"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeUtils_1 = require("./base/TreeUtils");
const TreeNode_1 = require("./base/TreeNode");
const AbstractRuntimeProgram_1 = require("./grammar/AbstractRuntimeProgram");
const GrammarBackedNonTerminalNode_1 = require("./grammar/GrammarBackedNonTerminalNode");
const GrammarBackedTerminalNode_1 = require("./grammar/GrammarBackedTerminalNode");
const GrammarBackedAnyNode_1 = require("./grammar/GrammarBackedAnyNode");
const GrammarProgram_1 = require("./grammar/GrammarProgram");
const TreeNotationCodeMirrorMode_1 = require("./grammar/TreeNotationCodeMirrorMode");
class jtree {
}
jtree.program = AbstractRuntimeProgram_1.default;
jtree.Utils = TreeUtils_1.default;
jtree.TreeNode = TreeNode_1.default;
jtree.NonTerminalNode = GrammarBackedNonTerminalNode_1.default;
jtree.TerminalNode = GrammarBackedTerminalNode_1.default;
jtree.AnyNode = GrammarBackedAnyNode_1.default;
jtree.GrammarProgram = GrammarProgram_1.default;
jtree.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode_1.default;
jtree.getLanguage = name => require(__dirname + `/../langs/${name}/index.js`);
jtree.getVersion = () => "20.0.0";
exports.default = jtree;
