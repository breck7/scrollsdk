"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarConstantsNode_1 = require("./GrammarConstantsNode");
const GrammarExampleNode_1 = require("./GrammarExampleNode");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode_1.default {
    // todo: protected?
    _getRunTimeCatchAllKeyword() {
        return (this.get(GrammarConstants_1.GrammarConstants.catchAllKeyword) ||
            this.getParent()._getRunTimeCatchAllKeyword());
    }
    isOrExtendsAKeywordInScope(keywordsInScope) {
        const chain = this.getKeywordInheritanceSet();
        return keywordsInScope.some(keyword => chain.has(keyword));
    }
    getSyntaxContextId() {
        return this.getId().replace(/\#/g, "HASH"); // # is not allowed in sublime context names
    }
    getMatchBlock() {
        const defaultHighlightScope = "source";
        const program = this.getProgram();
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const color = (this.getHighlightScope() || defaultHighlightScope) + "." + this.getId();
        const match = `'^ *${escapeRegExp(this.getId())}(?: |$)'`;
        const topHalf = ` '${this.getSyntaxContextId()}':
  - match: ${match}
    scope: ${color}`;
        const requiredCellTypeNames = this.getRequiredCellTypeNames();
        const catchAllCellTypeName = this.getCatchAllCellTypeName();
        if (catchAllCellTypeName)
            requiredCellTypeNames.push(catchAllCellTypeName);
        if (!requiredCellTypeNames.length)
            return topHalf;
        const captures = requiredCellTypeNames
            .map((typeName, index) => {
            const cellTypeDefinition = program.getCellTypeDefinition(typeName); // todo: cleanup
            if (!cellTypeDefinition)
                throw new Error(`No ${GrammarConstants_1.GrammarConstants.cellType} ${typeName} found`); // todo: standardize error/capture error at grammar time
            return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) +
                "." +
                cellTypeDefinition.getCellTypeId()}`;
        })
            .join("\n");
        const cellTypesToRegex = (cellTypeNames) => cellTypeNames.map((cellTypeName) => `({{${cellTypeName}}})?`).join(" ?");
        return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeNames)}
       captures:
${captures}
     - match: $
       pop: true`;
    }
    getKeywordInheritanceSet() {
        this._initKeywordInheritanceSetCache();
        return this._cache_keywordInheritanceSet;
    }
    _getParentKeyword() {
        return this.getWord(2);
    }
    _initKeywordInheritanceSetCache() {
        if (this._cache_keywordInheritanceSet)
            return undefined;
        const cache = new Set();
        cache.add(this.getId());
        const parentKeyword = this._getParentKeyword();
        if (parentKeyword) {
            cache.add(parentKeyword);
            const defs = this._getProgramKeywordDefinitionCache();
            const parentDef = defs[parentKeyword];
            if (!parentDef)
                throw new Error(`${parentKeyword} not found`);
            for (let keyword of parentDef.getKeywordInheritanceSet()) {
                cache.add(keyword);
            }
        }
        this._cache_keywordInheritanceSet = cache;
    }
    // todo: protected?
    _getProgramKeywordDefinitionCache() {
        return this.getProgram()._getProgramKeywordDefinitionCache();
    }
    getDoc() {
        return this.getId();
    }
    _getDefaultsNode() {
        return this.getNode(GrammarConstants_1.GrammarConstants.defaults);
    }
    // todo: deprecate?
    getDefaultFor(name) {
        const defaults = this._getDefaultsNode();
        return defaults ? defaults.get(name) : undefined;
    }
    getDescription() {
        return this.get(GrammarConstants_1.GrammarConstants.description) || "";
    }
    getExamples() {
        return this.getChildrenByNodeConstructor(GrammarExampleNode_1.default);
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
