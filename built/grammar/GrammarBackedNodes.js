"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractRuntimeNodes_1 = require("./AbstractRuntimeNodes");
const TreeErrorTypes_1 = require("./TreeErrorTypes");
class GrammarBackedTerminalNode extends AbstractRuntimeNodes_1.AbstractRuntimeNonRootNode {
}
exports.GrammarBackedTerminalNode = GrammarBackedTerminalNode;
class GrammarBackedErrorNode extends AbstractRuntimeNodes_1.AbstractRuntimeNonRootNode {
    getLineCellTypes() {
        return "error ".repeat(this.getWords().length).trim();
    }
    getErrors() {
        return [this.getFirstWord() ? new TreeErrorTypes_1.UnknownNodeTypeError(this) : new TreeErrorTypes_1.BlankLineError(this)];
    }
}
exports.GrammarBackedErrorNode = GrammarBackedErrorNode;
class GrammarBackedNonTerminalNode extends AbstractRuntimeNodes_1.AbstractRuntimeNonRootNode {
    // todo: implement
    _getNodeJoinCharacter() {
        return "\n";
    }
    compile(targetExtension) {
        const compiler = this._getCompilerNode(targetExtension);
        const openChildrenString = compiler.getOpenChildrenString();
        const closeChildrenString = compiler.getCloseChildrenString();
        const compiledLine = this._getCompiledLine(targetExtension);
        const indent = this._getCompiledIndentation(targetExtension);
        const compiledChildren = this.map(child => child.compile(targetExtension)).join(this._getNodeJoinCharacter());
        return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`;
    }
    static useAsBackupConstructor() {
        return GrammarBackedNonTerminalNode._backupConstructorEnabled;
    }
    static setAsBackupConstructor(value) {
        GrammarBackedNonTerminalNode._backupConstructorEnabled = value;
        return GrammarBackedNonTerminalNode;
    }
}
GrammarBackedNonTerminalNode._backupConstructorEnabled = false;
exports.GrammarBackedNonTerminalNode = GrammarBackedNonTerminalNode;
class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
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
exports.GrammarBackedBlobNode = GrammarBackedBlobNode;
