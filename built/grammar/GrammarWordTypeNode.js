"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
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
class GrammarKeywordTableTestNode extends AbstractGrammarWordTestNode {
    _getKeywordTable(runTimeGrammarBackedProgram) {
        // @keywordTable @wordType 1
        const nodeType = this.getWord(1);
        const wordIndex = parseInt(this.getWord(2));
        const table = {};
        runTimeGrammarBackedProgram.findNodes(nodeType).forEach(node => {
            table[node.getWord(wordIndex)] = true;
        });
        return table;
    }
    // todo: remove
    isValid(str, runTimeGrammarBackedProgram) {
        // note: hack where we store it on the program. otherwise has global effects.
        if (!runTimeGrammarBackedProgram._keywordTable)
            runTimeGrammarBackedProgram._keywordTable = this._getKeywordTable(runTimeGrammarBackedProgram);
        return runTimeGrammarBackedProgram._keywordTable[str] === true;
    }
}
class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
    isValid(str) {
        // @enum c c++ java
        return !!this.getOptions()[str];
    }
    getOptions() {
        if (!this._map)
            this._map = TreeUtils_1.default.arrayToMap(this.getWordsFrom(1));
        return this._map;
    }
}
class GrammarWordParserNode extends TreeNode_1.default {
    parse(str) {
        const fns = {
            parseInt: parseInt,
            parseFloat: parseFloat
        };
        const fnName = this.getWord(2);
        const fn = fns[fnName];
        if (fn)
            return fn(str);
        return str;
    }
}
class GrammarWordTypeNode extends TreeNode_1.default {
    getKeywordMap() {
        const types = {};
        types[GrammarConstants_1.GrammarConstants.regex] = GrammarRegexTestNode;
        types[GrammarConstants_1.GrammarConstants.keywordTable] = GrammarKeywordTableTestNode;
        types[GrammarConstants_1.GrammarConstants.enum] = GrammarEnumTestNode;
        types[GrammarConstants_1.GrammarConstants.parseWith] = GrammarWordParserNode;
        types[GrammarConstants_1.GrammarConstants.highlightScope] = TreeNode_1.default;
        return types;
    }
    getHighlightScope() {
        return this.get(GrammarConstants_1.GrammarConstants.highlightScope);
    }
    _getEnumOptions() {
        const enumNode = this.getChildrenByNodeType(GrammarEnumTestNode)[0];
        if (!enumNode)
            return undefined;
        // we sort by longest first to capture longest match first. todo: add test
        const options = Object.keys(enumNode.getOptions());
        options.sort((a, b) => b.length - a.length);
        return options;
    }
    getAutocompleteWordOptions() {
        const enumOptions = this._getEnumOptions();
        return enumOptions || [];
    }
    getRegexString() {
        // todo: enum
        const enumOptions = this._getEnumOptions();
        return (this.get(GrammarConstants_1.GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "noWordTypeRegexFound"));
    }
    parse(str) {
        const parser = this.getNode(GrammarConstants_1.GrammarConstants.parseWith);
        return parser ? parser.parse(str) : str;
    }
    isValid(str, runTimeGrammarBackedProgram) {
        str = str.replace(/\*$/, ""); // todo: cleanup
        return this.getChildrenByNodeType(AbstractGrammarWordTestNode).every(node => node.isValid(str, runTimeGrammarBackedProgram));
    }
    getId() {
        return this.getWord(1);
    }
    getTypeId() {
        return this.getWord(1);
    }
}
class GrammarWordTypeIntNode extends GrammarWordTypeNode {
    isValid(str) {
        const num = parseInt(str);
        if (isNaN(num))
            return false;
        return num.toString() === str;
    }
    getRegexString() {
        return "\-?[0-9]+";
    }
    parse(str) {
        return parseInt(str);
    }
}
class GrammarWordTypeBitNode extends GrammarWordTypeNode {
    isValid(str) {
        return str === "0" || str === "1";
    }
    getRegexString() {
        return "[01]";
    }
    parse(str) {
        return !!parseInt(str);
    }
}
class GrammarWordTypeFloatNode extends GrammarWordTypeNode {
    isValid(str) {
        return !isNaN(parseFloat(str));
    }
    getRegexString() {
        return "\-?[0-9]*\.?[0-9]*";
    }
    parse(str) {
        return parseFloat(str);
    }
}
class GrammarWordTypeBoolNode extends GrammarWordTypeNode {
    constructor() {
        super(...arguments);
        this._options = ["1", "0", "true", "false", "t", "f", "yes", "no"];
    }
    isValid(str) {
        return new Set(this._options).has(str.toLowerCase());
    }
    getRegexString() {
        return "(?:" + this._options.join("|") + ")";
    }
    parse(str) {
        return !!parseInt(str);
    }
}
class GrammarWordTypeAnyNode extends GrammarWordTypeNode {
    isValid() {
        return true;
    }
    getRegexString() {
        return "[^ ]+";
    }
}
GrammarWordTypeNode.types = {
    any: GrammarWordTypeAnyNode,
    float: GrammarWordTypeFloatNode,
    bit: GrammarWordTypeBitNode,
    bool: GrammarWordTypeBoolNode,
    int: GrammarWordTypeIntNode
};
exports.default = GrammarWordTypeNode;
