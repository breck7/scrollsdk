"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const AbstractRuntimeProgram_1 = require("./AbstractRuntimeProgram");
const GrammarConstants_1 = require("./GrammarConstants");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
const GrammarKeywordDefinitionNode_1 = require("./GrammarKeywordDefinitionNode");
const GrammarCellTypeNode_1 = require("./GrammarCellTypeNode");
class GrammarRootNode extends AbstractGrammarDefinitionNode_1.default {
    _getDefaultNodeConstructor() {
        return undefined;
    }
    getProgram() {
        return this.getParent();
    }
    getKeywordMap() {
        // todo: this isn't quite correct. we are allowing too many keywords.
        const map = super.getKeywordMap();
        map[GrammarConstants_1.GrammarConstants.extensions] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.version] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.name] = TreeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.keywordOrder] = TreeNode_1.default;
        return map;
    }
}
class GrammarAbstractKeywordDefinitionNode extends GrammarKeywordDefinitionNode_1.default {
    _isAbstract() {
        return true;
    }
}
// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode_1.default {
    getKeywordMap() {
        const map = {};
        map[GrammarConstants_1.GrammarConstants.grammar] = GrammarRootNode;
        map[GrammarConstants_1.GrammarConstants.cellType] = GrammarCellTypeNode_1.default;
        map[GrammarConstants_1.GrammarConstants.keyword] = GrammarKeywordDefinitionNode_1.default;
        map[GrammarConstants_1.GrammarConstants.abstract] = GrammarAbstractKeywordDefinitionNode;
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
        this.getKeywordDefinitions().forEach(def => def.getExamples().forEach(example => {
            const exampleProgram = new programConstructor(example.childrenToString());
            exampleProgram.getProgramErrors().forEach(err => {
                errors.push(err);
            });
        }));
        return errors;
    }
    getNodeConstructor(line) {
        // Todo: we are using 0 + 1 keywords to detect type. Should we ease this or discourage?
        // Todo: this only supports single word type inheritance.
        const parts = line.split(this.getZI());
        let type = parts[0] === GrammarConstants_1.GrammarConstants.cellType &&
            (GrammarCellTypeNode_1.default.types[parts[1]] || GrammarCellTypeNode_1.default.types[parts[2]]);
        return type ? type : super.getNodeConstructor(line);
    }
    getTargetExtension() {
        return this._getGrammarRootNode().getTargetExtension();
    }
    getKeywordOrder() {
        return this._getGrammarRootNode().get(GrammarConstants_1.GrammarConstants.keywordOrder);
    }
    getCellTypes() {
        if (!this._cache_cellTypes)
            this._cache_cellTypes = this._getCellTypes();
        return this._cache_cellTypes;
    }
    getCellType(word) {
        return this.getCellTypes()[word];
    }
    _getCellTypes() {
        const types = {};
        // todo: add built in word types?
        this.getChildrenByNodeType(GrammarCellTypeNode_1.default).forEach(type => (types[type.getId()] = type));
        return types;
    }
    getProgram() {
        return this;
    }
    getKeywordDefinitions() {
        return this.getChildrenByNodeType(GrammarKeywordDefinitionNode_1.default);
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
    _getKeywordsNode() {
        return this._getGrammarRootNode().getNode(GrammarConstants_1.GrammarConstants.keywords);
    }
    getKeywordDefinitionByKeywordPath(keywordPath) {
        if (!this._cachedDefinitions)
            this._cachedDefinitions = {};
        if (this._cachedDefinitions[keywordPath])
            return this._cachedDefinitions[keywordPath];
        const parts = keywordPath.split(" ");
        let subject = this;
        let def;
        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            def = subject.getRunTimeKeywordMapWithDefinitions()[part];
            if (!def)
                def = subject._getCatchAllDefinition();
            subject = def;
        }
        this._cachedDefinitions[keywordPath] = def;
        return def;
    }
    getDocs() {
        return this.toString();
    }
    _initProgramKeywordDefinitionCache() {
        if (this._cache_keywordDefinitions)
            return undefined;
        const keywordDefinitionMap = {};
        this.getChildrenByNodeType(GrammarKeywordDefinitionNode_1.default).forEach(keywordDefinitionNode => {
            keywordDefinitionMap[keywordDefinitionNode.getId()] = keywordDefinitionNode;
        });
        this._cache_keywordDefinitions = keywordDefinitionMap;
    }
    // todo: protected?
    _getProgramKeywordDefinitionCache() {
        this._initProgramKeywordDefinitionCache();
        return this._cache_keywordDefinitions;
    }
    // todo: protected?
    _getRunTimeCatchAllKeyword() {
        return this._getGrammarRootNode().get(GrammarConstants_1.GrammarConstants.catchAllKeyword);
    }
    _getRootConstructor() {
        const definedConstructor = this._getGrammarRootNode().getDefinedConstructor();
        const extendedConstructor = definedConstructor || AbstractRuntimeProgram_1.default;
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
    toSublimeSyntaxFile() {
        const types = this.getCellTypes();
        const variables = Object.keys(types)
            .map(name => ` ${name}: '${types[name].getRegexString()}'`)
            .join("\n");
        const keywords = this.getKeywordDefinitions().filter(kw => !kw._isAbstract());
        const keywordContexts = keywords.map(def => def.getMatchBlock()).join("\n\n");
        const includes = keywords.map(keyword => `  - include: '${keyword.getSyntaxContextId()}'`).join("\n");
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

${keywordContexts}`;
    }
    // A language where anything goes.
    static getTheAnyLanguageRootConstructor() {
        return this.newFromCondensed(`${GrammarConstants_1.GrammarConstants.grammar} any
 ${GrammarConstants_1.GrammarConstants.catchAllKeyword} any
${GrammarConstants_1.GrammarConstants.keyword} any
 ${GrammarConstants_1.GrammarConstants.catchAllCellType} any
${GrammarConstants_1.GrammarConstants.cellType} any`).getRootConstructor();
    }
    static newFromCondensed(grammarCode, grammarPath) {
        // todo: handle imports
        const tree = new TreeNode_1.default(grammarCode);
        // Expand groups
        // todo: rename? maybe change this to "make" or "quickKeywords"?
        const xi = tree.getXI();
        tree.findNodes(`${GrammarConstants_1.GrammarConstants.abstract}${xi}${GrammarConstants_1.GrammarConstants.group}`).forEach(group => {
            const abstractName = group.getParent().getWord(1);
            group
                .getContent()
                .split(xi)
                .forEach(word => tree.appendLine(`${GrammarConstants_1.GrammarConstants.keyword}${xi}${word}${xi}${abstractName}`));
        });
        return new GrammarProgram(tree.getExpanded(1, 2), grammarPath);
    }
    static _getBestType(values) {
        const all = fn => {
            for (let i = 0; i < values.length; i++) {
                if (!fn(values[i]))
                    return false;
            }
            return true;
        };
        if (all(str => str === "0" || str === "1"))
            return "bit";
        if (all(str => {
            const num = parseInt(str);
            if (isNaN(num))
                return false;
            return num.toString() === str;
        })) {
            return "int";
        }
        if (all(str => !str.match(/[^\d\.\-]/)))
            return "float";
        const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"]);
        if (all(str => bools.has(str.toLowerCase())))
            return "bool";
        return "any";
    }
    static predictGrammarFile(str, keywords = undefined) {
        const tree = str instanceof TreeNode_1.default ? str : new TreeNode_1.default(str);
        const xi = " "; // todo: make param?
        keywords = keywords || tree.getColumnNames();
        return keywords //this.getInvalidKeywords()
            .map(keyword => {
            const lines = tree.getColumn(keyword).filter(i => i);
            const cells = lines.map(line => line.split(xi));
            const sizes = new Set(cells.map(c => c.length));
            const max = Math.max(...Array.from(sizes));
            const min = Math.min(...Array.from(sizes));
            let catchAllCellType;
            let cellTypes = [];
            for (let index = 0; index < max; index++) {
                const set = new Set(cells.map(c => c[index]));
                const values = Array.from(set).filter(c => c);
                const type = GrammarProgram._getBestType(values);
                cellTypes.push(type);
            }
            if (max > min) {
                //columns = columns.slice(0, min)
                catchAllCellType = cellTypes.pop();
                while (cellTypes[cellTypes.length - 1] === catchAllCellType) {
                    cellTypes.pop();
                }
            }
            const catchAllCellTypeString = catchAllCellType
                ? `\n ${GrammarConstants_1.GrammarConstants.catchAllCellType} ${catchAllCellType}`
                : "";
            const childrenAnyString = tree.isLeafColumn(keyword) ? "" : `\n ${GrammarConstants_1.GrammarConstants.any}`;
            if (!cellTypes.length)
                return `${GrammarConstants_1.GrammarConstants.keyword} ${keyword}${catchAllCellTypeString}${childrenAnyString}`;
            if (cellTypes.length > 1)
                return `${GrammarConstants_1.GrammarConstants.keyword} ${keyword}
 ${GrammarConstants_1.GrammarConstants.cells} ${cellTypes.join(xi)}${catchAllCellTypeString}${childrenAnyString}`;
            return `${GrammarConstants_1.GrammarConstants.keyword} ${keyword} ${cellTypes[0]}${catchAllCellTypeString}${childrenAnyString}`;
        })
            .join("\n");
    }
}
exports.default = GrammarProgram;
