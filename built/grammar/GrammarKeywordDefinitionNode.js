"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarConstantsNode_1 = require("./GrammarConstantsNode");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode_1.default {
    // todo: protected?
    _getRunTimeCatchAllKeyword() {
        return (this.get(GrammarConstants_1.GrammarConstants.catchAllKeyword) ||
            this.getParent()._getRunTimeCatchAllKeyword());
    }
    isOrExtendsAKeywordInScope(keywordsInScope) {
        const chain = this._getKeywordChain();
        return keywordsInScope.some(keyword => chain[keyword]);
    }
    getSyntaxContextId() {
        return this.getId().replace(/\#/g, "HASH"); // # is not allowed in sublime context names
    }
    getMatchBlock() {
        const program = this.getProgram();
        const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const color = (this.getHighlightScope() || "source") + "." + this.getId();
        const match = `'^ *${escapeRegExp(this.getId())}(?: |$)'`;
        const topHalf = ` '${this.getSyntaxContextId()}':
  - match: ${match}
    scope: ${color}`;
        const cols = this.getNodeColumnTypes();
        if (!cols.length)
            return topHalf;
        const captures = cols
            .map((col, index) => {
            const wordType = program.getWordType(col); // todo: cleanup
            if (!wordType)
                throw new Error(`No column type ${col} found`); // todo: standardize error/capture error at grammar time
            return `        ${index + 1}: ${(wordType.getHighlightScope() || "source") + "." + wordType.getId()}`;
        })
            .join("\n");
        const colsToRegex = cols => {
            return cols.map(col => `({{${col.replace("*", "")}}})?`).join(" ?");
        };
        return `${topHalf}
    push:
     - match: ${colsToRegex(cols)}
       captures:
${captures}
     - match: $
       pop: true`;
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
        return this.getProgram()._getProgramKeywordDefinitionCache();
    }
    getDoc() {
        return this.getId();
    }
    _getDefaultsNode() {
        return this.get(GrammarConstants_1.GrammarConstants.defaults);
    }
    // todo: deprecate?
    getDefaultFor(name) {
        const defaults = this._getDefaultsNode();
        return defaults ? defaults.get(name) : undefined;
    }
    getDescription() {
        return this.get(GrammarConstants_1.GrammarConstants.description) || "";
    }
    getConstantsObject() {
        const constantsNode = this.getNodeByType(GrammarConstantsNode_1.default);
        return constantsNode ? constantsNode.getConstantsObj() : {};
    }
    getFrequency() {
        const val = this.get(GrammarConstants_1.GrammarConstants.frequency);
        return val ? parseFloat(val) : 0;
    }
}
exports.default = GrammarKeywordDefinitionNode;
