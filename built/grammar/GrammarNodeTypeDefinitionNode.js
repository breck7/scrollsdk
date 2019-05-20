"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarConstantsNode_1 = require("./GrammarConstantsNode");
const GrammarExampleNode_1 = require("./GrammarExampleNode");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode_1.default {
    // todo: protected?
    _getRunTimeCatchAllNodeTypeId() {
        return (this.get(GrammarConstants_1.GrammarConstants.catchAllNodeType) ||
            this.getParent()._getRunTimeCatchAllNodeTypeId());
    }
    getExpectedLineCellTypes() {
        const req = [this.getFirstCellType()].concat(this.getRequiredCellTypeNames());
        const catchAllCellType = this.getCatchAllCellTypeName();
        if (catchAllCellType)
            req.push(catchAllCellType + "*");
        return req.join(" ");
    }
    isOrExtendsANodeTypeInScope(firstWordsInScope) {
        const chain = this.getNodeTypeInheritanceSet();
        return firstWordsInScope.some(firstWord => chain.has(firstWord));
    }
    getSublimeSyntaxContextId() {
        return this.getNodeTypeIdFromDefinition().replace(/\#/g, "HASH"); // # is not allowed in sublime context names
    }
    getMatchBlock() {
        const defaultHighlightScope = "source";
        const program = this.getProgram();
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = `'^ *${escapeRegExp(this.getNodeTypeIdFromDefinition())}(?: |$)'`;
        const topHalf = ` '${this.getSublimeSyntaxContextId()}':
  - match: ${match}`;
        const requiredCellTypeNames = this.getRequiredCellTypeNames();
        const catchAllCellTypeName = this.getCatchAllCellTypeName();
        requiredCellTypeNames.unshift(this.getFirstCellType());
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
    getNodeTypeInheritanceSet() {
        this._initNodeTypeInheritanceSetCache();
        return this._cache_nodeTypeInheritanceSet;
    }
    _getIdOfNodeTypeThatThisExtends() {
        return this.getWord(2);
    }
    _initNodeTypeInheritanceSetCache() {
        if (this._cache_nodeTypeInheritanceSet)
            return undefined;
        const cache = new Set();
        cache.add(this.getNodeTypeIdFromDefinition());
        const extendedNodeTypeId = this._getIdOfNodeTypeThatThisExtends();
        if (extendedNodeTypeId) {
            cache.add(extendedNodeTypeId);
            const defs = this._getProgramNodeTypeDefinitionCache();
            const parentDef = defs[extendedNodeTypeId];
            if (!parentDef)
                throw new Error(`${extendedNodeTypeId} not found`);
            for (let firstWord of parentDef.getNodeTypeInheritanceSet()) {
                cache.add(firstWord);
            }
        }
        this._cache_nodeTypeInheritanceSet = cache;
    }
    // todo: protected?
    _getProgramNodeTypeDefinitionCache() {
        return this.getProgram()._getProgramNodeTypeDefinitionCache();
    }
    getDoc() {
        return this.getNodeTypeIdFromDefinition();
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
exports.default = GrammarNodeTypeDefinitionNode;
