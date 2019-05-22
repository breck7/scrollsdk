"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
const AbstractRuntimeNode_1 = require("./AbstractRuntimeNode");
class AbstractRuntimeProgram extends AbstractRuntimeNode_1.default {
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
    getInvalidNodeTypes(level = undefined) {
        return Array.from(new Set(this.getProgramErrors()
            .filter(err => err.kind === GrammarConstants_1.GrammarConstantsErrors.invalidNodeTypeError)
            .filter(err => (level ? level === err.level : true))
            .map(err => err.subkind)));
    }
    updateNodeTypeIds(nodeTypeMap) {
        if (typeof nodeTypeMap === "string")
            nodeTypeMap = new TreeNode_1.default(nodeTypeMap);
        if (nodeTypeMap instanceof TreeNode_1.default)
            nodeTypeMap = nodeTypeMap.toObject();
        for (let node of this.getTopDownArrayIterator()) {
            const nodeTypeId = node.getDefinition().getNodeTypeIdFromDefinition();
            const newId = nodeTypeMap[nodeTypeId];
            if (newId)
                node.setFirstWord(newId);
        }
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
        return this.getProgramErrors().map(err => err.message);
    }
    getFirstWordMap() {
        return this.getDefinition().getRunTimeFirstWordMap();
    }
    getDefinition() {
        return this.getGrammarProgram();
    }
    getNodeTypeUsage(filepath = "") {
        // returns a report on what nodeTypes from its language the program uses
        const usage = new TreeNode_1.default();
        const grammarProgram = this.getGrammarProgram();
        const nodeTypeDefinitions = grammarProgram.getNodeTypeDefinitions();
        nodeTypeDefinitions.forEach(child => {
            usage.appendLine([child.getNodeTypeIdFromDefinition(), "line-id", GrammarConstants_1.GrammarConstants.nodeType, child.getRequiredCellTypeNames().join(" ")].join(" "));
        });
        const programNodes = this.getTopDownArray();
        programNodes.forEach((programNode, lineNumber) => {
            const def = programNode.getDefinition();
            const stats = usage.getNode(def.getNodeTypeIdFromDefinition());
            stats.appendLine([filepath + "-" + lineNumber, programNode.getWords().join(" ")].join(" "));
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
    getCompiledProgramName(programPath) {
        const grammarProgram = this.getDefinition();
        return programPath.replace(`.${grammarProgram.getExtensionName()}`, `.${grammarProgram.getTargetExtension()}`);
    }
}
exports.default = AbstractRuntimeProgram;
