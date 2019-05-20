"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
const GrammarBackedBlobNode_1 = require("./GrammarBackedBlobNode");
const GrammarBackedTerminalNode_1 = require("./GrammarBackedTerminalNode");
const GrammarBackedErrorNode_1 = require("./GrammarBackedErrorNode");
const GrammarConstants_1 = require("./GrammarConstants");
class AbstractCustomConstructorNode extends TreeNode_1.default {
    getTheDefinedConstructor() {
        // todo: allow overriding if custom constructor not found.
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
        if (!this.isAppropriateEnvironment() || this.getTheDefinedConstructor())
            return [];
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getFirstWord();
        const point = this.getPoint();
        return [
            {
                kind: GrammarConstants_1.GrammarConstantsErrors.invalidConstructorPathError,
                subkind: this.getFirstWord(),
                level: point.x,
                context: context,
                message: `${GrammarConstants_1.GrammarConstantsErrors.invalidConstructorPathError} no constructor "${this.getLine()}" found at line ${point.y}`
            }
        ];
    }
    getBuiltIn() {
        const constructors = {
            ErrorNode: GrammarBackedErrorNode_1.default,
            TerminalNode: GrammarBackedTerminalNode_1.default,
            NonTerminalNode: GrammarBackedNonTerminalNode_1.default,
            BlobNode: GrammarBackedBlobNode_1.default
        };
        return constructors[this.getWord(1)];
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
class CustomJavascriptConstructorNode extends AbstractCustomConstructorNode {
    _getNodeJsConstructor() {
        const jtreePath = __dirname + "/../jtree.node.js";
        const code = `const jtree = require('${jtreePath}').default
/* INDENT FOR BUILD REASONS */  module.exports = ${this.childrenToString()}`;
        if (CustomJavascriptConstructorNode.cache[code])
            return CustomJavascriptConstructorNode.cache[code];
        const constructorName = this.getParent()
            .getParent()
            .getWord(1) ||
            this.getParent()
                .getParent()
                .get(GrammarConstants_1.GrammarConstants.name) + "Root";
        const tempFilePath = `${__dirname}/constructor-${constructorName}-${TreeUtils_1.default.getRandomString(30)}-temp.js`;
        const fs = require("fs");
        try {
            fs.writeFileSync(tempFilePath, code, "utf8");
            CustomJavascriptConstructorNode.cache[code] = require(tempFilePath);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            fs.unlinkSync(tempFilePath);
        }
        return CustomJavascriptConstructorNode.cache[code];
    }
    _getBrowserConstructor() {
        const definedCode = this.childrenToString();
        const tempClassName = "tempConstructor" + TreeUtils_1.default.getRandomString(30);
        if (CustomJavascriptConstructorNode.cache[definedCode])
            return CustomJavascriptConstructorNode.cache[definedCode];
        const script = document.createElement("script");
        script.innerHTML = `window.${tempClassName} = ${this.childrenToString()}`;
        document.head.appendChild(script);
        CustomJavascriptConstructorNode.cache[definedCode] = window[tempClassName];
    }
    _getCustomConstructor() {
        return this.isNodeJs() ? this._getNodeJsConstructor() : this._getBrowserConstructor();
    }
    getCatchAllNodeConstructor() {
        return TreeNode_1.default;
    }
}
CustomJavascriptConstructorNode.cache = {};
class GrammarCustomConstructorsNode extends TreeNode_1.default {
    getFirstWordMap() {
        const map = {};
        map[GrammarConstants_1.GrammarConstants.constructorNodeJs] = CustomNodeJsConstructorNode;
        map[GrammarConstants_1.GrammarConstants.constructorBrowser] = CustomBrowserConstructorNode;
        map[GrammarConstants_1.GrammarConstants.constructorJavascript] = CustomJavascriptConstructorNode;
        return map;
    }
    getConstructorForEnvironment() {
        const jsConstructor = this.getNode(GrammarConstants_1.GrammarConstants.constructorJavascript);
        if (jsConstructor)
            return jsConstructor;
        return (this.getNode(this.isNodeJs() ? GrammarConstants_1.GrammarConstants.constructorNodeJs : GrammarConstants_1.GrammarConstants.constructorBrowser));
    }
}
exports.default = GrammarCustomConstructorsNode;
