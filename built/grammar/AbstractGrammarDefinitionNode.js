"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarDefinitionErrorNode_1 = require("./GrammarDefinitionErrorNode");
const GrammarCustomConstructorsNode_1 = require("./GrammarCustomConstructorsNode");
const GrammarCompilerNode_1 = require("./GrammarCompilerNode");
const GrammarExampleNode_1 = require("./GrammarExampleNode");
const GrammarConstantsNode_1 = require("./GrammarConstantsNode");
const GrammarBackedNonTerminalNode_1 = require("./GrammarBackedNonTerminalNode");
const GrammarBackedAnyNode_1 = require("./GrammarBackedAnyNode");
const GrammarBackedTerminalNode_1 = require("./GrammarBackedTerminalNode");
class AbstractGrammarDefinitionNode extends TreeNode_1.default {
    getFirstWordMap() {
        const types = [
            GrammarConstants_1.GrammarConstants.frequency,
            GrammarConstants_1.GrammarConstants.nodeTypes,
            GrammarConstants_1.GrammarConstants.cells,
            GrammarConstants_1.GrammarConstants.description,
            GrammarConstants_1.GrammarConstants.catchAllNodeType,
            GrammarConstants_1.GrammarConstants.catchAllCellType,
            GrammarConstants_1.GrammarConstants.firstCellType,
            GrammarConstants_1.GrammarConstants.defaults,
            GrammarConstants_1.GrammarConstants.tags,
            GrammarConstants_1.GrammarConstants.anySpecial,
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
    _isNonTerminal() {
        return this._isAnyNode() || this.has(GrammarConstants_1.GrammarConstants.nodeTypes) || this.has(GrammarConstants_1.GrammarConstants.catchAllNodeType);
    }
    _isAbstract() {
        return false;
    }
    _isAnyNode() {
        return this.has(GrammarConstants_1.GrammarConstants.anySpecial);
    }
    getConstructorDefinedInGrammar() {
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
        const customConstructorsDefinition = (this.getChildrenByNodeConstructor(GrammarCustomConstructorsNode_1.default)[0]);
        if (customConstructorsDefinition) {
            const envConstructor = customConstructorsDefinition.getConstructorForEnvironment();
            if (envConstructor)
                return envConstructor.getTheDefinedConstructor();
        }
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
    getRunTimeNodeTypeNames() {
        return Object.keys(this.getRunTimeFirstWordMap());
    }
    getRunTimeFirstWordMapWithDefinitions() {
        const defs = this._getProgramNodeTypeDefinitionCache();
        return TreeUtils_1.default.mapValues(this.getRunTimeFirstWordMap(), key => defs[key]);
    }
    getRequiredCellTypeNames() {
        const parameters = this.get(GrammarConstants_1.GrammarConstants.cells);
        return parameters ? parameters.split(" ") : [];
    }
    getCatchAllCellTypeName() {
        return this.get(GrammarConstants_1.GrammarConstants.catchAllCellType);
    }
    _initRunTimeFirstWordToNodeConstructorMap() {
        if (this._cache_runTimeFirstWordToNodeConstructorMap)
            return undefined;
        // todo: make this handle extensions.
        const nodeTypesInScope = this._getNodeTypesInScope();
        this._cache_runTimeFirstWordToNodeConstructorMap = {};
        // terminals dont have acceptable firstWords
        if (!nodeTypesInScope.length)
            return undefined;
        const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache();
        const nodeTypeIds = Object.keys(allProgramNodeTypeDefinitionsMap);
        nodeTypeIds
            .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypesInScope))
            .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
            .forEach(nodeTypeId => {
            this._cache_runTimeFirstWordToNodeConstructorMap[nodeTypeId] = allProgramNodeTypeDefinitionsMap[nodeTypeId].getConstructorDefinedInGrammar();
        });
    }
    // todo: protected?
    _getNodeTypesInScope() {
        const nodeTypesNode = this._getNodeTypesNode();
        return nodeTypesNode ? nodeTypesNode.getFirstWords() : [];
    }
    getTopNodeTypeIds() {
        const definitions = this._getProgramNodeTypeDefinitionCache();
        const firstWords = this.getRunTimeFirstWordMap();
        const arr = Object.keys(firstWords).map(firstWord => definitions[firstWord]);
        arr.sort(TreeUtils_1.default.sortByAccessor((definition) => definition.getFrequency()));
        arr.reverse();
        return arr.map(definition => definition.getNodeTypeIdFromDefinition());
    }
    _getNodeTypesNode() {
        // todo: allow multiple of these if we allow mixins?
        return this.getNode(GrammarConstants_1.GrammarConstants.nodeTypes);
    }
    isRequired() {
        GrammarConstants_1.GrammarConstants;
        return this.has(GrammarConstants_1.GrammarConstants.required);
    }
    isSingle() {
        return this.has(GrammarConstants_1.GrammarConstants.single);
    }
    // todo: protected?
    _getRunTimeCatchAllNodeTypeId() {
        return "";
    }
    getNodeTypeDefinitionByName(firstWord) {
        const definitions = this._getProgramNodeTypeDefinitionCache();
        return definitions[firstWord] || this._getCatchAllDefinition(); // todo: this is where we might do some type of firstWord lookup for user defined fns.
    }
    _getCatchAllDefinition() {
        const catchAllNodeTypeId = this._getRunTimeCatchAllNodeTypeId();
        const definitions = this._getProgramNodeTypeDefinitionCache();
        const def = definitions[catchAllNodeTypeId];
        if (def)
            return def;
        // todo: implement contraints like a grammar file MUST have a catch all.
        if (this.isRoot())
            throw new Error(`This grammar language lacks a root catch all definition`);
        else
            return this.getParent()._getCatchAllDefinition();
    }
    _initCatchAllNodeConstructorCache() {
        if (this._cache_catchAllConstructor)
            return undefined;
        this._cache_catchAllConstructor = this._getCatchAllDefinition().getConstructorDefinedInGrammar();
    }
    getFirstCellType() {
        return this.get(GrammarConstants_1.GrammarConstants.firstCellType) || GrammarConstants_1.GrammarStandardCellTypes.anyFirstWord;
    }
    isDefined(firstWord) {
        return !!this._getProgramNodeTypeDefinitionCache()[firstWord.toLowerCase()];
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
