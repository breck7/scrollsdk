"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractRuntimeNonRootNode_1 = require("./AbstractRuntimeNonRootNode");
const GrammarConstants_1 = require("./GrammarConstants");
class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode_1.default {
    getLineSyntax() {
        return "error ".repeat(this.getWords().length).trim();
    }
    getErrors() {
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getFirstWord();
        const locationMsg = context ? `in "${context}" ` : "";
        const point = this.getPoint();
        const firstWord = this.getFirstWord();
        return [
            {
                kind: GrammarConstants_1.GrammarConstantsErrors.invalidNodeTypeError,
                subkind: firstWord,
                context: context,
                level: point.x,
                message: `${GrammarConstants_1.GrammarConstantsErrors.invalidNodeTypeError} "${firstWord}" ${locationMsg}at line ${point.y} column ${point.x}`
            }
        ];
    }
}
exports.default = GrammarBackedErrorNode;
