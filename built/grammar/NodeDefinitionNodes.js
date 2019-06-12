"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarCustomConstructorsNode_1 = require("./GrammarCustomConstructorsNode");
const GrammarCompilerNode_1 = require("./GrammarCompilerNode");
const GrammarConstantsNode_1 = require("./GrammarConstantsNode");
const AbstractRuntimeNodes_1 = require("./AbstractRuntimeNodes");
const TreeErrorTypes_1 = require("./TreeErrorTypes");
const GrammarCellTypeDefinitionNode_1 = require("./GrammarCellTypeDefinitionNode");
class GrammarDefinitionErrorNode extends TreeNode_1.default {
    getErrors() {
        return [this.getFirstWord() ? new TreeErrorTypes_1.UnknownNodeTypeError(this) : new TreeErrorTypes_1.BlankLineError(this)];
    }
    getLineCellTypes() {
        return [GrammarConstants_1.GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => GrammarConstants_1.GrammarStandardCellTypeIds.any)).join(" ");
    }
}
class GrammarExampleNode extends TreeNode_1.default {
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
        map[GrammarConstants_1.GrammarConstants.example] = GrammarExampleNode;
        return map;
    }
    getExamples() {
        return this.getChildrenByNodeConstructor(GrammarExampleNode);
    }
    getNodeTypeIdFromDefinition() {
        return this.getWord(1);
    }
    getGeneratedClassName() {
        let javascriptSyntaxSafeId = this.getNodeTypeIdFromDefinition();
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\..)/g, letter => letter[1].toUpperCase());
        // todo: remove this? switch to allowing nodeTypeDefs to have a match attribute or something?
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\+/g, "plus");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\-/g, "minus");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\%/g, "mod");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\//g, "div");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\*/g, "mult");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\#/g, "hash");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\!/g, "bang");
        return `${javascriptSyntaxSafeId}Node`;
    }
    getNodeConstructorToJavascript() {
        const nodeMap = this.getRunTimeFirstWordMapWithDefinitions();
        // if THIS node defines a catch all constructor, use that
        // IF IT DOES NOT, ADD NOTHING
        // if THIS node defines a keyword map, use that first
        // IF IT DOES NOT, ADD NOTHING
        // CHECK PARENTS TOO
        const firstWordMap = this._createRunTimeFirstWordToNodeConstructorMap(this._getMyInScopeNodeTypeIds());
        if (firstWordMap)
            return `getFirstWordMap() {
  return {${Object.keys(firstWordMap).map(firstWord => `"${firstWord}" : ${nodeMap[firstWord].getGeneratedClassName()}`)}}
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
            return AbstractRuntimeNodes_1.GrammarBackedBlobNode;
        return this._isNonTerminal() ? AbstractRuntimeNodes_1.GrammarBackedNonTerminalNode : AbstractRuntimeNodes_1.GrammarBackedTerminalNode;
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
        if (!this._cache_runTimeFirstWordToNodeConstructorMap)
            this._cache_runTimeFirstWordToNodeConstructorMap = this._createRunTimeFirstWordToNodeConstructorMap(this._getInScopeNodeTypeIds());
        return this._cache_runTimeFirstWordToNodeConstructorMap;
    }
    getRunTimeFirstWordsInScope() {
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
    _createRunTimeFirstWordToNodeConstructorMap(nodeTypeIdsInScope) {
        if (!nodeTypeIdsInScope.length)
            return {};
        const result = {};
        const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache();
        Object.keys(allProgramNodeTypeDefinitionsMap)
            .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
            .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
            .forEach(nodeTypeId => {
            result[nodeTypeId] = allProgramNodeTypeDefinitionsMap[nodeTypeId].getConstructorDefinedInGrammar();
        });
        return result;
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
exports.AbstractGrammarDefinitionNode = AbstractGrammarDefinitionNode;
class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
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
        return extendsId ? this.getNodeTypeDefinitionByNodeTypeId(extendsId) : undefined;
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
        const cellTypesToRegex = (cellTypeIds) => cellTypeIds.map((cellTypeId) => `({{${cellTypeId}}})?`).join(" ?");
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
        let nodeTypeIds = [];
        const extendedNodeTypeId = this._getIdOfNodeTypeThatThisExtends();
        if (extendedNodeTypeId) {
            const defs = this._getProgramNodeTypeDefinitionCache();
            const parentDef = defs[extendedNodeTypeId];
            if (!parentDef)
                throw new Error(`${extendedNodeTypeId} not found`);
            nodeTypeIds = nodeTypeIds.concat(parentDef.getAncestorNodeTypeIdsArray());
        }
        nodeTypeIds.push(this.getNodeTypeIdFromDefinition());
        this._cache_nodeTypeInheritanceSet = new Set(nodeTypeIds);
        this._cache_ancestorNodeTypeIdsArray = nodeTypeIds;
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
    getFrequency() {
        const val = this.get(GrammarConstants_1.GrammarConstants.frequency);
        return val ? parseFloat(val) : 0;
    }
    _getExtendedNodeTypeId() {
        const ancestorIds = this.getAncestorNodeTypeIdsArray();
        if (ancestorIds.length > 1)
            return ancestorIds[ancestorIds.length - 2];
    }
    _toJavascript() {
        const ancestorIds = this.getAncestorNodeTypeIdsArray();
        const extendedNodeTypeId = this._getExtendedNodeTypeId();
        const extendsClass = extendedNodeTypeId ? this.getNodeTypeDefinitionByNodeTypeId(extendedNodeTypeId).getGeneratedClassName() : "jtree.NonTerminalNode";
        const components = [this.getNodeConstructorToJavascript(), this.getGetters().join("\n")].filter(code => code);
        return `class ${this.getGeneratedClassName()} extends ${extendsClass} {
      ${components.join("\n")}
    }`;
    }
}
exports.GrammarNodeTypeDefinitionNode = GrammarNodeTypeDefinitionNode;
class GrammarRootNode extends AbstractGrammarDefinitionNode {
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
class GrammarAbstractNodeTypeDefinitionNode extends GrammarNodeTypeDefinitionNode {
    _isAbstract() {
        return true;
    }
}
// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode {
    getFirstWordMap() {
        const map = {};
        map[GrammarConstants_1.GrammarConstants.grammar] = GrammarRootNode;
        map[GrammarConstants_1.GrammarConstants.cellType] = GrammarCellTypeDefinitionNode_1.default;
        map[GrammarConstants_1.GrammarConstants.nodeType] = GrammarNodeTypeDefinitionNode;
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
        return this.getChildrenByNodeConstructor(GrammarNodeTypeDefinitionNode);
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
        this.getChildrenByNodeConstructor(GrammarNodeTypeDefinitionNode).forEach(nodeTypeDefinitionNode => {
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
exports.GrammarProgram = GrammarProgram;
