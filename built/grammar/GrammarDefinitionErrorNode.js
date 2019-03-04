"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
class GrammarDefinitionErrorNode extends TreeNode_1.default {
    getErrors() {
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getKeyword();
        const point = this.getPoint();
        return [
            {
                kind: GrammarConstants_1.default.invalidKeywordError,
                subkind: this.getKeyword(),
                level: point.x,
                context: context,
                message: `${GrammarConstants_1.default.invalidKeywordError} "${this.getKeyword()}" at line ${point.y}`
            }
        ];
    }
    getLineSyntax() {
        return ["keyword"].concat(this.getWordsFrom(1).map(word => "any")).join(" ");
    }
}
exports.default = GrammarDefinitionErrorNode;
