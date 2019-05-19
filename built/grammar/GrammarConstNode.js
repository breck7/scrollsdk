"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
class GrammarConstNode extends TreeNode_1.default {
    getValue() {
        // todo: parse type
        if (this.length)
            return this.childrenToString();
        return this.getWordsFrom(2).join(" ");
    }
    getName() {
        return this.getFirstWord();
    }
}
exports.default = GrammarConstNode;
