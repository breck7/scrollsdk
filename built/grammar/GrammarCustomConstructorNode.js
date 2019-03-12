"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
const GrammarBackedAnyNode_1 = require("./GrammarBackedAnyNode");
const GrammarBackedTerminalNode_1 = require("./GrammarBackedTerminalNode");
const GrammarBackedErrorNode_1 = require("./GrammarBackedErrorNode");
class GrammarCustomConstructorNode extends TreeNode_1.default {
    _getNodeConstructorFilePath() {
        return this.getWord(2);
    }
    // todo: allow for deeper nesting? use Utils.resolveProperty
    getSubModuleName() {
        return this.getWord(3);
    }
    _getNodeClasses() {
        const builtIns = {
            ErrorNode: GrammarBackedErrorNode_1.default,
            TerminalNode: GrammarBackedTerminalNode_1.default,
            NonTerminalNode: GrammarBackedNonTerminalNode_1.default,
            AnyNode: GrammarBackedAnyNode_1.default
        };
        return builtIns;
    }
    getDefinedConstructor() {
        const filepath = this._getNodeConstructorFilePath();
        const builtIns = this._getNodeClasses();
        const builtIn = builtIns[filepath];
        if (builtIn)
            return builtIn;
        const rootPath = this.getRootNode().getTheGrammarFilePath();
        const basePath = TreeUtils_1.default.getPathWithoutFileName(rootPath) + "/";
        const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath;
        // todo: remove "window" below?
        if (!this.isNodeJs()) {
            const cls = window[TreeUtils_1.default.getClassNameFromFilePath(filepath)];
            if (!cls)
                console.error(`WARNING: class ${filepath} not found.`);
            return cls;
        }
        const theModule = require(fullPath);
        const subModule = this.getSubModuleName();
        return subModule ? theModule[subModule] : theModule;
    }
}
exports.default = GrammarCustomConstructorNode;
