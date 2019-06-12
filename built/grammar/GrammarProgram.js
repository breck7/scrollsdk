"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const AbstractRuntimeNodes_1 = require("./AbstractRuntimeNodes");
const GrammarConstants_1 = require("./GrammarConstants");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
const GrammarNodeTypeDefinitionNode_1 = require("./GrammarNodeTypeDefinitionNode");
const GrammarCellTypeDefinitionNode_1 = require("./GrammarCellTypeDefinitionNode");
class GrammarRootNode extends AbstractGrammarDefinitionNode_1.default {
    _getDefaultNodeConstructor() {
        return undefined;
    }
    getProgram() {
        return this.getParent();
    }
    getFirstWordMap() {
        // todo: this isn't quite correct. we are allowing too many firstWords.
        const map = super.getFirstWordMap();
        map[GrammarConstants_1.GrammarConstants.extensions] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.version] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.name] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.nodeTypeOrder] = TreeNode_1.default;
        return map;
    }
}
class GrammarAbstractNodeTypeDefinitionNode extends GrammarNodeTypeDefinitionNode_1.default {
    _isAbstract() {
        return true;
    }
}
// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode_1.default {
    getFirstWordMap() {
        const map = {};
        map[GrammarConstants_1.GrammarConstants.grammar] = GrammarRootNode;
        map[GrammarConstants_1.GrammarConstants.cellType] = GrammarCellTypeDefinitionNode_1.default;
        map[GrammarConstants_1.GrammarConstants.nodeType] = GrammarNodeTypeDefinitionNode_1.default;
        map[GrammarConstants_1.GrammarConstants.abstract] = GrammarAbstractNodeTypeDefinitionNode;
        map[GrammarConstants_1.GrammarConstants.toolingDirective] = TreeNode_1.default;
        return map;
    }
    // todo: this code is largely duplicated in abstractruntimeprogram
    getProgramErrors() {
        const errors = [];
        let line = 1;
        for (let node of this.getTopDownArray()) {
            node._cachedLineNumber = line;
            const errs = node.getErrors();
            errs.forEach(err => errors.push(err));
            delete node._cachedLineNumber;
            line++;
        }
        return errors;
    }
    getErrorsInGrammarExamples() {
        const programConstructor = this.getRootConstructor();
        const errors = [];
        this.getNodeTypeDefinitions().forEach(def => def.getExamples().forEach(example => {
            const exampleProgram = new programConstructor(example.childrenToString());
            exampleProgram.getProgramErrors().forEach(err => {
                errors.push(err);
            });
        }));
        return errors;
    }
    getTargetExtension() {
        return this._getGrammarRootNode().getTargetExtension();
    }
    getNodeTypeOrder() {
        return this._getGrammarRootNode().get(GrammarConstants_1.GrammarConstants.nodeTypeOrder);
    }
    getCellTypeDefinitions() {
        if (!this._cache_cellTypes)
            this._cache_cellTypes = this._getCellTypeDefinitions();
        return this._cache_cellTypes;
    }
    getCellTypeDefinitionById(cellTypeId) {
        // todo: return unknownCellTypeDefinition? or is that handled somewhere else?
        return this.getCellTypeDefinitions()[cellTypeId];
    }
    getNodeTypeFamilyTree() {
        const tree = new TreeNode_1.default();
        Object.values(this.getNodeTypeDefinitions()).forEach(node => {
            const path = node.getAncestorNodeTypeIdsArray().join(" ");
            tree.touchNode(path);
        });
        return tree;
    }
    _getCellTypeDefinitions() {
        const types = {};
        // todo: add built in word types?
        this.getChildrenByNodeConstructor(GrammarCellTypeDefinitionNode_1.default).forEach(type => (types[type.getCellTypeId()] = type));
        return types;
    }
    getProgram() {
        return this;
    }
    getNodeTypeDefinitions() {
        return this.getChildrenByNodeConstructor(GrammarNodeTypeDefinitionNode_1.default);
    }
    // todo: remove?
    getTheGrammarFilePath() {
        return this.getLine();
    }
    _getGrammarRootNode() {
        return this.getNodeByType(GrammarRootNode);
    }
    getExtensionName() {
        return this.getGrammarName();
    }
    getGrammarName() {
        return this._getGrammarRootNode().get(GrammarConstants_1.GrammarConstants.name);
    }
    _getInScopeNodeTypeIds() {
        const nodeTypesNode = this._getGrammarRootNode().getNode(GrammarConstants_1.GrammarConstants.inScope);
        return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : [];
    }
    getNodeTypeDefinitionByFirstWordPath(firstWordPath) {
        if (!this._cachedDefinitions)
            this._cachedDefinitions = {};
        if (this._cachedDefinitions[firstWordPath])
            return this._cachedDefinitions[firstWordPath];
        const parts = firstWordPath.split(" ");
        let subject = this;
        let def;
        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            def = subject.getRunTimeFirstWordMapWithDefinitions()[part];
            if (!def)
                def = subject._getCatchAllNodeTypeDefinition();
            subject = def;
        }
        this._cachedDefinitions[firstWordPath] = def;
        return def;
    }
    getDocs() {
        return this.toString();
    }
    _initProgramNodeTypeDefinitionCache() {
        if (this._cache_nodeTypeDefinitions)
            return undefined;
        this._cache_nodeTypeDefinitions = {};
        this.getChildrenByNodeConstructor(GrammarNodeTypeDefinitionNode_1.default).forEach(nodeTypeDefinitionNode => {
            this._cache_nodeTypeDefinitions[nodeTypeDefinitionNode.getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode;
        });
    }
    // todo: protected?
    _getProgramNodeTypeDefinitionCache() {
        this._initProgramNodeTypeDefinitionCache();
        return this._cache_nodeTypeDefinitions;
    }
    // todo: protected?
    _getRunTimeCatchAllNodeTypeId() {
        return this._getGrammarRootNode().get(GrammarConstants_1.GrammarConstants.catchAllNodeType);
    }
    _getRootConstructor() {
        const extendedConstructor = this._getGrammarRootNode().getConstructorDefinedInGrammar() || AbstractRuntimeNodes_1.AbstractRuntimeProgramRootNode;
        const grammarProgram = this;
        // Note: this is some of the most unorthodox code in this repo. We create a class on the fly for your
        // new language.
        return class extends extendedConstructor {
            getGrammarProgram() {
                return grammarProgram;
            }
        };
    }
    getRootConstructor() {
        if (!this._cache_rootConstructorClass)
            this._cache_rootConstructorClass = this._getRootConstructor();
        return this._cache_rootConstructorClass;
    }
    _getFileExtensions() {
        return this._getGrammarRootNode().get(GrammarConstants_1.GrammarConstants.extensions)
            ? this._getGrammarRootNode()
                .get(GrammarConstants_1.GrammarConstants.extensions)
                .split(" ")
                .join(",")
            : this.getExtensionName();
    }
    toNodeJsJavascript(jtreePath = "jtree") {
        return this._toJavascript(jtreePath, true);
    }
    toBrowserJavascript() {
        return this._toJavascript("", false);
    }
    _getRootClassName() {
        return this.getExtensionName() + "Program";
    }
    _toJavascript(jtreePath, forNodeJs = true) {
        const nodeTypeClasses = this.getNodeTypeDefinitions()
            .map(def => def._toJavascript())
            .join("\n\n");
        const components = [this.getNodeConstructorToJavascript()].filter(code => code);
        const rootClass = `class ${this._getRootClassName()} extends jtree.programRoot {
  getGrammarProgram() {}
  ${components.join("\n")}
    }`;
        return `${forNodeJs ? `const jtree = require("${jtreePath}")` : ""}

${nodeTypeClasses}

${rootClass}

${forNodeJs ? "module.exports = " + this._getRootClassName() : ""}
`;
    }
    toSublimeSyntaxFile() {
        const types = this.getCellTypeDefinitions();
        const variables = Object.keys(types)
            .map(name => ` ${name}: '${types[name].getRegexString()}'`)
            .join("\n");
        const defs = this.getNodeTypeDefinitions().filter(kw => !kw._isAbstract());
        const nodeTypeContexts = defs.map(def => def.getMatchBlock()).join("\n\n");
        const includes = defs.map(nodeTypeDef => `  - include: '${nodeTypeDef.getSublimeSyntaxContextId()}'`).join("\n");
        return `%YAML 1.2
---
name: ${this.getExtensionName()}
file_extensions: [${this._getFileExtensions()}]
scope: source.${this.getExtensionName()}

variables:
${variables}

contexts:
 main:
${includes}

${nodeTypeContexts}`;
    }
    // A language where anything goes.
    static getTheAnyLanguageRootConstructor() {
        return this.newFromCondensed(`${GrammarConstants_1.GrammarConstants.grammar}
 ${GrammarConstants_1.GrammarConstants.name} any
 ${GrammarConstants_1.GrammarConstants.catchAllNodeType} anyNode
${GrammarConstants_1.GrammarConstants.nodeType} anyNode
 ${GrammarConstants_1.GrammarConstants.catchAllCellType} anyWord
 ${GrammarConstants_1.GrammarConstants.firstCellType} anyWord
${GrammarConstants_1.GrammarConstants.cellType} anyWord`).getRootConstructor();
    }
    static _condensedToExpanded(grammarCode) {
        // todo: handle imports
        const tree = new TreeNode_1.default(grammarCode);
        // Expand groups
        // todo: rename? maybe change this to something like "makeNodeTypes"?
        // todo: where is this used? if we had imports, would that be a better solution?
        const xi = tree.getXI();
        tree.findNodes(`${GrammarConstants_1.GrammarConstants.abstract}${xi}${GrammarConstants_1.GrammarConstants.group}`).forEach(group => {
            const abstractName = group.getParent().getWord(1);
            group
                .getContent()
                .split(xi)
                .forEach(word => tree.appendLine(`${GrammarConstants_1.GrammarConstants.nodeType}${xi}${word}${xi}${abstractName}`));
        });
        // todo: only expand certain types.
        // inScope should be a set.
        tree._expandChildren(1, 2, tree.filter(node => node.getFirstWord() !== GrammarConstants_1.GrammarConstants.toolingDirective));
        return tree;
    }
    static newFromCondensed(grammarCode, grammarPath) {
        return new GrammarProgram(this._condensedToExpanded(grammarCode), grammarPath);
    }
    async loadAllConstructorScripts(baseUrlPath) {
        if (!this.isBrowser())
            return undefined;
        const uniqueScriptsSet = new Set(this.getNodesByGlobPath(`* ${GrammarConstants_1.GrammarConstants.constructors} ${GrammarConstants_1.GrammarConstants.constructorBrowser}`)
            .filter(node => node.getWord(2))
            .map(node => baseUrlPath + node.getWord(2)));
        return Promise.all(Array.from(uniqueScriptsSet).map(script => GrammarProgram._appendScriptOnce(script)));
    }
    static async _appendScriptOnce(url) {
        // if (this.isNodeJs()) return undefined
        if (!url)
            return undefined;
        if (this._scriptLoadingPromises[url])
            return this._scriptLoadingPromises[url];
        this._scriptLoadingPromises[url] = this._appendScript(url);
        return this._scriptLoadingPromises[url];
    }
    static _appendScript(url) {
        //https://bradb.net/blog/promise-based-js-script-loader/
        return new Promise(function (resolve, reject) {
            let resolved = false;
            const scriptEl = document.createElement("script");
            scriptEl.type = "text/javascript";
            scriptEl.src = url;
            scriptEl.async = true;
            scriptEl.onload = scriptEl.onreadystatechange = function () {
                if (!resolved && (!this.readyState || this.readyState == "complete")) {
                    resolved = true;
                    resolve(url);
                }
            };
            scriptEl.onerror = scriptEl.onabort = reject;
            document.head.appendChild(scriptEl);
        });
    }
}
GrammarProgram._scriptLoadingPromises = {};
exports.default = GrammarProgram;
