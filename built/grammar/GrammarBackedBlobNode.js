"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode_1.default {
    getFirstWordMap() {
        return {};
    }
    getErrors() {
        return [];
    }
    getCatchAllNodeConstructor(line) {
        return GrammarBackedBlobNode;
    }
}
exports.default = GrammarBackedBlobNode;
