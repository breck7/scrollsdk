"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
class GrammarBackedAnyNode extends GrammarBackedNonTerminalNode_1.default {
    getFirstWordMap() {
        return {};
    }
    getErrors() {
        return [];
    }
    getCatchAllNodeConstructor(line) {
        return GrammarBackedAnyNode;
    }
}
exports.default = GrammarBackedAnyNode;
