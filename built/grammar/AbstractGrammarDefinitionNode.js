"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarCustomConstructorsNode_1 = require("./GrammarCustomConstructorsNode");
const GrammarCompilerNode_1 = require("./GrammarCompilerNode");
const GrammarExampleNode_1 = require("./GrammarExampleNode");
const GrammarConstantsNode_1 = require("./GrammarConstantsNode");
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
const GrammarBackedBlobNode_1 = require("./GrammarBackedBlobNode");
const GrammarBackedTerminalNode_1 = require("./GrammarBackedTerminalNode");
const TreeErrorTypes_1 = require("./TreeErrorTypes");
class GrammarDefinitionErrorNode extends TreeNode_1.default {
    getErrors() {
        return [this.getFirstWord() ? new TreeErrorTypes_1.UnknownNodeTypeError(this) : new TreeErrorTypes_1.BlankLineError(this)];
    }
    getLineCellTypes() {
        return [GrammarConstants_1.GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => GrammarConstants_1.GrammarStandardCellTypeIds.any)).join(" ");
    }
}
class AbstractGrammarDefinitionNode extends TreeNode_1.default {
    getFirstWordMap() {
        const types = [
            GrammarConstants_1.GrammarConstants.frequency,
            GrammarConstants_1.GrammarConstants.inScope,
            GrammarConstants_1.GrammarConstants.cells,
            GrammarConstants_1.GrammarConstants.description,
            GrammarConstants_1.GrammarConstants.catchAllNodeType,
            GrammarConstants_1.GrammarConstants.catchAllCellType,
            GrammarConstants_1.GrammarConstants.firstCellType,
            GrammarConstants_1.GrammarConstants.defaults,
            GrammarConstants_1.GrammarConstants.tags,
            GrammarConstants_1.GrammarConstants.blob,
            GrammarConstants_1.GrammarConstants.group,
            GrammarConstants_1.GrammarConstants.required,
            GrammarConstants_1.GrammarConstants.single
        ];
        const map = {};
        types.forEach(type => {
            map[type] = TreeNode_1.default;
        });
        map[GrammarConstants_1.GrammarConstants.constants] = GrammarConstantsNode_1.default;
        map[GrammarConstants_1.GrammarConstants.compilerNodeType] = GrammarCompilerNode_1.default;
        map[GrammarConstants_1.GrammarConstants.constructors] = GrammarCustomConstructorsNode_1.default;
        map[GrammarConstants_1.GrammarConstants.example] = GrammarExampleNode_1.default;
        return map;
    }
    getNodeTypeIdFromDefinition() {
        return this.getWord(1);
    }
    getGeneratedClassName() {
        const id = this.getNodeTypeIdFromDefinition();
        const safeId = id.replace(/\./g, "_");
        return `${safeId}Node`;
    }
    getNodeConstructorToJavascript() {
        const nodeMap = this.getRunTimeFirstWordMapWithDefinitions();
        // if THIS node defines a catch all constructor, use that
        // IF IT DOES NOT, ADD NOTHING
        // if THIS node defines a keyword map, use that first
        // IF IT DOES NOT, ADD NOTHING
        // CHECK PARENTS TOO
        const firstWordMap = Object.keys(nodeMap)
            .map(firstWord => `"${firstWord}" : ${nodeMap[firstWord].getGeneratedClassName()}`)
            .join(",\n");
        if (firstWordMap)
            return `getNodeConstructor(line) {
return this.getFirstWordMap()[this._getFirstWord(line)] || this.getCatchAllNodeConstructor(line)
  return {${firstWordMap}}
  }`;
    }
    _isNonTerminal() {
        return this._isBlobNode() || this.has(GrammarConstants_1.GrammarConstants.inScope) || this.has(GrammarConstants_1.GrammarConstants.catchAllNodeType);
    }
    _isAbstract() {
        return false;
    }
    _isBlobNode() {
        return this.has(GrammarConstants_1.GrammarConstants.blob);
    }
    getConstructorDefinedInGrammar() {
        if (!this._cache_definedNodeConstructor)
            this._cache_definedNodeConstructor = this._getDefinedNodeConstructor();
        return this._cache_definedNodeConstructor;
    }
    _getDefaultNodeConstructor() {
        if (this._isBlobNode())
            return GrammarBackedBlobNode_1.default;
        return this._isNonTerminal() ? GrammarBackedNonTerminalNode_1.default : GrammarBackedTerminalNode_1.default;
    }
    /* Node constructor is the actual JS class being initiated, different than the Node type. */
    _getDefinedNodeConstructor() {
        const customConstructorsDefinition = this.getChildrenByNodeConstructor(GrammarCustomConstructorsNode_1.default)[0];
        if (customConstructorsDefinition) {
            const envConstructor = customConstructorsDefinition.getConstructorForEnvironment();
            if (envConstructor)
                return envConstructor.getTheDefinedConstructor();
        }
        return this._getDefaultNodeConstructor();
    }
    getCatchAllNodeConstructor(line) {
        return GrammarDefinitionErrorNode;
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
        return this.getChildrenByNodeConstructor(GrammarCompilerNode_1.default) || [];
    }
    // todo: remove?
    // for now by convention first compiler is "target extension"
    getTargetExtension() {
        const firstNode = this._getCompilerNodes()[0];
        return firstNode ? firstNode.getTargetExtension() : "";
    }
    getRunTimeFirstWordMap() {
        this._initRunTimeFirstWordToNodeConstructorMap();
        return this._cache_runTimeFirstWordToNodeConstructorMap;
    }
    getRunTimeNodeTypeIds() {
        return Object.keys(this.getRunTimeFirstWordMap());
    }
    getRunTimeFirstWordMapWithDefinitions() {
        const defs = this._getProgramNodeTypeDefinitionCache();
        return TreeUtils_1.default.mapValues(this.getRunTimeFirstWordMap(), key => defs[key]);
    }
    getRequiredCellTypeIds() {
        const parameters = this.get(GrammarConstants_1.GrammarConstants.cells);
        return parameters ? parameters.split(" ") : [];
    }
    getGetters() {
        const requireds = this.getRequiredCellTypeIds().map((cellTypeId, index) => `get ${cellTypeId}() {
      return this.getWord(${index + 1})
    }`);
        const catchAllCellTypeId = this.getCatchAllCellTypeId();
        if (catchAllCellTypeId)
            requireds.push(`get ${catchAllCellTypeId}() {
      return this.getWordsFrom(${requireds.length + 1})
    }`);
        return requireds;
    }
    getCatchAllCellTypeId() {
        return this.get(GrammarConstants_1.GrammarConstants.catchAllCellType);
    }
    _initRunTimeFirstWordToNodeConstructorMap() {
        if (this._cache_runTimeFirstWordToNodeConstructorMap)
            return undefined;
        // todo: make this handle extensions.
        const nodeTypeIdsInScope = this._getInScopeNodeTypeIds();
        this._cache_runTimeFirstWordToNodeConstructorMap = {};
        // terminals dont have acceptable firstWords
        if (!nodeTypeIdsInScope.length)
            return undefined;
        const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache();
        const nodeTypeIds = Object.keys(allProgramNodeTypeDefinitionsMap);
        nodeTypeIds
            .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
            .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
            .forEach(nodeTypeId => {
            this._cache_runTimeFirstWordToNodeConstructorMap[nodeTypeId] = allProgramNodeTypeDefinitionsMap[nodeTypeId].getConstructorDefinedInGrammar();
        });
    }
    getTopNodeTypeIds() {
        const definitions = this._getProgramNodeTypeDefinitionCache();
        const firstWords = this.getRunTimeFirstWordMap();
        const arr = Object.keys(firstWords).map(firstWord => definitions[firstWord]);
        arr.sort(TreeUtils_1.default.sortByAccessor((definition) => definition.getFrequency()));
        arr.reverse();
        return arr.map(definition => definition.getNodeTypeIdFromDefinition());
    }
    _getParentDefinition() {
        return undefined;
    }
    _getMyInScopeNodeTypeIds() {
        const nodeTypesNode = this.getNode(GrammarConstants_1.GrammarConstants.inScope);
        return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : [];
    }
    _getInScopeNodeTypeIds() {
        // todo: allow multiple of these if we allow mixins?
        const ids = this._getMyInScopeNodeTypeIds();
        const parentDef = this._getParentDefinition();
        return parentDef ? ids.concat(parentDef._getInScopeNodeTypeIds()) : ids;
    }
    isRequired() {
        return this.has(GrammarConstants_1.GrammarConstants.required);
    }
    _shouldBeJustOne() {
        return this.has(GrammarConstants_1.GrammarConstants.single);
    }
    // todo: protected?
    _getRunTimeCatchAllNodeTypeId() {
        return "";
    }
    getNodeTypeDefinitionByNodeTypeId(nodeTypeId) {
        const definitions = this._getProgramNodeTypeDefinitionCache();
        return definitions[nodeTypeId] || this._getCatchAllNodeTypeDefinition(); // todo: this is where we might do some type of firstWord lookup for user defined fns.
    }
    _getCatchAllNodeTypeDefinition() {
        const catchAllNodeTypeId = this._getRunTimeCatchAllNodeTypeId();
        const definitions = this._getProgramNodeTypeDefinitionCache();
        const def = definitions[catchAllNodeTypeId];
        if (def)
            return def;
        // todo: implement contraints like a grammar file MUST have a catch all.
        if (this.isRoot())
            throw new Error(`This grammar language "${this.getProgram().getGrammarName()}" lacks a root catch all definition`);
        else
            return this.getParent()._getCatchAllNodeTypeDefinition();
    }
    _initCatchAllNodeConstructorCache() {
        if (this._cache_catchAllConstructor)
            return undefined;
        this._cache_catchAllConstructor = this._getCatchAllNodeTypeDefinition().getConstructorDefinedInGrammar();
    }
    getFirstCellTypeId() {
        return this.get(GrammarConstants_1.GrammarConstants.firstCellType) || GrammarConstants_1.GrammarStandardCellTypeIds.anyFirstWord;
    }
    isDefined(nodeTypeId) {
        return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId.toLowerCase()];
    }
    // todo: protected?
    _getProgramNodeTypeDefinitionCache() {
        return this.getProgram()._getProgramNodeTypeDefinitionCache();
    }
    getRunTimeCatchAllNodeConstructor() {
        this._initCatchAllNodeConstructorCache();
        return this._cache_catchAllConstructor;
    }
}
exports.default = AbstractGrammarDefinitionNode;
