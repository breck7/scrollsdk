"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
class GrammarBackedAnyNode extends GrammarBackedNonTerminalNode_1.default {
    getKeywordMap() {
        return {};
    }
    getErrors() {
        return [];
    }
    getCatchAllNodeClass(line) {
        return GrammarBackedAnyNode;
    }
}
exports.default = GrammarBackedAnyNode;
