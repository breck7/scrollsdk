"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
const jTreeTypes_1 = require("../jTreeTypes");
class GrammarDefinitionErrorNode extends TreeNode_1.default {
    getErrors() {
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getFirstWord();
        const point = this.getPoint();
        return [
            {
                kind: jTreeTypes_1.default.GrammarConstantsErrors.invalidNodeTypeError,
                subkind: this.getFirstWord(),
                level: point.x,
                context: context,
                message: `${jTreeTypes_1.default.GrammarConstantsErrors.invalidNodeTypeError} "${this.getFirstWord()}" at line ${point.y}`
            }
        ];
    }
    getLineCellTypes() {
        return [GrammarConstants_1.GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => "any")).join(" ");
    }
}
exports.default = GrammarDefinitionErrorNode;
