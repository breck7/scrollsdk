"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("./base/TreeNode");
const TreeUtils_1 = require("./base/TreeUtils");
var GrammarConstantsCompiler;
(function (GrammarConstantsCompiler) {
    GrammarConstantsCompiler["stringTemplate"] = "stringTemplate";
    GrammarConstantsCompiler["indentCharacter"] = "indentCharacter";
    GrammarConstantsCompiler["catchAllCellDelimiter"] = "catchAllCellDelimiter";
    GrammarConstantsCompiler["openChildren"] = "openChildren";
    GrammarConstantsCompiler["joinChildrenWith"] = "joinChildrenWith";
    GrammarConstantsCompiler["closeChildren"] = "closeChildren";
})(GrammarConstantsCompiler || (GrammarConstantsCompiler = {}));
var PreludeCellTypeIds;
(function (PreludeCellTypeIds) {
    PreludeCellTypeIds["anyCell"] = "anyCell";
    PreludeCellTypeIds["anyFirstCell"] = "anyFirstCell";
    PreludeCellTypeIds["extraWordCell"] = "extraWordCell";
    PreludeCellTypeIds["floatCell"] = "floatCell";
    PreludeCellTypeIds["numberCell"] = "numberCell";
    PreludeCellTypeIds["bitCell"] = "bitCell";
    PreludeCellTypeIds["boolCell"] = "boolCell";
    PreludeCellTypeIds["intCell"] = "intCell";
})(PreludeCellTypeIds || (PreludeCellTypeIds = {}));
exports.PreludeCellTypeIds = PreludeCellTypeIds;
var GrammarConstantsConstantTypes;
(function (GrammarConstantsConstantTypes) {
    GrammarConstantsConstantTypes["boolean"] = "boolean";
    GrammarConstantsConstantTypes["string"] = "string";
    GrammarConstantsConstantTypes["int"] = "int";
    GrammarConstantsConstantTypes["float"] = "float";
})(GrammarConstantsConstantTypes || (GrammarConstantsConstantTypes = {}));
var GrammarConstants;
(function (GrammarConstants) {
    // node types
    GrammarConstants["extensions"] = "extensions";
    GrammarConstants["toolingDirective"] = "tooling";
    GrammarConstants["todoComment"] = "todo";
    GrammarConstants["version"] = "version";
    GrammarConstants["nodeType"] = "nodeType";
    GrammarConstants["cellType"] = "cellType";
    GrammarConstants["grammarFileExtension"] = "grammar";
    GrammarConstants["nodeTypeSuffix"] = "Node";
    GrammarConstants["cellTypeSuffix"] = "Cell";
    // error check time
    GrammarConstants["regex"] = "regex";
    GrammarConstants["reservedWords"] = "reservedWords";
    GrammarConstants["enumFromCellTypes"] = "enumFromCellTypes";
    GrammarConstants["enum"] = "enum";
    // baseNodeTypes
    GrammarConstants["baseNodeType"] = "baseNodeType";
    GrammarConstants["blobNode"] = "blobNode";
    GrammarConstants["errorNode"] = "errorNode";
    // parse time
    GrammarConstants["extends"] = "extends";
    GrammarConstants["abstract"] = "abstract";
    GrammarConstants["root"] = "root";
    GrammarConstants["match"] = "match";
    GrammarConstants["pattern"] = "pattern";
    GrammarConstants["inScope"] = "inScope";
    GrammarConstants["cells"] = "cells";
    GrammarConstants["catchAllCellType"] = "catchAllCellType";
    GrammarConstants["firstCellType"] = "firstCellType";
    GrammarConstants["catchAllNodeType"] = "catchAllNodeType";
    GrammarConstants["constants"] = "constants";
    GrammarConstants["required"] = "required";
    GrammarConstants["single"] = "single";
    GrammarConstants["tags"] = "tags";
    // default catchAll nodeType
    GrammarConstants["BlobNode"] = "BlobNode";
    GrammarConstants["defaultRootNode"] = "defaultRootNode";
    // code
    GrammarConstants["javascript"] = "javascript";
    // compile time
    GrammarConstants["compilerNodeType"] = "compiler";
    GrammarConstants["compilesTo"] = "compilesTo";
    // develop time
    GrammarConstants["description"] = "description";
    GrammarConstants["example"] = "example";
    GrammarConstants["frequency"] = "frequency";
    GrammarConstants["highlightScope"] = "highlightScope";
})(GrammarConstants || (GrammarConstants = {}));
exports.GrammarConstants = GrammarConstants;
// todo: can we merge these methods into base TreeNode and ditch this class?
class GrammarBackedNode extends TreeNode_1.default {
    getAutocompleteResults(partialWord, cellIndex) {
        return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex);
    }
    getChildInstancesOfNodeTypeId(nodeTypeId) {
        return this.filter(node => node.doesExtend(nodeTypeId));
    }
    doesExtend(nodeTypeId) {
        return this.getDefinition()._doesExtend(nodeTypeId);
    }
    _getErrorNodeErrors() {
        return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)];
    }
    _getBlobNodeCatchAllNodeType() {
        return BlobNode;
    }
    _getAutocompleteResultsForFirstWord(partialWord) {
        let defs = Object.values(this.getDefinition().getFirstWordMapWithDefinitions());
        if (partialWord)
            defs = defs.filter(def => {
                const word = def._getFirstWordMatch();
                return word ? word.includes(partialWord) : false;
            });
        return defs.map(def => {
            const id = def._getFirstWordMatch();
            const description = def.getDescription();
            return {
                text: id,
                displayText: id + (description ? " " + description : "")
            };
        });
    }
    _getAutocompleteResultsForCell(partialWord, cellIndex) {
        // todo: root should be [] correct?
        const cell = this._getGrammarBackedCellArray()[cellIndex];
        return cell ? cell.getAutoCompleteWords(partialWord) : [];
    }
    _getGrammarBackedCellArray() {
        return [];
    }
    getRunTimeEnumOptions(cell) {
        return undefined;
    }
    sortNodesByInScopeOrder() {
        const nodeTypeOrder = this.getDefinition()._getMyInScopeNodeTypeIds();
        if (!nodeTypeOrder.length)
            return this;
        const orderMap = {};
        nodeTypeOrder.forEach((word, index) => {
            orderMap[word] = index;
        });
        this.sort(TreeUtils_1.default.sortByAccessor((runtimeNode) => {
            return orderMap[runtimeNode.getDefinition().getNodeTypeIdFromDefinition()];
        }));
        return this;
    }
    _getRequiredNodeErrors(errors = []) {
        Object.values(this.getDefinition().getFirstWordMapWithDefinitions()).forEach(def => {
            if (def.isRequired()) {
                if (!this.getChildren().some(node => node.getDefinition() === def))
                    errors.push(new MissingRequiredNodeTypeError(this, def.getNodeTypeIdFromDefinition()));
            }
        });
        return errors;
    }
}
class TypedWord {
    constructor(node, cellIndex, type) {
        this._node = node;
        this._cellIndex = cellIndex;
        this._type = type;
    }
    replace(newWord) {
        this._node.setWord(this._cellIndex, newWord);
    }
    get word() {
        return this._node.getWord(this._cellIndex);
    }
    get type() {
        return this._type;
    }
    toString() {
        return this.word + ":" + this.type;
    }
}
class GrammarBackedRootNode extends GrammarBackedNode {
    getRootProgramNode() {
        return this;
    }
    createParser() {
        return new TreeNode_1.default.Parser(BlobNode);
    }
    getAllTypedWords() {
        const words = [];
        this.getTopDownArray().forEach((node) => {
            node.getWordTypes().forEach((cell, index) => {
                words.push(new TypedWord(node, index, cell.getCellTypeId()));
            });
        });
        return words;
    }
    findAllWordsWithCellType(cellTypeId) {
        return this.getAllTypedWords().filter(typedWord => typedWord.type === cellTypeId);
    }
    findAllNodesWithNodeType(nodeTypeId) {
        return this.getTopDownArray().filter((node) => node.getDefinition().getNodeTypeIdFromDefinition() === nodeTypeId);
    }
    getDefinition() {
        return this.getGrammarProgramRoot();
    }
    getInPlaceCellTypeTree() {
        return this.getTopDownArray()
            .map(child => child.getIndentation() + child.getLineCellTypes())
            .join("\n");
    }
    getParseTable(maxColumnWidth = 40) {
        const tree = new TreeNode_1.default(this.getInPlaceCellTypeTree());
        return new TreeNode_1.default(tree.getTopDownArray().map((node, lineNumber) => {
            const sourceNode = this.nodeAtLine(lineNumber);
            const errs = sourceNode.getErrors();
            const errorCount = errs.length;
            const obj = {
                lineNumber: lineNumber,
                source: sourceNode.getIndentation() + sourceNode.getLine(),
                nodeType: sourceNode.constructor.name,
                cellTypes: node.getContent(),
                errorCount: errorCount
            };
            if (errorCount)
                obj.errorMessages = errs.map(err => err.getMessage()).join(";");
            return obj;
        })).toFormattedTable(maxColumnWidth);
    }
    getErrors() {
        return this._getRequiredNodeErrors(super.getErrors());
    }
    // Helper method for selecting potential nodeTypes needed to update grammar file.
    getInvalidNodeTypes() {
        return Array.from(new Set(this.getAllErrors()
            .filter(err => err instanceof UnknownNodeTypeError)
            .map(err => err.getNode().getFirstWord())));
    }
    getAllSuggestions() {
        return new TreeNode_1.default(this.getAllWordBoundaryCoordinates().map(coordinate => {
            const results = this.getAutocompleteResultsAt(coordinate.y, coordinate.x);
            return {
                line: coordinate.y,
                char: coordinate.x,
                word: results.word,
                suggestions: results.matches.map(m => m.text).join(" ")
            };
        })).toTable();
    }
    getAutocompleteResultsAt(lineIndex, charIndex) {
        const lineNode = this.nodeAtLine(lineIndex) || this;
        const nodeInScope = lineNode.getNodeInScopeAtCharIndex(charIndex);
        // todo: add more tests
        // todo: second param this.childrenToString()
        // todo: change to getAutocomplete definitions
        const wordIndex = lineNode.getWordIndexAtCharacterIndex(charIndex);
        const wordProperties = lineNode.getWordProperties(wordIndex);
        return {
            startCharIndex: wordProperties.startCharIndex,
            endCharIndex: wordProperties.endCharIndex,
            word: wordProperties.word,
            matches: nodeInScope.getAutocompleteResults(wordProperties.word, wordIndex)
        };
    }
    getSortedByInheritance() {
        const clone = new ExtendibleTreeNode(this.clone());
        const familyTree = new GrammarProgram(clone.toString()).getNodeTypeFamilyTree();
        const rank = {};
        familyTree.getTopDownArray().forEach((node, index) => {
            rank[node.getWord(0)] = index;
        });
        const nodeAFirst = -1;
        const nodeBFirst = 1;
        clone.sort((nodeA, nodeB) => {
            const nodeARank = rank[nodeA.getWord(0)];
            const nodeBRank = rank[nodeB.getWord(0)];
            return nodeARank < nodeBRank ? nodeAFirst : nodeBFirst;
        });
        return clone;
    }
    getNodeTypeUsage(filepath = "") {
        // returns a report on what nodeTypes from its language the program uses
        const usage = new TreeNode_1.default();
        const grammarProgram = this.getGrammarProgramRoot();
        grammarProgram.getValidConcreteAndAbstractNodeTypeDefinitions().forEach(def => {
            usage.appendLine([def.getNodeTypeIdFromDefinition(), "line-id", "nodeType", def.getRequiredCellTypeIds().join(" ")].join(" "));
        });
        this.getTopDownArray().forEach((node, lineNumber) => {
            const stats = usage.getNode(node.getNodeTypeId());
            stats.appendLine([filepath + "-" + lineNumber, node.getWords().join(" ")].join(" "));
        });
        return usage;
    }
    getInPlaceHighlightScopeTree() {
        return this.getTopDownArray()
            .map(child => child.getIndentation() + child.getLineHighlightScopes())
            .join("\n");
    }
    getInPlaceCellTypeTreeWithNodeConstructorNames() {
        return this.getTopDownArray()
            .map(child => child.constructor.name + this.getZI() + child.getIndentation() + child.getLineCellTypes())
            .join("\n");
    }
    getTreeWithNodeTypes() {
        return this.getTopDownArray()
            .map(child => child.constructor.name + this.getZI() + child.getIndentation() + child.getLine())
            .join("\n");
    }
    getCellHighlightScopeAtPosition(lineIndex, wordIndex) {
        this._initCellTypeCache();
        const typeNode = this._cache_highlightScopeTree.getTopDownArray()[lineIndex - 1];
        return typeNode ? typeNode.getWord(wordIndex - 1) : undefined;
    }
    _initCellTypeCache() {
        const treeMTime = this.getTreeMTime();
        if (this._cache_programCellTypeStringMTime === treeMTime)
            return undefined;
        this._cache_typeTree = new TreeNode_1.default(this.getInPlaceCellTypeTree());
        this._cache_highlightScopeTree = new TreeNode_1.default(this.getInPlaceHighlightScopeTree());
        this._cache_programCellTypeStringMTime = treeMTime;
    }
}
exports.GrammarBackedRootNode = GrammarBackedRootNode;
class GrammarBackedNonRootNode extends GrammarBackedNode {
    getRootProgramNode() {
        return this.getParent().getRootProgramNode();
    }
    createParser() {
        return new TreeNode_1.default.Parser(this.getParent()
            ._getParser()
            ._getCatchAllNodeConstructor(this.getParent()), {});
    }
    getNodeTypeId() {
        return this.getDefinition().getNodeTypeIdFromDefinition();
    }
    getDefinition() {
        return this.getRootProgramNode()
            .getGrammarProgramRoot()
            .getNodeTypeDefinitionByNodeTypeId(this.constructor.name);
    }
    getGrammarProgramRoot() {
        return this.getRootProgramNode().getGrammarProgramRoot();
    }
    getWordTypes() {
        return this._getGrammarBackedCellArray().filter(cell => cell.getWord() !== undefined);
    }
    _getGrammarBackedCellArray() {
        const definition = this.getDefinition();
        const grammarProgram = definition.getLanguageDefinitionProgram();
        const requiredCellTypeIds = definition.getRequiredCellTypeIds();
        const firstCellTypeId = definition.getFirstCellTypeId();
        const numberOfRequiredCells = requiredCellTypeIds.length + 1; // todo: assuming here first cell is required.
        const catchAllCellTypeId = definition.getCatchAllCellTypeId();
        const actualWordCountOrRequiredCellCount = Math.max(this.getWords().length, numberOfRequiredCells);
        const cells = [];
        // A for loop instead of map because "numberOfCellsToFill" can be longer than words.length
        for (let cellIndex = 0; cellIndex < actualWordCountOrRequiredCellCount; cellIndex++) {
            const isCatchAll = cellIndex >= numberOfRequiredCells;
            let cellTypeId;
            if (cellIndex === 0)
                cellTypeId = firstCellTypeId;
            else if (isCatchAll)
                cellTypeId = catchAllCellTypeId;
            else
                cellTypeId = requiredCellTypeIds[cellIndex - 1];
            let cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId);
            let cellConstructor;
            if (cellTypeDefinition)
                cellConstructor = cellTypeDefinition.getCellConstructor();
            else if (cellTypeId)
                cellConstructor = GrammarUnknownCellTypeCell;
            else {
                cellConstructor = GrammarExtraWordCellTypeCell;
                cellTypeId = PreludeCellTypeIds.extraWordCell;
                cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId);
            }
            cells[cellIndex] = new cellConstructor(this, cellIndex, cellTypeDefinition, cellTypeId, isCatchAll);
        }
        return cells;
    }
    // todo: just make a fn that computes proper spacing and then is given a node to print
    getLineCellTypes() {
        return this._getGrammarBackedCellArray()
            .map(slot => slot.getCellTypeId())
            .join(" ");
    }
    getLineHighlightScopes(defaultScope = "source") {
        return this._getGrammarBackedCellArray()
            .map(slot => slot.getHighlightScope() || defaultScope)
            .join(" ");
    }
    getErrors() {
        const errors = this._getGrammarBackedCellArray()
            .map(check => check.getErrorIfAny())
            .filter(i => i);
        const firstWord = this.getFirstWord();
        if (this.getDefinition().has(GrammarConstants.single))
            this.getParent()
                .findNodes(firstWord)
                .forEach((node, index) => {
                if (index)
                    errors.push(new NodeTypeUsedMultipleTimesError(node));
            });
        return this._getRequiredNodeErrors(errors);
    }
    _getCompiledIndentation() {
        const indentCharacter = this.getDefinition()._getCompilerObject()[GrammarConstantsCompiler.indentCharacter];
        const indent = this.getIndentation();
        return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent;
    }
    _getCompiledLine() {
        const compiler = this.getDefinition()._getCompilerObject();
        const catchAllCellDelimiter = compiler[GrammarConstantsCompiler.catchAllCellDelimiter];
        const str = compiler[GrammarConstantsCompiler.stringTemplate];
        return str ? TreeUtils_1.default.formatStr(str, catchAllCellDelimiter, this.cells) : this.getLine();
    }
    compile() {
        const def = this.getDefinition();
        if (def.isTerminalNodeType())
            return this._getCompiledIndentation() + this._getCompiledLine();
        const compiler = def._getCompilerObject();
        const openChildrenString = compiler[GrammarConstantsCompiler.openChildren] || "";
        const closeChildrenString = compiler[GrammarConstantsCompiler.closeChildren] || "";
        const childJoinCharacter = compiler[GrammarConstantsCompiler.joinChildrenWith] || "\n";
        const compiledLine = this._getCompiledLine();
        const indent = this._getCompiledIndentation();
        const compiledChildren = this.map(child => child.compile()).join(childJoinCharacter);
        return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`;
    }
    // todo: remove
    get cells() {
        const cells = {};
        this._getGrammarBackedCellArray().forEach(cell => {
            const cellTypeId = cell.getCellTypeId();
            if (!cell.isCatchAll())
                cells[cellTypeId] = cell.getParsed();
            else {
                if (!cells[cellTypeId])
                    cells[cellTypeId] = [];
                cells[cellTypeId].push(cell.getParsed());
            }
        });
        return cells;
    }
}
exports.GrammarBackedNonRootNode = GrammarBackedNonRootNode;
class BlobNode extends GrammarBackedNonRootNode {
    createParser() {
        return new TreeNode_1.default.Parser(BlobNode, {});
    }
    getErrors() {
        return [];
    }
}
class UnknownNodeTypeNode extends GrammarBackedNonRootNode {
    createParser() {
        return new TreeNode_1.default.Parser(UnknownNodeTypeNode, {});
    }
    getErrors() {
        return [new UnknownNodeTypeError(this)];
    }
}
/*
A cell contains a word but also the type information for that word.
*/
class AbstractGrammarBackedCell {
    constructor(node, index, typeDef, cellTypeId, isCatchAll) {
        this._typeDef = typeDef;
        this._node = node;
        this._isCatchAll = isCatchAll;
        this._index = index;
        this._cellTypeId = cellTypeId;
        this._word = node.getWord(index);
    }
    getCellTypeId() {
        return this._cellTypeId;
    }
    getNode() {
        return this._node;
    }
    getCellIndex() {
        return this._index;
    }
    isCatchAll() {
        return this._isCatchAll;
    }
    getHighlightScope() {
        const definition = this._getCellTypeDefinition();
        if (definition)
            return definition.getHighlightScope();
    }
    getAutoCompleteWords(partialWord = "") {
        const cellDef = this._getCellTypeDefinition();
        let words = cellDef ? cellDef._getAutocompleteWordOptions(this.getNode().getRootProgramNode()) : [];
        const runTimeOptions = this.getNode().getRunTimeEnumOptions(this);
        if (runTimeOptions)
            words = runTimeOptions.concat(words);
        if (partialWord)
            words = words.filter(word => word.includes(partialWord));
        return words.map(word => {
            return {
                text: word,
                displayText: word
            };
        });
    }
    getWord() {
        return this._word;
    }
    _getCellTypeDefinition() {
        return this._typeDef;
    }
    _getFullLine() {
        return this.getNode().getLine();
    }
    _getErrorContext() {
        return this._getFullLine().split(" ")[0]; // todo: XI
    }
    isValid() {
        const runTimeOptions = this.getNode().getRunTimeEnumOptions(this);
        if (runTimeOptions)
            return runTimeOptions.includes(this._word);
        return this._getCellTypeDefinition().isValid(this._word, this.getNode().getRootProgramNode()) && this._isValid();
    }
    getErrorIfAny() {
        if (this._word !== undefined && this.isValid())
            return undefined;
        // todo: refactor invalidwordError. We want better error messages.
        return this._word === undefined ? new MissingWordError(this) : new InvalidWordError(this);
    }
}
AbstractGrammarBackedCell.parserFunctionName = "";
class GrammarIntCell extends AbstractGrammarBackedCell {
    _isValid() {
        const num = parseInt(this._word);
        if (isNaN(num))
            return false;
        return num.toString() === this._word;
    }
    getRegexString() {
        return "\-?[0-9]+";
    }
    getParsed() {
        return parseInt(this._word);
    }
}
GrammarIntCell.parserFunctionName = "parseInt";
class GrammarBitCell extends AbstractGrammarBackedCell {
    _isValid() {
        const str = this._word;
        return str === "0" || str === "1";
    }
    getRegexString() {
        return "[01]";
    }
    getParsed() {
        return !!parseInt(this._word);
    }
}
class GrammarFloatCell extends AbstractGrammarBackedCell {
    _isValid() {
        const num = parseFloat(this._word);
        return !isNaN(num) && /^-?\d*(\.\d+)?$/.test(this._word);
    }
    getRegexString() {
        return "-?\d*(\.\d+)?";
    }
    getParsed() {
        return parseFloat(this._word);
    }
}
GrammarFloatCell.parserFunctionName = "parseFloat";
// ErrorCellType => grammar asks for a '' cell type here but the grammar does not specify a '' cell type. (todo: bring in didyoumean?)
class GrammarBoolCell extends AbstractGrammarBackedCell {
    constructor() {
        super(...arguments);
        this._trues = new Set(["1", "true", "t", "yes"]);
        this._falses = new Set(["0", "false", "f", "no"]);
    }
    _isValid() {
        const str = this._word.toLowerCase();
        return this._trues.has(str) || this._falses.has(str);
    }
    _getOptions() {
        return Array.from(this._trues).concat(Array.from(this._falses));
    }
    getRegexString() {
        return "(?:" + this._getOptions().join("|") + ")";
    }
    getParsed() {
        return this._trues.has(this._word.toLowerCase());
    }
}
class GrammarAnyCell extends AbstractGrammarBackedCell {
    _isValid() {
        return true;
    }
    getRegexString() {
        return "[^ ]+";
    }
    getParsed() {
        return this._word;
    }
}
class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell {
    _isValid() {
        return false;
    }
    getParsed() {
        return this._word;
    }
    getErrorIfAny() {
        return new ExtraWordError(this);
    }
}
class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell {
    _isValid() {
        return false;
    }
    getParsed() {
        return this._word;
    }
    getErrorIfAny() {
        return new UnknownCellTypeError(this);
    }
}
class AbstractTreeError {
    constructor(node) {
        this._node = node;
    }
    getLineIndex() {
        return this.getLineNumber() - 1;
    }
    getLineNumber() {
        return this.getNode()._getLineNumber(); // todo: handle sourcemaps
    }
    isCursorOnWord(lineIndex, characterIndex) {
        return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnWord(characterIndex);
    }
    _doesCharacterIndexFallOnWord(characterIndex) {
        return this.getCellIndex() === this.getNode().getWordIndexAtCharacterIndex(characterIndex);
    }
    // convenience method. may be removed.
    isBlankLineError() {
        return false;
    }
    // convenience method. may be removed.
    isMissingWordError() {
        return false;
    }
    getIndent() {
        return this.getNode().getIndentation();
    }
    getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => { }) {
        const suggestion = this.getSuggestionMessage();
        if (this.isMissingWordError())
            return this._getCodeMirrorLineWidgetElementCellTypeHints();
        if (suggestion)
            return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion);
        return this._getCodeMirrorLineWidgetElementWithoutSuggestion();
    }
    getNodeTypeId() {
        return this.getNode().getDefinition().getNodeTypeIdFromDefinition();
    }
    _getCodeMirrorLineWidgetElementCellTypeHints() {
        const el = document.createElement("div");
        el.appendChild(document.createTextNode(this.getIndent() + this.getNode().getDefinition().getLineHints()));
        el.className = "LintCellTypeHints";
        return el;
    }
    _getCodeMirrorLineWidgetElementWithoutSuggestion() {
        const el = document.createElement("div");
        el.appendChild(document.createTextNode(this.getIndent() + this.getMessage()));
        el.className = "LintError";
        return el;
    }
    _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion) {
        const el = document.createElement("div");
        el.appendChild(document.createTextNode(this.getIndent() + `${this.getErrorTypeName()}. Suggestion: ${suggestion}`));
        el.className = "LintErrorWithSuggestion";
        el.onclick = () => {
            this.applySuggestion();
            onApplySuggestionCallBack();
        };
        return el;
    }
    getLine() {
        return this.getNode().getLine();
    }
    getExtension() {
        return this.getNode()
            .getGrammarProgramRoot()
            .getExtensionName();
    }
    getNode() {
        return this._node;
    }
    getErrorTypeName() {
        return this.constructor.name.replace("Error", "");
    }
    getCellIndex() {
        return 0;
    }
    toObject() {
        return {
            type: this.getErrorTypeName(),
            line: this.getLineNumber(),
            cell: this.getCellIndex(),
            suggestion: this.getSuggestionMessage(),
            path: this.getNode().getFirstWordPath(),
            message: this.getMessage()
        };
    }
    hasSuggestion() {
        return this.getSuggestionMessage() !== "";
    }
    getSuggestionMessage() {
        return "";
    }
    toString() {
        return this.getMessage();
    }
    applySuggestion() { }
    getMessage() {
        return `${this.getErrorTypeName()} at line ${this.getLineNumber()} cell ${this.getCellIndex()}.`;
    }
}
class AbstractCellError extends AbstractTreeError {
    constructor(cell) {
        super(cell.getNode());
        this._cell = cell;
    }
    getCell() {
        return this._cell;
    }
    getCellIndex() {
        return this._cell.getCellIndex();
    }
    _getWordSuggestion() {
        return TreeUtils_1.default.didYouMean(this.getCell().getWord(), this.getCell()
            .getAutoCompleteWords()
            .map(option => option.text));
    }
}
class UnknownNodeTypeError extends AbstractTreeError {
    getMessage() {
        const node = this.getNode();
        const parentNode = node.getParent();
        const options = parentNode._getParser().getFirstWordOptions();
        return super.getMessage() + ` Invalid nodeType "${node.getFirstWord()}". Valid nodeTypes are: ${TreeUtils_1.default._listToEnglishText(options, 7)}.`;
    }
    _getWordSuggestion() {
        const node = this.getNode();
        const parentNode = node.getParent();
        return TreeUtils_1.default.didYouMean(node.getFirstWord(), parentNode.getAutocompleteResults("", 0).map(option => option.text));
    }
    getSuggestionMessage() {
        const suggestion = this._getWordSuggestion();
        const node = this.getNode();
        if (suggestion)
            return `Change "${node.getFirstWord()}" to "${suggestion}"`;
        return "";
    }
    applySuggestion() {
        const suggestion = this._getWordSuggestion();
        if (suggestion)
            this.getNode().setWord(this.getCellIndex(), suggestion);
        return this;
    }
}
class BlankLineError extends UnknownNodeTypeError {
    getMessage() {
        return super.getMessage() + ` Line: "${this.getNode().getLine()}". Blank lines are errors.`;
    }
    // convenience method
    isBlankLineError() {
        return true;
    }
    getSuggestionMessage() {
        return `Delete line ${this.getLineNumber()}`;
    }
    applySuggestion() {
        this.getNode().destroy();
        return this;
    }
}
class MissingRequiredNodeTypeError extends AbstractTreeError {
    constructor(node, missingNodeTypeId) {
        super(node);
        this._missingNodeTypeId = missingNodeTypeId;
    }
    getMessage() {
        return super.getMessage() + ` A "${this._missingNodeTypeId}" is required.`;
    }
}
class NodeTypeUsedMultipleTimesError extends AbstractTreeError {
    getMessage() {
        return super.getMessage() + ` Multiple "${this.getNode().getFirstWord()}" found.`;
    }
    getSuggestionMessage() {
        return `Delete line ${this.getLineNumber()}`;
    }
    applySuggestion() {
        return this.getNode().destroy();
    }
}
class UnknownCellTypeError extends AbstractCellError {
    getMessage() {
        return super.getMessage() + ` No cellType "${this.getCell().getCellTypeId()}" found. Language grammar for "${this.getExtension()}" may need to be fixed.`;
    }
}
class InvalidWordError extends AbstractCellError {
    getMessage() {
        return super.getMessage() + ` "${this.getCell().getWord()}" does not fit in cellType "${this.getCell().getCellTypeId()}".`;
    }
    getSuggestionMessage() {
        const suggestion = this._getWordSuggestion();
        if (suggestion)
            return `Change "${this.getCell().getWord()}" to "${suggestion}"`;
        return "";
    }
    applySuggestion() {
        const suggestion = this._getWordSuggestion();
        if (suggestion)
            this.getNode().setWord(this.getCellIndex(), suggestion);
        return this;
    }
}
class ExtraWordError extends AbstractCellError {
    getMessage() {
        return super.getMessage() + ` Extra word "${this.getCell().getWord()}" in ${this.getNodeTypeId()}.`;
    }
    getSuggestionMessage() {
        return `Delete word "${this.getCell().getWord()}" at cell ${this.getCellIndex()}`;
    }
    applySuggestion() {
        return this.getNode().deleteWordAt(this.getCellIndex());
    }
}
class MissingWordError extends AbstractCellError {
    // todo: autocomplete suggestion
    getMessage() {
        return super.getMessage() + ` Missing word for cell "${this.getCell().getCellTypeId()}".`;
    }
    isMissingWordError() {
        return true;
    }
}
// todo: add standard types, enum types, from disk types
class AbstractGrammarWordTestNode extends TreeNode_1.default {
}
class GrammarRegexTestNode extends AbstractGrammarWordTestNode {
    isValid(str) {
        if (!this._regex)
            this._regex = new RegExp("^" + this.getContent() + "$");
        return !!str.match(this._regex);
    }
}
class GrammarReservedWordsTestNode extends AbstractGrammarWordTestNode {
    isValid(str) {
        if (!this._set)
            this._set = new Set(this.getContent().split(" "));
        return !this._set.has(str);
    }
}
// todo: remove in favor of custom word type constructors
class EnumFromCellTypesTestNode extends AbstractGrammarWordTestNode {
    _getEnumFromCellTypes(programRootNode) {
        const cellTypeIds = this.getWordsFrom(1);
        const enumGroup = cellTypeIds.join(" ");
        // note: hack where we store it on the program. otherwise has global effects.
        if (!programRootNode._enumMaps)
            programRootNode._enumMaps = {};
        if (programRootNode._enumMaps[enumGroup])
            return programRootNode._enumMaps[enumGroup];
        const wordIndex = 1;
        const map = {};
        const cellTypeMap = {};
        cellTypeIds.forEach(typeId => (cellTypeMap[typeId] = true));
        programRootNode
            .getAllTypedWords()
            .filter((typedWord) => cellTypeMap[typedWord.type])
            .forEach(typedWord => {
            map[typedWord.word] = true;
        });
        programRootNode._enumMaps[enumGroup] = map;
        return map;
    }
    // todo: remove
    isValid(str, programRootNode) {
        return this._getEnumFromCellTypes(programRootNode)[str] === true;
    }
}
class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
    isValid(str) {
        // enum c c++ java
        return !!this.getOptions()[str];
    }
    getOptions() {
        if (!this._map)
            this._map = TreeUtils_1.default.arrayToMap(this.getWordsFrom(1));
        return this._map;
    }
}
class AbstractExtendibleTreeNode extends TreeNode_1.default {
    _getFromExtended(firstWordPath) {
        const hit = this._getNodeFromExtended(firstWordPath);
        return hit ? hit.get(firstWordPath) : undefined;
    }
    // todo: be more specific with the param
    _getChildrenByNodeConstructorInExtended(constructor) {
        return TreeUtils_1.default.flatten(this._getAncestorsArray().map(node => node.getChildrenByNodeConstructor(constructor)));
    }
    _getExtendedParent() {
        return this._getAncestorsArray()[1];
    }
    _hasFromExtended(firstWordPath) {
        return !!this._getNodeFromExtended(firstWordPath);
    }
    _getNodeFromExtended(firstWordPath) {
        return this._getAncestorsArray().find(node => node.has(firstWordPath));
    }
    _doesExtend(nodeTypeId) {
        return this._getAncestorSet().has(nodeTypeId);
    }
    _getAncestorSet() {
        if (!this._cache_ancestorSet)
            this._cache_ancestorSet = new Set(this._getAncestorsArray().map(def => def._getId()));
        return this._cache_ancestorSet;
    }
    // Note: the order is: [this, parent, grandParent, ...]
    _getAncestorsArray(cannotContainNodes) {
        this._initAncestorsArrayCache(cannotContainNodes);
        return this._cache_ancestorsArray;
    }
    _getIdThatThisExtends() {
        return this.get(GrammarConstants.extends);
    }
    _initAncestorsArrayCache(cannotContainNodes) {
        if (this._cache_ancestorsArray)
            return undefined;
        if (cannotContainNodes && cannotContainNodes.includes(this))
            throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`);
        cannotContainNodes = cannotContainNodes || [this];
        let ancestors = [this];
        const extendedId = this._getIdThatThisExtends();
        if (extendedId) {
            const parentNode = this._getIdToNodeMap()[extendedId];
            if (!parentNode)
                throw new Error(`${extendedId} not found`);
            ancestors = ancestors.concat(parentNode._getAncestorsArray(cannotContainNodes));
        }
        this._cache_ancestorsArray = ancestors;
    }
}
class ExtendibleTreeNode extends AbstractExtendibleTreeNode {
    _getIdToNodeMap() {
        if (!this._nodeMapCache) {
            this._nodeMapCache = {};
            this.forEach(child => {
                this._nodeMapCache[child.getWord(1)] = child;
            });
        }
        return this._nodeMapCache;
    }
    _getId() {
        return this.getWord(1);
    }
}
class cellTypeDefinitionNode extends AbstractExtendibleTreeNode {
    createParser() {
        const types = {};
        types[GrammarConstants.regex] = GrammarRegexTestNode;
        types[GrammarConstants.reservedWords] = GrammarReservedWordsTestNode;
        types[GrammarConstants.enumFromCellTypes] = EnumFromCellTypesTestNode;
        types[GrammarConstants.enum] = GrammarEnumTestNode;
        types[GrammarConstants.highlightScope] = TreeNode_1.default;
        types[GrammarConstants.todoComment] = TreeNode_1.default;
        types[GrammarConstants.description] = TreeNode_1.default;
        types[GrammarConstants.extends] = TreeNode_1.default;
        return new TreeNode_1.default.Parser(undefined, types);
    }
    _getId() {
        return this.getWord(0);
    }
    _getIdToNodeMap() {
        return this._getRootProgramNode().getCellTypeDefinitions();
    }
    getGetter(wordIndex) {
        const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName;
        return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? wordToNativeJavascriptTypeParser + `(this.getWord(${wordIndex}))` : `this.getWord(${wordIndex})`}
    }`;
    }
    getCatchAllGetter(wordIndex) {
        const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName;
        return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser
            ? `this.getWordsFrom(${wordIndex}).map(val => ${wordToNativeJavascriptTypeParser}(val))`
            : `this.getWordsFrom(${wordIndex})`}
    }`;
    }
    // `this.getWordsFrom(${requireds.length + 1})`
    // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
    getCellConstructor() {
        const kinds = {};
        kinds[PreludeCellTypeIds.anyCell] = GrammarAnyCell;
        kinds[PreludeCellTypeIds.anyFirstCell] = GrammarAnyCell;
        kinds[PreludeCellTypeIds.floatCell] = GrammarFloatCell;
        kinds[PreludeCellTypeIds.numberCell] = GrammarFloatCell;
        kinds[PreludeCellTypeIds.bitCell] = GrammarBitCell;
        kinds[PreludeCellTypeIds.boolCell] = GrammarBoolCell;
        kinds[PreludeCellTypeIds.intCell] = GrammarIntCell;
        return kinds[this.getWord(0)] || kinds[this._getExtendedCellTypeId()] || GrammarAnyCell;
    }
    _getExtendedCellTypeId() {
        return this.get(GrammarConstants.extends);
    }
    getHighlightScope() {
        return this._getFromExtended(GrammarConstants.highlightScope);
    }
    _getEnumOptions() {
        const enumNode = this._getNodeFromExtended(GrammarConstants.enum);
        if (!enumNode)
            return undefined;
        // we sort by longest first to capture longest match first. todo: add test
        const options = Object.keys(enumNode.getNode(GrammarConstants.enum).getOptions());
        options.sort((a, b) => b.length - a.length);
        return options;
    }
    _getEnumFromCellTypeOptions(program) {
        const node = this._getNodeFromExtended(GrammarConstants.enumFromCellTypes);
        return node ? Object.keys(node.getNode(GrammarConstants.enumFromCellTypes)._getEnumFromCellTypes(program)) : undefined;
    }
    _getRootProgramNode() {
        return this.getParent();
    }
    _getAutocompleteWordOptions(program) {
        return this._getEnumOptions() || this._getEnumFromCellTypeOptions(program) || [];
    }
    getRegexString() {
        // todo: enum
        const enumOptions = this._getEnumOptions();
        return this._getFromExtended(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*");
    }
    isValid(str, programRootNode) {
        return this._getChildrenByNodeConstructorInExtended(AbstractGrammarWordTestNode).every(node => node.isValid(str, programRootNode));
    }
    getCellTypeId() {
        return this.getWord(0);
    }
}
class GrammarExampleNode extends TreeNode_1.default {
}
class GrammarCompilerNode extends TreeNode_1.default {
    createParser() {
        const types = [
            GrammarConstantsCompiler.stringTemplate,
            GrammarConstantsCompiler.indentCharacter,
            GrammarConstantsCompiler.catchAllCellDelimiter,
            GrammarConstantsCompiler.joinChildrenWith,
            GrammarConstantsCompiler.openChildren,
            GrammarConstantsCompiler.closeChildren
        ];
        const map = {};
        types.forEach(type => {
            map[type] = TreeNode_1.default;
        });
        return new TreeNode_1.default.Parser(undefined, map);
    }
}
class GrammarNodeTypeConstant extends TreeNode_1.default {
    getGetter() {
        return `get ${this.getIdentifier()}() { return ${this.getConstantValueAsJsText()} }`;
    }
    getIdentifier() {
        return this.getWord(1);
    }
    getConstantValueAsJsText() {
        const words = this.getWordsFrom(2);
        return words.length > 1 ? `[${words.join(",")}]` : words[0];
    }
    getConstantValue() {
        return JSON.parse(this.getConstantValueAsJsText());
    }
}
class GrammarNodeTypeConstantInt extends GrammarNodeTypeConstant {
}
class GrammarNodeTypeConstantString extends GrammarNodeTypeConstant {
    getConstantValueAsJsText() {
        return "`" + TreeUtils_1.default.escapeBackTicks(this.getConstantValue()) + "`";
    }
    getConstantValue() {
        return this.length ? this.childrenToString() : this.getWordsFrom(2).join(" ");
    }
}
class GrammarNodeTypeConstantFloat extends GrammarNodeTypeConstant {
}
class GrammarNodeTypeConstantBoolean extends GrammarNodeTypeConstant {
}
class AbstractGrammarDefinitionNode extends AbstractExtendibleTreeNode {
    createParser() {
        // todo: some of these should just be on nonRootNodes
        const types = [
            GrammarConstants.frequency,
            GrammarConstants.inScope,
            GrammarConstants.cells,
            GrammarConstants.extends,
            GrammarConstants.description,
            GrammarConstants.catchAllNodeType,
            GrammarConstants.catchAllCellType,
            GrammarConstants.firstCellType,
            GrammarConstants.extensions,
            GrammarConstants.version,
            GrammarConstants.tags,
            GrammarConstants.match,
            GrammarConstants.pattern,
            GrammarConstants.baseNodeType,
            GrammarConstants.required,
            GrammarConstants.root,
            GrammarConstants.compilesTo,
            GrammarConstants.abstract,
            GrammarConstants.javascript,
            GrammarConstants.single,
            GrammarConstants.todoComment
        ];
        const map = {};
        types.forEach(type => {
            map[type] = TreeNode_1.default;
        });
        map[GrammarConstantsConstantTypes.boolean] = GrammarNodeTypeConstantBoolean;
        map[GrammarConstantsConstantTypes.int] = GrammarNodeTypeConstantInt;
        map[GrammarConstantsConstantTypes.string] = GrammarNodeTypeConstantString;
        map[GrammarConstantsConstantTypes.float] = GrammarNodeTypeConstantFloat;
        map[GrammarConstants.compilerNodeType] = GrammarCompilerNode;
        map[GrammarConstants.example] = GrammarExampleNode;
        return new TreeNode_1.default.Parser(undefined, map);
    }
    _getId() {
        return this.getWord(0);
    }
    getConstantsObject() {
        const obj = this._getUniqueConstantNodes();
        Object.keys(obj).forEach(key => {
            obj[key] = obj[key].getConstantValue();
        });
        return obj;
    }
    _getUniqueConstantNodes(extended = true) {
        const obj = {};
        const items = extended ? this._getChildrenByNodeConstructorInExtended(GrammarNodeTypeConstant) : this.getChildrenByNodeConstructor(GrammarNodeTypeConstant);
        items.reverse(); // Last definition wins.
        items.forEach((node) => {
            obj[node.getIdentifier()] = node;
        });
        return obj;
    }
    getExamples() {
        return this._getChildrenByNodeConstructorInExtended(GrammarExampleNode);
    }
    getNodeTypeIdFromDefinition() {
        return this.getWord(0);
    }
    // todo: remove? just reused nodeTypeId
    _getGeneratedClassName() {
        return this.getNodeTypeIdFromDefinition();
    }
    _hasValidNodeTypeId() {
        return !!this._getGeneratedClassName();
    }
    _isAbstract() {
        return this.has(GrammarConstants.abstract);
    }
    _getConstructorDefinedInGrammar() {
        if (!this._cache_definedNodeConstructor)
            this._cache_definedNodeConstructor = this.getLanguageDefinitionProgram()._getCompiledLoadedNodeTypes()[this.getNodeTypeIdFromDefinition()];
        return this._cache_definedNodeConstructor;
    }
    _getFirstWordMatch() {
        if (this._getRegexMatch())
            // todo: enforce firstWordMatch and regexMatch as being XOR
            return undefined;
        return this.get(GrammarConstants.match) || this._getNodeTypeIdWithoutNodeTypeSuffix();
    }
    _getNodeTypeIdWithoutNodeTypeSuffix() {
        return this.getNodeTypeIdFromDefinition().replace(GrammarProgram.nodeTypeSuffixRegex, "");
    }
    _getRegexMatch() {
        return this.get(GrammarConstants.pattern);
    }
    getLanguageDefinitionProgram() {
        return this.getParent();
    }
    _getCustomJavascriptMethods() {
        const hasJsCode = this.has(GrammarConstants.javascript);
        return hasJsCode ? this.getNode(GrammarConstants.javascript).childrenToString() : "";
    }
    getFirstWordMapWithDefinitions() {
        if (!this._cache_firstWordToNodeDefMap)
            this._cache_firstWordToNodeDefMap = this._createParserInfo(this._getInScopeNodeTypeIds()).firstWordMap;
        return this._cache_firstWordToNodeDefMap;
    }
    // todo: remove
    getRunTimeFirstWordsInScope() {
        return this._getParser().getFirstWordOptions();
    }
    getRequiredCellTypeIds() {
        const parameters = this._getFromExtended(GrammarConstants.cells);
        return parameters ? parameters.split(" ") : [];
    }
    // todo: what happens when you have a cell getter and constant with same name?
    _getCellGettersAndNodeTypeConstants() {
        // todo: add cellType parsings
        const grammarProgram = this.getLanguageDefinitionProgram();
        const requiredCells = this.get(GrammarConstants.cells);
        const getters = (requiredCells ? requiredCells.split(" ") : []).map((cellTypeId, index) => {
            const cellTypeDef = grammarProgram.getCellTypeDefinitionById(cellTypeId);
            if (!cellTypeDef)
                throw new Error(`No cellType "${cellTypeId}" found`);
            return cellTypeDef.getGetter(index + 1);
        });
        const catchAllCellTypeId = this.get(GrammarConstants.catchAllCellType);
        if (catchAllCellTypeId)
            getters.push(grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId).getCatchAllGetter(getters.length + 1));
        // Constants
        Object.values(this._getUniqueConstantNodes(false)).forEach(node => {
            getters.push(node.getGetter());
        });
        return getters.join("\n");
    }
    getCatchAllCellTypeId() {
        return this._getFromExtended(GrammarConstants.catchAllCellType);
    }
    _createParserInfo(nodeTypeIdsInScope) {
        const result = {
            firstWordMap: {},
            regexTests: []
        };
        if (!nodeTypeIdsInScope.length)
            return result;
        const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache();
        Object.keys(allProgramNodeTypeDefinitionsMap)
            .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
            .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
            .forEach(nodeTypeId => {
            const def = allProgramNodeTypeDefinitionsMap[nodeTypeId];
            const regex = def._getRegexMatch();
            const firstWord = def._getFirstWordMatch();
            if (regex)
                result.regexTests.push({ regex: regex, nodeConstructor: def.getNodeTypeIdFromDefinition() });
            else
                result.firstWordMap[firstWord] = def;
        });
        return result;
    }
    getTopNodeTypeIds() {
        const arr = Object.values(this.getFirstWordMapWithDefinitions());
        arr.sort(TreeUtils_1.default.sortByAccessor((definition) => definition.getFrequency()));
        arr.reverse();
        return arr.map(definition => definition.getNodeTypeIdFromDefinition());
    }
    _getMyInScopeNodeTypeIds() {
        const nodeTypesNode = this.getNode(GrammarConstants.inScope);
        return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : [];
    }
    _getInScopeNodeTypeIds() {
        // todo: allow multiple of these if we allow mixins?
        const ids = this._getMyInScopeNodeTypeIds();
        const parentDef = this._getExtendedParent();
        return parentDef ? ids.concat(parentDef._getInScopeNodeTypeIds()) : ids;
    }
    isRequired() {
        return this._hasFromExtended(GrammarConstants.required);
    }
    getNodeTypeDefinitionByNodeTypeId(nodeTypeId) {
        // todo: return catch all?
        const def = this._getProgramNodeTypeDefinitionCache()[nodeTypeId];
        if (def)
            return def;
        // todo: cleanup
        this.getLanguageDefinitionProgram()._addDefaultCatchAllBlobNode();
        return this._getProgramNodeTypeDefinitionCache()[nodeTypeId];
    }
    getFirstCellTypeId() {
        return this._getFromExtended(GrammarConstants.firstCellType) || PreludeCellTypeIds.anyFirstCell;
    }
    isDefined(nodeTypeId) {
        return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId];
    }
    _getIdToNodeMap() {
        return this._getProgramNodeTypeDefinitionCache();
    }
    _amIRoot() {
        if (this._cache_isRoot === undefined)
            this._cache_isRoot = this._getLanguageRootNode() === this;
        return this._cache_isRoot;
    }
    _getLanguageRootNode() {
        return this.getParent()._getRootNodeTypeDefinitionNode();
    }
    _isErrorNodeType() {
        return this.get(GrammarConstants.baseNodeType) === GrammarConstants.errorNode;
    }
    _isBlobNodeType() {
        // Do not check extended classes. Only do once.
        return this.get(GrammarConstants.baseNodeType) === GrammarConstants.blobNode;
    }
    _getErrorMethodToJavascript() {
        if (this._isBlobNodeType())
            return "getErrors() { return [] }"; // Skips parsing child nodes for perf gains.
        if (this._isErrorNodeType())
            return "getErrors() { return this._getErrorNodeErrors() }";
        return "";
    }
    _getParserToJavascript() {
        if (this._isBlobNodeType())
            // todo: do we need this?
            return "createParser() { return new jtree.TreeNode.Parser(this._getBlobNodeCatchAllNodeType())}";
        const parserInfo = this._createParserInfo(this._getMyInScopeNodeTypeIds());
        const myFirstWordMap = parserInfo.firstWordMap;
        const regexRules = parserInfo.regexTests;
        // todo: use constants in first word maps?
        // todo: cache the super extending?
        const firstWords = Object.keys(myFirstWordMap);
        const hasFirstWords = firstWords.length;
        const catchAllConstructor = this._getCatchAllNodeConstructorToJavascript();
        if (!hasFirstWords && !catchAllConstructor && !regexRules.length)
            return "";
        const firstWordsStr = hasFirstWords
            ? `Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), {` +
                firstWords.map(firstWord => `"${firstWord}" : ${myFirstWordMap[firstWord].getNodeTypeIdFromDefinition()}`).join(",\n") +
                "})"
            : "undefined";
        const regexStr = regexRules.length
            ? `[${regexRules
                .map(rule => {
                return `{regex: /${rule.regex}/, nodeConstructor: ${rule.nodeConstructor}}`;
            })
                .join(",")}]`
            : "undefined";
        const catchAllStr = catchAllConstructor ? catchAllConstructor : this._amIRoot() ? `this._getBlobNodeCatchAllNodeType()` : "undefined";
        return `createParser() {
  return new jtree.TreeNode.Parser(${catchAllStr}, ${firstWordsStr}, ${regexStr})
  }`;
    }
    _getCatchAllNodeConstructorToJavascript() {
        if (this._isBlobNodeType())
            return "this._getBlobNodeCatchAllNodeType()";
        const nodeTypeId = this.get(GrammarConstants.catchAllNodeType);
        if (!nodeTypeId)
            return "";
        const nodeDef = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId);
        if (!nodeDef)
            throw new Error(`No definition found for nodeType id "${nodeTypeId}"`);
        return nodeDef._getGeneratedClassName();
    }
    _nodeDefToJavascriptClass() {
        const components = [
            this._getParserToJavascript(),
            this._getErrorMethodToJavascript(),
            this._getCellGettersAndNodeTypeConstants(),
            this._getCustomJavascriptMethods()
        ].filter(code => code);
        const extendedDef = this._getExtendedParent();
        const rootNode = this._getLanguageRootNode();
        const amIRoot = this._amIRoot();
        // todo: cleanup? If we have 2 roots, and the latter extends the first, the first should extent GBRootNode. Otherwise, the first should not extend RBRootNode.
        const doesRootExtendMe = this.has(GrammarConstants.root) && rootNode._getAncestorSet().has(this._getGeneratedClassName());
        const extendsClassName = extendedDef
            ? extendedDef._getGeneratedClassName()
            : amIRoot || doesRootExtendMe
                ? "jtree.GrammarBackedRootNode"
                : "jtree.GrammarBackedNonRootNode";
        if (amIRoot) {
            components.push(`getGrammarProgramRoot() {
        if (!this._cachedGrammarProgramRoot)
          this._cachedGrammarProgramRoot = new jtree.GrammarProgram(\`${TreeUtils_1.default.escapeBackTicks(this.getParent()
                .toString()
                .replace(/\\/g, "\\\\"))}\`)
        return this._cachedGrammarProgramRoot
      }`);
            const nodeTypeMap = this.getLanguageDefinitionProgram()
                .getValidConcreteAndAbstractNodeTypeDefinitions()
                .map(def => {
                const id = def.getNodeTypeIdFromDefinition();
                return `"${id}": ${id}`;
            })
                .join(",\n");
            components.push(`static getNodeTypeMap() { return {${nodeTypeMap} }}`);
        }
        return `class ${this._getGeneratedClassName()} extends ${extendsClassName} {
      ${components.join("\n")}
    }`;
    }
    _getCompilerObject() {
        let obj = {};
        const items = this._getChildrenByNodeConstructorInExtended(GrammarCompilerNode);
        items.reverse(); // Last definition wins.
        items.forEach((node) => {
            obj = Object.assign(obj, node.toObject()); // todo: what about multiline strings?
        });
        return obj;
    }
    // todo: improve layout (use bold?)
    getLineHints() {
        const catchAllCellTypeId = this.getCatchAllCellTypeId();
        return `${this.getNodeTypeIdFromDefinition()}: ${this.getRequiredCellTypeIds().join(" ")}${catchAllCellTypeId ? ` ${catchAllCellTypeId}...` : ""}`;
    }
    isOrExtendsANodeTypeInScope(firstWordsInScope) {
        const chain = this._getNodeTypeInheritanceSet();
        return firstWordsInScope.some(firstWord => chain.has(firstWord));
    }
    isTerminalNodeType() {
        return !this._getFromExtended(GrammarConstants.inScope) && !this._getFromExtended(GrammarConstants.catchAllNodeType);
    }
    _getFirstCellHighlightScope() {
        const program = this.getLanguageDefinitionProgram();
        const cellTypeDefinition = program.getCellTypeDefinitionById(this.getFirstCellTypeId());
        // todo: standardize error/capture error at grammar time
        if (!cellTypeDefinition)
            throw new Error(`No ${GrammarConstants.cellType} ${this.getFirstCellTypeId()} found`);
        return cellTypeDefinition.getHighlightScope();
    }
    getMatchBlock() {
        const defaultHighlightScope = "source";
        const program = this.getLanguageDefinitionProgram();
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const firstWordHighlightScope = (this._getFirstCellHighlightScope() || defaultHighlightScope) + "." + this.getNodeTypeIdFromDefinition();
        const regexMatch = this._getRegexMatch();
        const firstWordMatch = this._getFirstWordMatch();
        const match = regexMatch ? `'${regexMatch}'` : `'^ *${escapeRegExp(firstWordMatch)}(?: |$)'`;
        const topHalf = ` '${this.getNodeTypeIdFromDefinition()}':
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
                throw new Error(`No ${GrammarConstants.cellType} ${cellTypeId} found`); // todo: standardize error/capture error at grammar time
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
    _getNodeTypeInheritanceSet() {
        if (!this._cache_nodeTypeInheritanceSet)
            this._cache_nodeTypeInheritanceSet = new Set(this.getAncestorNodeTypeIdsArray());
        return this._cache_nodeTypeInheritanceSet;
    }
    getAncestorNodeTypeIdsArray() {
        if (!this._cache_ancestorNodeTypeIdsArray) {
            this._cache_ancestorNodeTypeIdsArray = this._getAncestorsArray().map(def => def.getNodeTypeIdFromDefinition());
            this._cache_ancestorNodeTypeIdsArray.reverse();
        }
        return this._cache_ancestorNodeTypeIdsArray;
    }
    _getProgramNodeTypeDefinitionCache() {
        return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache();
    }
    getDescription() {
        return this._getFromExtended(GrammarConstants.description) || "";
    }
    getFrequency() {
        const val = this._getFromExtended(GrammarConstants.frequency);
        return val ? parseFloat(val) : 0;
    }
    _getExtendedNodeTypeId() {
        const ancestorIds = this.getAncestorNodeTypeIdsArray();
        if (ancestorIds.length > 1)
            return ancestorIds[ancestorIds.length - 2];
    }
}
// todo: remove?
class nodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
}
// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode {
    createParser() {
        const map = {};
        map[GrammarConstants.toolingDirective] = TreeNode_1.default;
        map[GrammarConstants.todoComment] = TreeNode_1.default;
        return new TreeNode_1.default.Parser(UnknownNodeTypeNode, map, [
            { regex: GrammarProgram.nodeTypeFullRegex, nodeConstructor: nodeTypeDefinitionNode },
            { regex: GrammarProgram.cellTypeFullRegex, nodeConstructor: cellTypeDefinitionNode }
        ]);
    }
    _getCompiledLoadedNodeTypes() {
        if (!this._cache_compiledLoadedNodeTypes) {
            if (this.isNodeJs()) {
                const code = this.toNodeJsJavascript(__dirname + "/../index.js");
                try {
                    const rootNode = this._importNodeJsRootNodeTypeConstructor(code);
                    this._cache_compiledLoadedNodeTypes = rootNode.getNodeTypeMap();
                    if (!this._cache_compiledLoadedNodeTypes)
                        throw new Error(`Failed to getNodeTypeMap`);
                }
                catch (err) {
                    console.log(err);
                    console.log(`Error in code: `);
                    console.log(code);
                }
            }
            else
                this._cache_compiledLoadedNodeTypes = this._importBrowserRootNodeTypeConstructor(this.toBrowserJavascript(), this.getGrammarName()).getNodeTypeMap();
        }
        return this._cache_compiledLoadedNodeTypes;
    }
    _importNodeJsRootNodeTypeConstructor(code) {
        const vm = require("vm");
        // todo: cleanup up
        try {
            ;
            global.jtree = require(__dirname + "/../index.js").default;
            global.require = require;
            global.module = {};
            return vm.runInThisContext(code);
        }
        catch (err) {
            console.log(`Error in compiled grammar code for language "${this.getGrammarName()}":`);
            console.log(code
                .split("\n")
                .map((line, index) => index + 1 + " " + line)
                .join("\n"));
            console.log(err);
            throw err;
        }
    }
    _importBrowserRootNodeTypeConstructor(code, name) {
        const script = document.createElement("script");
        script.innerHTML = code;
        document.head.appendChild(script);
        return window[name];
    }
    // todo: better formalize the source maps pattern somewhat used here by getAllErrors
    // todo: move this to Grammar.grammar (or just get the bootstrapping done.)
    getErrorsInGrammarExamples() {
        const programConstructor = this.getRootConstructor();
        const errors = [];
        this.getValidConcreteAndAbstractNodeTypeDefinitions().forEach(def => def.getExamples().forEach(example => {
            const exampleProgram = new programConstructor(example.childrenToString());
            exampleProgram.getAllErrors(example._getLineNumber() + 1).forEach(err => {
                errors.push(err);
            });
        }));
        return errors;
    }
    getTargetExtension() {
        return this._getRootNodeTypeDefinitionNode().get(GrammarConstants.compilesTo);
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
        Object.values(this.getValidConcreteAndAbstractNodeTypeDefinitions()).forEach(node => {
            const path = node.getAncestorNodeTypeIdsArray().join(" ");
            tree.touchNode(path);
        });
        return tree;
    }
    _getCellTypeDefinitions() {
        const types = {};
        // todo: add built in word types?
        this.getChildrenByNodeConstructor(cellTypeDefinitionNode).forEach(type => (types[type.getCellTypeId()] = type));
        return types;
    }
    getLanguageDefinitionProgram() {
        return this;
    }
    getValidConcreteAndAbstractNodeTypeDefinitions() {
        return (this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).filter((node) => node._hasValidNodeTypeId()));
    }
    _getRootNodeTypeDefinitionNode() {
        if (!this._cache_rootNodeTypeNode) {
            this.forEach(def => {
                if (def instanceof AbstractGrammarDefinitionNode && def.has(GrammarConstants.root) && def._hasValidNodeTypeId())
                    this._cache_rootNodeTypeNode = def;
            });
        }
        // By default, have a very permissive basic root node.
        // todo: whats the best design pattern to use for this sort of thing?
        if (!this._cache_rootNodeTypeNode) {
            this._cache_rootNodeTypeNode = this.concat(`${GrammarConstants.defaultRootNode}
 ${GrammarConstants.root}
 ${GrammarConstants.catchAllNodeType} ${GrammarConstants.BlobNode}`)[0];
            this._addDefaultCatchAllBlobNode();
        }
        return this._cache_rootNodeTypeNode;
    }
    // todo: whats the best design pattern to use for this sort of thing?
    _addDefaultCatchAllBlobNode() {
        delete this._cache_nodeTypeDefinitions;
        this.concat(`${GrammarConstants.BlobNode}
 ${GrammarConstants.baseNodeType} ${GrammarConstants.blobNode}`);
    }
    getExtensionName() {
        return this.getGrammarName().replace(GrammarProgram.nodeTypeSuffixRegex, "");
    }
    getGrammarName() {
        return this._getRootNodeTypeDefinitionNode().getNodeTypeIdFromDefinition();
    }
    _getMyInScopeNodeTypeIds() {
        const nodeTypesNode = this._getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope);
        return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : [];
    }
    _getInScopeNodeTypeIds() {
        const nodeTypesNode = this._getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope);
        return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : [];
    }
    _initProgramNodeTypeDefinitionCache() {
        if (this._cache_nodeTypeDefinitions)
            return undefined;
        this._cache_nodeTypeDefinitions = {};
        this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).forEach(nodeTypeDefinitionNode => {
            this._cache_nodeTypeDefinitions[nodeTypeDefinitionNode.getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode;
        });
    }
    _getProgramNodeTypeDefinitionCache() {
        this._initProgramNodeTypeDefinitionCache();
        return this._cache_nodeTypeDefinitions;
    }
    _getRootConstructor() {
        const def = this._getRootNodeTypeDefinitionNode();
        return def._getConstructorDefinedInGrammar();
    }
    getRootConstructor() {
        if (!this._cache_rootConstructorClass)
            this._cache_rootConstructorClass = this._getRootConstructor();
        return this._cache_rootConstructorClass;
    }
    _getFileExtensions() {
        return this._getRootNodeTypeDefinitionNode().get(GrammarConstants.extensions)
            ? this._getRootNodeTypeDefinitionNode()
                .get(GrammarConstants.extensions)
                .split(" ")
                .join(",")
            : this.getExtensionName();
    }
    toNodeJsJavascript(jtreePath = "jtree") {
        return this._rootNodeDefToJavascriptClass(jtreePath, true).trim();
    }
    toBrowserJavascript() {
        return this._rootNodeDefToJavascriptClass("", false).trim();
    }
    _getProperName() {
        return TreeUtils_1.default.ucfirst(this.getExtensionName());
    }
    _rootNodeDefToJavascriptClass(jtreePath, forNodeJs = true) {
        const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions();
        // todo: throw if there is no root node defined
        const nodeTypeClasses = defs.map(def => def._nodeDefToJavascriptClass()).join("\n\n");
        const rootName = this._getRootNodeTypeDefinitionNode()._getGeneratedClassName();
        if (!rootName)
            throw new Error(`Root Node Type Has No Name`);
        let exportScript = "";
        if (forNodeJs) {
            exportScript = `module.exports = ${rootName};
${rootName}`;
        }
        else {
            exportScript = `window.${rootName} = ${rootName}`;
        }
        // todo: we can expose the previous "constants" export, if needed, via the grammar, which we preserve.
        return `{
"use strict";

${forNodeJs ? `const jtree = require("${jtreePath}")` : ""}

${nodeTypeClasses}

${exportScript}
}
`;
    }
    toSublimeSyntaxFile() {
        const cellTypeDefs = this.getCellTypeDefinitions();
        const variables = Object.keys(cellTypeDefs)
            .map(name => ` ${name}: '${cellTypeDefs[name].getRegexString()}'`)
            .join("\n");
        const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions().filter(kw => !kw._isAbstract());
        const nodeTypeContexts = defs.map(def => def.getMatchBlock()).join("\n\n");
        const includes = defs.map(nodeTypeDef => `  - include: '${nodeTypeDef.getNodeTypeIdFromDefinition()}'`).join("\n");
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
}
GrammarProgram.makeNodeTypeId = (str) => str.replace(GrammarProgram.nodeTypeSuffixRegex, "") + GrammarConstants.nodeTypeSuffix;
GrammarProgram.makeCellTypeId = (str) => str.replace(GrammarProgram.cellTypeSuffixRegex, "") + GrammarConstants.cellTypeSuffix;
GrammarProgram.nodeTypeSuffixRegex = new RegExp(GrammarConstants.nodeTypeSuffix + "$");
GrammarProgram.nodeTypeFullRegex = new RegExp("^[a-zA-Z0-9]+" + GrammarConstants.nodeTypeSuffix + "$");
GrammarProgram.cellTypeSuffixRegex = new RegExp(GrammarConstants.cellTypeSuffix + "$");
GrammarProgram.cellTypeFullRegex = new RegExp("^[a-zA-Z0-9]+" + GrammarConstants.cellTypeSuffix + "$");
GrammarProgram._languages = {};
GrammarProgram._nodeTypes = {};
exports.GrammarProgram = GrammarProgram;
