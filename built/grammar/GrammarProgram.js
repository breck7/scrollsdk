"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const AbstractRuntimeProgram_1 = require("./AbstractRuntimeProgram");
const GrammarConstants_1 = require("./GrammarConstants");
const AbstractGrammarDefinitionNode_1 = require("./AbstractGrammarDefinitionNode");
const GrammarKeywordDefinitionNode_1 = require("./GrammarKeywordDefinitionNode");
const GrammarWordTypeNode_1 = require("./GrammarWordTypeNode");
class GrammarRootNode extends AbstractGrammarDefinitionNode_1.default {
    _getDefaultNodeConstructor() {
        return undefined;
    }
    getProgram() {
        return this.getParent();
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
        map[GrammarConstants_1.GrammarConstants.wordType] = GrammarWordTypeNode_1.default;
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
    getNodeConstructor(line) {
        // Todo: we are using 0 + 1 keywords to detect type. Should we ease this or discourage?
        // Todo: this only supports single word type inheritance.
        const parts = line.split(this.getZI());
        let type = parts[0] === GrammarConstants_1.GrammarConstants.wordType &&
            (GrammarWordTypeNode_1.default.types[parts[1]] || GrammarWordTypeNode_1.default.types[parts[2]]);
        return type ? type : super.getNodeConstructor(line);
    }
    getTargetExtension() {
        return this._getGrammarRootNode().getTargetExtension();
    }
    getWordTypes() {
        if (!this._cache_wordTypes)
            this._cache_wordTypes = this._getWordTypes();
        return this._cache_wordTypes;
    }
    getWordType(word) {
        // todo: cleanup
        return this.getWordTypes()[word.replace(/\*$/, "")];
    }
    _getWordTypes() {
        const types = {};
        // todo: add built in word types?
        this.getChildrenByNodeType(GrammarWordTypeNode_1.default).forEach(type => (types[type.getId()] = type));
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
        return this._getGrammarRootNode().getId();
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
        const newClass = class extends extendedConstructor {
            getGrammarProgram() {
                return grammarProgram;
            }
        };
        return newClass;
    }
    getRootConstructor() {
        if (!this._cache_rootConstructorClass)
            this._cache_rootConstructorClass = this._getRootConstructor();
        return this._cache_rootConstructorClass;
    }
    getNodeColumnRegexes() {
        const colTypes = this.getWordTypes();
        return this.getNodeColumnTypes().map(col => colTypes[col].getRegexString());
    }
    toSublimeSyntaxFile() {
        const wordTypes = this.getWordTypes();
        const variables = Object.keys(wordTypes)
            .map(name => ` ${name}: '${wordTypes[name].getRegexString()}'`)
            .join("\n");
        const keywords = this.getKeywordDefinitions().filter(kw => !kw._isAbstract());
        const keywordContexts = keywords.map(def => def.getMatchBlock()).join("\n\n");
        const includes = keywords.map(keyword => `  - include: '${keyword.getSyntaxContextId()}'`).join("\n");
        return `%YAML 1.2
---
name: ${this.getExtensionName()}
file_extensions: [${this.getExtensionName()}]
scope: source.${this.getExtensionName()}

variables:
${variables}

contexts:
 main:
${includes}

${keywordContexts}`;
    }
    static newFromCondensed(grammarCode, grammarPath) {
        // todo: handle imports
        const tree = new TreeNode_1.default(grammarCode);
        // Expand groups
        const xi = tree.getXI();
        tree.findNodes(`${GrammarConstants_1.GrammarConstants.abstract}${xi}${GrammarConstants_1.GrammarConstants.group}`).forEach(group => {
            const abstractName = group.getParent().getWord(1);
            group
                .getContent()
                .split(xi)
                .forEach(word => tree.appendLine(`${GrammarConstants_1.GrammarConstants.keyword}${xi}${word}${xi}${abstractName}`));
        });
        const expandedGrammarCode = tree.getExpanded(1, 2);
        return new GrammarProgram(expandedGrammarCode, grammarPath);
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
            let columns = [];
            for (let index = 0; index < max; index++) {
                const set = new Set(cells.map(c => c[index]));
                const values = Array.from(set).filter(c => c);
                const type = GrammarProgram._getBestType(values);
                columns.push(type);
            }
            if (max > min) {
                //columns = columns.slice(0, min)
                let last = columns.pop();
                while (columns[columns.length - 1] === last) {
                    columns.pop();
                }
                columns.push(last + "*");
            }
            const childrenAnyString = tree.isLeafColumn(keyword) ? "" : `\n @any`;
            if (!columns.length)
                return `@keyword ${keyword}${childrenAnyString}`;
            if (columns.length > 1)
                return `@keyword ${keyword}
 @columns ${columns.join(xi)}${childrenAnyString}`;
            return `@keyword ${keyword} ${columns[0]}${childrenAnyString}`;
        })
            .join("\n");
    }
}
exports.default = GrammarProgram;
