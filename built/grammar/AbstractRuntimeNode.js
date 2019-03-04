"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
class AbstractRuntimeNode extends TreeNode_1.default {
    getGrammarProgram() { }
    getProgram() {
        return this;
    }
}
exports.default = AbstractRuntimeNode;
