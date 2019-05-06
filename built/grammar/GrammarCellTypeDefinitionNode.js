"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
const GrammarConstants_1 = require("./GrammarConstants");
const GrammarBackedCell_1 = require("./GrammarBackedCell");
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
    // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
    getCellConstructor() {
        const kinds = {
            any: GrammarBackedCell_1.GrammarAnyCell,
            float: GrammarBackedCell_1.GrammarFloatCell,
            number: GrammarBackedCell_1.GrammarFloatCell,
            bit: GrammarBackedCell_1.GrammarBitCell,
            bool: GrammarBackedCell_1.GrammarBoolCell,
            int: GrammarBackedCell_1.GrammarIntCell
        };
        return kinds[this.getWord(1)] || kinds[this.getWord(2)] || GrammarBackedCell_1.GrammarAnyCell;
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
    _getEnumFromGrammarOptions(runTimeProgram) {
        const node = this.getNode(GrammarConstants_1.GrammarConstants.enumFromGrammar);
        return node ? Object.keys(node._getEnumFromGrammar(runTimeProgram)) : undefined;
    }
    getAutocompleteWordOptions(runTimeProgram) {
        return this._getEnumOptions() || this._getEnumFromGrammarOptions(runTimeProgram) || [];
    }
    getRegexString() {
        // todo: enum
        const enumOptions = this._getEnumOptions();
        return this.get(GrammarConstants_1.GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*");
    }
    isValid(str, runTimeGrammarBackedProgram) {
        return this.getChildrenByNodeType(AbstractGrammarWordTestNode).every(node => node.isValid(str, runTimeGrammarBackedProgram));
    }
    getCellTypeId() {
        return this.getWord(1);
    }
}
exports.default = GrammarCellTypeDefinitionNode;
