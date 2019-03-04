"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
class GrammarCompilerNode extends TreeNode_1.default {
    getKeywordMap() {
        const types = [
            GrammarConstants_1.default.compiler.sub,
            GrammarConstants_1.default.compiler.indentCharacter,
            GrammarConstants_1.default.compiler.listDelimiter,
            GrammarConstants_1.default.compiler.openChildren,
            GrammarConstants_1.default.compiler.closeChildren
        ];
        const map = {};
        types.forEach(type => {
            map[type] = TreeNode_1.default;
        });
        return map;
    }
    getTargetExtension() {
        return this.getWord(1);
    }
    getListDelimiter() {
        return this.get(GrammarConstants_1.default.compiler.listDelimiter);
    }
    getTransformation() {
        return this.get(GrammarConstants_1.default.compiler.sub);
    }
    getIndentCharacter() {
        return this.get(GrammarConstants_1.default.compiler.indentCharacter);
    }
    getOpenChildrenString() {
        return this.get(GrammarConstants_1.default.compiler.openChildren) || "";
    }
    getCloseChildrenString() {
        return this.get(GrammarConstants_1.default.compiler.closeChildren) || "";
    }
}
exports.default = GrammarCompilerNode;
