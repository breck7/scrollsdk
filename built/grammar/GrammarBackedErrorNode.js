"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractRuntimeNodes_1 = require("./AbstractRuntimeNodes");
const TreeErrorTypes_1 = require("./TreeErrorTypes");
class GrammarBackedErrorNode extends AbstractRuntimeNodes_1.AbstractRuntimeNonRootNode {
    getLineCellTypes() {
        return "error ".repeat(this.getWords().length).trim();
    }
    getErrors() {
        return [this.getFirstWord() ? new TreeErrorTypes_1.UnknownNodeTypeError(this) : new TreeErrorTypes_1.BlankLineError(this)];
    }
}
exports.default = GrammarBackedErrorNode;
