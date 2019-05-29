"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
const TreeErrorTypes_1 = require("./TreeErrorTypes");
class GrammarDefinitionErrorNode extends TreeNode_1.default {
    getErrors() {
        return [new TreeErrorTypes_1.UnknownNodeTypeError(this)];
    }
    getLineCellTypes() {
        return [GrammarConstants_1.GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => "any")).join(" ");
    }
}
exports.default = GrammarDefinitionErrorNode;
