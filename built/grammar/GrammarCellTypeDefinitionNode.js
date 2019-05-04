"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
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
    _getKeywordTable(runTimeGrammarBackedProgram) {
        const nodeType = this.getWord(1);
        // note: hack where we store it on the program. otherwise has global effects.
        if (!runTimeGrammarBackedProgram._keywordTables)
            runTimeGrammarBackedProgram._keywordTables = {};
        if (runTimeGrammarBackedProgram._keywordTables[nodeType])
            return runTimeGrammarBackedProgram._keywordTables[nodeType];
        // keywordTable cellType 1
        const wordIndex = 1;
        const table = {};
        runTimeGrammarBackedProgram.findNodes(nodeType).forEach(node => {
            table[node.getWord(wordIndex)] = true;
        });
        runTimeGrammarBackedProgram._keywordTables[nodeType] = table;
        return table;
    }
    // todo: remove
    isValid(str, runTimeGrammarBackedProgram) {
        return this._getKeywordTable(runTimeGrammarBackedProgram)[str] === true;
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
class GrammarCellTypeDefinitionNode extends TreeNode_1.default {
    getKeywordMap() {
        const types = {};
        types[GrammarConstants_1.GrammarConstants.regex] = GrammarRegexTestNode;
        types[GrammarConstants_1.GrammarConstants.enumFromGrammar] = EnumFromGrammarTestNode;
        types[GrammarConstants_1.GrammarConstants.enum] = GrammarEnumTestNode;
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
    _getKeywordTableOptions(runTimeProgram) {
        const node = this.getNode(GrammarConstants_1.GrammarConstants.enumFromGrammar);
        return node ? Object.keys(node._getKeywordTable(runTimeProgram)) : undefined;
    }
    getAutocompleteWordOptions(runTimeProgram) {
        return this._getEnumOptions() || this._getKeywordTableOptions(runTimeProgram) || [];
    }
    getRegexString() {
        // todo: enum
        const enumOptions = this._getEnumOptions();
        return this.get(GrammarConstants_1.GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*");
    }
    parse(str) {
        return str;
    }
    isValid(str, runTimeGrammarBackedProgram) {
        return this.getChildrenByNodeType(AbstractGrammarWordTestNode).every(node => node.isValid(str, runTimeGrammarBackedProgram));
    }
    getId() {
        return this.getWord(1);
    }
    getTypeId() {
        return this.getWord(1);
    }
}
class GrammarCellTypeIntNode extends GrammarCellTypeDefinitionNode {
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
class GrammarCellTypeBitNode extends GrammarCellTypeDefinitionNode {
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
class GrammarCellTypeFloatNode extends GrammarCellTypeDefinitionNode {
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
class GrammarCellTypeBoolNode extends GrammarCellTypeDefinitionNode {
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
class GrammarCellTypeAnyNode extends GrammarCellTypeDefinitionNode {
    isValid() {
        return true;
    }
    getRegexString() {
        return "[^ ]+";
    }
}
GrammarCellTypeDefinitionNode.types = {
    any: GrammarCellTypeAnyNode,
    float: GrammarCellTypeFloatNode,
    number: GrammarCellTypeFloatNode,
    bit: GrammarCellTypeBitNode,
    bool: GrammarCellTypeBoolNode,
    int: GrammarCellTypeIntNode
};
exports.default = GrammarCellTypeDefinitionNode;
