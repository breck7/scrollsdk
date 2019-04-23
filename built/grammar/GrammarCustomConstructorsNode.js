"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
const GrammarBackedAnyNode_1 = require("./GrammarBackedAnyNode");
const GrammarBackedTerminalNode_1 = require("./GrammarBackedTerminalNode");
const GrammarBackedErrorNode_1 = require("./GrammarBackedErrorNode");
const GrammarConstants_1 = require("./GrammarConstants");
class AbstractCustomConstructorNode extends TreeNode_1.default {
    _getBuiltInConstructors() {
        return {
            ErrorNode: GrammarBackedErrorNode_1.default,
            TerminalNode: GrammarBackedTerminalNode_1.default,
            NonTerminalNode: GrammarBackedNonTerminalNode_1.default,
            AnyNode: GrammarBackedAnyNode_1.default
        };
    }
    getDefinedConstructor() {
        return this.getBuiltIn() || this._getCustomConstructor();
    }
    isAppropriateEnvironment() {
        return true;
    }
    _getCustomConstructor() {
        return undefined;
    }
    getErrors() {
        // todo: should this be a try/catch?
        if (!this.isAppropriateEnvironment() || this.getDefinedConstructor())
            return [];
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getKeyword();
        const point = this.getPoint();
        return [
            {
                kind: GrammarConstants_1.GrammarConstantsErrors.invalidConstructorPathError,
                subkind: this.getKeyword(),
                level: point.x,
                context: context,
                message: `${GrammarConstants_1.GrammarConstantsErrors.invalidConstructorPathError} no constructor "${this.getLine()}" found at line ${point.y}`
            }
        ];
    }
    getBuiltIn() {
        return this._getBuiltInConstructors()[this.getWord(1)];
    }
}
class CustomNodeJsConstructorNode extends AbstractCustomConstructorNode {
    _getCustomConstructor() {
        const filepath = this._getNodeConstructorFilePath();
        const rootPath = this.getRootNode().getTheGrammarFilePath();
        const basePath = TreeUtils_1.default.getPathWithoutFileName(rootPath) + "/";
        const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath;
        const theModule = require(fullPath);
        const subModuleName = this.getWord(2);
        return subModuleName ? TreeUtils_1.default.resolveProperty(theModule, subModuleName) : theModule;
    }
    // todo: does this support spaces in filepaths?
    _getNodeConstructorFilePath() {
        return this.getWord(1);
    }
    isAppropriateEnvironment() {
        return this.isNodeJs();
    }
}
class CustomBrowserConstructorNode extends AbstractCustomConstructorNode {
    _getCustomConstructor() {
        const constructorName = this.getWord(1);
        const constructor = TreeUtils_1.default.resolveProperty(window, constructorName);
        if (!constructor)
            throw new Error(`constructor window.${constructorName} not found.`);
        return constructor;
    }
    isAppropriateEnvironment() {
        return !this.isNodeJs();
    }
}
class GrammarCustomConstructorsNode extends TreeNode_1.default {
    getKeywordMap() {
        const map = {};
        map[GrammarConstants_1.GrammarConstants.constructorNodeJs] = CustomNodeJsConstructorNode;
        map[GrammarConstants_1.GrammarConstants.constructorBrowser] = CustomBrowserConstructorNode;
        return map;
    }
    getConstructorForEnvironment() {
        return this.getNode(this.isNodeJs() ? GrammarConstants_1.GrammarConstants.constructorNodeJs : GrammarConstants_1.GrammarConstants.constructorBrowser);
    }
}
exports.default = GrammarCustomConstructorsNode;
