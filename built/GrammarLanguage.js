"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("./base/TreeNode");
const TreeUtils_1 = require("./base/TreeUtils");
var GrammarConstantsCompiler;
(function (GrammarConstantsCompiler) {
    GrammarConstantsCompiler["stringTemplate"] = "stringTemplate";
    GrammarConstantsCompiler["indentCharacter"] = "indentCharacter";
    GrammarConstantsCompiler["listDelimiter"] = "listDelimiter";
    GrammarConstantsCompiler["openChildren"] = "openChildren";
    GrammarConstantsCompiler["closeChildren"] = "closeChildren";
})(GrammarConstantsCompiler || (GrammarConstantsCompiler = {}));
var GrammarStandardCellTypeIds;
(function (GrammarStandardCellTypeIds) {
    GrammarStandardCellTypeIds["any"] = "any";
    GrammarStandardCellTypeIds["anyFirstWord"] = "anyFirstWord";
    GrammarStandardCellTypeIds["extraWord"] = "extraWord";
    GrammarStandardCellTypeIds["float"] = "float";
    GrammarStandardCellTypeIds["number"] = "number";
    GrammarStandardCellTypeIds["bit"] = "bit";
    GrammarStandardCellTypeIds["bool"] = "bool";
    GrammarStandardCellTypeIds["int"] = "int";
})(GrammarStandardCellTypeIds || (GrammarStandardCellTypeIds = {}));
exports.GrammarStandardCellTypeIds = GrammarStandardCellTypeIds;
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
    GrammarConstants["grammar"] = "grammar";
    GrammarConstants["extensions"] = "extensions";
    GrammarConstants["toolingDirective"] = "tooling";
    GrammarConstants["todoComment"] = "todo";
    GrammarConstants["version"] = "version";
    GrammarConstants["name"] = "name";
    GrammarConstants["nodeTypeOrder"] = "nodeTypeOrder";
    GrammarConstants["nodeType"] = "nodeType";
    GrammarConstants["cellType"] = "cellType";
    GrammarConstants["abstract"] = "abstract";
    // error check time
    GrammarConstants["regex"] = "regex";
    GrammarConstants["enumFromGrammar"] = "enumFromGrammar";
    GrammarConstants["enum"] = "enum";
    // baseNodeTypes
    GrammarConstants["baseNodeType"] = "baseNodeType";
    GrammarConstants["blobNode"] = "blobNode";
    GrammarConstants["errorNode"] = "errorNode";
    GrammarConstants["terminalNode"] = "terminalNode";
    GrammarConstants["nonTerminalNode"] = "nonTerminalNode";
    // parse time
    GrammarConstants["extends"] = "extends";
    GrammarConstants["inScope"] = "inScope";
    GrammarConstants["cells"] = "cells";
    GrammarConstants["catchAllCellType"] = "catchAllCellType";
    GrammarConstants["firstCellType"] = "firstCellType";
    GrammarConstants["catchAllNodeType"] = "catchAllNodeType";
    GrammarConstants["constants"] = "constants";
    GrammarConstants["group"] = "group";
    GrammarConstants["required"] = "required";
    GrammarConstants["single"] = "single";
    GrammarConstants["tags"] = "tags";
    // code
    GrammarConstants["javascript"] = "javascript";
    // parse and interpret time
    GrammarConstants["constructors"] = "constructors";
    GrammarConstants["constructorNodeJs"] = "nodejs";
    GrammarConstants["constructorBrowser"] = "browser";
    // compile time
    GrammarConstants["compilerNodeType"] = "compiler";
    // develop time
    GrammarConstants["description"] = "description";
    GrammarConstants["example"] = "example";
    GrammarConstants["frequency"] = "frequency";
    GrammarConstants["highlightScope"] = "highlightScope";
})(GrammarConstants || (GrammarConstants = {}));
exports.GrammarConstants = GrammarConstants;
class GrammarBackedNode extends TreeNode_1.default {
    getAutocompleteResults(partialWord, cellIndex) {
        return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex);
    }
    static _getJavascriptClassNameFromNodeTypeId(nodeTypeId) {
        let javascriptSyntaxSafeId = nodeTypeId;
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\..)/g, letter => letter[1].toUpperCase());
        // todo: remove this? switch to allowing nodeTypeDefs to have a match attribute or something?
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\+/g, "plus");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\-/g, "minus");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\%/g, "mod");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\//g, "div");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\*/g, "mult");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\#/g, "hash");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\@/g, "at");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\!/g, "bang");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\~/g, "tilda");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\=/g, "equal");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\$/g, "dollar");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\</g, "lt");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\>/g, "gt");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\?/g, "questionMark");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\[/g, "openBracket");
        javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\]/g, "closeBracket");
        javascriptSyntaxSafeId = TreeUtils_1.default.ucfirst(javascriptSyntaxSafeId);
        return `${javascriptSyntaxSafeId}Node`;
    }
    _getAutocompleteResultsForFirstWord(partialWord) {
        let defs = Object.values(this.getDefinition().getRunTimeFirstWordMapWithDefinitions());
        if (partialWord)
            defs = defs.filter(def => def.getNodeTypeIdFromDefinition().includes(partialWord));
        return defs.map(def => {
            const id = def.getNodeTypeIdFromDefinition();
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
    getFirstWordMap() {
        return this.getDefinition().getRunTimeFirstWordMap();
    }
    getCatchAllNodeConstructor(line) {
        return this.getDefinition().getRunTimeCatchAllNodeConstructor();
    }
    _getGrammarBackedCellArray() {
        return [];
    }
    getRunTimeEnumOptions(cell) {
        return undefined;
    }
    _getRequiredNodeErrors(errors = []) {
        const firstWords = this.getDefinition().getRunTimeFirstWordMapWithDefinitions();
        Object.keys(firstWords).forEach(firstWord => {
            const def = firstWords[firstWord];
            if (def.isRequired() && !this.has(firstWord))
                errors.push(new MissingRequiredNodeTypeError(this, firstWord));
        });
        return errors;
    }
}
class GrammarBackedRootNode extends GrammarBackedNode {
    getRootProgramNode() {
        return this;
    }
    getDefinition() {
        return this.getGrammarProgramRoot();
    }
    getInPlaceCellTypeTree() {
        return this.getTopDownArray()
            .map(child => child.getIndentation() + child.getLineCellTypes())
            .join("\n");
    }
    getAllErrors() {
        return this._getRequiredNodeErrors(super.getAllErrors());
    }
    // Helper method for selecting potential nodeTypes needed to update grammar file.
    getInvalidNodeTypes() {
        return Array.from(new Set(this.getAllErrors()
            .filter(err => err instanceof UnknownNodeTypeError)
            .map(err => err.getNode().getFirstWord())));
    }
    updateNodeTypeIds(nodeTypeMap) {
        if (typeof nodeTypeMap === "string")
            nodeTypeMap = new TreeNode_1.default(nodeTypeMap);
        if (nodeTypeMap instanceof TreeNode_1.default)
            nodeTypeMap = nodeTypeMap.toObject();
        const renames = [];
        for (let node of this.getTopDownArrayIterator()) {
            const nodeTypeId = node.getNodeTypeId();
            const newId = nodeTypeMap[nodeTypeId];
            if (newId)
                renames.push([node, newId]);
        }
        renames.forEach(pair => pair[0].setFirstWord(pair[1]));
        return this;
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
    getPrettified() {
        const nodeTypeOrder = this.getGrammarProgramRoot().getNodeTypeOrder();
        const clone = this.clone();
        const isCondensed = this.getGrammarProgramRoot().getGrammarName() === "grammar"; // todo: generalize?
        clone._firstWordSort(nodeTypeOrder.split(" "), isCondensed ? TreeUtils_1.default._makeGraphSortFunction(node => node.getWord(1), node => node.get(GrammarConstants.extends)) : undefined);
        return clone.toString();
    }
    getNodeTypeUsage(filepath = "") {
        // returns a report on what nodeTypes from its language the program uses
        const usage = new TreeNode_1.default();
        const grammarProgram = this.getGrammarProgramRoot();
        grammarProgram.getConcreteAndAbstractNodeTypeDefinitions().forEach(def => {
            usage.appendLine([def.getNodeTypeIdFromDefinition(), "line-id", GrammarConstants.nodeType, def.getRequiredCellTypeIds().join(" ")].join(" "));
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
    getNodeTypeId() {
        return this.getDefinition().getNodeTypeIdFromDefinition();
    }
    getDefinition() {
        const grammarProgramRoot = this.getRootProgramNode().getGrammarProgramRoot();
        // todo: do we need a relative to with this firstWord path?
        return grammarProgramRoot.getNodeTypeDefinitionByFirstWordPath(this.getFirstWordPath());
    }
    getGrammarProgramRoot() {
        return this.getRootProgramNode().getGrammarProgramRoot();
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
                cellTypeId = GrammarStandardCellTypeIds.extraWord;
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
    _getCompilerNode(targetLanguage) {
        return this.getDefinition().getDefinitionCompilerNode(targetLanguage, this);
    }
    _getCompiledIndentation(targetLanguage) {
        const compiler = this._getCompilerNode(targetLanguage);
        const indentCharacter = compiler._getIndentCharacter();
        const indent = this.getIndentation();
        return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent;
    }
    _getCompiledLine(targetLanguage) {
        const compiler = this._getCompilerNode(targetLanguage);
        const listDelimiter = compiler._getListDelimiter();
        const str = compiler._getTransformation();
        return str ? TreeUtils_1.default.formatStr(str, listDelimiter, this.cells) : this.getLine();
    }
    compile(targetLanguage) {
        return this._getCompiledIndentation(targetLanguage) + this._getCompiledLine(targetLanguage);
    }
    // todo: remove
    get cells() {
        const cells = {};
        this._getGrammarBackedCellArray()
            .slice(1)
            .forEach(cell => {
            if (!cell.isCatchAll())
                cells[cell.getCellTypeId()] = cell.getParsed();
            else {
                if (!cells[cell.getCellTypeId()])
                    cells[cell.getCellTypeId()] = [];
                cells[cell.getCellTypeId()].push(cell.getParsed());
            }
        });
        return cells;
    }
}
class GrammarBackedTerminalNode extends GrammarBackedNonRootNode {
}
exports.GrammarBackedTerminalNode = GrammarBackedTerminalNode;
class GrammarBackedErrorNode extends GrammarBackedNonRootNode {
    // todo: is this correct?
    getLineCellTypes() {
        return "errorNodeAnyCellType ".repeat(this.getWords().length).trim();
    }
    getErrors() {
        return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)];
    }
}
exports.GrammarBackedErrorNode = GrammarBackedErrorNode;
class GrammarBackedNonTerminalNode extends GrammarBackedNonRootNode {
    // todo: implement
    _getNodeJoinCharacter() {
        return "\n";
    }
    compile(targetExtension) {
        const compiler = this._getCompilerNode(targetExtension);
        const openChildrenString = compiler._getOpenChildrenString();
        const closeChildrenString = compiler._getCloseChildrenString();
        console.log("open:", openChildrenString, compiler.childrenToString());
        const compiledLine = this._getCompiledLine(targetExtension);
        const indent = this._getCompiledIndentation(targetExtension);
        const compiledChildren = this.map(child => child.compile(targetExtension)).join(this._getNodeJoinCharacter());
        return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`;
    }
    static useAsBackupConstructor() {
        return GrammarBackedNonTerminalNode._backupConstructorEnabled;
    }
    static setAsBackupConstructor(value) {
        GrammarBackedNonTerminalNode._backupConstructorEnabled = value;
        return GrammarBackedNonTerminalNode;
    }
}
GrammarBackedNonTerminalNode._backupConstructorEnabled = false;
exports.GrammarBackedNonTerminalNode = GrammarBackedNonTerminalNode;
class GrammarBackedBlobNode extends GrammarBackedNonRootNode {
    getFirstWordMap() {
        return {};
    }
    getErrors() {
        return [];
    }
    getCatchAllNodeConstructor(line) {
        return GrammarBackedBlobNode;
    }
}
exports.GrammarBackedBlobNode = GrammarBackedBlobNode;
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
    _getLineNumber() {
        return this.getNode().getPoint().y;
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
        return this.getNode().getPoint().y;
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
        return this.getNode().getGrammarProgramRoot().getExtensionName();
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
        return super.getMessage() + ` Invalid nodeType "${this.getNode().getFirstWord()}".`;
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
        return super.getMessage() + ` Blank lines are errors.`;
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
class InvalidConstructorPathError extends AbstractTreeError {
    getMessage() {
        return super.getMessage() + ` No constructor "${this.getLine()}" found. Language grammar "${this.getExtension()}" may need to be fixed.`;
    }
}
class MissingRequiredNodeTypeError extends AbstractTreeError {
    constructor(node, missingWord) {
        super(node);
        this._missingWord = missingWord;
    }
    getMessage() {
        return super.getMessage() + ` Missing "${this._missingWord}" found.`;
    }
    getSuggestionMessage() {
        return `Insert "${this._missingWord}" on line ${this.getLineNumber() + 1}`;
    }
    applySuggestion() {
        return this.getNode().prependLine(this._missingWord);
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
        return super.getMessage() + ` Extra word "${this.getCell().getWord()}".`;
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
// todo: remove in favor of custom word type constructors
class EnumFromGrammarTestNode extends AbstractGrammarWordTestNode {
    _getEnumFromGrammar(programRootNode) {
        const nodeTypes = this.getWordsFrom(1);
        const enumGroup = nodeTypes.join(" ");
        // note: hack where we store it on the program. otherwise has global effects.
        if (!programRootNode._enumMaps)
            programRootNode._enumMaps = {};
        if (programRootNode._enumMaps[enumGroup])
            return programRootNode._enumMaps[enumGroup];
        const wordIndex = 1;
        const map = {};
        programRootNode.findNodes(nodeTypes).forEach(node => {
            map[node.getWord(wordIndex)] = true;
        });
        programRootNode._enumMaps[enumGroup] = map;
        return map;
    }
    // todo: remove
    isValid(str, programRootNode) {
        return this._getEnumFromGrammar(programRootNode)[str] === true;
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
        return this._getAncestorsArray().map(node => node.getChildrenByNodeConstructor(constructor)).flat();
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
class GrammarCellTypeDefinitionNode extends AbstractExtendibleTreeNode {
    getFirstWordMap() {
        const types = {};
        types[GrammarConstants.regex] = GrammarRegexTestNode;
        types[GrammarConstants.enumFromGrammar] = EnumFromGrammarTestNode;
        types[GrammarConstants.enum] = GrammarEnumTestNode;
        types[GrammarConstants.highlightScope] = TreeNode_1.default;
        types[GrammarConstants.todoComment] = TreeNode_1.default;
        types[GrammarConstants.extends] = TreeNode_1.default;
        return types;
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
        kinds[GrammarStandardCellTypeIds.any] = GrammarAnyCell;
        kinds[GrammarStandardCellTypeIds.anyFirstWord] = GrammarAnyCell;
        kinds[GrammarStandardCellTypeIds.float] = GrammarFloatCell;
        kinds[GrammarStandardCellTypeIds.number] = GrammarFloatCell;
        kinds[GrammarStandardCellTypeIds.bit] = GrammarBitCell;
        kinds[GrammarStandardCellTypeIds.bool] = GrammarBoolCell;
        kinds[GrammarStandardCellTypeIds.int] = GrammarIntCell;
        return kinds[this.getWord(1)] || kinds[this._getExtendedCellTypeId()] || GrammarAnyCell;
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
    _getEnumFromGrammarOptions(program) {
        const node = this._getNodeFromExtended(GrammarConstants.enumFromGrammar);
        return node ? Object.keys(node.getNode(GrammarConstants.enumFromGrammar)._getEnumFromGrammar(program)) : undefined;
    }
    _getRootProgramNode() {
        return this.getParent();
    }
    _getAutocompleteWordOptions(program) {
        return this._getEnumOptions() || this._getEnumFromGrammarOptions(program) || [];
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
        return this.getWord(1);
    }
}
class GrammarDefinitionErrorNode extends TreeNode_1.default {
    getErrors() {
        return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)];
    }
    getLineCellTypes() {
        return [GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => GrammarStandardCellTypeIds.any)).join(" ");
    }
}
class GrammarExampleNode extends TreeNode_1.default {
}
class GrammarCompilerNode extends TreeNode_1.default {
    getFirstWordMap() {
        const types = [
            GrammarConstantsCompiler.stringTemplate,
            GrammarConstantsCompiler.indentCharacter,
            GrammarConstantsCompiler.listDelimiter,
            GrammarConstantsCompiler.openChildren,
            GrammarConstantsCompiler.closeChildren
        ];
        const map = {};
        types.forEach(type => {
            map[type] = TreeNode_1.default;
        });
        return map;
    }
    _getTargetExtension() {
        return this.getWord(1);
    }
    _getListDelimiter() {
        return this.get(GrammarConstantsCompiler.listDelimiter);
    }
    _getTransformation() {
        return this.get(GrammarConstantsCompiler.stringTemplate);
    }
    _getIndentCharacter() {
        return this.get(GrammarConstantsCompiler.indentCharacter);
    }
    _getOpenChildrenString() {
        return this.get(GrammarConstantsCompiler.openChildren) || "";
    }
    _getCloseChildrenString() {
        return this.get(GrammarConstantsCompiler.closeChildren) || "";
    }
}
class AbstractCustomConstructorNode extends TreeNode_1.default {
    isAppropriateEnvironment() {
        return true;
    }
    getErrors() {
        // todo: should this be a try/catch?
        if (!this.isAppropriateEnvironment() || this._getCustomConstructor())
            return [];
        return [new InvalidConstructorPathError(this)];
    }
    getGrammarProgramRoot() {
        return this._getDef().getLanguageDefinitionProgram();
    }
    _getDef() {
        const def = this.getParent().getParent();
        if (def instanceof NonRootNodeTypeDefinition)
            return def;
        return def.getLanguageDefinitionProgram();
    }
}
class CustomNodeJsConstructorNode extends AbstractCustomConstructorNode {
    // todo: if we keep this, we need to surface better error messaging with the submodule convention bit.
    _getCustomConstructor() {
        const filepath = this._getNodeConstructorFilePath();
        const rootPath = this.getRootNode().getTheGrammarFilePath();
        const basePath = TreeUtils_1.default.getPathWithoutFileName(rootPath) + "/";
        const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath;
        const theModule = require(fullPath);
        const constructorSubModuleName = this._getSubModulePath();
        return constructorSubModuleName ? TreeUtils_1.default.resolveProperty(theModule, constructorSubModuleName) : theModule;
    }
    _getSubModulePath() {
        return this.getWord(2) || this._getDef()._getGeneratedClassName();
    }
    // todo: does this support spaces in filepaths?
    _getNodeConstructorFilePath() {
        return this.getWord(1);
    }
    isAppropriateEnvironment() {
        return this.isNodeJs();
    }
}
class CustomBrowserConstructorNode extends AbstractCustomConstructorNode {
    _getCustomConstructor() {
        // todo: bad idea to have browser and node have reverse ordering for submodulename
        const constructorSubModuleName = this._getSubModulePath();
        const constructor = TreeUtils_1.default.resolveProperty(window, constructorSubModuleName);
        if (GrammarBackedNonTerminalNode.useAsBackupConstructor())
            return GrammarBackedNonTerminalNode;
        if (!constructor)
            throw new Error(`constructor window.${constructorSubModuleName} not found.`);
        return constructor;
    }
    _getSubModulePath() {
        return this.getWord(1) || this._getDef()._getGeneratedClassName();
    }
    isAppropriateEnvironment() {
        return !this.isNodeJs();
    }
}
class GrammarCustomConstructorsNode extends TreeNode_1.default {
    getFirstWordMap() {
        const map = {};
        map[GrammarConstants.constructorNodeJs] = CustomNodeJsConstructorNode;
        map[GrammarConstants.constructorBrowser] = CustomBrowserConstructorNode;
        return map;
    }
    getConstructorForEnvironment() {
        return this.getNode(this.isNodeJs() ? GrammarConstants.constructorNodeJs : GrammarConstants.constructorBrowser);
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
    getFirstWordMap() {
        const types = [
            GrammarConstants.frequency,
            GrammarConstants.inScope,
            GrammarConstants.cells,
            GrammarConstants.extends,
            GrammarConstants.description,
            GrammarConstants.catchAllNodeType,
            GrammarConstants.catchAllCellType,
            GrammarConstants.firstCellType,
            GrammarConstants.tags,
            GrammarConstants.baseNodeType,
            GrammarConstants.group,
            GrammarConstants.required,
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
        map[GrammarConstants.constructors] = GrammarCustomConstructorsNode;
        map[GrammarConstants.example] = GrammarExampleNode;
        return map;
    }
    getConstantsObject() {
        const obj = this._getUniqueConstantNodes();
        Object.keys(obj).forEach(key => {
            obj[key] = obj[key].getConstantValue();
        });
        return obj;
    }
    _getUniqueConstantNodes() {
        const obj = {};
        const items = this._getChildrenByNodeConstructorInExtended(GrammarNodeTypeConstant);
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
        return this.getWord(1);
    }
    _getGeneratedClassName() {
        return GrammarBackedNode._getJavascriptClassNameFromNodeTypeId(this.getNodeTypeIdFromDefinition());
    }
    getNodeConstructorToJavascript() {
        const nodeMap = this.getRunTimeFirstWordMapWithDefinitions();
        // if THIS node defines a catch all constructor, use that
        // IF IT DOES NOT, ADD NOTHING
        // if THIS node defines a keyword map, use that first
        // IF IT DOES NOT, ADD NOTHING
        // CHECK PARENTS TOO
        const firstWordMap = this._createRunTimeFirstWordToNodeConstructorMap(this._getMyInScopeNodeTypeIds());
        // todo: use constants in first word maps
        if (Object.keys(firstWordMap).length)
            return `getFirstWordMap() {
  return {${Object.keys(firstWordMap).map(firstWord => `"${firstWord}" : ${nodeMap[firstWord]._getGeneratedClassName()}`)}}
  }`;
        return "";
    }
    _isAbstract() {
        return false;
    }
    _getConstructorFromOldConstructorsNode() {
        // Get custom def node
        // todo: can we ditch?
        const customConstructorsDefinition = this._getNodeFromExtended(GrammarConstants.constructors);
        if (!customConstructorsDefinition)
            return undefined;
        const envConstructor = customConstructorsDefinition.getNode(GrammarConstants.constructors).getConstructorForEnvironment();
        if (envConstructor)
            return envConstructor._getCustomConstructor();
    }
    _getConstructorDefinedInGrammar() {
        if (!this._cache_definedNodeConstructor)
            this._cache_definedNodeConstructor = this._initConstructorDefinedInGrammar();
        return this._cache_definedNodeConstructor;
    }
    _importNodeJsConstructor(className, code) {
        const vm = require("vm");
        const gb = global;
        try {
            gb.jtree = require(__dirname + "/jtree.node.js").default;
            // todo: can we do this without polluting global namespace? https://github.com/nodejs/node/issues/14160#issuecomment-504648655
            code = `global.${className} = ` + code;
            vm.runInThisContext(code);
            return gb[className];
        }
        catch (err) {
            console.log("Error in code:");
            console.log(code);
            throw err;
        }
    }
    _importBrowserConstructor(code) {
        const tempClassName = "tempConstructor" + TreeUtils_1.default.getRandomString(30);
        const script = document.createElement("script");
        script.innerHTML = `window.${tempClassName} = ${code}`;
        document.head.appendChild(script);
        return window[tempClassName];
    }
    // todo: always should return a custom constructor for each node type
    /* right now we have nodeType with "constructors nodejs/browser", nodetype with "javascript", nodetype with "baseType", "rootNodeType", node type with "catchAll OR inScope" */
    _initConstructorDefinedInGrammar() {
        let constructor = this._getConstructorFromOldConstructorsNode();
        if (!constructor) {
            // todo: this is not catching if we dont have that but we do have constants.
            const def = (this instanceof GrammarDefinitionGrammarNode ? this.getLanguageDefinitionProgram() : this);
            // todo: reuse other code...load things into 1 file?
            const className = def._getGeneratedClassName();
            const extendsClassName = def._getExtendsClassName(false);
            const gettersAndConstants = def._getCellGettersAndNodeTypeConstants();
            const code = `class ${className} extends ${extendsClassName} {
      ${gettersAndConstants}
      ${def._getCustomJavascriptMethods()}
}`;
            if (AbstractGrammarDefinitionNode._cachedNodeConstructorsFromCode[code])
                return AbstractGrammarDefinitionNode._cachedNodeConstructorsFromCode[code];
            if (this.isNodeJs())
                constructor = this._importNodeJsConstructor(this._getGeneratedClassName(), code);
            else
                constructor = this._importBrowserConstructor(code);
            AbstractGrammarDefinitionNode._cachedNodeConstructorsFromCode[code] = constructor;
        }
        return constructor;
    }
    getCatchAllNodeConstructor(line) {
        return GrammarDefinitionErrorNode;
    }
    getLanguageDefinitionProgram() {
        return this.getParent();
    }
    getDefinitionCompilerNode(targetLanguage, node) {
        const compilerNode = this._getCompilerNodes().find(node => node._getTargetExtension() === targetLanguage);
        if (!compilerNode)
            throw new Error(`No compiler for language "${targetLanguage}" for line "${node.getLine()}"`);
        return compilerNode;
    }
    _getCustomJavascriptMethods() {
        return "";
    }
    _getCompilerNodes() {
        return this._getChildrenByNodeConstructorInExtended(GrammarCompilerNode) || [];
    }
    // todo: remove?
    // for now by convention first compiler is "target extension"
    getTargetExtension() {
        const firstNode = this._getCompilerNodes()[0];
        return firstNode ? firstNode._getTargetExtension() : "";
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
        const parameters = this._getFromExtended(GrammarConstants.cells);
        return parameters ? parameters.split(" ") : [];
    }
    // todo: what happens when you have a cell getter and constant with same name?
    _getCellGettersAndNodeTypeConstants() {
        // todo: add cellType parsings
        const grammarProgram = this.getLanguageDefinitionProgram();
        const getters = this.getRequiredCellTypeIds().map((cellTypeId, index) => grammarProgram.getCellTypeDefinitionById(cellTypeId).getGetter(index + 1));
        const catchAllCellTypeId = this.getCatchAllCellTypeId();
        if (catchAllCellTypeId)
            getters.push(grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId).getCatchAllGetter(getters.length + 1));
        // Constants
        Object.values(this._getUniqueConstantNodes()).forEach(node => {
            getters.push(node.getGetter());
        });
        return getters.join("\n");
    }
    getCatchAllCellTypeId() {
        return this._getFromExtended(GrammarConstants.catchAllCellType);
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
            result[nodeTypeId] = allProgramNodeTypeDefinitionsMap[nodeTypeId]._getConstructorDefinedInGrammar();
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
            throw new Error(`This grammar language "${this.getLanguageDefinitionProgram().getGrammarName()}" lacks a root catch all definition`);
        else
            return this.getParent()._getCatchAllNodeTypeDefinition();
    }
    _initCatchAllNodeConstructorCache() {
        if (this._cache_catchAllConstructor)
            return undefined;
        this._cache_catchAllConstructor = this._getCatchAllNodeTypeDefinition()._getConstructorDefinedInGrammar();
    }
    getFirstCellTypeId() {
        return this._getFromExtended(GrammarConstants.firstCellType) || GrammarStandardCellTypeIds.anyFirstWord;
    }
    isDefined(nodeTypeId) {
        return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId.toLowerCase()];
    }
    _getIdToNodeMap() {
        return this._getProgramNodeTypeDefinitionCache();
    }
    _getProgramNodeTypeDefinitionCache() {
        return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache();
    }
    getRunTimeCatchAllNodeConstructor() {
        this._initCatchAllNodeConstructorCache();
        return this._cache_catchAllConstructor;
    }
}
// constructor
//  extends constructor (baseType)
//  getters/setters(?) (int/string/float/boolean)
//  custom code (javascript)
AbstractGrammarDefinitionNode._cachedNodeConstructorsFromCode = {};
class NonRootNodeTypeDefinition extends AbstractGrammarDefinitionNode {
    // todo: protected?
    _getRunTimeCatchAllNodeTypeId() {
        return this._getFromExtended(GrammarConstants.catchAllNodeType) || this.getParent()._getRunTimeCatchAllNodeTypeId();
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
    getSublimeSyntaxContextId() {
        return this.getNodeTypeIdFromDefinition().replace(/\#/g, "HASH"); // # is not allowed in sublime context names
    }
    _getExtendsClassName(isCompiled = false) {
        const baseTypeNames = {};
        baseTypeNames[GrammarConstants.blobNode] = "BlobNode";
        baseTypeNames[GrammarConstants.errorNode] = "ErrorNode";
        baseTypeNames[GrammarConstants.terminalNode] = "TerminalNode";
        baseTypeNames[GrammarConstants.nonTerminalNode] = "NonTerminalNode";
        const isNonTerminal = this._getFromExtended(GrammarConstants.inScope) || this._getFromExtended(GrammarConstants.catchAllNodeType);
        const baseNodeTypeName = baseTypeNames[this._getFromExtended(GrammarConstants.baseNodeType)] || (isNonTerminal ? "NonTerminalNode" : "TerminalNode");
        if (!isCompiled)
            return "jtree." + baseNodeTypeName; // todo: this is incorrect but works for legacy stuff.
        const extendedDef = this._getExtendedParent();
        return extendedDef ? extendedDef._getGeneratedClassName() : isCompiled ? "jtree.TerminalNode" : "jtree.NonTerminalNode";
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
    // todo: protected?
    _getProgramNodeTypeDefinitionCache() {
        return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache();
    }
    getDoc() {
        return this.getNodeTypeIdFromDefinition();
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
    _getCustomJavascriptMethods() {
        const jsCode = this._getNodeFromExtended(GrammarConstants.javascript);
        return jsCode ? jsCode.getNode(GrammarConstants.javascript).childrenToString() : "";
    }
    _nodeDefToJavascriptClass(isCompiled = true) {
        const components = [this.getNodeConstructorToJavascript(), this._getCellGettersAndNodeTypeConstants(), this._getCustomJavascriptMethods()].filter(code => code);
        return `class ${this._getGeneratedClassName()} extends ${this._getExtendsClassName(isCompiled)} {
      ${components.join("\n")}
    }`;
    }
}
// todo: is this extending the correct class? Should it just be extending TreeNode?
class GrammarDefinitionGrammarNode extends AbstractGrammarDefinitionNode {
    _nodeDefToJavascriptClass() {
        return "";
    }
    _getGeneratedClassName() {
        return this.getLanguageDefinitionProgram()._getGeneratedClassName();
    }
    // todo: I think this may be a sign we dont want this class.
    _getExtendsClassName() {
        return "jtree.GrammarBackedRootNode";
    }
    getLanguageDefinitionProgram() {
        return this.getParent();
    }
    getFirstWordMap() {
        // todo: this isn't quite correct. we are allowing too many firstWords.
        const map = super.getFirstWordMap();
        map[GrammarConstants.extensions] = TreeNode_1.default;
        map[GrammarConstants.version] = TreeNode_1.default;
        map[GrammarConstants.name] = TreeNode_1.default;
        map[GrammarConstants.nodeTypeOrder] = TreeNode_1.default;
        map[GrammarConstants.javascript] = TreeNode_1.default;
        map[GrammarConstants.todoComment] = TreeNode_1.default;
        map[GrammarConstantsConstantTypes.boolean] = GrammarNodeTypeConstantBoolean;
        map[GrammarConstantsConstantTypes.int] = GrammarNodeTypeConstantInt;
        map[GrammarConstantsConstantTypes.string] = GrammarNodeTypeConstantString;
        map[GrammarConstantsConstantTypes.float] = GrammarNodeTypeConstantFloat;
        return map;
    }
}
class GrammarAbstractNodeTypeDefinitionNode extends NonRootNodeTypeDefinition {
    _isAbstract() {
        return true;
    }
}
// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode {
    getFirstWordMap() {
        const map = {};
        map[GrammarConstants.grammar] = GrammarDefinitionGrammarNode;
        map[GrammarConstants.cellType] = GrammarCellTypeDefinitionNode;
        map[GrammarConstants.nodeType] = NonRootNodeTypeDefinition;
        map[GrammarConstants.abstract] = GrammarAbstractNodeTypeDefinitionNode;
        map[GrammarConstants.toolingDirective] = TreeNode_1.default;
        map[GrammarConstants.todoComment] = TreeNode_1.default;
        return map;
    }
    _getExtendsClassName(isCompiled = false) {
        return "jtree.GrammarBackedRootNode";
    }
    _getCustomJavascriptMethods() {
        const jsCode = this._getGrammarGrammarNode().getNode(GrammarConstants.javascript);
        return jsCode ? jsCode.childrenToString() : "";
    }
    getErrorsInGrammarExamples() {
        const programConstructor = this.getRootConstructor();
        const errors = [];
        this.getConcreteAndAbstractNodeTypeDefinitions().forEach(def => def.getExamples().forEach(example => {
            const exampleProgram = new programConstructor(example.childrenToString());
            exampleProgram.getAllErrors().forEach(err => {
                errors.push(err);
            });
        }));
        return errors;
    }
    getTargetExtension() {
        return this._getGrammarGrammarNode().getTargetExtension();
    }
    getNodeTypeOrder() {
        return this._getGrammarGrammarNode().get(GrammarConstants.nodeTypeOrder);
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
        Object.values(this.getConcreteAndAbstractNodeTypeDefinitions()).forEach(node => {
            const path = node.getAncestorNodeTypeIdsArray().join(" ");
            tree.touchNode(path);
        });
        return tree;
    }
    _getCellTypeDefinitions() {
        const types = {};
        // todo: add built in word types?
        this.getChildrenByNodeConstructor(GrammarCellTypeDefinitionNode).forEach(type => (types[type.getCellTypeId()] = type));
        return types;
    }
    getLanguageDefinitionProgram() {
        return this;
    }
    getConcreteAndAbstractNodeTypeDefinitions() {
        return this.getChildrenByNodeConstructor(NonRootNodeTypeDefinition);
    }
    // todo: remove?
    getTheGrammarFilePath() {
        return this.getLine();
    }
    _getGrammarGrammarNode() {
        return this.getNodeByType(GrammarDefinitionGrammarNode);
    }
    getExtensionName() {
        return this.getGrammarName();
    }
    getGrammarName() {
        return this._getGrammarGrammarNode().get(GrammarConstants.name);
    }
    _getMyInScopeNodeTypeIds() {
        const nodeTypesNode = this._getGrammarGrammarNode().getNode(GrammarConstants.inScope);
        return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : [];
    }
    _getInScopeNodeTypeIds() {
        const nodeTypesNode = this._getGrammarGrammarNode().getNode(GrammarConstants.inScope);
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
    _initProgramNodeTypeDefinitionCache() {
        if (this._cache_nodeTypeDefinitions)
            return undefined;
        this._cache_nodeTypeDefinitions = {};
        this.getChildrenByNodeConstructor(NonRootNodeTypeDefinition).forEach(nodeTypeDefinitionNode => {
            this._cache_nodeTypeDefinitions[nodeTypeDefinitionNode.getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode;
        });
    }
    _getProgramNodeTypeDefinitionCache() {
        this._initProgramNodeTypeDefinitionCache();
        return this._cache_nodeTypeDefinitions;
    }
    _getRunTimeCatchAllNodeTypeId() {
        return this._getGrammarGrammarNode().get(GrammarConstants.catchAllNodeType);
    }
    _getRootConstructor() {
        const extendedConstructor = this._getGrammarGrammarNode()._getConstructorDefinedInGrammar();
        const grammarProgram = this;
        // Note: this is some of the most unorthodox code in this repo. We create a class on the fly for your
        // new language.
        return class extends extendedConstructor {
            getGrammarProgramRoot() {
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
        return this._getGrammarGrammarNode().get(GrammarConstants.extensions)
            ? this._getGrammarGrammarNode()
                .get(GrammarConstants.extensions)
                .split(" ")
                .join(",")
            : this.getExtensionName();
    }
    toNodeJsJavascript(jtreePath = "jtree") {
        return this._nodeDefToJavascriptClass(true, jtreePath, true).trim();
    }
    // todo: have this here or not?
    toNodeJsJavascriptPrettier(jtreePath = "jtree") {
        return require("prettier").format(this._nodeDefToJavascriptClass(true, jtreePath, true), { semi: false, parser: "babel", printWidth: 160 });
    }
    toBrowserJavascript() {
        return this._nodeDefToJavascriptClass(true, "", false).trim();
    }
    _getProperName() {
        return TreeUtils_1.default.ucfirst(this.getExtensionName());
    }
    _getGeneratedClassName() {
        return this._getProperName() + "ProgramRoot";
    }
    _getCatchAllNodeConstructorToJavascript() {
        const nodeTypeId = this._getRunTimeCatchAllNodeTypeId();
        if (!nodeTypeId)
            return "";
        const className = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)._getGeneratedClassName();
        return `getCatchAllNodeConstructor() { return ${className}}`;
    }
    _nodeDefToJavascriptClass(isCompiled, jtreePath, forNodeJs = true) {
        const defs = this.getConcreteAndAbstractNodeTypeDefinitions();
        const nodeTypeClasses = defs.map(def => def._nodeDefToJavascriptClass()).join("\n\n");
        const constantsName = this._getProperName() + "Constants";
        const nodeTypeConstants = defs
            .map(def => {
            const id = def.getNodeTypeIdFromDefinition();
            return `"${id}": "${id}"`;
        })
            .join(",\n");
        const cellTypeConstants = Object.keys(this.getCellTypeDefinitions())
            .map(id => `"${id}" : "${id}"`)
            .join(",\n");
        const rootClassMethods = [this.getNodeConstructorToJavascript(), this._getCatchAllNodeConstructorToJavascript(), this._getCustomJavascriptMethods()].filter(code => code);
        const rootClass = `class ${this._getGeneratedClassName()} extends ${this._getExtendsClassName(isCompiled)} {
  ${rootClassMethods.join("\n")}


      getGrammarProgramRoot() {
        if (!this._cachedGrammarProgramRoot)
          this._cachedGrammarProgramRoot = jtree.GrammarProgram.newFromCondensed(\`${TreeUtils_1.default.escapeBackTicks(this.toString().replace(/\\/g, "\\\\"))}\`)
        return this._cachedGrammarProgramRoot
      }

    }`;
        return `"use strict";

${forNodeJs ? `const jtree = require("${jtreePath}")` : ""}

const ${constantsName} = {
  nodeTypes: {
    ${nodeTypeConstants}
  },
  cellTypes: {
    ${cellTypeConstants}
  }
}

${nodeTypeClasses}

${rootClass}

${forNodeJs ? `module.exports = {${constantsName}, ` + this._getGeneratedClassName() + "}" : ""}
`;
    }
    toSublimeSyntaxFile() {
        const cellTypeDefs = this.getCellTypeDefinitions();
        const variables = Object.keys(cellTypeDefs)
            .map(name => ` ${name}: '${cellTypeDefs[name].getRegexString()}'`)
            .join("\n");
        const defs = this.getConcreteAndAbstractNodeTypeDefinitions().filter(kw => !kw._isAbstract());
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
    // todo: can we remove? can we make the default language not require any grammar node?
    static getTheAnyLanguageRootConstructor() {
        return this.newFromCondensed(`${GrammarConstants.grammar}
 ${GrammarConstants.name} anyLanguage
 ${GrammarConstants.catchAllNodeType} anyNode
${GrammarConstants.nodeType} anyNode
 ${GrammarConstants.catchAllCellType} anyWord
 ${GrammarConstants.firstCellType} anyWord
${GrammarConstants.cellType} anyWord`).getRootConstructor();
    }
    // todo: remove this. dont expand.
    static _expandGroups(grammarCode) {
        // todo: handle imports
        const tree = new TreeNode_1.default(grammarCode);
        const xi = tree.getXI();
        tree.findNodes(`${GrammarConstants.abstract}${xi}${GrammarConstants.group}`).forEach(group => {
            const abstractName = group.getParent().getWord(1);
            group
                .getContent()
                .split(xi)
                .forEach(word => tree.appendLineAndChildren(`${GrammarConstants.nodeType}${xi}${word}`, `${GrammarConstants.extends}${xi}${abstractName}`));
        });
        return tree;
    }
    static newFromCondensed(grammarCode, grammarPath) {
        return new GrammarProgram(this._expandGroups(grammarCode), grammarPath);
    }
    // todo: we could probably remove once we switch to compiled
    async loadAllConstructorScripts(baseUrlPath) {
        if (!this.isBrowser())
            return undefined;
        const uniqueScriptsSet = new Set(this.getNodesByGlobPath(`* ${GrammarConstants.constructors} ${GrammarConstants.constructorBrowser}`)
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
