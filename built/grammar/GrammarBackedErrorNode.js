"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractRuntimeCodeNode_1 = require("./AbstractRuntimeCodeNode");
const GrammarConstants_1 = require("./GrammarConstants");
class GrammarBackedErrorNode extends AbstractRuntimeCodeNode_1.default {
    getLineSyntax() {
        return "error ".repeat(this.getWords().length).trim();
    }
    getErrors() {
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getKeyword();
        const locationMsg = context ? `in "${context}" ` : "";
        const point = this.getPoint();
        const keyword = this.getKeyword();
        return [
            {
                kind: GrammarConstants_1.default.invalidKeywordError,
                subkind: keyword,
                context: context,
                level: point.x,
                message: `${GrammarConstants_1.default.invalidKeywordError} "${keyword}" ${locationMsg}at line ${point.y} column ${point.x}`
            }
        ];
    }
}
exports.default = GrammarBackedErrorNode;
