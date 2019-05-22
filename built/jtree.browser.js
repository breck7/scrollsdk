"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let _jtreeLatestTime = 0;
let _jtreeMinTimeIncrement = 0.000000000001;
class AbstractNode {
    _getNow() {
        // We add this loop to restore monotonically increasing .now():
        // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
        let time = performance.now();
        while (time <= _jtreeLatestTime) {
            if (time === time + _jtreeMinTimeIncrement)
                // Some browsers have different return values for perf.now()
                _jtreeMinTimeIncrement = 10 * _jtreeMinTimeIncrement;
            time += _jtreeMinTimeIncrement;
        }
        _jtreeLatestTime = time;
        return time;
    }
}
// todo: change to enum?
var GrammarConstantsCompiler;
(function (GrammarConstantsCompiler) {
    GrammarConstantsCompiler["sub"] = "sub";
    GrammarConstantsCompiler["indentCharacter"] = "indentCharacter";
    GrammarConstantsCompiler["listDelimiter"] = "listDelimiter";
    GrammarConstantsCompiler["openChildren"] = "openChildren";
    GrammarConstantsCompiler["closeChildren"] = "closeChildren";
})(GrammarConstantsCompiler || (GrammarConstantsCompiler = {}));
var GrammarStandardCellTypes;
(function (GrammarStandardCellTypes) {
    GrammarStandardCellTypes["any"] = "any";
    GrammarStandardCellTypes["anyFirstWord"] = "anyFirstWord";
    GrammarStandardCellTypes["float"] = "float";
    GrammarStandardCellTypes["number"] = "number";
    GrammarStandardCellTypes["bit"] = "bit";
    GrammarStandardCellTypes["bool"] = "bool";
    GrammarStandardCellTypes["int"] = "int";
})(GrammarStandardCellTypes || (GrammarStandardCellTypes = {}));
var GrammarConstants;
(function (GrammarConstants) {
    // node types
    GrammarConstants["grammar"] = "grammar";
    GrammarConstants["extensions"] = "extensions";
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
    // parse time
    GrammarConstants["nodeTypes"] = "nodeTypes";
    GrammarConstants["cells"] = "cells";
    GrammarConstants["catchAllCellType"] = "catchAllCellType";
    GrammarConstants["firstCellType"] = "firstCellType";
    GrammarConstants["catchAllNodeType"] = "catchAllNodeType";
    GrammarConstants["defaults"] = "defaults";
    GrammarConstants["constants"] = "constants";
    GrammarConstants["group"] = "group";
    GrammarConstants["blob"] = "blob";
    GrammarConstants["required"] = "required";
    GrammarConstants["single"] = "single";
    GrammarConstants["tags"] = "tags";
    // parse and interpret time
    GrammarConstants["constructors"] = "constructors";
    GrammarConstants["constructorNodeJs"] = "nodejs";
    GrammarConstants["constructorBrowser"] = "browser";
    GrammarConstants["constructorJavascript"] = "javascript";
    // compile time
    GrammarConstants["compilerNodeType"] = "compiler";
    // develop time
    GrammarConstants["description"] = "description";
    GrammarConstants["example"] = "example";
    GrammarConstants["frequency"] = "frequency";
    GrammarConstants["highlightScope"] = "highlightScope";
})(GrammarConstants || (GrammarConstants = {}));
var GrammarConstantsErrors;
(function (GrammarConstantsErrors) {
    GrammarConstantsErrors["invalidNodeTypeError"] = "invalidNodeTypeError";
    GrammarConstantsErrors["invalidConstructorPathError"] = "invalidConstructorPathError";
    GrammarConstantsErrors["invalidWordError"] = "invalidWordError";
    GrammarConstantsErrors["grammarDefinitionError"] = "grammarDefinitionError";
    GrammarConstantsErrors["extraWordError"] = "extraWordError";
    GrammarConstantsErrors["unfilledColumnError"] = "unfilledColumnError";
    GrammarConstantsErrors["missingRequiredNodeTypeError"] = "missingRequiredNodeTypeError";
    GrammarConstantsErrors["nodeTypeUsedMultipleTimesError"] = "nodeTypeUsedMultipleTimesError";
})(GrammarConstantsErrors || (GrammarConstantsErrors = {}));
class TreeUtils {
    static getPathWithoutFileName(path) {
        const parts = path.split("/"); // todo: change for windows?
        parts.pop();
        return parts.join("/");
    }
    static getClassNameFromFilePath(filename) {
        return filename
            .replace(/\.[^\.]+$/, "")
            .split("/")
            .pop();
    }
    static getLineIndexAtCharacterPosition(str, index) {
        const lines = str.split("\n");
        const len = lines.length;
        let position = 0;
        for (let lineNumber = 0; lineNumber < len; lineNumber++) {
            position += lines[lineNumber].length;
            if (position >= index)
                return lineNumber;
        }
    }
    static resolvePath(filePath, programFilepath) {
        // For use in Node.js only
        if (!filePath.startsWith("."))
            return filePath;
        const path = require("path");
        const folder = this.getPathWithoutFileName(programFilepath);
        return path.resolve(folder + "/" + filePath);
    }
    static getFileExtension(url = "") {
        const match = url.match(/\.([^\.]+)$/);
        return (match && match[1]) || "";
    }
    static resolveProperty(obj, path, separator = ".") {
        const properties = Array.isArray(path) ? path : path.split(separator);
        return properties.reduce((prev, curr) => prev && prev[curr], obj);
    }
    static formatStr(str, listDelimiter = " ", parameterMap) {
        return str.replace(/{([^\}]+)}/g, (match, path) => {
            const val = parameterMap[path];
            if (!val)
                return "";
            return Array.isArray(val) ? val.join(listDelimiter) : val;
        });
    }
    static stripHtml(text) {
        return text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text;
    }
    static getUniqueWordsArray(allWords) {
        const words = allWords.replace(/\n/g, " ").split(" ");
        const index = {};
        words.forEach(word => {
            if (!index[word])
                index[word] = 0;
            index[word]++;
        });
        return Object.keys(index).map(key => {
            return {
                word: key,
                count: index[key]
            };
        });
    }
    static getRandomString(length = 30, letters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")) {
        let str = "";
        while (length) {
            str += letters[Math.round(Math.min(Math.random() * letters.length, letters.length - 1))];
            length--;
        }
        return str;
    }
    static makeRandomTree(lines = 1000) {
        let str = "";
        let letters = " 123abc".split("");
        while (lines) {
            let indent = " ".repeat(Math.round(Math.random() * 6));
            let bit = indent;
            let rand = Math.floor(Math.random() * 30);
            while (rand) {
                bit += letters[Math.round(Math.min(Math.random() * letters.length, letters.length - 1))];
                rand--;
            }
            bit += "\n";
            str += bit;
            lines--;
        }
        return str;
    }
    static arrayToMap(arr) {
        const map = {};
        arr.forEach(val => (map[val] = true));
        return map;
    }
    static mapValues(object, fn) {
        const result = {};
        Object.keys(object).forEach(key => {
            result[key] = fn(key);
        });
        return result;
    }
    static sortByAccessor(accessor) {
        return (objectA, objectB) => {
            const av = accessor(objectA);
            const bv = accessor(objectB);
            let result = av < bv ? -1 : av > bv ? 1 : 0;
            if (av === undefined && bv !== undefined)
                result = -1;
            else if (bv === undefined && av !== undefined)
                result = 1;
            return result;
        };
    }
    static makeGraphSortFunction(thisColumnIndex, extendsColumnIndex) {
        return (nodeA, nodeB) => {
            // -1 === a before b
            const nodeAUniqueId = nodeA.getWord(thisColumnIndex);
            const nodeAExtends = nodeA.getWord(extendsColumnIndex);
            const nodeBUniqueId = nodeB.getWord(thisColumnIndex);
            const nodeBExtends = nodeB.getWord(extendsColumnIndex);
            const nodeAExtendsNodeB = nodeAExtends && nodeAExtends === nodeBUniqueId;
            const nodeBExtendsNodeA = nodeBExtends && nodeBExtends === nodeAUniqueId;
            if (!nodeAExtends && !nodeBExtends) {
                // If neither extends, sort by firstWord
                if (nodeAUniqueId > nodeBUniqueId)
                    return 1;
                else if (nodeAUniqueId < nodeBUniqueId)
                    return -1;
                return 0;
            }
            // If only one extends, the other comes first
            else if (!nodeAExtends)
                return -1;
            else if (!nodeBExtends)
                return 1;
            // If A extends B, B should come first
            if (nodeAExtendsNodeB)
                return 1;
            else if (nodeBExtendsNodeA)
                return -1;
            // Sort by what they extend
            if (nodeAExtends > nodeBExtends)
                return 1;
            else if (nodeAExtends < nodeBExtends)
                return -1;
            // Finally sort by firstWord
            if (nodeAUniqueId > nodeBUniqueId)
                return 1;
            else if (nodeAUniqueId < nodeBUniqueId)
                return -1;
            // Should never hit this, unless we have a duplicate line.
            return 0;
        };
    }
}
TreeUtils.BrowserScript = class {
    constructor(fileStr) {
        this._str = fileStr;
    }
    addUseStrict() {
        this._str = `"use strict";\n` + this._str;
        return this;
    }
    removeRequires() {
        this._str = this._str.replace(/(\n|^)const .* \= require\(.*/g, "$1");
        return this;
    }
    _removeAllLinesStartingWith(prefix) {
        this._str = this._str
            .split("\n")
            .filter(line => !line.startsWith(prefix))
            .join("\n");
        return this;
    }
    removeNodeJsOnlyLines() {
        return this._removeAllLinesStartingWith("/*NODE_JS_ONLY*/");
    }
    removeHashBang() {
        this._str = this._str.replace(/^\#\![^\n]+\n/, "");
        return this;
    }
    removeImports() {
        // todo: what if this spans multiple lines?
        this._str = this._str.replace(/(\n|^)import .* from .*/g, "$1");
        this._str = this._str.replace(/(\n|^)\/\*FOR_TYPES_ONLY\*\/ import .* from .*/g, "$1");
        this._str = this._str.replace(/(\n|^)import {[^\}]+} ?from ?"[^\"]+"/g, "$1");
        return this;
    }
    removeExports() {
        this._str = this._str.replace(/(\n|^)export default .*/g, "$1");
        this._str = this._str.replace(/(\n|^)export {[^\}]+}/g, "$1");
        return this;
    }
    changeDefaultExportsToWindowExports() {
        this._str = this._str.replace(/\nexport default ([^;]*)/g, "\nwindow.$1 = $1");
        // todo: should we just switch to some bundler?
        const matches = this._str.match(/\nexport { [^\}]+ }/g);
        if (matches)
            this._str.replace(/\nexport { ([^\}]+) }/g, matches[0]
                .replace("export {", "")
                .replace("}", "")
                .split(/ /g)
                .map(mod => `\nwindow.${mod} = ${mod}`)
                .join("\n"));
        return this;
    }
    changeNodeExportsToWindowExports() {
        // todo: should we just switch to some bundler?
        const reg = /\nmodule\.exports = { ?([^\}]+) ?}/;
        const matches = this._str.match(reg);
        if (matches) {
            this._str = this._str.replace(reg, matches[1]
                .split(/,/g)
                .map(mod => mod.replace(/\s/g, ""))
                .map(mod => `\nwindow.${mod} = ${mod}`)
                .join("\n"));
        }
        this._str = this._str.replace(/\nmodule\.exports \= ([^;^{]*)/g, "\nwindow.$1 = $1");
        this._str = this._str.replace(/\nexports\.default \= ([^;]*)/g, "\nwindow.$1 = $1");
        return this;
    }
    getString() {
        return this._str;
    }
};
var FileFormat;
(function (FileFormat) {
    FileFormat["csv"] = "csv";
    FileFormat["tsv"] = "tsv";
    FileFormat["tree"] = "tree";
})(FileFormat || (FileFormat = {}));
class ImmutableNode extends AbstractNode {
    constructor(children, line, parent) {
        super();
        this._parent = parent;
        this._setLine(line);
        this._setChildren(children);
    }
    execute(context) {
        return Promise.all(this.map(child => child.execute(context)));
    }
    getErrors() {
        return [];
    }
    getLineCellTypes() {
        return "any ".repeat(this.getWords().length).trim();
    }
    executeSync(context) {
        return this.map(child => child.executeSync(context));
    }
    isNodeJs() {
        return typeof exports !== "undefined";
    }
    isBrowser() {
        return !this.isNodeJs();
    }
    getOlderSiblings() {
        if (this.isRoot())
            return [];
        return this.getParent().slice(0, this.getIndex());
    }
    _getClosestOlderSibling() {
        const olderSiblings = this.getOlderSiblings();
        return olderSiblings[olderSiblings.length - 1];
    }
    getYoungerSiblings() {
        if (this.isRoot())
            return [];
        return this.getParent().slice(this.getIndex() + 1);
    }
    getSiblings() {
        if (this.isRoot())
            return [];
        return this.getParent().filter(node => node !== this);
    }
    _getUid() {
        if (!this._uid)
            this._uid = ImmutableNode._makeUniqueId();
        return this._uid;
    }
    // todo: rename getMother? grandMother et cetera?
    getParent() {
        return this._parent;
    }
    getPoint() {
        return this._getPoint();
    }
    _getPoint(relativeTo) {
        return {
            x: this._getXCoordinate(relativeTo),
            y: this._getYCoordinate(relativeTo)
        };
    }
    getPointRelativeTo(relativeTo) {
        return this._getPoint(relativeTo);
    }
    getIndentation(relativeTo) {
        return this.getXI().repeat(this._getXCoordinate(relativeTo) - 1);
    }
    _getTopDownArray(arr) {
        this.forEach(child => {
            arr.push(child);
            child._getTopDownArray(arr);
        });
    }
    getTopDownArray() {
        const arr = [];
        this._getTopDownArray(arr);
        return arr;
    }
    *getTopDownArrayIterator() {
        for (let child of this.getChildren()) {
            yield child;
            yield* child.getTopDownArrayIterator();
        }
    }
    nodeAtLine(lineNumber) {
        let index = 0;
        for (let node of this.getTopDownArrayIterator()) {
            if (lineNumber === index)
                return node;
            index++;
        }
    }
    getNumberOfLines() {
        let lineCount = 0;
        for (let node of this.getTopDownArrayIterator()) {
            lineCount++;
        }
        return lineCount;
    }
    _getLineNumber(target) {
        let lineNumber = 1;
        for (let node of this.getTopDownArrayIterator()) {
            if (node === target)
                return lineNumber;
            lineNumber++;
        }
        return lineNumber;
    }
    isBlankLine() {
        return !this.length && !this.getLine();
    }
    hasDuplicateFirstWords() {
        return this.length ? new Set(this.getFirstWords()).size !== this.length : false;
    }
    isEmpty() {
        return !this.length && !this.getContent();
    }
    _getYCoordinate(relativeTo) {
        if (this._cachedLineNumber)
            return this._cachedLineNumber;
        if (this.isRoot(relativeTo))
            return 0;
        const start = relativeTo || this.getRootNode();
        return start._getLineNumber(this);
    }
    isRoot(relativeTo) {
        return relativeTo === this || !this.getParent();
    }
    getRootNode() {
        return this._getRootNode();
    }
    _getRootNode(relativeTo) {
        if (this.isRoot(relativeTo))
            return this;
        return this.getParent()._getRootNode(relativeTo);
    }
    toString(indentCount = 0, language = this) {
        if (this.isRoot())
            return this._childrenToString(indentCount, language);
        return (language.getXI().repeat(indentCount) +
            this.getLine(language) +
            (this.length ? language.getYI() + this._childrenToString(indentCount + 1, language) : ""));
    }
    getWord(index) {
        const words = this._getLine().split(this.getZI());
        if (index < 0)
            index = words.length + index;
        return words[index];
    }
    _toHtml(indentCount) {
        const path = this.getPathVector().join(" ");
        const classes = {
            nodeLine: "nodeLine",
            xi: "xIncrement",
            yi: "yIncrement",
            nodeChildren: "nodeChildren"
        };
        const edge = this.getXI().repeat(indentCount);
        // Set up the firstWord part of the node
        const edgeHtml = `<span class="${classes.nodeLine}" data-pathVector="${path}"><span class="${classes.xi}">${edge}</span>`;
        const lineHtml = this._getLineHtml();
        const childrenHtml = this.length
            ? `<span class="${classes.yi}">${this.getYI()}</span>` +
                `<span class="${classes.nodeChildren}">${this._childrenToHtml(indentCount + 1)}</span>`
            : "";
        return `${edgeHtml}${lineHtml}${childrenHtml}</span>`;
    }
    _getWords(startFrom) {
        if (!this._words)
            this._words = this._getLine().split(this.getZI());
        return startFrom ? this._words.slice(startFrom) : this._words;
    }
    getWords() {
        return this._getWords(0);
    }
    getWordsFrom(startFrom) {
        return this._getWords(startFrom);
    }
    _getWordIndexCharacterStartPosition(wordIndex) {
        const xiLength = this.getXI().length;
        const numIndents = this._getXCoordinate(undefined) - 1;
        const indentPosition = xiLength * numIndents;
        if (wordIndex < 1)
            return xiLength * (numIndents + wordIndex);
        return (indentPosition +
            this.getWords()
                .slice(0, wordIndex)
                .join(this.getZI()).length +
            this.getZI().length);
    }
    getNodeInScopeAtCharIndex(charIndex) {
        if (this.isRoot())
            return this;
        let wordIndex = this.getWordIndexAtCharacterIndex(charIndex);
        if (wordIndex > 0)
            return this;
        let node = this;
        while (wordIndex < 1) {
            node = node.getParent();
            wordIndex++;
        }
        return node;
    }
    getWordProperties(wordIndex) {
        const start = this._getWordIndexCharacterStartPosition(wordIndex);
        const word = wordIndex < 0 ? "" : this.getWord(wordIndex);
        return {
            startCharIndex: start,
            endCharIndex: start + word.length,
            word: word
        };
    }
    getAllWordBoundaryCoordinates() {
        const coordinates = [];
        let line = 0;
        for (let node of this.getTopDownArrayIterator()) {
            ;
            node.getWordBoundaryIndices().forEach(index => {
                coordinates.push({
                    y: line,
                    x: index
                });
            });
            line++;
        }
        return coordinates;
    }
    getWordBoundaryIndices() {
        const boundaries = [0];
        let numberOfIndents = this._getXCoordinate(undefined) - 1;
        let start = numberOfIndents;
        // Add indents
        while (numberOfIndents) {
            boundaries.push(boundaries.length);
            numberOfIndents--;
        }
        // Add columns
        const ziIncrement = this.getZI().length;
        this.getWords().forEach(word => {
            if (boundaries[boundaries.length - 1] !== start)
                boundaries.push(start);
            start += word.length;
            if (boundaries[boundaries.length - 1] !== start)
                boundaries.push(start);
            start += ziIncrement;
        });
        return boundaries;
    }
    getWordIndexAtCharacterIndex(charIndex) {
        // todo: is this correct thinking for handling root?
        if (this.isRoot())
            return 0;
        const numberOfIndents = this._getXCoordinate(undefined) - 1;
        // todo: probably want to rewrite this in a performant way.
        const spots = [];
        while (spots.length < numberOfIndents) {
            spots.push(-(numberOfIndents - spots.length));
        }
        this.getWords().forEach((word, wordIndex) => {
            word.split("").forEach(letter => {
                spots.push(wordIndex);
            });
            spots.push(wordIndex);
        });
        return spots[charIndex];
    }
    getFirstWord() {
        return this.getWords()[0];
    }
    getContent() {
        const words = this.getWordsFrom(1);
        return words.length ? words.join(this.getZI()) : undefined;
    }
    getContentWithChildren() {
        // todo: deprecate
        const content = this.getContent();
        return (content ? content : "") + (this.length ? this.getYI() + this._childrenToString() : "");
    }
    getStack() {
        return this._getStack();
    }
    _getStack(relativeTo) {
        if (this.isRoot(relativeTo))
            return [];
        const parent = this.getParent();
        if (parent.isRoot(relativeTo))
            return [this];
        else
            return parent._getStack(relativeTo).concat([this]);
    }
    getStackString() {
        return this._getStack()
            .map((node, index) => this.getXI().repeat(index) + node.getLine())
            .join(this.getYI());
    }
    getLine(language) {
        if (!this._words && !language)
            return this._getLine(); // todo: how does this interact with "language" param?
        return this.getWords().join((language || this).getZI());
    }
    getColumnNames() {
        return this._getUnionNames();
    }
    getOneHot(column) {
        const clone = this.clone();
        const cols = Array.from(new Set(clone.getColumn(column)));
        clone.forEach(node => {
            const val = node.get(column);
            node.delete(column);
            cols.forEach(col => {
                node.set(column + "_" + col, val === col ? "1" : "0");
            });
        });
        return clone;
    }
    // todo: return array? getPathArray?
    _getFirstWordPath(relativeTo) {
        if (this.isRoot(relativeTo))
            return "";
        else if (this.getParent().isRoot(relativeTo))
            return this.getFirstWord();
        return this.getParent()._getFirstWordPath(relativeTo) + this.getXI() + this.getFirstWord();
    }
    getFirstWordPathRelativeTo(relativeTo) {
        return this._getFirstWordPath(relativeTo);
    }
    getFirstWordPath() {
        return this._getFirstWordPath();
    }
    getPathVector() {
        return this._getPathVector();
    }
    getPathVectorRelativeTo(relativeTo) {
        return this._getPathVector(relativeTo);
    }
    _getPathVector(relativeTo) {
        if (this.isRoot(relativeTo))
            return [];
        const path = this.getParent()._getPathVector(relativeTo);
        path.push(this.getIndex());
        return path;
    }
    getIndex() {
        return this.getParent()._indexOfNode(this);
    }
    isTerminal() {
        return !this.length;
    }
    _getLineHtml() {
        return this.getWords()
            .map((word, index) => `<span class="word${index}">${TreeUtils.stripHtml(word)}</span>`)
            .join(`<span class="zIncrement">${this.getZI()}</span>`);
    }
    _getXmlContent(indentCount) {
        if (this.getContent() !== undefined)
            return this.getContentWithChildren();
        return this.length
            ? `${indentCount === -1 ? "" : "\n"}${this._childrenToXml(indentCount > -1 ? indentCount + 2 : -1)}${" ".repeat(indentCount)}`
            : "";
    }
    _toXml(indentCount) {
        const indent = " ".repeat(indentCount);
        const tag = this.getFirstWord();
        return `${indent}<${tag}>${this._getXmlContent(indentCount)}</${tag}>${indentCount === -1 ? "" : "\n"}`;
    }
    _toObjectTuple() {
        const content = this.getContent();
        const length = this.length;
        const hasChildrenNoContent = content === undefined && length;
        const hasContentAndHasChildren = content !== undefined && length;
        // If the node has a content and a subtree return it as a string, as
        // Javascript object values can't be both a leaf and a tree.
        const tupleValue = hasChildrenNoContent
            ? this.toObject()
            : hasContentAndHasChildren
                ? this.getContentWithChildren()
                : content;
        return [this.getFirstWord(), tupleValue];
    }
    _indexOfNode(needleNode) {
        let result = -1;
        this.find((node, index) => {
            if (node === needleNode) {
                result = index;
                return true;
            }
        });
        return result;
    }
    getSlice(startIndexInclusive, stopIndexExclusive) {
        return new TreeNode(this.slice(startIndexInclusive, stopIndexExclusive)
            .map(child => child.toString())
            .join("\n"));
    }
    _hasColumns(columns) {
        const words = this.getWords();
        return columns.every((searchTerm, index) => searchTerm === words[index]);
    }
    hasWord(index, word) {
        return this.getWord(index) === word;
    }
    getNodeByColumns(...columns) {
        return this.getTopDownArray().find(node => node._hasColumns(columns));
    }
    getNodeByColumn(index, name) {
        return this.find(node => node.getWord(index) === name);
    }
    _getNodesByColumn(index, name) {
        return this.filter(node => node.getWord(index) === name);
    }
    getChildrenFirstArray() {
        const arr = [];
        this._getChildrenFirstArray(arr);
        return arr;
    }
    _getChildrenFirstArray(arr) {
        this.forEach(child => {
            child._getChildrenFirstArray(arr);
            arr.push(child);
        });
    }
    _getXCoordinate(relativeTo) {
        return this._getStack(relativeTo).length;
    }
    getParentFirstArray() {
        const levels = this._getLevels();
        const arr = [];
        Object.values(levels).forEach(level => {
            level.forEach(item => arr.push(item));
        });
        return arr;
    }
    _getLevels() {
        const levels = {};
        this.getTopDownArray().forEach(node => {
            const level = node._getXCoordinate();
            if (!levels[level])
                levels[level] = [];
            levels[level].push(node);
        });
        return levels;
    }
    _getChildrenArray() {
        if (!this._children)
            this._children = [];
        return this._children;
    }
    _getChildren() {
        return this._getChildrenArray();
    }
    getLines() {
        return this.map(node => node.getLine());
    }
    getChildren() {
        return this._getChildren().slice(0);
    }
    get length() {
        return this._getChildren().length;
    }
    _nodeAt(index) {
        if (index < 0)
            index = this.length + index;
        return this._getChildren()[index];
    }
    nodeAt(indexOrIndexArray) {
        if (typeof indexOrIndexArray === "number")
            return this._nodeAt(indexOrIndexArray);
        if (indexOrIndexArray.length === 1)
            return this._nodeAt(indexOrIndexArray[0]);
        const first = indexOrIndexArray[0];
        const node = this._nodeAt(first);
        if (!node)
            return undefined;
        return node.nodeAt(indexOrIndexArray.slice(1));
    }
    _toObject() {
        const obj = {};
        this.forEach(node => {
            const tuple = node._toObjectTuple();
            obj[tuple[0]] = tuple[1];
        });
        return obj;
    }
    toHtml() {
        return this._childrenToHtml(0);
    }
    _childrenToHtml(indentCount) {
        return this.map(node => node._toHtml(indentCount)).join(`<span class="yIncrement">${this.getYI()}</span>`);
    }
    _childrenToString(indentCount, language = this) {
        return this.map(node => node.toString(indentCount, language)).join(language.getYI());
    }
    childrenToString() {
        return this._childrenToString();
    }
    // todo: implement
    _getNodeJoinCharacter() {
        return "\n";
    }
    compile(targetExtension) {
        return this.map(child => child.compile(targetExtension)).join(this._getNodeJoinCharacter());
    }
    toXml() {
        return this._childrenToXml(0);
    }
    toDisk(path) {
        if (!this.isNodeJs())
            throw new Error("This method only works in Node.js");
        const format = ImmutableNode._getFileFormat(path);
        const formats = {
            tree: (tree) => tree.toString(),
            csv: (tree) => tree.toCsv(),
            tsv: (tree) => tree.toTsv()
        };
        require("fs").writeFileSync(path, formats[format](this), "utf8");
        return this;
    }
    _lineToYaml(indentLevel, listTag = "") {
        let prefix = " ".repeat(indentLevel);
        if (listTag && indentLevel > 1)
            prefix = " ".repeat(indentLevel - 2) + listTag + " ";
        return prefix + `${this.getFirstWord()}:` + (this.getContent() ? " " + this.getContent() : "");
    }
    _isYamlList() {
        return this.hasDuplicateFirstWords();
    }
    toYaml() {
        return `%YAML 1.2
---\n${this._childrenToYaml(0).join("\n")}`;
    }
    _childrenToYaml(indentLevel) {
        if (this._isYamlList())
            return this._childrenToYamlList(indentLevel);
        else
            return this._childrenToYamlAssociativeArray(indentLevel);
    }
    // if your code-to-be-yaml has a list of associative arrays of type N and you don't
    // want the type N to print
    _collapseYamlLine() {
        return false;
    }
    _toYamlListElement(indentLevel) {
        const children = this._childrenToYaml(indentLevel + 1);
        if (this._collapseYamlLine()) {
            if (indentLevel > 1)
                return children.join("\n").replace(" ".repeat(indentLevel), " ".repeat(indentLevel - 2) + "- ");
            return children.join("\n");
        }
        else {
            children.unshift(this._lineToYaml(indentLevel, "-"));
            return children.join("\n");
        }
    }
    _childrenToYamlList(indentLevel) {
        return this.map(node => node._toYamlListElement(indentLevel + 2));
    }
    _toYamlAssociativeArrayElement(indentLevel) {
        const children = this._childrenToYaml(indentLevel + 1);
        children.unshift(this._lineToYaml(indentLevel));
        return children.join("\n");
    }
    _childrenToYamlAssociativeArray(indentLevel) {
        return this.map(node => node._toYamlAssociativeArrayElement(indentLevel));
    }
    // todo: do we need this?
    _getDuplicateLinesMap() {
        const count = {};
        this.forEach(node => {
            const line = node.getLine();
            if (count[line])
                count[line]++;
            else
                count[line] = 1;
        });
        this.forEach(node => {
            const line = node.getLine();
            if (count[line] === 1)
                delete count[line];
        });
        return count;
    }
    toJson() {
        return JSON.stringify(this.toObject(), null, " ");
    }
    findNodes(firstWordPath) {
        // todo: can easily speed this up
        return this.getTopDownArray().filter(node => {
            if (node._getFirstWordPath(this) === firstWordPath)
                return true;
            return false;
        });
    }
    format(str) {
        const that = this;
        return str.replace(/{([^\}]+)}/g, (match, path) => that.get(path) || "");
    }
    getColumn(path) {
        return this.map(node => node.get(path));
    }
    getFiltered(fn) {
        const clone = this.clone();
        clone
            .filter((node, index) => !fn(node, index))
            .forEach(node => {
            node.destroy();
        });
        return clone;
    }
    isLeafColumn(path) {
        for (let node of this._getChildren()) {
            const nd = node.getNode(path);
            if (nd && nd.length)
                return false;
        }
        return true;
    }
    getNode(firstWordPath) {
        return this._getNodeByPath(firstWordPath);
    }
    get(firstWordPath) {
        const node = this._getNodeByPath(firstWordPath);
        return node === undefined ? undefined : node.getContent();
    }
    getNodesByGlobPath(query) {
        return this._getNodesByGlobPath(query);
    }
    _getNodesByGlobPath(globPath) {
        const xi = this.getXI();
        if (!globPath.includes(xi)) {
            if (globPath === "*")
                return this.getChildren();
            return this.filter(node => node.getFirstWord() === globPath);
        }
        const parts = globPath.split(xi);
        const current = parts.shift();
        const rest = parts.join(xi);
        const matchingNodes = current === "*" ? this.getChildren() : this.filter(child => child.getFirstWord() === current);
        return [].concat.apply([], matchingNodes.map(node => node._getNodesByGlobPath(rest)));
    }
    _getNodeByPath(firstWordPath) {
        const xi = this.getXI();
        if (!firstWordPath.includes(xi)) {
            const index = this.indexOfLast(firstWordPath);
            return index === -1 ? undefined : this._nodeAt(index);
        }
        const parts = firstWordPath.split(xi);
        const current = parts.shift();
        const currentNode = this._getChildren()[this._getIndex()[current]];
        return currentNode ? currentNode._getNodeByPath(parts.join(xi)) : undefined;
    }
    getNext() {
        if (this.isRoot())
            return this;
        const index = this.getIndex();
        const parent = this.getParent();
        const length = parent.length;
        const next = index + 1;
        return next === length ? parent._getChildren()[0] : parent._getChildren()[next];
    }
    getPrevious() {
        if (this.isRoot())
            return this;
        const index = this.getIndex();
        const parent = this.getParent();
        const length = parent.length;
        const prev = index - 1;
        return prev === -1 ? parent._getChildren()[length - 1] : parent._getChildren()[prev];
    }
    _getUnionNames() {
        if (!this.length)
            return [];
        const obj = {};
        this.forEach((node) => {
            if (!node.length)
                return undefined;
            node.forEach(node => {
                obj[node.getFirstWord()] = 1;
            });
        });
        return Object.keys(obj);
    }
    getAncestorNodesByInheritanceViaExtendsKeyword(key) {
        const ancestorNodes = this._getAncestorNodes((node, id) => node._getNodesByColumn(0, id), node => node.get(key), this);
        ancestorNodes.push(this);
        return ancestorNodes;
    }
    // Note: as you can probably tell by the name of this method, I don't recommend using this as it will likely be replaced by something better.
    getAncestorNodesByInheritanceViaColumnIndices(thisColumnNumber, extendsColumnNumber) {
        const ancestorNodes = this._getAncestorNodes((node, id) => node._getNodesByColumn(thisColumnNumber, id), node => node.getWord(extendsColumnNumber), this);
        ancestorNodes.push(this);
        return ancestorNodes;
    }
    _getAncestorNodes(getPotentialParentNodesByIdFn, getParentIdFn, cannotContainNode) {
        const parentId = getParentIdFn(this);
        if (!parentId)
            return [];
        const potentialParentNodes = getPotentialParentNodesByIdFn(this.getParent(), parentId);
        if (!potentialParentNodes.length)
            throw new Error(`"${this.getLine()} tried to extend "${parentId}" but "${parentId}" not found.`);
        if (potentialParentNodes.length > 1)
            throw new Error(`Invalid inheritance family tree. Multiple unique ids found for "${parentId}"`);
        const parentNode = potentialParentNodes[0];
        // todo: detect loops
        if (parentNode === cannotContainNode)
            throw new Error(`Loop detected between '${this.getLine()}' and '${parentNode.getLine()}'`);
        const ancestorNodes = parentNode._getAncestorNodes(getPotentialParentNodesByIdFn, getParentIdFn, cannotContainNode);
        ancestorNodes.push(parentNode);
        return ancestorNodes;
    }
    pathVectorToFirstWordPath(pathVector) {
        const path = pathVector.slice(); // copy array
        const names = [];
        let node = this;
        while (path.length) {
            if (!node)
                return names;
            names.push(node.nodeAt(path[0]).getFirstWord());
            node = node.nodeAt(path.shift());
        }
        return names;
    }
    toCsv() {
        return this.toDelimited(",");
    }
    toFlatTree() {
        const tree = this.clone();
        tree.forEach(node => {
            // todo: best approach here? set children as content?
            node.deleteChildren();
        });
        return tree;
    }
    _getTypes(header) {
        const matrix = this._getMatrix(header);
        const types = header.map(i => "int");
        matrix.forEach(row => {
            row.forEach((value, index) => {
                const type = types[index];
                if (type === "string")
                    return 1;
                if (value === undefined || value === "")
                    return 1;
                if (type === "float") {
                    if (value.match(/^\-?[0-9]*\.?[0-9]*$/))
                        return 1;
                    types[index] = "string";
                }
                if (value.match(/^\-?[0-9]+$/))
                    return 1;
                types[index] = "string";
            });
        });
        return types;
    }
    toDataTable(header = this._getUnionNames()) {
        const types = this._getTypes(header);
        const parsers = {
            string: str => str,
            float: parseFloat,
            int: parseInt
        };
        const cellFn = (cellValue, rowIndex, columnIndex) => rowIndex ? parsers[types[columnIndex]](cellValue) : cellValue;
        const arrays = this._toArrays(header, cellFn);
        arrays.rows.unshift(arrays.header);
        return arrays.rows;
    }
    toDelimited(delimiter, header = this._getUnionNames()) {
        const regex = new RegExp(`(\\n|\\"|\\${delimiter})`);
        const cellFn = (str, row, column) => !str.toString().match(regex) ? str : `"` + str.replace(/\"/g, `""`) + `"`;
        return this._toDelimited(delimiter, header, cellFn);
    }
    _getMatrix(columns) {
        const matrix = [];
        this.forEach(child => {
            const row = [];
            columns.forEach(col => {
                row.push(child.get(col));
            });
            matrix.push(row);
        });
        return matrix;
    }
    _toArrays(header, cellFn) {
        const skipHeaderRow = 1;
        const headerArray = header.map((columnName, index) => cellFn(columnName, 0, index));
        const rows = this.map((node, rowNumber) => header.map((columnName, columnIndex) => {
            const childNode = node.getNode(columnName);
            const content = childNode ? childNode.getContentWithChildren() : "";
            return cellFn(content, rowNumber + skipHeaderRow, columnIndex);
        }));
        return {
            rows: rows,
            header: headerArray
        };
    }
    _toDelimited(delimiter, header, cellFn) {
        const data = this._toArrays(header, cellFn);
        return data.header.join(delimiter) + "\n" + data.rows.map(row => row.join(delimiter)).join("\n");
    }
    toTable() {
        // Output a table for printing
        return this._toTable(100, false);
    }
    toFormattedTable(maxWidth, alignRight) {
        // Output a table with padding up to maxWidth in each cell
        return this._toTable(maxWidth, alignRight);
    }
    _toTable(maxWidth, alignRight = false) {
        const header = this._getUnionNames();
        const widths = header.map(col => (col.length > maxWidth ? maxWidth : col.length));
        this.forEach(node => {
            if (!node.length)
                return true;
            header.forEach((col, index) => {
                const cellValue = node.get(col);
                if (!cellValue)
                    return true;
                const length = cellValue.toString().length;
                if (length > widths[index])
                    widths[index] = length > maxWidth ? maxWidth : length;
            });
        });
        const cellFn = (cellText, row, col) => {
            const width = widths[col];
            // Strip newlines in fixedWidth output
            const cellValue = cellText.toString().replace(/\n/g, "\\n");
            const cellLength = cellValue.length;
            if (cellLength > width) {
                return cellValue.substr(0, width);
            }
            const padding = " ".repeat(width - cellLength);
            return alignRight ? padding + cellValue : cellValue + padding;
        };
        return this._toDelimited(" ", header, cellFn);
    }
    toSsv() {
        return this.toDelimited(" ");
    }
    toOutline() {
        return this._toOutline(node => node.getLine());
    }
    toMappedOutline(nodeFn) {
        return this._toOutline(nodeFn);
    }
    // Adapted from: https://github.com/notatestuser/treeify.js
    _toOutline(nodeFn) {
        const growBranch = (outlineTreeNode, last, lastStates, nodeFn, callback) => {
            let lastStatesCopy = lastStates.slice(0);
            const node = outlineTreeNode.node;
            if (lastStatesCopy.push([outlineTreeNode, last]) && lastStates.length > 0) {
                let line = "";
                // firstWordd on the "was last element" states of whatever we're nested within,
                // we need to append either blankness or a branch to our line
                lastStates.forEach((lastState, idx) => {
                    if (idx > 0)
                        line += lastState[1] ? " " : "│";
                });
                // the prefix varies firstWordd on whether the key contains something to show and
                // whether we're dealing with the last element in this collection
                // the extra "-" just makes things stand out more.
                line += (last ? "└" : "├") + nodeFn(node);
                callback(line);
            }
            if (!node)
                return;
            const length = node.length;
            let index = 0;
            node.forEach(node => {
                let lastKey = ++index === length;
                growBranch({ node: node }, lastKey, lastStatesCopy, nodeFn, callback);
            });
        };
        let output = "";
        growBranch({ node: this }, false, [], nodeFn, (line) => (output += line + "\n"));
        return output;
    }
    copyTo(node, index) {
        return node._setLineAndChildren(this.getLine(), this.childrenToString(), index);
    }
    // Note: Splits using a positive lookahead
    // this.split("foo").join("\n") === this.toString()
    split(firstWord) {
        const constructor = this.constructor;
        const YI = this.getYI();
        const ZI = this.getZI();
        // todo: cleanup. the escaping is wierd.
        return this.toString()
            .split(new RegExp(`\\${YI}(?=${firstWord}(?:${ZI}|\\${YI}))`, "g"))
            .map(str => new constructor(str));
    }
    toMarkdownTable() {
        return this.toMarkdownTableAdvanced(this._getUnionNames(), (val) => val);
    }
    toMarkdownTableAdvanced(columns, formatFn) {
        const matrix = this._getMatrix(columns);
        const empty = columns.map(col => "-");
        matrix.unshift(empty);
        matrix.unshift(columns);
        const lines = matrix.map((row, rowIndex) => {
            const formattedValues = row.map((val, colIndex) => formatFn(val, rowIndex, colIndex));
            return `|${formattedValues.join("|")}|`;
        });
        return lines.join("\n");
    }
    toTsv() {
        return this.toDelimited("\t");
    }
    getYI() {
        return "\n";
    }
    getZI() {
        return " ";
    }
    getYIRegex() {
        return new RegExp(this.getYI(), "g");
    }
    getXI() {
        return " ";
    }
    _textToContentAndChildrenTuple(text) {
        const lines = text.split(this.getYIRegex());
        const firstLine = lines.shift();
        const children = !lines.length
            ? undefined
            : lines
                .map(line => (line.substr(0, 1) === this.getXI() ? line : this.getXI() + line))
                .map(line => line.substr(1))
                .join(this.getYI());
        return [firstLine, children];
    }
    _getLine() {
        return this._line;
    }
    _setLine(line = "") {
        this._line = line;
        if (this._words)
            delete this._words;
        return this;
    }
    _clearChildren() {
        delete this._children;
        this._clearIndex();
        return this;
    }
    _setChildren(content, circularCheckArray) {
        this._clearChildren();
        if (!content)
            return this;
        // set from string
        if (typeof content === "string")
            return this._parseString(content);
        // set from tree object
        if (content instanceof ImmutableNode) {
            const me = this;
            content.forEach(node => {
                me._setLineAndChildren(node.getLine(), node.childrenToString());
            });
            return this;
        }
        // If we set from object, create an array of inserted objects to avoid circular loops
        if (!circularCheckArray)
            circularCheckArray = [content];
        return this._setFromObject(content, circularCheckArray);
    }
    _setFromObject(content, circularCheckArray) {
        for (let firstWord in content) {
            if (!content.hasOwnProperty(firstWord))
                continue;
            // Branch the circularCheckArray, as we only have same branch circular arrays
            this._appendFromJavascriptObjectTuple(firstWord, content[firstWord], circularCheckArray.slice(0));
        }
        return this;
    }
    // todo: refactor the below.
    _appendFromJavascriptObjectTuple(firstWord, content, circularCheckArray) {
        const type = typeof content;
        let line;
        let children;
        if (content === null)
            line = firstWord + " " + null;
        else if (content === undefined)
            line = firstWord;
        else if (type === "string") {
            const tuple = this._textToContentAndChildrenTuple(content);
            line = firstWord + " " + tuple[0];
            children = tuple[1];
        }
        else if (type === "function")
            line = firstWord + " " + content.toString();
        else if (type !== "object")
            line = firstWord + " " + content;
        else if (content instanceof Date)
            line = firstWord + " " + content.getTime().toString();
        else if (content instanceof ImmutableNode) {
            line = firstWord;
            children = new TreeNode(content.childrenToString(), content.getLine());
        }
        else if (circularCheckArray.indexOf(content) === -1) {
            circularCheckArray.push(content);
            line = firstWord;
            const length = content instanceof Array ? content.length : Object.keys(content).length;
            if (length)
                children = new TreeNode()._setChildren(content, circularCheckArray);
        }
        else {
            // iirc this is return early from circular
            return;
        }
        this._setLineAndChildren(line, children);
    }
    // todo: protected?
    _setLineAndChildren(line, children, index = this.length) {
        const nodeConstructor = this.getNodeConstructor(line);
        const newNode = new nodeConstructor(children, line, this);
        const adjustedIndex = index < 0 ? this.length + index : index;
        this._getChildrenArray().splice(adjustedIndex, 0, newNode);
        if (this._index)
            this._makeIndex(adjustedIndex);
        return newNode;
    }
    _parseString(str) {
        if (!str)
            return this;
        const lines = str.split(this.getYIRegex());
        const parentStack = [];
        let currentIndentCount = -1;
        let lastNode = this;
        lines.forEach(line => {
            const indentCount = this._getIndentCount(line);
            if (indentCount > currentIndentCount) {
                currentIndentCount++;
                parentStack.push(lastNode);
            }
            else if (indentCount < currentIndentCount) {
                // pop things off stack
                while (indentCount < currentIndentCount) {
                    parentStack.pop();
                    currentIndentCount--;
                }
            }
            const lineContent = line.substr(currentIndentCount);
            const parent = parentStack[parentStack.length - 1];
            const nodeConstructor = parent.getNodeConstructor(lineContent);
            lastNode = new nodeConstructor(undefined, lineContent, parent);
            parent._getChildrenArray().push(lastNode);
        });
        return this;
    }
    _getIndex() {
        // StringMap<int> {firstWord: index}
        // When there are multiple tails with the same firstWord, _index stores the last content.
        // todo: change the above behavior: when a collision occurs, create an array.
        return this._index || this._makeIndex();
    }
    getContentsArray() {
        return this.map(node => node.getContent());
    }
    // todo: rename to getChildrenByConstructor(?)
    getChildrenByNodeConstructor(constructor) {
        return this.filter(child => child instanceof constructor);
    }
    // todo: rename to getNodeByConstructor(?)
    getNodeByType(constructor) {
        return this.find(child => child instanceof constructor);
    }
    indexOfLast(firstWord) {
        const result = this._getIndex()[firstWord];
        return result === undefined ? -1 : result;
    }
    indexOf(firstWord) {
        if (!this.has(firstWord))
            return -1;
        const length = this.length;
        const nodes = this._getChildren();
        for (let index = 0; index < length; index++) {
            if (nodes[index].getFirstWord() === firstWord)
                return index;
        }
        return -1;
    }
    toObject() {
        return this._toObject();
    }
    getFirstWords() {
        return this.map(node => node.getFirstWord());
    }
    _makeIndex(startAt = 0) {
        if (!this._index || !startAt)
            this._index = {};
        const nodes = this._getChildren();
        const newIndex = this._index;
        const length = nodes.length;
        for (let index = startAt; index < length; index++) {
            newIndex[nodes[index].getFirstWord()] = index;
        }
        return newIndex;
    }
    _childrenToXml(indentCount) {
        return this.map(node => node._toXml(indentCount)).join("");
    }
    _getIndentCount(str) {
        let level = 0;
        const edgeChar = this.getXI();
        while (str[level] === edgeChar) {
            level++;
        }
        return level;
    }
    clone() {
        return new this.constructor(this.childrenToString(), this.getLine());
    }
    // todo: rename to hasFirstWord
    has(firstWord) {
        return this._hasFirstWord(firstWord);
    }
    _hasFirstWord(firstWord) {
        return this._getIndex()[firstWord] !== undefined;
    }
    // todo: is this used anywhere?
    _getFirstWordByIndex(index) {
        // Passing -1 gets the last item, et cetera
        const length = this.length;
        if (index < 0)
            index = length + index;
        if (index >= length)
            return undefined;
        return this._getChildren()[index].getFirstWord();
    }
    map(fn) {
        return this.getChildren().map(fn);
    }
    filter(fn) {
        return this.getChildren().filter(fn);
    }
    find(fn) {
        return this.getChildren().find(fn);
    }
    every(fn) {
        let index = 0;
        for (let node of this.getTopDownArrayIterator()) {
            if (!fn(node, index))
                return false;
            index++;
        }
        return true;
    }
    forEach(fn) {
        this.getChildren().forEach(fn);
        return this;
    }
    // todo: protected?
    _clearIndex() {
        delete this._index;
    }
    slice(start, end) {
        return this.getChildren().slice(start, end);
    }
    getFirstWordMap() {
        return undefined;
    }
    getCatchAllNodeConstructor(line) {
        return this.constructor;
    }
    getInheritanceTree() {
        const paths = {};
        const result = new TreeNode();
        this.forEach(node => {
            const key = node.getWord(0);
            const parentKey = node.getWord(1);
            const parentPath = paths[parentKey];
            paths[key] = parentPath ? [parentPath, key].join(" ") : key;
            result.touchNode(paths[key]);
        });
        return result;
    }
    _getGrandParent() {
        return this.isRoot() || this.getParent().isRoot() ? undefined : this.getParent().getParent();
    }
    getNodeConstructor(line) {
        const map = this.getFirstWordMap();
        if (!map)
            return this.getCatchAllNodeConstructor(line);
        const firstBreak = line.indexOf(this.getZI());
        const firstWord = line.substr(0, firstBreak > -1 ? firstBreak : undefined);
        return map[firstWord] || this.getCatchAllNodeConstructor(line);
    }
    static _makeUniqueId() {
        if (this._uniqueId === undefined)
            this._uniqueId = 0;
        this._uniqueId++;
        return this._uniqueId;
    }
    static _getFileFormat(path) {
        const format = path.split(".").pop();
        return FileFormat[format] ? format : FileFormat.tree;
    }
}
ImmutableNode.iris = `sepal_length,sepal_width,petal_length,petal_width,species
6.1,3,4.9,1.8,virginica
5.6,2.7,4.2,1.3,versicolor
5.6,2.8,4.9,2,virginica
6.2,2.8,4.8,1.8,virginica
7.7,3.8,6.7,2.2,virginica
5.3,3.7,1.5,0.2,setosa
6.2,3.4,5.4,2.3,virginica
4.9,2.5,4.5,1.7,virginica
5.1,3.5,1.4,0.2,setosa
5,3.4,1.5,0.2,setosa`;
class TreeNode extends ImmutableNode {
    getMTime() {
        if (!this._mtime)
            this._updateMTime();
        return this._mtime;
    }
    _getChildrenMTime() {
        const mTimes = this.map(child => child.getTreeMTime());
        const cmTime = this._getCMTime();
        if (cmTime)
            mTimes.push(cmTime);
        const newestTime = Math.max.apply(null, mTimes);
        return this._setCMTime(newestTime || this._getNow())._getCMTime();
    }
    _getCMTime() {
        return this._cmtime;
    }
    _setCMTime(value) {
        this._cmtime = value;
        return this;
    }
    getTreeMTime() {
        const mtime = this.getMTime();
        const cmtime = this._getChildrenMTime();
        return Math.max(mtime, cmtime);
    }
    _setVirtualParentTree(tree) {
        this._virtualParentTree = tree;
        return this;
    }
    _getVirtualParentTreeNode() {
        return this._virtualParentTree;
    }
    _setVirtualAncestorNodesByInheritanceViaColumnIndices(thisIdColumnNumber, extendsIdColumnNumber) {
        const map = {};
        for (let node of this.getChildren()) {
            const nodeId = node.getWord(thisIdColumnNumber);
            if (map[nodeId])
                throw new Error(`Tried to define a node with id "${nodeId}" but one is already defined.`);
            map[nodeId] = {
                nodeId: nodeId,
                node: node,
                parentId: node.getWord(extendsIdColumnNumber)
            };
        }
        // Add parent Nodes
        Object.values(map).forEach(nodeInfo => {
            const parentId = nodeInfo.parentId;
            const parentNode = map[parentId];
            if (parentId && !parentNode)
                throw new Error(`Node "${nodeInfo.nodeId}" tried to extend "${parentId}" but "${parentId}" not found.`);
            if (parentId)
                nodeInfo.node._setVirtualParentTree(parentNode.node);
        });
    }
    _expandFromVirtualParentTree() {
        if (this._isVirtualExpanded)
            return this;
        this._isExpanding = true;
        let parentNode = this._getVirtualParentTreeNode();
        if (parentNode) {
            if (parentNode._isExpanding)
                throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`);
            parentNode._expandFromVirtualParentTree();
            const clone = this.clone();
            this._setChildren(parentNode.childrenToString());
            this.extend(clone);
        }
        this._isExpanding = false;
        this._isVirtualExpanded = true;
    }
    // todo: add more testing.
    // todo: solve issue with where extend should overwrite or append
    // todo: should take a grammar? to decide whether to overwrite or append.
    // todo: this is slow.
    extend(nodeOrStr) {
        if (!(nodeOrStr instanceof TreeNode))
            nodeOrStr = new TreeNode(nodeOrStr);
        const usedFirstWords = new Set();
        nodeOrStr.forEach(sourceNode => {
            const firstWord = sourceNode.getFirstWord();
            let targetNode;
            const isAnArrayNotMap = usedFirstWords.has(firstWord);
            if (!this.has(firstWord)) {
                usedFirstWords.add(firstWord);
                this.appendLineAndChildren(sourceNode.getLine(), sourceNode.childrenToString());
                return true;
            }
            if (isAnArrayNotMap)
                targetNode = this.appendLine(sourceNode.getLine());
            else {
                targetNode = this.touchNode(firstWord).setContent(sourceNode.getContent());
                usedFirstWords.add(firstWord);
            }
            if (sourceNode.length)
                targetNode.extend(sourceNode);
        });
        return this;
    }
    // todo: solve issue related to whether extend should overwrite or append.
    getExpanded(thisIdColumnNumber, extendsIdColumnNumber) {
        const clone = this.clone();
        clone._setVirtualAncestorNodesByInheritanceViaColumnIndices(thisIdColumnNumber, extendsIdColumnNumber);
        clone.forEach(node => {
            node._expandFromVirtualParentTree();
        });
        return clone;
    }
    macroExpand(macroDefinitionWord, macroUsageWord) {
        const clone = this.clone();
        const defs = clone.findNodes(macroDefinitionWord);
        const allUses = clone.findNodes(macroUsageWord);
        const zi = clone.getZI();
        defs.forEach(def => {
            const macroName = def.getWord(1);
            const uses = allUses.filter(node => node.hasWord(1, macroName));
            const params = def.getWordsFrom(2);
            const replaceFn = (str) => {
                const paramValues = str.split(zi).slice(2);
                let newTree = def.childrenToString();
                params.forEach((param, index) => {
                    newTree = newTree.replace(new RegExp(param, "g"), paramValues[index]);
                });
                return newTree;
            };
            uses.forEach(node => {
                node.replaceNode(replaceFn);
            });
            def.destroy();
        });
        return clone;
    }
    setChildren(children) {
        return this._setChildren(children);
    }
    _updateMTime() {
        this._mtime = this._getNow();
    }
    insertWord(index, word) {
        const wi = this.getZI();
        const words = this._getLine().split(wi);
        words.splice(index, 0, word);
        this.setLine(words.join(wi));
        return this;
    }
    deleteDuplicates() {
        const set = new Set();
        this.getTopDownArray().forEach(node => {
            const str = node.toString();
            if (set.has(str))
                node.destroy();
            else
                set.add(str);
        });
        return this;
    }
    setWord(index, word) {
        const wi = this.getZI();
        const words = this._getLine().split(wi);
        words[index] = word;
        this.setLine(words.join(wi));
        return this;
    }
    deleteChildren() {
        return this._clearChildren();
    }
    setContent(content) {
        if (content === this.getContent())
            return this;
        const newArray = [this.getFirstWord()];
        if (content !== undefined) {
            content = content.toString();
            if (content.match(this.getYI()))
                return this.setContentWithChildren(content);
            newArray.push(content);
        }
        this._updateMTime();
        return this._setLine(newArray.join(this.getZI()));
    }
    setContentWithChildren(text) {
        // todo: deprecate
        if (!text.includes(this.getYI())) {
            this._clearChildren();
            return this.setContent(text);
        }
        const lines = text.split(this.getYIRegex());
        const firstLine = lines.shift();
        this.setContent(firstLine);
        // tood: cleanup.
        const remainingString = lines.join(this.getYI());
        const children = new TreeNode(remainingString);
        if (!remainingString)
            children.appendLine("");
        this.setChildren(children);
        return this;
    }
    setFirstWord(firstWord) {
        return this.setWord(0, firstWord);
    }
    setLine(line) {
        if (line === this.getLine())
            return this;
        this._updateMTime();
        // todo: clear parent TMTimes
        this.getParent()._clearIndex();
        return this._setLine(line);
    }
    duplicate() {
        return this.getParent()._setLineAndChildren(this.getLine(), this.childrenToString(), this.getIndex() + 1);
    }
    destroy() {
        ;
        this.getParent()._deleteNode(this);
    }
    set(firstWordPath, text) {
        return this.touchNode(firstWordPath).setContentWithChildren(text);
    }
    setFromText(text) {
        if (this.toString() === text)
            return this;
        const tuple = this._textToContentAndChildrenTuple(text);
        this.setLine(tuple[0]);
        return this._setChildren(tuple[1]);
    }
    appendLine(line) {
        return this._setLineAndChildren(line);
    }
    appendLineAndChildren(line, children) {
        return this._setLineAndChildren(line, children);
    }
    getNodesByRegex(regex) {
        const matches = [];
        regex = regex instanceof RegExp ? [regex] : regex;
        this._getNodesByLineRegex(matches, regex);
        return matches;
    }
    getNodesByLinePrefixes(columns) {
        const matches = [];
        this._getNodesByLineRegex(matches, columns.map(str => new RegExp("^" + str)));
        return matches;
    }
    _getNodesByLineRegex(matches, regs) {
        const rgs = regs.slice(0);
        const reg = rgs.shift();
        const candidates = this.filter(child => child.getLine().match(reg));
        if (!rgs.length)
            return candidates.forEach(cand => matches.push(cand));
        candidates.forEach(cand => cand._getNodesByLineRegex(matches, rgs));
    }
    concat(node) {
        if (typeof node === "string")
            node = new TreeNode(node);
        return node.map(node => this._setLineAndChildren(node.getLine(), node.childrenToString()));
    }
    _deleteByIndexes(indexesToDelete) {
        this._clearIndex();
        // note: assumes indexesToDelete is in ascending order
        indexesToDelete.reverse().forEach(index => this._getChildrenArray().splice(index, 1));
        return this._setCMTime(this._getNow());
    }
    _deleteNode(node) {
        const index = this._indexOfNode(node);
        return index > -1 ? this._deleteByIndexes([index]) : 0;
    }
    reverse() {
        this._clearIndex();
        this._getChildrenArray().reverse();
        return this;
    }
    shift() {
        if (!this.length)
            return null;
        const node = this._getChildrenArray().shift();
        return node.copyTo(new this.constructor(), 0);
    }
    sort(fn) {
        this._getChildrenArray().sort(fn);
        this._clearIndex();
        return this;
    }
    invert() {
        this.forEach(node => node.getWords().reverse());
        return this;
    }
    _rename(oldFirstWord, newFirstWord) {
        const index = this.indexOf(oldFirstWord);
        if (index === -1)
            return this;
        const node = this._getChildren()[index];
        node.setFirstWord(newFirstWord);
        this._clearIndex();
        return this;
    }
    // Does not recurse.
    remap(map) {
        this.forEach(node => {
            const firstWord = node.getFirstWord();
            if (map[firstWord] !== undefined)
                node.setFirstWord(map[firstWord]);
        });
        return this;
    }
    rename(oldFirstWord, newFirstWord) {
        this._rename(oldFirstWord, newFirstWord);
        return this;
    }
    renameAll(oldName, newName) {
        this.findNodes(oldName).forEach(node => node.setFirstWord(newName));
        return this;
    }
    _deleteAllChildNodesWithFirstWord(firstWord) {
        if (!this.has(firstWord))
            return this;
        const allNodes = this._getChildren();
        const indexesToDelete = [];
        allNodes.forEach((node, index) => {
            if (node.getFirstWord() === firstWord)
                indexesToDelete.push(index);
        });
        return this._deleteByIndexes(indexesToDelete);
    }
    delete(path = "") {
        const xi = this.getXI();
        if (!path.includes(xi))
            return this._deleteAllChildNodesWithFirstWord(path);
        const parts = path.split(xi);
        const nextFirstWord = parts.pop();
        const targetNode = this.getNode(parts.join(xi));
        return targetNode ? targetNode._deleteAllChildNodesWithFirstWord(nextFirstWord) : 0;
    }
    deleteColumn(firstWord = "") {
        this.forEach(node => node.delete(firstWord));
        return this;
    }
    _getNonMaps() {
        const results = this.getTopDownArray().filter(node => node.hasDuplicateFirstWords());
        if (this.hasDuplicateFirstWords())
            results.unshift(this);
        return results;
    }
    replaceNode(fn) {
        const parent = this.getParent();
        const index = this.getIndex();
        const newNodes = new TreeNode(fn(this.toString()));
        const returnedNodes = [];
        newNodes.forEach((child, childIndex) => {
            const newNode = parent.insertLineAndChildren(child.getLine(), child.childrenToString(), index + childIndex);
            returnedNodes.push(newNode);
        });
        this.destroy();
        return returnedNodes;
    }
    insertLineAndChildren(line, children, index) {
        return this._setLineAndChildren(line, children, index);
    }
    insertLine(line, index) {
        return this._setLineAndChildren(line, undefined, index);
    }
    prependLine(line) {
        return this.insertLine(line, 0);
    }
    pushContentAndChildren(content, children) {
        let index = this.length;
        while (this.has(index.toString())) {
            index++;
        }
        const line = index.toString() + (content === undefined ? "" : this.getZI() + content);
        return this.appendLineAndChildren(line, children);
    }
    deleteBlanks() {
        this.getChildren()
            .filter(node => node.isBlankLine())
            .forEach(node => node.destroy());
        return this;
    }
    firstWordSort(firstWordOrder) {
        return this._firstWordSort(firstWordOrder);
    }
    _firstWordSort(firstWordOrder, secondarySortFn) {
        const map = {};
        firstWordOrder.forEach((word, index) => {
            map[word] = index;
        });
        this.sort((nodeA, nodeB) => {
            const valA = map[nodeA.getFirstWord()];
            const valB = map[nodeB.getFirstWord()];
            if (valA > valB)
                return 1;
            if (valA < valB)
                return -1; // A comes first
            return secondarySortFn ? secondarySortFn(nodeA, nodeB) : 0;
        });
        return this;
    }
    _touchNode(firstWordPathArray) {
        let contextNode = this;
        firstWordPathArray.forEach(firstWord => {
            contextNode = contextNode.getNode(firstWord) || contextNode.appendLine(firstWord);
        });
        return contextNode;
    }
    _touchNodeByString(str) {
        str = str.replace(this.getYIRegex(), ""); // todo: do we want to do this sanitization?
        return this._touchNode(str.split(this.getZI()));
    }
    touchNode(str) {
        return this._touchNodeByString(str);
    }
    hasLine(line) {
        return this.getChildren().some(node => node.getLine() === line);
    }
    getNodesByLine(line) {
        return this.filter(node => node.getLine() === line);
    }
    toggleLine(line) {
        const lines = this.getNodesByLine(line);
        if (lines.length) {
            lines.map(line => line.destroy());
            return this;
        }
        return this.appendLine(line);
    }
    // todo: remove?
    sortByColumns(indexOrIndices) {
        const indices = indexOrIndices instanceof Array ? indexOrIndices : [indexOrIndices];
        const length = indices.length;
        this.sort((nodeA, nodeB) => {
            const wordsA = nodeA.getWords();
            const wordsB = nodeB.getWords();
            for (let index = 0; index < length; index++) {
                const col = indices[index];
                const av = wordsA[col];
                const bv = wordsB[col];
                if (av === undefined)
                    return -1;
                if (bv === undefined)
                    return 1;
                if (av > bv)
                    return 1;
                else if (av < bv)
                    return -1;
            }
            return 0;
        });
        return this;
    }
    shiftLeft() {
        const grandParent = this._getGrandParent();
        if (!grandParent)
            return this;
        const parentIndex = this.getParent().getIndex();
        const newNode = grandParent.insertLineAndChildren(this.getLine(), this.length ? this.childrenToString() : undefined, parentIndex + 1);
        this.destroy();
        return newNode;
    }
    shiftRight() {
        const olderSibling = this._getClosestOlderSibling();
        if (!olderSibling)
            return this;
        const newNode = olderSibling.appendLineAndChildren(this.getLine(), this.length ? this.childrenToString() : undefined);
        this.destroy();
        return newNode;
    }
    shiftYoungerSibsRight() {
        const nodes = this.getYoungerSiblings();
        nodes.forEach(node => node.shiftRight());
        return this;
    }
    sortBy(nameOrNames) {
        const names = nameOrNames instanceof Array ? nameOrNames : [nameOrNames];
        const length = names.length;
        this.sort((nodeA, nodeB) => {
            if (!nodeB.length && !nodeA.length)
                return 0;
            else if (!nodeA.length)
                return -1;
            else if (!nodeB.length)
                return 1;
            for (let index = 0; index < length; index++) {
                const firstWord = names[index];
                const av = nodeA.get(firstWord);
                const bv = nodeB.get(firstWord);
                if (av > bv)
                    return 1;
                else if (av < bv)
                    return -1;
            }
            return 0;
        });
        return this;
    }
    static fromCsv(str) {
        return this.fromDelimited(str, ",", '"');
    }
    static fromJson(str) {
        return new TreeNode(JSON.parse(str));
    }
    static fromSsv(str) {
        return this.fromDelimited(str, " ", '"');
    }
    static fromTsv(str) {
        return this.fromDelimited(str, "\t", '"');
    }
    static fromDelimited(str, delimiter, quoteChar) {
        const rows = this._getEscapedRows(str, delimiter, quoteChar);
        return this._rowsToTreeNode(rows, delimiter, true);
    }
    static _getEscapedRows(str, delimiter, quoteChar) {
        return str.includes(quoteChar)
            ? this._strToRows(str, delimiter, quoteChar)
            : str.split("\n").map(line => line.split(delimiter));
    }
    static fromDelimitedNoHeaders(str, delimiter, quoteChar) {
        const rows = this._getEscapedRows(str, delimiter, quoteChar);
        return this._rowsToTreeNode(rows, delimiter, false);
    }
    static _strToRows(str, delimiter, quoteChar, newLineChar = "\n") {
        const rows = [[]];
        const newLine = "\n";
        const length = str.length;
        let currentCell = "";
        let inQuote = str.substr(0, 1) === quoteChar;
        let currentPosition = inQuote ? 1 : 0;
        let nextChar;
        let isLastChar;
        let currentRow = 0;
        let char;
        let isNextCharAQuote;
        while (currentPosition < length) {
            char = str[currentPosition];
            isLastChar = currentPosition + 1 === length;
            nextChar = str[currentPosition + 1];
            isNextCharAQuote = nextChar === quoteChar;
            if (inQuote) {
                if (char !== quoteChar)
                    currentCell += char;
                else if (isNextCharAQuote) {
                    // Both the current and next char are ", so the " is escaped
                    currentCell += nextChar;
                    currentPosition++; // Jump 2
                }
                else {
                    // If the current char is a " and the next char is not, it's the end of the quotes
                    inQuote = false;
                    if (isLastChar)
                        rows[currentRow].push(currentCell);
                }
            }
            else {
                if (char === delimiter) {
                    rows[currentRow].push(currentCell);
                    currentCell = "";
                    if (isNextCharAQuote) {
                        inQuote = true;
                        currentPosition++; // Jump 2
                    }
                }
                else if (char === newLine) {
                    rows[currentRow].push(currentCell);
                    currentCell = "";
                    currentRow++;
                    if (nextChar)
                        rows[currentRow] = [];
                    if (isNextCharAQuote) {
                        inQuote = true;
                        currentPosition++; // Jump 2
                    }
                }
                else if (isLastChar)
                    rows[currentRow].push(currentCell + char);
                else
                    currentCell += char;
            }
            currentPosition++;
        }
        return rows;
    }
    static multiply(nodeA, nodeB) {
        const productNode = nodeA.clone();
        productNode.forEach((node, index) => {
            node.setChildren(node.length ? this.multiply(node, nodeB) : nodeB.clone());
        });
        return productNode;
    }
    // Given an array return a tree
    static _rowsToTreeNode(rows, delimiter, hasHeaders) {
        const numberOfColumns = rows[0].length;
        const treeNode = new TreeNode();
        const names = this._getHeader(rows, hasHeaders);
        const rowCount = rows.length;
        for (let rowIndex = hasHeaders ? 1 : 0; rowIndex < rowCount; rowIndex++) {
            let row = rows[rowIndex];
            // If the row contains too many columns, shift the extra columns onto the last one.
            // This allows you to not have to escape delimiter characters in the final column.
            if (row.length > numberOfColumns) {
                row[numberOfColumns - 1] = row.slice(numberOfColumns - 1).join(delimiter);
                row = row.slice(0, numberOfColumns);
            }
            else if (row.length < numberOfColumns) {
                // If the row is missing columns add empty columns until it is full.
                // This allows you to make including delimiters for empty ending columns in each row optional.
                while (row.length < numberOfColumns) {
                    row.push("");
                }
            }
            const obj = {};
            row.forEach((cellValue, index) => {
                obj[names[index]] = cellValue;
            });
            treeNode.pushContentAndChildren(undefined, obj);
        }
        return treeNode;
    }
    static _initializeXmlParser() {
        if (this._xmlParser)
            return;
        const windowObj = window;
        if (typeof windowObj.DOMParser !== "undefined")
            this._xmlParser = (xmlStr) => new windowObj.DOMParser().parseFromString(xmlStr, "text/xml");
        else if (typeof windowObj.ActiveXObject !== "undefined" && new windowObj.ActiveXObject("Microsoft.XMLDOM")) {
            this._xmlParser = (xmlStr) => {
                const xmlDoc = new windowObj.ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xmlStr);
                return xmlDoc;
            };
        }
        else
            throw new Error("No XML parser found");
    }
    static fromXml(str) {
        this._initializeXmlParser();
        const xml = this._xmlParser(str);
        try {
            return this._treeNodeFromXml(xml).getNode("children");
        }
        catch (err) {
            return this._treeNodeFromXml(this._parseXml2(str)).getNode("children");
        }
    }
    static _zipObject(keys, values) {
        const obj = {};
        keys.forEach((key, index) => (obj[key] = values[index]));
        return obj;
    }
    static fromShape(shapeArr, rootNode = new TreeNode()) {
        const part = shapeArr.shift();
        if (part !== undefined) {
            for (let index = 0; index < part; index++) {
                rootNode.appendLine(index.toString());
            }
        }
        if (shapeArr.length)
            rootNode.forEach(node => TreeNode.fromShape(shapeArr.slice(0), node));
        return rootNode;
    }
    static fromDataTable(table) {
        const header = table.shift();
        return new TreeNode(table.map(row => this._zipObject(header, row)));
    }
    static _parseXml2(str) {
        const el = document.createElement("div");
        el.innerHTML = str;
        return el;
    }
    // todo: cleanup typings
    static _treeNodeFromXml(xml) {
        const result = new TreeNode();
        const children = new TreeNode();
        // Set attributes
        if (xml.attributes) {
            for (let index = 0; index < xml.attributes.length; index++) {
                result.set(xml.attributes[index].name, xml.attributes[index].value);
            }
        }
        if (xml.data)
            children.pushContentAndChildren(xml.data);
        // Set content
        if (xml.childNodes && xml.childNodes.length > 0) {
            for (let index = 0; index < xml.childNodes.length; index++) {
                const child = xml.childNodes[index];
                if (child.tagName && child.tagName.match(/parsererror/i))
                    throw new Error("Parse Error");
                if (child.childNodes.length > 0 && child.tagName)
                    children.appendLineAndChildren(child.tagName, this._treeNodeFromXml(child));
                else if (child.tagName)
                    children.appendLine(child.tagName);
                else if (child.data) {
                    const data = child.data.trim();
                    if (data)
                        children.pushContentAndChildren(data);
                }
            }
        }
        if (children.length > 0)
            result.touchNode("children").setChildren(children);
        return result;
    }
    static _getHeader(rows, hasHeaders) {
        const numberOfColumns = rows[0].length;
        const headerRow = hasHeaders ? rows[0] : [];
        const ZI = " ";
        const ziRegex = new RegExp(ZI, "g");
        if (hasHeaders) {
            // Strip any ZIs from column names in the header row.
            // This makes the mapping not quite 1 to 1 if there are any ZIs in names.
            for (let index = 0; index < numberOfColumns; index++) {
                headerRow[index] = headerRow[index].replace(ziRegex, "");
            }
        }
        else {
            // If str has no headers, create them as 0,1,2,3
            for (let index = 0; index < numberOfColumns; index++) {
                headerRow.push(index.toString());
            }
        }
        return headerRow;
    }
    static nest(str, xValue) {
        const YI = "\n";
        const XI = " ";
        const indent = YI + XI.repeat(xValue);
        return str ? indent + str.replace(/\n/g, indent) : "";
    }
    static fromDisk(path) {
        const format = this._getFileFormat(path);
        const content = require("fs").readFileSync(path, "utf8");
        const methods = {
            tree: (content) => new TreeNode(content),
            csv: (content) => this.fromCsv(content),
            tsv: (content) => this.fromTsv(content)
        };
        return methods[format](content);
    }
}
class AbstractRuntimeNode extends TreeNode {
    // note: this is overwritten by the root node of a runtime grammar program.
    // some of the magic that makes this all work. but maybe there's a better way.
    getGrammarProgram() {
        return this.getProgram().getGrammarProgram();
    }
    getCatchAllNodeConstructor(line) {
        return this.getDefinition().getRunTimeCatchAllNodeConstructor();
    }
    getProgram() {
        return this;
    }
    getAutocompleteResults(partialWord, cellIndex) {
        return cellIndex === 0
            ? this._getAutocompleteResultsForFirstWord(partialWord)
            : this._getAutocompleteResultsForCell(partialWord, cellIndex);
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
        const def = this.getDefinition();
        let defs = Object.values(def.getRunTimeFirstWordMapWithDefinitions());
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
    _getNodeTypeDefinitionByName(path) {
        // todo: do we need a relative to with this firstWord path?
        return this.getProgram()
            .getGrammarProgram()
            .getNodeTypeDefinitionByFirstWordPath(path);
    }
    _getRequiredNodeErrors(errors = []) {
        const nodeDef = this.getDefinition();
        const firstWords = nodeDef.getRunTimeFirstWordMapWithDefinitions();
        Object.keys(firstWords).forEach(firstWord => {
            const def = firstWords[firstWord];
            if (def.isRequired() && !this.has(firstWord)) {
                errors.push({
                    kind: GrammarConstantsErrors.missingRequiredNodeTypeError,
                    subkind: firstWord,
                    level: 0,
                    context: "",
                    message: `${GrammarConstantsErrors.missingRequiredNodeTypeError} Required nodeType missing: "${firstWord}" in node '${this.getLine()}' at line '${this.getPoint().y}'`
                });
            }
        });
        return errors;
    }
}
class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram() {
        return this.getParent().getProgram();
    }
    getGrammarProgram() {
        return this.getDefinition().getProgram();
    }
    getDefinition() {
        // todo: do we need a relative to with this firstWord path?
        return this._getNodeTypeDefinitionByName(this.getFirstWordPath());
    }
    getCompilerNode(targetLanguage) {
        return this.getDefinition().getDefinitionCompilerNode(targetLanguage, this);
    }
    getParsedWords() {
        return this._getGrammarBackedCellArray().map(word => word.getParsed());
    }
    getCompiledIndentation(targetLanguage) {
        const compiler = this.getCompilerNode(targetLanguage);
        const indentCharacter = compiler.getIndentCharacter();
        const indent = this.getIndentation();
        return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent;
    }
    getCompiledLine(targetLanguage) {
        const compiler = this.getCompilerNode(targetLanguage);
        const listDelimiter = compiler.getListDelimiter();
        const str = compiler.getTransformation();
        return str ? TreeUtils.formatStr(str, listDelimiter, this.cells) : this.getLine();
    }
    compile(targetLanguage) {
        return this.getCompiledIndentation(targetLanguage) + this.getCompiledLine(targetLanguage);
    }
    getErrors() {
        // Not enough parameters
        // Too many parameters
        // Incorrect parameter
        const errors = this._getGrammarBackedCellArray()
            .map(check => check.getErrorIfAny())
            .filter(i => i);
        // More than one
        const definition = this.getDefinition();
        let times;
        const firstWord = this.getFirstWord();
        if (definition.isSingle() && (times = this.getParent().findNodes(firstWord).length) > 1)
            errors.push({
                kind: GrammarConstantsErrors.nodeTypeUsedMultipleTimesError,
                subkind: firstWord,
                level: 0,
                context: this.getParent().getLine(),
                message: `${GrammarConstantsErrors.nodeTypeUsedMultipleTimesError} nodeType "${firstWord}" used '${times}' times. '${this.getLine()}' at line '${this.getPoint().y}'`
            });
        return this._getRequiredNodeErrors(errors);
    }
    get cells() {
        const cells = {};
        this._getGrammarBackedCellArray()
            .slice(1)
            .forEach(cell => {
            if (!cell.isCatchAll())
                cells[cell.getCellTypeName()] = cell.getParsed();
            else {
                if (!cells[cell.getCellTypeName()])
                    cells[cell.getCellTypeName()] = [];
                cells[cell.getCellTypeName()].push(cell.getParsed());
            }
        });
        return cells;
    }
    _getGrammarBackedCellArray() {
        const definition = this.getDefinition();
        const grammarProgram = definition.getProgram();
        const requiredCellTypesNames = definition.getRequiredCellTypeNames();
        const firstCellTypeName = definition.getFirstCellType();
        const numberOfRequiredCells = requiredCellTypesNames.length + 1; // todo: assuming here first cell is required.
        const catchAllCellTypeName = definition.getCatchAllCellTypeName();
        const actualWordCountOrRequiredCellCount = Math.max(this.getWords().length, numberOfRequiredCells);
        const cells = [];
        // A for loop instead of map because "numberOfCellsToFill" can be longer than words.length
        for (let cellIndex = 0; cellIndex < actualWordCountOrRequiredCellCount; cellIndex++) {
            const isCatchAll = cellIndex >= numberOfRequiredCells;
            let cellTypeName;
            if (cellIndex === 0)
                cellTypeName = firstCellTypeName;
            else if (isCatchAll)
                cellTypeName = catchAllCellTypeName;
            else
                cellTypeName = requiredCellTypesNames[cellIndex - 1];
            const cellTypeDefinition = grammarProgram.getCellTypeDefinition(cellTypeName);
            let cellConstructor;
            if (cellTypeDefinition)
                cellConstructor = cellTypeDefinition.getCellConstructor();
            else if (cellTypeName)
                cellConstructor = GrammarUnknownCellTypeCell;
            else
                cellConstructor = GrammarExtraWordCellTypeCell;
            cells[cellIndex] = new cellConstructor(this, cellIndex, cellTypeDefinition, cellTypeName, isCatchAll);
        }
        return cells;
    }
    // todo: just make a fn that computes proper spacing and then is given a node to print
    getLineCellTypes() {
        return this._getGrammarBackedCellArray()
            .map(slot => slot.getCellTypeName())
            .join(" ");
    }
    getLineHighlightScopes(defaultScope = "source") {
        return this._getGrammarBackedCellArray()
            .map(slot => slot.getHighlightScope() || defaultScope)
            .join(" ");
    }
}
class AbstractRuntimeProgram extends AbstractRuntimeNode {
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
            .filter(err => err.kind === GrammarConstantsErrors.invalidNodeTypeError)
            .filter(err => (level ? level === err.level : true))
            .map(err => err.subkind)));
    }
    updateNodeTypeIds(nodeTypeMap) {
        if (typeof nodeTypeMap === "string")
            nodeTypeMap = new TreeNode(nodeTypeMap);
        if (nodeTypeMap instanceof TreeNode)
            nodeTypeMap = nodeTypeMap.toObject();
        const renames = [];
        for (let node of this.getTopDownArrayIterator()) {
            const nodeTypeId = node.getDefinition().getNodeTypeIdFromDefinition();
            const newId = nodeTypeMap[nodeTypeId];
            if (newId)
                renames.push([node, newId]);
        }
        renames.forEach(pair => pair[0].setFirstWord(pair[1]));
        return this;
    }
    getAllSuggestions() {
        return new TreeNode(this.getAllWordBoundaryCoordinates().map(coordinate => {
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
        clone._firstWordSort(nodeTypeOrder.split(" "), isCondensed ? TreeUtils.makeGraphSortFunction(1, 2) : undefined);
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
        const usage = new TreeNode();
        const grammarProgram = this.getGrammarProgram();
        const nodeTypeDefinitions = grammarProgram.getNodeTypeDefinitions();
        nodeTypeDefinitions.forEach(child => {
            usage.appendLine([child.getNodeTypeIdFromDefinition(), "line-id", GrammarConstants.nodeType, child.getRequiredCellTypeNames().join(" ")].join(" "));
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
        this._cache_typeTree = new TreeNode(this.getInPlaceCellTypeTree());
        this._cache_highlightScopeTree = new TreeNode(this.getInPlaceHighlightScopeTree());
        this._cache_programCellTypeStringMTime = treeMTime;
    }
    getCompiledProgramName(programPath) {
        const grammarProgram = this.getDefinition();
        return programPath.replace(`.${grammarProgram.getExtensionName()}`, `.${grammarProgram.getTargetExtension()}`);
    }
}
/*
A cell contains a word but also the type information for that word.
*/
class AbstractGrammarBackedCell {
    constructor(node, index, typeDef, cellTypeName, isCatchAll) {
        this._typeDef = typeDef;
        this._node = node;
        this._isCatchAll = isCatchAll;
        this._index = index;
        this._cellTypeName = cellTypeName;
        this._word = node.getWord(index);
        this._grammarProgram = node.getDefinition().getProgram();
    }
    getCellTypeName() {
        return this._cellTypeName;
    }
    _getProgram() {
        return this._node.getProgram();
    }
    isCatchAll() {
        return this._isCatchAll;
    }
    getHighlightScope() {
        const definition = this._getCellTypeDefinition();
        if (definition)
            return definition.getHighlightScope();
    }
    getAutoCompleteWords(partialWord) {
        const definition = this._getCellTypeDefinition();
        let words = definition ? definition.getAutocompleteWordOptions(this._getProgram()) : [];
        const runTimeOptions = this._node.getRunTimeEnumOptions(this);
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
        return this._node.getPoint().y;
    }
    _getFullLine() {
        return this._node.getLine();
    }
    _getErrorContext() {
        return this._getFullLine().split(" ")[0]; // todo: XI
    }
    _getExpectedLineCellTypes() {
        return this._node.getDefinition().getExpectedLineCellTypes();
    }
    isValid() {
        const runTimeOptions = this._node.getRunTimeEnumOptions(this);
        if (runTimeOptions)
            return runTimeOptions.includes(this._word);
        return this._getCellTypeDefinition().isValid(this._word, this._getProgram()) && this._isValid();
    }
    getErrorIfAny() {
        if (this._word !== undefined && this.isValid())
            return undefined;
        if (this._word === undefined)
            return {
                kind: GrammarConstantsErrors.unfilledColumnError,
                subkind: this.getCellTypeName(),
                level: this._index,
                context: this._getErrorContext(),
                message: `${GrammarConstantsErrors.unfilledColumnError} "${this.getCellTypeName()}" cellType in "${this._getFullLine()}" at line ${this._getLineNumber()} word ${this._index}. Expected line cell types: "${this._getExpectedLineCellTypes()}". definition: ${this._node
                    .getDefinition()
                    .toString()}`
            };
        return {
            kind: GrammarConstantsErrors.invalidWordError,
            subkind: this.getCellTypeName(),
            level: this._index,
            context: this._getErrorContext(),
            message: `${GrammarConstantsErrors.invalidWordError} in "${this._getFullLine()}" at line ${this._getLineNumber()} column ${this._index}. "${this._word}" does not fit in "${this.getCellTypeName()}" cellType. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
        };
    }
}
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
        return !isNaN(parseFloat(this._word));
    }
    getRegexString() {
        return "\-?[0-9]*\.?[0-9]*";
    }
    getParsed() {
        return parseFloat(this._word);
    }
}
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
        return {
            kind: GrammarConstantsErrors.extraWordError,
            subkind: "",
            level: this._index,
            context: this._getErrorContext(),
            message: `${GrammarConstantsErrors.extraWordError} "${this._word}" in "${this._getFullLine()}" at line ${this._getLineNumber()} word ${this._index}. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
        };
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
        return {
            kind: GrammarConstantsErrors.grammarDefinitionError,
            subkind: this.getCellTypeName(),
            level: this._index,
            context: this._getErrorContext(),
            message: `${GrammarConstantsErrors.grammarDefinitionError} For word "${this._word}" no cellType "${this.getCellTypeName()}" in grammar "${this._grammarProgram.getExtensionName()}" found in "${this._getFullLine()}" on line ${this._getLineNumber()} word ${this._index}. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
        };
    }
}
class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
    getLineCellTypes() {
        return "error ".repeat(this.getWords().length).trim();
    }
    getErrors() {
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getFirstWord();
        const locationMsg = context ? `in "${context}" ` : "";
        const point = this.getPoint();
        const firstWord = this.getFirstWord();
        return [
            {
                kind: GrammarConstantsErrors.invalidNodeTypeError,
                subkind: firstWord,
                context: context,
                level: point.x,
                message: `${GrammarConstantsErrors.invalidNodeTypeError} "${firstWord}" ${locationMsg}at line ${point.y} column ${point.x}`
            }
        ];
    }
}
class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    getFirstWordMap() {
        return this.getDefinition().getRunTimeFirstWordMap();
    }
    // todo: implement
    _getNodeJoinCharacter() {
        return "\n";
    }
    compile(targetExtension) {
        const compiler = this.getCompilerNode(targetExtension);
        const openChildrenString = compiler.getOpenChildrenString();
        const closeChildrenString = compiler.getCloseChildrenString();
        const compiledLine = this.getCompiledLine(targetExtension);
        const indent = this.getCompiledIndentation(targetExtension);
        const compiledChildren = this.map(child => child.compile(targetExtension)).join(this._getNodeJoinCharacter());
        return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`;
    }
}
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
class GrammarBackedTerminalNode extends AbstractRuntimeNonRootNode {
}
// todo: add standard types, enum types, from disk types
class AbstractGrammarWordTestNode extends TreeNode {
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
    _getEnumFromGrammar(runTimeGrammarBackedProgram) {
        const nodeType = this.getWord(1);
        // note: hack where we store it on the program. otherwise has global effects.
        if (!runTimeGrammarBackedProgram._enumMaps)
            runTimeGrammarBackedProgram._enumMaps = {};
        if (runTimeGrammarBackedProgram._enumMaps[nodeType])
            return runTimeGrammarBackedProgram._enumMaps[nodeType];
        const wordIndex = 1;
        const map = {};
        runTimeGrammarBackedProgram.findNodes(nodeType).forEach(node => {
            map[node.getWord(wordIndex)] = true;
        });
        runTimeGrammarBackedProgram._enumMaps[nodeType] = map;
        return map;
    }
    // todo: remove
    isValid(str, runTimeGrammarBackedProgram) {
        return this._getEnumFromGrammar(runTimeGrammarBackedProgram)[str] === true;
    }
}
class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
    isValid(str) {
        // enum c c++ java
        return !!this.getOptions()[str];
    }
    getOptions() {
        if (!this._map)
            this._map = TreeUtils.arrayToMap(this.getWordsFrom(1));
        return this._map;
    }
}
class GrammarCellTypeDefinitionNode extends TreeNode {
    getFirstWordMap() {
        const types = {};
        types[GrammarConstants.regex] = GrammarRegexTestNode;
        types[GrammarConstants.enumFromGrammar] = EnumFromGrammarTestNode;
        types[GrammarConstants.enum] = GrammarEnumTestNode;
        types[GrammarConstants.highlightScope] = TreeNode;
        return types;
    }
    // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
    getCellConstructor() {
        const kinds = {};
        kinds[GrammarStandardCellTypes.any] = GrammarAnyCell;
        kinds[GrammarStandardCellTypes.anyFirstWord] = GrammarAnyCell;
        kinds[GrammarStandardCellTypes.float] = GrammarFloatCell;
        kinds[GrammarStandardCellTypes.number] = GrammarFloatCell;
        kinds[GrammarStandardCellTypes.bit] = GrammarBitCell;
        kinds[GrammarStandardCellTypes.bool] = GrammarBoolCell;
        kinds[GrammarStandardCellTypes.int] = GrammarIntCell;
        return kinds[this.getWord(1)] || kinds[this.getWord(2)] || GrammarAnyCell;
    }
    getHighlightScope() {
        return this.get(GrammarConstants.highlightScope);
    }
    _getEnumOptions() {
        const enumNode = this.getChildrenByNodeConstructor(GrammarEnumTestNode)[0];
        if (!enumNode)
            return undefined;
        // we sort by longest first to capture longest match first. todo: add test
        const options = Object.keys(enumNode.getOptions());
        options.sort((a, b) => b.length - a.length);
        return options;
    }
    _getEnumFromGrammarOptions(runTimeProgram) {
        const node = this.getNode(GrammarConstants.enumFromGrammar);
        return node ? Object.keys(node._getEnumFromGrammar(runTimeProgram)) : undefined;
    }
    getAutocompleteWordOptions(runTimeProgram) {
        return this._getEnumOptions() || this._getEnumFromGrammarOptions(runTimeProgram) || [];
    }
    getRegexString() {
        // todo: enum
        const enumOptions = this._getEnumOptions();
        return this.get(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*");
    }
    isValid(str, runTimeGrammarBackedProgram) {
        return this.getChildrenByNodeConstructor(AbstractGrammarWordTestNode).every(node => node.isValid(str, runTimeGrammarBackedProgram));
    }
    getCellTypeId() {
        return this.getWord(1);
    }
}
class GrammarCompilerNode extends TreeNode {
    getFirstWordMap() {
        const types = [
            GrammarConstantsCompiler.sub,
            GrammarConstantsCompiler.indentCharacter,
            GrammarConstantsCompiler.listDelimiter,
            GrammarConstantsCompiler.openChildren,
            GrammarConstantsCompiler.closeChildren
        ];
        const map = {};
        types.forEach(type => {
            map[type] = TreeNode;
        });
        return map;
    }
    getTargetExtension() {
        return this.getWord(1);
    }
    getListDelimiter() {
        return this.get(GrammarConstantsCompiler.listDelimiter);
    }
    getTransformation() {
        return this.get(GrammarConstantsCompiler.sub);
    }
    getIndentCharacter() {
        return this.get(GrammarConstantsCompiler.indentCharacter);
    }
    getOpenChildrenString() {
        return this.get(GrammarConstantsCompiler.openChildren) || "";
    }
    getCloseChildrenString() {
        return this.get(GrammarConstantsCompiler.closeChildren) || "";
    }
}
class GrammarConstNode extends TreeNode {
    getValue() {
        // todo: parse type
        if (this.length)
            return this.childrenToString();
        return this.getWordsFrom(2).join(" ");
    }
    getName() {
        return this.getFirstWord();
    }
}
class GrammarConstantsNode extends TreeNode {
    getCatchAllNodeConstructor(line) {
        return GrammarConstNode;
    }
    getConstantsObj() {
        const result = {};
        this.forEach(node => (result[node.getName()] = node.getValue()));
        return result;
    }
}
class AbstractCustomConstructorNode extends TreeNode {
    getTheDefinedConstructor() {
        // todo: allow overriding if custom constructor not found.
        return this.getBuiltIn() || this._getCustomConstructor();
    }
    isAppropriateEnvironment() {
        return true;
    }
    _getCustomConstructor() {
        return undefined;
    }
    getErrors() {
        // todo: should this be a try/catch?
        if (!this.isAppropriateEnvironment() || this.getTheDefinedConstructor())
            return [];
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getFirstWord();
        const point = this.getPoint();
        return [
            {
                kind: GrammarConstantsErrors.invalidConstructorPathError,
                subkind: this.getFirstWord(),
                level: point.x,
                context: context,
                message: `${GrammarConstantsErrors.invalidConstructorPathError} no constructor "${this.getLine()}" found at line ${point.y}`
            }
        ];
    }
    getBuiltIn() {
        const constructors = {
            ErrorNode: GrammarBackedErrorNode,
            TerminalNode: GrammarBackedTerminalNode,
            NonTerminalNode: GrammarBackedNonTerminalNode,
            BlobNode: GrammarBackedBlobNode
        };
        return constructors[this.getWord(1)];
    }
}
class CustomNodeJsConstructorNode extends AbstractCustomConstructorNode {
    _getCustomConstructor() {
        const filepath = this._getNodeConstructorFilePath();
        const rootPath = this.getRootNode().getTheGrammarFilePath();
        const basePath = TreeUtils.getPathWithoutFileName(rootPath) + "/";
        const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath;
        const theModule = require(fullPath);
        const subModuleName = this.getWord(2);
        return subModuleName ? TreeUtils.resolveProperty(theModule, subModuleName) : theModule;
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
        const constructorName = this.getWord(1);
        const constructor = TreeUtils.resolveProperty(window, constructorName);
        if (!constructor)
            throw new Error(`constructor window.${constructorName} not found.`);
        return constructor;
    }
    isAppropriateEnvironment() {
        return !this.isNodeJs();
    }
}
class CustomJavascriptConstructorNode extends AbstractCustomConstructorNode {
    _getNodeJsConstructor() {
        const jtreePath = __dirname + "/../jtree.node.js";
        const code = `const jtree = require('${jtreePath}').default
/* INDENT FOR BUILD REASONS */  module.exports = ${this.childrenToString()}`;
        if (CustomJavascriptConstructorNode.cache[code])
            return CustomJavascriptConstructorNode.cache[code];
        const constructorName = this.getParent()
            .getParent()
            .getWord(1) ||
            this.getParent()
                .getParent()
                .get(GrammarConstants.name) + "Root";
        const tempFilePath = `${__dirname}/constructor-${constructorName}-${TreeUtils.getRandomString(30)}-temp.js`;
        const fs = require("fs");
        try {
            fs.writeFileSync(tempFilePath, code, "utf8");
            CustomJavascriptConstructorNode.cache[code] = require(tempFilePath);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            fs.unlinkSync(tempFilePath);
        }
        return CustomJavascriptConstructorNode.cache[code];
    }
    _getBrowserConstructor() {
        const definedCode = this.childrenToString();
        const tempClassName = "tempConstructor" + TreeUtils.getRandomString(30);
        if (CustomJavascriptConstructorNode.cache[definedCode])
            return CustomJavascriptConstructorNode.cache[definedCode];
        const script = document.createElement("script");
        script.innerHTML = `window.${tempClassName} = ${this.childrenToString()}`;
        document.head.appendChild(script);
        CustomJavascriptConstructorNode.cache[definedCode] = window[tempClassName];
    }
    _getCustomConstructor() {
        return this.isNodeJs() ? this._getNodeJsConstructor() : this._getBrowserConstructor();
    }
    getCatchAllNodeConstructor() {
        return TreeNode;
    }
}
CustomJavascriptConstructorNode.cache = {};
class GrammarCustomConstructorsNode extends TreeNode {
    getFirstWordMap() {
        const map = {};
        map[GrammarConstants.constructorNodeJs] = CustomNodeJsConstructorNode;
        map[GrammarConstants.constructorBrowser] = CustomBrowserConstructorNode;
        map[GrammarConstants.constructorJavascript] = CustomJavascriptConstructorNode;
        return map;
    }
    getConstructorForEnvironment() {
        const jsConstructor = this.getNode(GrammarConstants.constructorJavascript);
        if (jsConstructor)
            return jsConstructor;
        return (this.getNode(this.isNodeJs() ? GrammarConstants.constructorNodeJs : GrammarConstants.constructorBrowser));
    }
}
class GrammarDefinitionErrorNode extends TreeNode {
    getErrors() {
        const parent = this.getParent();
        const context = parent.isRoot() ? "" : parent.getFirstWord();
        const point = this.getPoint();
        return [
            {
                kind: GrammarConstantsErrors.invalidNodeTypeError,
                subkind: this.getFirstWord(),
                level: point.x,
                context: context,
                message: `${GrammarConstantsErrors.invalidNodeTypeError} "${this.getFirstWord()}" at line ${point.y}`
            }
        ];
    }
    getLineCellTypes() {
        return [GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => "any")).join(" ");
    }
}
class GrammarExampleNode extends TreeNode {
}
class AbstractGrammarDefinitionNode extends TreeNode {
    getFirstWordMap() {
        const types = [
            GrammarConstants.frequency,
            GrammarConstants.nodeTypes,
            GrammarConstants.cells,
            GrammarConstants.description,
            GrammarConstants.catchAllNodeType,
            GrammarConstants.catchAllCellType,
            GrammarConstants.firstCellType,
            GrammarConstants.defaults,
            GrammarConstants.tags,
            GrammarConstants.blob,
            GrammarConstants.group,
            GrammarConstants.required,
            GrammarConstants.single
        ];
        const map = {};
        types.forEach(type => {
            map[type] = TreeNode;
        });
        map[GrammarConstants.constants] = GrammarConstantsNode;
        map[GrammarConstants.compilerNodeType] = GrammarCompilerNode;
        map[GrammarConstants.constructors] = GrammarCustomConstructorsNode;
        map[GrammarConstants.example] = GrammarExampleNode;
        return map;
    }
    getNodeTypeIdFromDefinition() {
        return this.getWord(1);
    }
    _isNonTerminal() {
        return this._isBlobNode() || this.has(GrammarConstants.nodeTypes) || this.has(GrammarConstants.catchAllNodeType);
    }
    _isAbstract() {
        return false;
    }
    _isBlobNode() {
        return this.has(GrammarConstants.blob);
    }
    getConstructorDefinedInGrammar() {
        if (!this._cache_definedNodeConstructor)
            this._cache_definedNodeConstructor = this._getDefinedNodeConstructor();
        return this._cache_definedNodeConstructor;
    }
    _getDefaultNodeConstructor() {
        if (this._isBlobNode())
            return GrammarBackedBlobNode;
        return this._isNonTerminal() ? GrammarBackedNonTerminalNode : GrammarBackedTerminalNode;
    }
    /* Node constructor is the actual JS class being initiated, different than the Node type. */
    _getDefinedNodeConstructor() {
        const customConstructorsDefinition = (this.getChildrenByNodeConstructor(GrammarCustomConstructorsNode)[0]);
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
        return this.getChildrenByNodeConstructor(GrammarCompilerNode) || [];
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
        return TreeUtils.mapValues(this.getRunTimeFirstWordMap(), key => defs[key]);
    }
    getRequiredCellTypeNames() {
        const parameters = this.get(GrammarConstants.cells);
        return parameters ? parameters.split(" ") : [];
    }
    getCatchAllCellTypeName() {
        return this.get(GrammarConstants.catchAllCellType);
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
        arr.sort(TreeUtils.sortByAccessor((definition) => definition.getFrequency()));
        arr.reverse();
        return arr.map(definition => definition.getNodeTypeIdFromDefinition());
    }
    _getNodeTypesNode() {
        // todo: allow multiple of these if we allow mixins?
        return this.getNode(GrammarConstants.nodeTypes);
    }
    isRequired() {
        GrammarConstants;
        return this.has(GrammarConstants.required);
    }
    isSingle() {
        return this.has(GrammarConstants.single);
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
            throw new Error(`This grammar language "${this.getProgram().getGrammarName()}" lacks a root catch all definition`);
        else
            return this.getParent()._getCatchAllDefinition();
    }
    _initCatchAllNodeConstructorCache() {
        if (this._cache_catchAllConstructor)
            return undefined;
        this._cache_catchAllConstructor = this._getCatchAllDefinition().getConstructorDefinedInGrammar();
    }
    getFirstCellType() {
        return this.get(GrammarConstants.firstCellType) || GrammarStandardCellTypes.anyFirstWord;
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
class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
    // todo: protected?
    _getRunTimeCatchAllNodeTypeId() {
        return (this.get(GrammarConstants.catchAllNodeType) ||
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
    _getFirstCellHighlightScope() {
        const program = this.getProgram();
        const cellTypeDefinition = program.getCellTypeDefinition(this.getFirstCellType());
        // todo: standardize error/capture error at grammar time
        if (!cellTypeDefinition)
            throw new Error(`No ${GrammarConstants.cellType} ${this.getFirstCellType()} found`);
        return cellTypeDefinition.getHighlightScope();
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
                throw new Error(`No ${GrammarConstants.cellType} ${typeName} found`); // todo: standardize error/capture error at grammar time
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
        return this.getNode(GrammarConstants.defaults);
    }
    // todo: deprecate?
    getDefaultFor(name) {
        const defaults = this._getDefaultsNode();
        return defaults ? defaults.get(name) : undefined;
    }
    getDescription() {
        return this.get(GrammarConstants.description) || "";
    }
    getExamples() {
        return this.getChildrenByNodeConstructor(GrammarExampleNode);
    }
    getConstantsObject() {
        const constantsNode = this.getNodeByType(GrammarConstantsNode);
        return constantsNode ? constantsNode.getConstantsObj() : {};
    }
    getFrequency() {
        const val = this.get(GrammarConstants.frequency);
        return val ? parseFloat(val) : 0;
    }
}
class UnknownGrammarProgram extends TreeNode {
    getPredictedGrammarFile(grammarName) {
        const rootNode = new TreeNode(`grammar
 name ${grammarName}`);
        // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
        const globalCellTypeMap = new Map();
        const xi = this.getXI();
        const yi = this.getYI();
        this.getFirstWords().forEach(firstWord => rootNode.touchNode(`${GrammarConstants.grammar} ${GrammarConstants.nodeTypes} ${firstWord}`));
        const clone = this.clone();
        let allNodes = clone.getTopDownArrayIterator();
        let node;
        for (node of allNodes) {
            const firstWord = node.getFirstWord();
            const asInt = parseInt(firstWord);
            if (!isNaN(asInt) && asInt.toString() === firstWord && node.getParent().getFirstWord())
                node.setFirstWord(node.getParent().getFirstWord() + "Child");
        }
        allNodes = clone.getTopDownArrayIterator();
        const allChilds = {};
        const allFirstWordNodes = {};
        for (let node of allNodes) {
            const firstWord = node.getFirstWord();
            if (!allChilds[firstWord])
                allChilds[firstWord] = {};
            if (!allFirstWordNodes[firstWord])
                allFirstWordNodes[firstWord] = [];
            allFirstWordNodes[firstWord].push(node);
            node.forEach((child) => {
                allChilds[firstWord][child.getFirstWord()] = true;
            });
        }
        const lineCount = clone.getNumberOfLines();
        const firstWords = Object.keys(allChilds).map(firstWord => {
            const defNode = new TreeNode(`${GrammarConstants.nodeType} ${firstWord}`).nodeAt(0);
            const childFirstWords = Object.keys(allChilds[firstWord]);
            if (childFirstWords.length) {
                //defNode.touchNode(GrammarConstants.blob) // todo: remove?
                childFirstWords.forEach(firstWord => defNode.touchNode(`${GrammarConstants.nodeTypes} ${firstWord}`));
            }
            const allLines = allFirstWordNodes[firstWord];
            const cells = allLines
                .map(line => line.getContent())
                .filter(i => i)
                .map(i => i.split(xi));
            const sizes = new Set(cells.map(c => c.length));
            const max = Math.max(...Array.from(sizes));
            const min = Math.min(...Array.from(sizes));
            let catchAllCellType;
            let cellTypes = [];
            for (let index = 0; index < max; index++) {
                const cellType = this._getBestCellType(firstWord, cells.map(c => c[index]));
                if (cellType.cellTypeDefinition && !globalCellTypeMap.has(cellType.cellTypeName))
                    globalCellTypeMap.set(cellType.cellTypeName, cellType.cellTypeDefinition);
                cellTypes.push(cellType.cellTypeName);
            }
            if (max > min) {
                //columns = columns.slice(0, min)
                catchAllCellType = cellTypes.pop();
                while (cellTypes[cellTypes.length - 1] === catchAllCellType) {
                    cellTypes.pop();
                }
            }
            if (catchAllCellType)
                defNode.set(GrammarConstants.catchAllCellType, catchAllCellType);
            if (cellTypes.length > 1)
                defNode.set(GrammarConstants.cells, cellTypes.join(xi));
            if (!catchAllCellType && cellTypes.length === 1)
                defNode.set(GrammarConstants.cells, cellTypes[0]);
            // Todo: switch to conditional frequency
            //defNode.set(GrammarConstants.frequency, (allLines.length / lineCount).toFixed(3))
            return defNode.getParent().toString();
        });
        const cellTypes = [];
        globalCellTypeMap.forEach(def => cellTypes.push(def));
        return [rootNode.toString(), cellTypes.join(yi), firstWords.join(yi)].filter(i => i).join("\n");
    }
    _getBestCellType(firstWord, allValues) {
        const asSet = new Set(allValues);
        const xi = this.getXI();
        const values = Array.from(asSet).filter(c => c);
        const all = (fn) => {
            for (let i = 0; i < values.length; i++) {
                if (!fn(values[i]))
                    return false;
            }
            return true;
        };
        if (all((str) => str === "0" || str === "1"))
            return { cellTypeName: "bit" };
        if (all((str) => {
            const num = parseInt(str);
            if (isNaN(num))
                return false;
            return num.toString() === str;
        })) {
            return { cellTypeName: "int" };
        }
        if (all((str) => !str.match(/[^\d\.\-]/)))
            return { cellTypeName: "float" };
        const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"]);
        if (all((str) => bools.has(str.toLowerCase())))
            return { cellTypeName: "bool" };
        // If there are duplicate files and the set is less than enum
        const enumLimit = 30;
        if ((asSet.size === 1 || allValues.length > asSet.size) && asSet.size < enumLimit)
            return {
                cellTypeName: `${firstWord}Enum`,
                cellTypeDefinition: `cellType ${firstWord}Enum
 enum ${values.join(xi)}`
            };
        return { cellTypeName: "any" };
    }
}
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
        map[GrammarConstants.extensions] = TreeNode;
        map[GrammarConstants.version] = TreeNode;
        map[GrammarConstants.name] = TreeNode;
        map[GrammarConstants.nodeTypeOrder] = TreeNode;
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
        map[GrammarConstants.grammar] = GrammarRootNode;
        map[GrammarConstants.cellType] = GrammarCellTypeDefinitionNode;
        map[GrammarConstants.nodeType] = GrammarNodeTypeDefinitionNode;
        map[GrammarConstants.abstract] = GrammarAbstractNodeTypeDefinitionNode;
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
        return this._getGrammarRootNode().get(GrammarConstants.nodeTypeOrder);
    }
    getCellTypeDefinitions() {
        if (!this._cache_cellTypes)
            this._cache_cellTypes = this._getCellTypeDefinitions();
        return this._cache_cellTypes;
    }
    getCellTypeDefinition(word) {
        const type = this.getCellTypeDefinitions()[word];
        // todo: return unknownCellTypeDefinition
        return type;
    }
    _getCellTypeDefinitions() {
        const types = {};
        // todo: add built in word types?
        this.getChildrenByNodeConstructor(GrammarCellTypeDefinitionNode).forEach(type => (types[type.getCellTypeId()] = type));
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
        return this._getGrammarRootNode().get(GrammarConstants.name);
    }
    _getNodeTypesNode() {
        return this._getGrammarRootNode().getNode(GrammarConstants.nodeTypes);
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
                def = subject._getCatchAllDefinition();
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
        return this._getGrammarRootNode().get(GrammarConstants.catchAllNodeType);
    }
    _getRootConstructor() {
        const extendedConstructor = this._getGrammarRootNode().getConstructorDefinedInGrammar() || AbstractRuntimeProgram;
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
        return this._getGrammarRootNode().get(GrammarConstants.extensions)
            ? this._getGrammarRootNode()
                .get(GrammarConstants.extensions)
                .split(" ")
                .join(",")
            : this.getExtensionName();
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
        return this.newFromCondensed(`${GrammarConstants.grammar} any
 ${GrammarConstants.catchAllNodeType} any
${GrammarConstants.nodeType} any
 ${GrammarConstants.catchAllCellType} any
${GrammarConstants.cellType} any`).getRootConstructor();
    }
    static newFromCondensed(grammarCode, grammarPath) {
        // todo: handle imports
        const tree = new TreeNode(grammarCode);
        // Expand groups
        // todo: rename? maybe change this to something like "makeNodeTypes"?
        const xi = tree.getXI();
        tree.findNodes(`${GrammarConstants.abstract}${xi}${GrammarConstants.group}`).forEach(group => {
            const abstractName = group.getParent().getWord(1);
            group
                .getContent()
                .split(xi)
                .forEach(word => tree.appendLine(`${GrammarConstants.nodeType}${xi}${word}${xi}${abstractName}`));
        });
        return new GrammarProgram(tree.getExpanded(1, 2), grammarPath);
    }
    loadAllConstructorScripts(baseUrlPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isBrowser())
                return undefined;
            const uniqueScriptsSet = new Set(this.getNodesByGlobPath(`* ${GrammarConstants.constructors} ${GrammarConstants.constructorBrowser}`)
                .filter(node => node.getWord(2))
                .map(node => baseUrlPath + node.getWord(2)));
            return Promise.all(Array.from(uniqueScriptsSet).map(script => GrammarProgram._appendScriptOnce(script)));
        });
    }
    static _appendScriptOnce(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (this.isNodeJs()) return undefined
            if (!url)
                return undefined;
            if (this._scriptLoadingPromises[url])
                return this._scriptLoadingPromises[url];
            this._scriptLoadingPromises[url] = this._appendScript(url);
            return this._scriptLoadingPromises[url];
        });
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
// Adapted from https://github.com/NeekSandhu/codemirror-textmate/blob/master/src/tmToCm.ts
var CmToken;
(function (CmToken) {
    CmToken["Atom"] = "atom";
    CmToken["Attribute"] = "attribute";
    CmToken["Bracket"] = "bracket";
    CmToken["Builtin"] = "builtin";
    CmToken["Comment"] = "comment";
    CmToken["Def"] = "def";
    CmToken["Error"] = "error";
    CmToken["Header"] = "header";
    CmToken["HR"] = "hr";
    CmToken["Keyword"] = "keyword";
    CmToken["Link"] = "link";
    CmToken["Meta"] = "meta";
    CmToken["Number"] = "number";
    CmToken["Operator"] = "operator";
    CmToken["Property"] = "property";
    CmToken["Qualifier"] = "qualifier";
    CmToken["Quote"] = "quote";
    CmToken["String"] = "string";
    CmToken["String2"] = "string-2";
    CmToken["Tag"] = "tag";
    CmToken["Type"] = "type";
    CmToken["Variable"] = "variable";
    CmToken["Variable2"] = "variable-2";
    CmToken["Variable3"] = "variable-3";
})(CmToken || (CmToken = {}));
const tmToCm = {
    comment: {
        $: CmToken.Comment
    },
    constant: {
        // TODO: Revision
        $: CmToken.Def,
        character: {
            escape: {
                $: CmToken.String2
            }
        },
        language: {
            $: CmToken.Atom
        },
        numeric: {
            $: CmToken.Number
        },
        other: {
            email: {
                link: {
                    $: CmToken.Link
                }
            },
            symbol: {
                // TODO: Revision
                $: CmToken.Def
            }
        }
    },
    entity: {
        name: {
            class: {
                $: CmToken.Def
            },
            function: {
                $: CmToken.Def
            },
            tag: {
                $: CmToken.Tag
            },
            type: {
                $: CmToken.Type,
                class: {
                    $: CmToken.Variable
                }
            }
        },
        other: {
            "attribute-name": {
                $: CmToken.Attribute
            },
            "inherited-class": {
                // TODO: Revision
                $: CmToken.Def
            }
        },
        support: {
            function: {
                // TODO: Revision
                $: CmToken.Def
            }
        }
    },
    invalid: {
        $: CmToken.Error,
        illegal: { $: CmToken.Error },
        deprecated: {
            $: CmToken.Error
        }
    },
    keyword: {
        $: CmToken.Keyword,
        operator: {
            $: CmToken.Operator
        },
        other: {
            "special-method": CmToken.Def
        }
    },
    punctuation: {
        $: CmToken.Operator,
        definition: {
            comment: {
                $: CmToken.Comment
            },
            tag: {
                $: CmToken.Bracket
            }
            // 'template-expression': {
            //     $: CodeMirrorToken.Operator,
            // },
        }
        // terminator: {
        //     $: CodeMirrorToken.Operator,
        // },
    },
    storage: {
        $: CmToken.Keyword
    },
    string: {
        $: CmToken.String,
        regexp: {
            $: CmToken.String2
        }
    },
    support: {
        class: {
            $: CmToken.Def
        },
        constant: {
            $: CmToken.Variable2
        },
        function: {
            $: CmToken.Def
        },
        type: {
            $: CmToken.Type
        },
        variable: {
            $: CmToken.Variable2,
            property: {
                $: CmToken.Property
            }
        }
    },
    variable: {
        $: CmToken.Def,
        language: {
            // TODO: Revision
            $: CmToken.Variable3
        },
        other: {
            object: {
                $: CmToken.Variable,
                property: {
                    $: CmToken.Property
                }
            },
            property: {
                $: CmToken.Property
            }
        },
        parameter: {
            $: CmToken.Def
        }
    }
};
const textMateScopeToCodeMirrorStyle = (scopeSegments, styleTree = tmToCm) => {
    const matchingBranch = styleTree[scopeSegments.shift()];
    return matchingBranch
        ? textMateScopeToCodeMirrorStyle(scopeSegments, matchingBranch) || matchingBranch.$ || null
        : null;
};
class TreeNotationCodeMirrorMode {
    constructor(name, getProgramConstructorMethod, getProgramCodeMethod, codeMirrorLib = undefined) {
        this._name = name;
        this._getProgramConstructorMethod = getProgramConstructorMethod;
        this._getProgramCodeMethod =
            getProgramCodeMethod || (instance => (instance ? instance.getValue() : this._originalValue));
        this._codeMirrorLib = codeMirrorLib;
    }
    _getParsedProgram() {
        const source = this._getProgramCodeMethod(this._cmInstance) || "";
        if (!this._cachedProgram || this._cachedSource !== source) {
            this._cachedSource = source;
            this._cachedProgram = new (this._getProgramConstructorMethod())(source);
        }
        return this._cachedProgram;
    }
    _getExcludedIntelliSenseTriggerKeys() {
        return {
            "8": "backspace",
            "9": "tab",
            "13": "enter",
            "16": "shift",
            "17": "ctrl",
            "18": "alt",
            "19": "pause",
            "20": "capslock",
            "27": "escape",
            "33": "pageup",
            "34": "pagedown",
            "35": "end",
            "36": "home",
            "37": "left",
            "38": "up",
            "39": "right",
            "40": "down",
            "45": "insert",
            "46": "delete",
            "91": "left window key",
            "92": "right window key",
            "93": "select",
            "112": "f1",
            "113": "f2",
            "114": "f3",
            "115": "f4",
            "116": "f5",
            "117": "f6",
            "118": "f7",
            "119": "f8",
            "120": "f9",
            "121": "f10",
            "122": "f11",
            "123": "f12",
            "144": "numlock",
            "145": "scrolllock"
        };
    }
    token(stream, state) {
        return this._advanceStreamAndReturnTokenType(stream, state);
    }
    fromTextAreaWithAutocomplete(area, options) {
        this._originalValue = area.value;
        const defaultOptions = {
            lineNumbers: true,
            mode: this._name,
            tabSize: 1,
            indentUnit: 1,
            hintOptions: {
                hint: (cmInstance, options) => this.codeMirrorAutocomplete(cmInstance, options)
            }
        };
        Object.assign(defaultOptions, options);
        this._cmInstance = this._getCodeMirrorLib().fromTextArea(area, defaultOptions);
        this._enableAutoComplete(this._cmInstance);
        return this._cmInstance;
    }
    _enableAutoComplete(cmInstance) {
        const excludedKeys = this._getExcludedIntelliSenseTriggerKeys();
        const codeMirrorLib = this._getCodeMirrorLib();
        cmInstance.on("keyup", (cm, event) => {
            // https://stackoverflow.com/questions/13744176/codemirror-autocomplete-after-any-keyup
            if (!cm.state.completionActive && !excludedKeys[event.keyCode.toString()])
                // Todo: get typings for CM autocomplete
                codeMirrorLib.commands.autocomplete(cm, null, { completeSingle: false });
        });
    }
    _getCodeMirrorLib() {
        return this._codeMirrorLib;
    }
    codeMirrorAutocomplete(cmInstance, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = cmInstance.getDoc().getCursor();
            const codeMirrorLib = this._getCodeMirrorLib();
            const result = yield this._getParsedProgram().getAutocompleteResultsAt(cursor.line, cursor.ch);
            // It seems to be better UX if there's only 1 result, and its the word the user entered, to close autocomplete
            if (result.matches.length === 1 && result.matches[0].text === result.word)
                return null;
            return result.matches.length
                ? {
                    list: result.matches,
                    from: codeMirrorLib.Pos(cursor.line, result.startCharIndex),
                    to: codeMirrorLib.Pos(cursor.line, result.endCharIndex)
                }
                : null;
        });
    }
    register() {
        const codeMirrorLib = this._getCodeMirrorLib();
        codeMirrorLib.defineMode(this._name, () => this);
        codeMirrorLib.defineMIME("text/" + this._name, this._name);
        return this;
    }
    _advanceStreamAndReturnTokenType(stream, state) {
        let nextCharacter = stream.next();
        const lineNumber = this._getLineNumber(stream, state);
        while (typeof nextCharacter === "string") {
            const peek = stream.peek();
            if (nextCharacter === " ") {
                if (peek === undefined || peek === "\n") {
                    stream.skipToEnd(); // advance string to end
                    this._incrementLine(state);
                }
                return "bracket";
            }
            if (peek === " ") {
                state.cellIndex++;
                return this._getCellStyle(lineNumber, state.cellIndex);
            }
            nextCharacter = stream.next();
        }
        state.cellIndex++;
        const style = this._getCellStyle(lineNumber, state.cellIndex);
        this._incrementLine(state);
        return style;
    }
    _getLineNumber(stream, state) {
        const num = stream.lineOracle.line + 1; // state.lineIndex
        return num;
    }
    _getCellStyle(lineIndex, cellIndex) {
        const program = this._getParsedProgram();
        // todo: if the current word is an error, don't show red?
        const highlightScope = program.getCellHighlightScopeAtPosition(lineIndex, cellIndex);
        const style = highlightScope ? textMateScopeToCodeMirrorStyle(highlightScope.split(".")) : undefined;
        return style || "noHighlightScopeDefinedInGrammar";
    }
    // todo: remove.
    startState() {
        return {
            cellIndex: 0
        };
    }
    _incrementLine(state) {
        state.cellIndex = 0;
    }
}
class jtree {
}
jtree.programRoot = AbstractRuntimeProgram;
jtree.Utils = TreeUtils;
jtree.TreeNode = TreeNode;
jtree.NonTerminalNode = GrammarBackedNonTerminalNode;
jtree.TerminalNode = GrammarBackedTerminalNode;
jtree.BlobNode = GrammarBackedBlobNode;
jtree.GrammarProgram = GrammarProgram;
jtree.UnknownGrammarProgram = UnknownGrammarProgram;
jtree.TreeNotationCodeMirrorMode = TreeNotationCodeMirrorMode;
jtree.getVersion = () => "23.2.1";
