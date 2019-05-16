"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const AbstractRuntimeProgram_1 = require("./AbstractRuntimeProgram");
const GrammarConstants_1 = require("./GrammarConstants");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
const GrammarKeywordDefinitionNode_1 = require("./GrammarKeywordDefinitionNode");
const GrammarCellTypeDefinitionNode_1 = require("./GrammarCellTypeDefinitionNode");
class GrammarRootNode extends AbstractGrammarDefinitionNode_1.default {
    _getDefaultNodeConstructor() {
        return undefined;
    }
    getProgram() {
        return this.getParent();
    }
    getKeywordMap() {
        // todo: this isn't quite correct. we are allowing too many keywords.
        const map = super.getKeywordMap();
        map[GrammarConstants_1.GrammarConstants.extensions] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.version] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.name] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.keywordOrder] = TreeNode_1.default;
        return map;
    }
}
class GrammarAbstractKeywordDefinitionNode extends GrammarKeywordDefinitionNode_1.default {
    _isAbstract() {
        return true;
    }
}
// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode_1.default {
    getKeywordMap() {
        const map = {};
        map[GrammarConstants_1.GrammarConstants.grammar] = GrammarRootNode;
        map[GrammarConstants_1.GrammarConstants.cellType] = GrammarCellTypeDefinitionNode_1.default;
        map[GrammarConstants_1.GrammarConstants.keyword] = GrammarKeywordDefinitionNode_1.default;
        map[GrammarConstants_1.GrammarConstants.abstract] = GrammarAbstractKeywordDefinitionNode;
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
        this.getKeywordDefinitions().forEach(def => def.getExamples().forEach(example => {
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
    getKeywordOrder() {
        return this._getGrammarRootNode().get(GrammarConstants_1.GrammarConstants.keywordOrder);
    }
    getCellTypeDefinitions() {
        if (!this._cache_cellTypes)
            this._cache_cellTypes = this._getCellTypeDefinitions();
        return this._cache_cellTypes;
    }
    getCellTypeDefinition(word) {
        const type = this.getCellTypeDefinitions()[word];
        // todo: return unknownCellTypeDefinition
        return type;
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
    getKeywordDefinitions() {
        return this.getChildrenByNodeConstructor(GrammarKeywordDefinitionNode_1.default);
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
    _getKeywordsNode() {
        return this._getGrammarRootNode().getNode(GrammarConstants_1.GrammarConstants.keywords);
    }
    getKeywordDefinitionByKeywordPath(keywordPath) {
        if (!this._cachedDefinitions)
            this._cachedDefinitions = {};
        if (this._cachedDefinitions[keywordPath])
            return this._cachedDefinitions[keywordPath];
        const parts = keywordPath.split(" ");
        let subject = this;
        let def;
        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            def = subject.getRunTimeKeywordMapWithDefinitions()[part];
            if (!def)
                def = subject._getCatchAllDefinition();
            subject = def;
        }
        this._cachedDefinitions[keywordPath] = def;
        return def;
    }
    getDocs() {
        return this.toString();
    }
    _initProgramKeywordDefinitionCache() {
        if (this._cache_keywordDefinitions)
            return undefined;
        this._cache_keywordDefinitions = {};
        this.getChildrenByNodeConstructor(GrammarKeywordDefinitionNode_1.default).forEach(keywordDefinitionNode => {
            this._cache_keywordDefinitions[keywordDefinitionNode.getId()] = keywordDefinitionNode;
        });
    }
    // todo: protected?
    _getProgramKeywordDefinitionCache() {
        this._initProgramKeywordDefinitionCache();
        return this._cache_keywordDefinitions;
    }
    // todo: protected?
    _getRunTimeCatchAllKeyword() {
        return this._getGrammarRootNode().get(GrammarConstants_1.GrammarConstants.catchAllKeyword);
    }
    _getRootConstructor() {
        const extendedConstructor = this._getGrammarRootNode().getConstructorDefinedInGrammar() || AbstractRuntimeProgram_1.default;
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
    toSublimeSyntaxFile() {
        const types = this.getCellTypeDefinitions();
        const variables = Object.keys(types)
            .map(name => ` ${name}: '${types[name].getRegexString()}'`)
            .join("\n");
        const keywords = this.getKeywordDefinitions().filter(kw => !kw._isAbstract());
        const keywordContexts = keywords.map(def => def.getMatchBlock()).join("\n\n");
        const includes = keywords.map(keyword => `  - include: '${keyword.getSyntaxContextId()}'`).join("\n");
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

${keywordContexts}`;
    }
    // A language where anything goes.
    static getTheAnyLanguageRootConstructor() {
        return this.newFromCondensed(`${GrammarConstants_1.GrammarConstants.grammar} any
 ${GrammarConstants_1.GrammarConstants.catchAllKeyword} any
${GrammarConstants_1.GrammarConstants.keyword} any
 ${GrammarConstants_1.GrammarConstants.catchAllCellType} any
${GrammarConstants_1.GrammarConstants.cellType} any`).getRootConstructor();
    }
    static newFromCondensed(grammarCode, grammarPath) {
        // todo: handle imports
        const tree = new TreeNode_1.default(grammarCode);
        // Expand groups
        // todo: rename? maybe change this to "make" or "quickKeywords"?
        const xi = tree.getXI();
        tree.findNodes(`${GrammarConstants_1.GrammarConstants.abstract}${xi}${GrammarConstants_1.GrammarConstants.group}`).forEach(group => {
            const abstractName = group.getParent().getWord(1);
            group
                .getContent()
                .split(xi)
                .forEach(word => tree.appendLine(`${GrammarConstants_1.GrammarConstants.keyword}${xi}${word}${xi}${abstractName}`));
        });
        return new GrammarProgram(tree.getExpanded(1, 2), grammarPath);
    }
    loadAllConstructorScripts(baseUrlPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isBrowser())
                return undefined;
            const uniqueScriptsSet = new Set(this.getNodesByGlobPath(`* ${GrammarConstants_1.GrammarConstants.constructors} ${GrammarConstants_1.GrammarConstants.constructorBrowser}`)
                .filter(node => node.getWord(2))
                .map(node => baseUrlPath + node.getWord(2)));
            return Promise.all(Array.from(uniqueScriptsSet).map(script => GrammarProgram._appendScriptOnce(script)));
        });
    }
    static _appendScriptOnce(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (this.isNodeJs()) return undefined
            if (!url)
                return undefined;
            if (this._scriptLoadingPromises[url])
                return this._scriptLoadingPromises[url];
            this._scriptLoadingPromises[url] = this._appendScript(url);
            return this._scriptLoadingPromises[url];
        });
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
