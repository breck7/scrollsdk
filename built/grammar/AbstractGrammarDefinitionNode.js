"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarDefinitionErrorNode_1 = require("./GrammarDefinitionErrorNode");
const GrammarCustomConstructorNode_1 = require("./GrammarCustomConstructorNode");
const GrammarCompilerNode_1 = require("./GrammarCompilerNode");
const GrammarConstantsNode_1 = require("./GrammarConstantsNode");
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
const GrammarBackedAnyNode_1 = require("./GrammarBackedAnyNode");
const GrammarBackedTerminalNode_1 = require("./GrammarBackedTerminalNode");
class AbstractGrammarDefinitionNode extends TreeNode_1.default {
    getKeywordMap() {
        const types = [
            GrammarConstants_1.default.frequency,
            GrammarConstants_1.default.keywords,
            GrammarConstants_1.default.columns,
            GrammarConstants_1.default.description,
            GrammarConstants_1.default.catchAllKeyword,
            GrammarConstants_1.default.defaults
        ];
        const map = {};
        types.forEach(type => {
            map[type] = TreeNode_1.default;
        });
        map[GrammarConstants_1.default.constants] = GrammarConstantsNode_1.default;
        map[GrammarConstants_1.default.compilerKeyword] = GrammarCompilerNode_1.default;
        map[GrammarConstants_1.default.constructor] = GrammarCustomConstructorNode_1.default;
        return map;
    }
    getId() {
        return this.getWord(1);
    }
    _isNonTerminal() {
        return this._isAnyNode() || this.has(GrammarConstants_1.default.keywords) || this.has(GrammarConstants_1.default.catchAllKeyword);
    }
    _isAbstract() {
        return false;
    }
    _isAnyNode() {
        return this.has(GrammarConstants_1.default.any);
    }
    _getCustomDefinedConstructorNode() {
        return (this.getNodeByColumns(GrammarConstants_1.default.constructor, GrammarConstants_1.default.constructorJs));
    }
    getDefinedConstructor() {
        if (!this._cache_definedNodeConstructor)
            this._cache_definedNodeConstructor = this._getDefinedNodeConstructor();
        return this._cache_definedNodeConstructor;
    }
    _getDefaultNodeConstructor() {
        if (this._isAnyNode())
            return GrammarBackedAnyNode_1.default;
        return this._isNonTerminal() ? GrammarBackedNonTerminalNode_1.default : GrammarBackedTerminalNode_1.default;
    }
    /* Node constructor is the actual JS class being initiated, different than the Node type. */
    _getDefinedNodeConstructor() {
        const customConstructorDefinition = this._getCustomDefinedConstructorNode();
        if (customConstructorDefinition)
            return customConstructorDefinition.getDefinedConstructor();
        return this._getDefaultNodeConstructor();
    }
    getCatchAllNodeConstructor(line) {
        return GrammarDefinitionErrorNode_1.default;
    }
    getProgram() {
        return this.getParent();
    }
    getDefinitionCompilerNode(targetLanguage, node) {
        const compilerNode = this._getCompilerNodes().find(node => node.getTargetExtension() === targetLanguage);
        if (!compilerNode)
            throw new Error(`No compiler for language "${targetLanguage}" for line "${node.getLine()}"`);
        return compilerNode;
    }
    _getCompilerNodes() {
        return this.getChildrenByNodeType(GrammarCompilerNode_1.default) || [];
    }
    // todo: remove?
    // for now by convention first compiler is "target extension"
    getTargetExtension() {
        const firstNode = this._getCompilerNodes()[0];
        return firstNode ? firstNode.getTargetExtension() : "";
    }
    getRunTimeKeywordMap() {
        this._initKeywordsMapCache();
        return this._cache_keywordsMap;
    }
    getRunTimeKeywordNames() {
        return Object.keys(this.getRunTimeKeywordMap());
    }
    getRunTimeKeywordMapWithDefinitions() {
        const defs = this._getProgramKeywordDefinitionCache();
        return TreeUtils_1.default.mapValues(this.getRunTimeKeywordMap(), key => defs[key]);
    }
    getNodeColumnTypes() {
        const parameters = this.get(GrammarConstants_1.default.columns);
        return parameters ? parameters.split(" ") : [];
    }
    /*
     {key<string>: JSKeywordDefClass}
    */
    _initKeywordsMapCache() {
        if (this._cache_keywordsMap)
            return undefined;
        // todo: make this handle extensions.
        const keywordsInScope = this._getKeywordsInScope();
        this._cache_keywordsMap = {};
        // terminals dont have acceptable keywords
        if (!keywordsInScope.length)
            return undefined;
        const allProgramKeywordDefinitions = this._getProgramKeywordDefinitionCache();
        const keywords = Object.keys(allProgramKeywordDefinitions);
        keywords
            .filter(keyword => allProgramKeywordDefinitions[keyword].isOrExtendsAKeywordInScope(keywordsInScope))
            .filter(keyword => !allProgramKeywordDefinitions[keyword]._isAbstract())
            .forEach(keyword => {
            this._cache_keywordsMap[keyword] = allProgramKeywordDefinitions[keyword].getDefinedConstructor();
        });
    }
    _getKeywordsInScope() {
        const keywords = this._getKeywordsNode();
        return keywords ? keywords.getKeywords() : [];
    }
    getTopNodeTypes() {
        const definitions = this._getProgramKeywordDefinitionCache();
        const keywords = this.getRunTimeKeywordMap();
        const arr = Object.keys(keywords).map(keyword => definitions[keyword]);
        arr.sort(TreeUtils_1.default.sortByAccessor(definition => definition.getFrequency()));
        arr.reverse();
        return arr.map(definition => definition.getId());
    }
    _getKeywordsNode() {
        return this.getNode(GrammarConstants_1.default.keywords);
    }
    // todo: protected?
    _getRunTimeCatchAllKeyword() {
        return "";
    }
    getDefinitionByName(keyword) {
        const definitions = this._getProgramKeywordDefinitionCache();
        return definitions[keyword] || this._getCatchAllDefinition(); // todo: this is where we might do some type of keyword lookup for user defined fns.
    }
    _getCatchAllDefinition() {
        const catchAllKeyword = this._getRunTimeCatchAllKeyword();
        const definitions = this._getProgramKeywordDefinitionCache();
        const def = definitions[catchAllKeyword];
        // todo: implement contraints like a grammar file MUST have a catch all.
        return def ? def : this.getParent()._getCatchAllDefinition();
    }
    _initCatchAllNodeConstructorCache() {
        if (this._cache_catchAllConstructor)
            return undefined;
        this._cache_catchAllConstructor = this._getCatchAllDefinition().getDefinedConstructor();
    }
    getAutocompleteWords(inputStr, additionalWords = []) {
        // todo: add more tests
        const str = this.getRunTimeKeywordNames()
            .concat(additionalWords)
            .join("\n");
        // default is to just autocomplete using all words in existing program.
        return TreeUtils_1.default.getUniqueWordsArray(str)
            .filter(obj => obj.word.includes(inputStr) && obj.word !== inputStr)
            .map(obj => obj.word);
    }
    isDefined(keyword) {
        return !!this._getProgramKeywordDefinitionCache()[keyword.toLowerCase()];
    }
    // todo: protected?
    _getProgramKeywordDefinitionCache() { }
    getRunTimeCatchAllNodeConstructor() {
        this._initCatchAllNodeConstructorCache();
        return this._cache_catchAllConstructor;
    }
}
exports.default = AbstractGrammarDefinitionNode;
