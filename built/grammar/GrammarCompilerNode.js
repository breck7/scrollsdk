"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
class GrammarCompilerNode extends TreeNode_1.default {
    getKeywordMap() {
        const types = [
            GrammarConstants_1.GrammarConstantsCompiler.sub,
            GrammarConstants_1.GrammarConstantsCompiler.indentCharacter,
            GrammarConstants_1.GrammarConstantsCompiler.listDelimiter,
            GrammarConstants_1.GrammarConstantsCompiler.openChildren,
            GrammarConstants_1.GrammarConstantsCompiler.closeChildren
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
        return this.get(GrammarConstants_1.GrammarConstantsCompiler.listDelimiter);
    }
    getTransformation() {
        return this.get(GrammarConstants_1.GrammarConstantsCompiler.sub);
    }
    getIndentCharacter() {
        return this.get(GrammarConstants_1.GrammarConstantsCompiler.indentCharacter);
    }
    getOpenChildrenString() {
        return this.get(GrammarConstants_1.GrammarConstantsCompiler.openChildren) || "";
    }
    getCloseChildrenString() {
        return this.get(GrammarConstants_1.GrammarConstantsCompiler.closeChildren) || "";
    }
}
exports.default = GrammarCompilerNode;
