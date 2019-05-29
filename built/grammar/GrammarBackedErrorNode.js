"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractRuntimeNonRootNode_1 = require("./AbstractRuntimeNonRootNode");
const jTreeTypes_1 = require("../jTreeTypes");
class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode_1.default {
    getLineCellTypes() {
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
                kind: jTreeTypes_1.default.GrammarConstantsErrors.invalidNodeTypeError,
                subkind: firstWord,
                context: context,
                level: point.x,
                message: `${jTreeTypes_1.default.GrammarConstantsErrors.invalidNodeTypeError} "${firstWord}" ${locationMsg}at line ${point.y} column ${point.x}`
            }
        ];
    }
}
exports.default = GrammarBackedErrorNode;
