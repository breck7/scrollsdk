"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarBackedCell_1 = require("./GrammarBackedCell");
const TreeErrorTypes_1 = require("./TreeErrorTypes");
class AbstractRuntimeNode extends TreeNode_1.default {
    // note: this is overwritten by the root node of a runtime grammar program.
    // some of the magic that makes this all work. but maybe there's a better way.
    getGrammarProgram() {
        return this.getProgram().getGrammarProgram();
    }
    getNodeConstructor(line) {
        return this.getFirstWordMap()[this._getFirstWord(line)] || this.getCatchAllNodeConstructor(line);
    }
    getFirstWordMap() {
        return this.getDefinition().getRunTimeFirstWordMap();
    }
    getCatchAllNodeConstructor(line) {
        return this.getDefinition().getRunTimeCatchAllNodeConstructor();
    }
    getProgram() {
        return this;
    }
    getAutocompleteResults(partialWord, cellIndex) {
        return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex);
    }
    _getGrammarBackedCellArray() {
        return [];
    }
    getRunTimeEnumOptions(cell) {
        return undefined;
    }
    _getAutocompleteResultsForCell(partialWord, cellIndex) {
        // todo: root should be [] correct?
        const cell = this._getGrammarBackedCellArray()[cellIndex];
        return cell ? cell.getAutoCompleteWords(partialWord) : [];
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
    _getNodeTypeDefinitionByFirstWordPath(path) {
        // todo: do we need a relative to with this firstWord path?
        return this.getProgram()
            .getGrammarProgram()
            .getNodeTypeDefinitionByFirstWordPath(path);
    }
    _getRequiredNodeErrors(errors = []) {
        const firstWords = this.getDefinition().getRunTimeFirstWordMapWithDefinitions();
        Object.keys(firstWords).forEach(firstWord => {
            const def = firstWords[firstWord];
            if (def.isRequired() && !this.has(firstWord))
                errors.push(new TreeErrorTypes_1.MissingRequiredNodeTypeError(this, firstWord));
        });
        return errors;
    }
}
exports.AbstractRuntimeNode = AbstractRuntimeNode;
class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram() {
        return this.getParent().getProgram();
    }
    getGrammarProgram() {
        return this.getDefinition().getProgram();
    }
    getNodeTypeId() {
        return this.getDefinition().getNodeTypeIdFromDefinition();
    }
    getDefinition() {
        // todo: do we need a relative to with this firstWord path?
        return this._getNodeTypeDefinitionByFirstWordPath(this.getFirstWordPath());
    }
    getConstantsObject() {
        return this.getDefinition().getConstantsObject();
    }
    _getCompilerNode(targetLanguage) {
        return this.getDefinition().getDefinitionCompilerNode(targetLanguage, this);
    }
    _getCompiledIndentation(targetLanguage) {
        const compiler = this._getCompilerNode(targetLanguage);
        const indentCharacter = compiler.getIndentCharacter();
        const indent = this.getIndentation();
        return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent;
    }
    _getCompiledLine(targetLanguage) {
        const compiler = this._getCompilerNode(targetLanguage);
        const listDelimiter = compiler.getListDelimiter();
        const str = compiler.getTransformation();
        return str ? TreeUtils_1.default.formatStr(str, listDelimiter, this.cells) : this.getLine();
    }
    compile(targetLanguage) {
        return this._getCompiledIndentation(targetLanguage) + this._getCompiledLine(targetLanguage);
    }
    getErrors() {
        const errors = this._getGrammarBackedCellArray()
            .map(check => check.getErrorIfAny())
            .filter(i => i);
        const firstWord = this.getFirstWord();
        if (this.getDefinition()._shouldBeJustOne())
            this.getParent()
                .findNodes(firstWord)
                .forEach((node, index) => {
                if (index)
                    errors.push(new TreeErrorTypes_1.NodeTypeUsedMultipleTimesError(node));
            });
        return this._getRequiredNodeErrors(errors);
    }
    // todo: improve layout (use bold?)
    getLineHints() {
        const def = this.getDefinition();
        const catchAllCellTypeId = def.getCatchAllCellTypeId();
        return `${this.getNodeTypeId()}: ${def.getRequiredCellTypeIds().join(" ")}${catchAllCellTypeId ? ` ${catchAllCellTypeId}...` : ""}`;
    }
    // todo: remove?
    getParsedWords() {
        return this._getGrammarBackedCellArray().map(word => word.getParsed());
    }
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
    _getGrammarBackedCellArray() {
        const definition = this.getDefinition();
        const grammarProgram = definition.getProgram();
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
                cellConstructor = GrammarBackedCell_1.GrammarUnknownCellTypeCell;
            else {
                cellConstructor = GrammarBackedCell_1.GrammarExtraWordCellTypeCell;
                cellTypeId = GrammarConstants_1.GrammarStandardCellTypeIds.extraWord;
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
}
exports.AbstractRuntimeNonRootNode = AbstractRuntimeNonRootNode;
class AbstractRuntimeProgramRootNode extends AbstractRuntimeNode {
    *getProgramErrorsIterator() {
        let line = 1;
        for (let node of this.getTopDownArrayIterator()) {
            node._cachedLineNumber = line;
            const errs = node.getErrors();
            delete node._cachedLineNumber;
            if (errs.length)
                yield errs;
            line++;
        }
    }
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
        this._getRequiredNodeErrors(errors);
        return errors;
    }
    // Helper method for selecting potential nodeTypes needed to update grammar file.
    getInvalidNodeTypes() {
        return Array.from(new Set(this.getProgramErrors()
            .filter(err => err instanceof TreeErrorTypes_1.UnknownNodeTypeError)
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
        const nodeTypeOrder = this.getGrammarProgram().getNodeTypeOrder();
        const clone = this.clone();
        const isCondensed = this.getGrammarProgram().getGrammarName() === "grammar"; // todo: generalize?
        clone._firstWordSort(nodeTypeOrder.split(" "), isCondensed ? TreeUtils_1.default.makeGraphSortFunction(1, 2) : undefined);
        return clone.toString();
    }
    getProgramErrorMessages() {
        return this.getProgramErrors().map(err => err.getMessage());
    }
    getDefinition() {
        return this.getGrammarProgram();
    }
    getNodeTypeUsage(filepath = "") {
        // returns a report on what nodeTypes from its language the program uses
        const usage = new TreeNode_1.default();
        const grammarProgram = this.getGrammarProgram();
        grammarProgram.getNodeTypeDefinitions().forEach(def => {
            usage.appendLine([def.getNodeTypeIdFromDefinition(), "line-id", GrammarConstants_1.GrammarConstants.nodeType, def.getRequiredCellTypeIds().join(" ")].join(" "));
        });
        this.getTopDownArray().forEach((node, lineNumber) => {
            const stats = usage.getNode(node.getNodeTypeId());
            stats.appendLine([filepath + "-" + lineNumber, node.getWords().join(" ")].join(" "));
        });
        return usage;
    }
    getInPlaceCellTypeTree() {
        return this.getTopDownArray()
            .map(child => child.getIndentation() + child.getLineCellTypes())
            .join("\n");
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
    // todo: refine and make public
    _getInPlaceCellTypeTreeHtml() {
        const getColor = (child) => {
            if (child.getLineCellTypes().includes("error"))
                return "red";
            return "black";
        };
        const zip = (a1, a2) => {
            let last = a1.length > a2.length ? a1.length : a2.length;
            let parts = [];
            for (let index = 0; index < last; index++) {
                parts.push(`${a1[index]}:${a2[index]}`);
            }
            return parts.join(" ");
        };
        return this.getTopDownArray()
            .map(child => `<div style="white-space: pre;">${child.constructor.name} ${this.getZI()} ${child.getIndentation()} <span style="color: ${getColor(child)};">${zip(child.getLineCellTypes().split(" "), child.getLine().split(" "))}</span></div>`)
            .join("");
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
exports.AbstractRuntimeProgramRootNode = AbstractRuntimeProgramRootNode;
class GrammarBackedTerminalNode extends AbstractRuntimeNonRootNode {
}
exports.GrammarBackedTerminalNode = GrammarBackedTerminalNode;
class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
    getLineCellTypes() {
        return "error ".repeat(this.getWords().length).trim();
    }
    getErrors() {
        return [this.getFirstWord() ? new TreeErrorTypes_1.UnknownNodeTypeError(this) : new TreeErrorTypes_1.BlankLineError(this)];
    }
}
exports.GrammarBackedErrorNode = GrammarBackedErrorNode;
class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    // todo: implement
    _getNodeJoinCharacter() {
        return "\n";
    }
    compile(targetExtension) {
        const compiler = this._getCompilerNode(targetExtension);
        const openChildrenString = compiler.getOpenChildrenString();
        const closeChildrenString = compiler.getCloseChildrenString();
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
class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
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
