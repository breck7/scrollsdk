"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarConstantsNode_1 = require("./GrammarConstantsNode");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode_1.default {
    // todo: protected?
    _getRunTimeCatchAllKeyword() {
        return (this.get(GrammarConstants_1.default.catchAllKeyword) ||
            this.getParent()._getRunTimeCatchAllKeyword());
    }
    getKeywordMap() {
        const map = super.getKeywordMap();
        map[GrammarConstants_1.default.any] = TreeNode_1.default;
        map[GrammarConstants_1.default.group] = TreeNode_1.default;
        return map;
    }
    isOrExtendsAKeywordInScope(keywordsInScope) {
        const chain = this._getKeywordChain();
        return keywordsInScope.some(keyword => chain[keyword]);
    }
    _getKeywordChain() {
        this._initKeywordChainCache();
        return this._cache_keywordChain;
    }
    _getParentKeyword() {
        return this.getWord(2);
    }
    _initKeywordChainCache() {
        if (this._cache_keywordChain)
            return undefined;
        const cache = {};
        cache[this.getId()] = true;
        const parentKeyword = this._getParentKeyword();
        if (parentKeyword) {
            cache[parentKeyword] = true;
            const defs = this._getProgramKeywordDefinitionCache();
            const parentDef = defs[parentKeyword];
            if (!parentDef)
                throw new Error(`${parentKeyword} not found`);
            Object.assign(cache, parentDef._getKeywordChain());
        }
        this._cache_keywordChain = cache;
    }
    // todo: protected?
    _getProgramKeywordDefinitionCache() {
        return this.getParent()._getProgramKeywordDefinitionCache();
    }
    getDoc() {
        return this.getId();
    }
    _getDefaultsNode() {
        return this.get(GrammarConstants_1.default.defaults);
    }
    getDefaultFor(name) {
        const defaults = this._getDefaultsNode();
        return defaults ? defaults.get(name) : undefined;
    }
    getDescription() {
        return this.get(GrammarConstants_1.default.description) || "";
    }
    getConstantsObject() {
        const constantsNode = this.getNodeByType(GrammarConstantsNode_1.default);
        return constantsNode ? constantsNode.getConstantsObj() : {};
    }
    getFrequency() {
        const val = this.get(GrammarConstants_1.default.frequency);
        return val ? parseFloat(val) : 0;
    }
}
exports.default = GrammarKeywordDefinitionNode;
