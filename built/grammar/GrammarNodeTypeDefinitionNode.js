"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarExampleNode_1 = require("./GrammarExampleNode");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode_1.default {
    // todo: protected?
    _getRunTimeCatchAllNodeTypeId() {
        return this.get(GrammarConstants_1.GrammarConstants.catchAllNodeType) || this.getParent()._getRunTimeCatchAllNodeTypeId();
    }
    isOrExtendsANodeTypeInScope(firstWordsInScope) {
        const chain = this.getNodeTypeInheritanceSet();
        return firstWordsInScope.some(firstWord => chain.has(firstWord));
    }
    getSublimeSyntaxContextId() {
        return this.getNodeTypeIdFromDefinition().replace(/\#/g, "HASH"); // # is not allowed in sublime context names
    }
    getConstantsObject() {
        const constantsNode = this.getNode(GrammarConstants_1.GrammarConstants.constants);
        return constantsNode ? constantsNode.getConstantsObj() : {};
    }
    _getFirstCellHighlightScope() {
        const program = this.getProgram();
        const cellTypeDefinition = program.getCellTypeDefinitionById(this.getFirstCellTypeId());
        // todo: standardize error/capture error at grammar time
        if (!cellTypeDefinition)
            throw new Error(`No ${GrammarConstants_1.GrammarConstants.cellType} ${this.getFirstCellTypeId()} found`);
        return cellTypeDefinition.getHighlightScope();
    }
    _getParentDefinition() {
        const extendsId = this._getExtendedNodeTypeId();
        return extendsId ? this.getNodeTypeDefinitionByName(extendsId) : undefined;
    }
    getMatchBlock() {
        const defaultHighlightScope = "source";
        const program = this.getProgram();
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const firstWordHighlightScope = (this._getFirstCellHighlightScope() || defaultHighlightScope) + "." + this.getNodeTypeIdFromDefinition();
        const match = `'^ *${escapeRegExp(this.getNodeTypeIdFromDefinition())}(?: |$)'`;
        const topHalf = ` '${this.getSublimeSyntaxContextId()}':
  - match: ${match}
    scope: ${firstWordHighlightScope}`;
        const requiredCellTypeIds = this.getRequiredCellTypeIds();
        const catchAllCellTypeId = this.getCatchAllCellTypeId();
        if (catchAllCellTypeId)
            requiredCellTypeIds.push(catchAllCellTypeId);
        if (!requiredCellTypeIds.length)
            return topHalf;
        const captures = requiredCellTypeIds
            .map((cellTypeId, index) => {
            const cellTypeDefinition = program.getCellTypeDefinitionById(cellTypeId); // todo: cleanup
            if (!cellTypeDefinition)
                throw new Error(`No ${GrammarConstants_1.GrammarConstants.cellType} ${cellTypeId} found`); // todo: standardize error/capture error at grammar time
            return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) + "." + cellTypeDefinition.getCellTypeId()}`;
        })
            .join("\n");
        const cellTypesToRegex = (cellTypeNames) => cellTypeNames.map((cellTypeName) => `({{${cellTypeName}}})?`).join(" ?");
        return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeIds)}
       captures:
${captures}
     - match: $
       pop: true`;
    }
    getNodeTypeInheritanceSet() {
        this._initNodeTypeInheritanceCache();
        return this._cache_nodeTypeInheritanceSet;
    }
    _getIdOfNodeTypeThatThisExtends() {
        return this.getWord(2);
    }
    getAncestorNodeTypeIdsArray() {
        this._initNodeTypeInheritanceCache();
        return this._cache_ancestorNodeTypeIdsArray;
    }
    _initNodeTypeInheritanceCache() {
        if (this._cache_nodeTypeInheritanceSet)
            return undefined;
        let nodeTypeNames = [];
        const extendedNodeTypeId = this._getIdOfNodeTypeThatThisExtends();
        if (extendedNodeTypeId) {
            const defs = this._getProgramNodeTypeDefinitionCache();
            const parentDef = defs[extendedNodeTypeId];
            if (!parentDef)
                throw new Error(`${extendedNodeTypeId} not found`);
            nodeTypeNames = nodeTypeNames.concat(parentDef.getAncestorNodeTypeIdsArray());
        }
        nodeTypeNames.push(this.getNodeTypeIdFromDefinition());
        this._cache_nodeTypeInheritanceSet = new Set(nodeTypeNames);
        this._cache_ancestorNodeTypeIdsArray = nodeTypeNames;
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
    getFrequency() {
        const val = this.get(GrammarConstants_1.GrammarConstants.frequency);
        return val ? parseFloat(val) : 0;
    }
    _getExtendedNodeTypeId() {
        const ancestorIds = this.getAncestorNodeTypeIdsArray();
        if (ancestorIds.length > 1)
            return ancestorIds[ancestorIds.length - 2];
    }
    toJavascript() {
        const ancestorIds = this.getAncestorNodeTypeIdsArray();
        const extendedNodeTypeId = this._getExtendedNodeTypeId();
        const extendsClass = extendedNodeTypeId ? this.getNodeTypeDefinitionByName(extendedNodeTypeId).getGeneratedClassName() : "jtree.NonTerminalNode";
        const components = [this.getNodeConstructorToJavascript(), this.getGetters().join("\n")].filter(code => code);
        return `class ${this.getGeneratedClassName()} extends ${extendsClass} {
      ${components.join("\n")}
    }`;
    }
}
exports.default = GrammarNodeTypeDefinitionNode;
