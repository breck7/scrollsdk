"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractRuntimeNonRootNode_1 = require("./AbstractRuntimeNonRootNode");
class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode_1.default {
    getKeywordMap() {
        return this.getDefinition().getRunTimeKeywordMap();
    }
    // todo: implement
    _getNodeJoinCharacter() {
        return "\n";
    }
    compile(targetExtension) {
        const compiler = this.getCompilerNode(targetExtension);
        const openChildrenString = compiler.getOpenChildrenString();
        const closeChildrenString = compiler.getCloseChildrenString();
        const compiledLine = this.getCompiledLine(targetExtension);
        const indent = this.getCompiledIndentation(targetExtension);
        const compiledChildren = this.map(child => child.compile(targetExtension)).join(this._getNodeJoinCharacter());
        return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`;
    }
}
exports.default = GrammarBackedNonTerminalNode;
