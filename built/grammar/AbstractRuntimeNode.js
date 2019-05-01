"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
class AbstractRuntimeNode extends TreeNode_1.default {
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
    getAutocompleteResults(partialWord, wordIndex) {
        return wordIndex === 0
            ? this.getAutocompleteResultsForKeywords(partialWord)
            : this.getAutocompleteResultsForWord(partialWord, wordIndex);
    }
    _getGrammarBackedCellArray() {
        return [];
    }
    getAutocompleteResultsForWord(partialWord, wordIndex) {
        // todo: root should be [] correct?
        const cell = this._getGrammarBackedCellArray()[wordIndex - 1];
        return cell ? cell.getAutoCompleteWords(partialWord) : [];
    }
    getAutocompleteResultsForKeywords(partialWord) {
        const def = this.getDefinition();
        let defs = Object.values(def.getRunTimeKeywordMapWithDefinitions());
        if (partialWord)
            defs = defs.filter(def => def.getId().includes(partialWord));
        return defs.map(def => {
            const id = def.getId();
            const description = def.getDescription();
            return {
                text: id,
                displayText: id + (description ? " " + description : "")
            };
        });
    }
    _getKeywordDefinitionByName(path) {
        const grammarProgram = this.getProgram().getGrammarProgram();
        // todo: do we need a relative to with this keyword path?
        return grammarProgram.getKeywordDefinitionByKeywordPath(path);
    }
    _getRequiredNodeErrors(errors = []) {
        const nodeDef = this.getDefinition();
        const keywords = nodeDef.getRunTimeKeywordMapWithDefinitions();
        Object.keys(keywords).forEach(keyword => {
            const def = keywords[keyword];
            if (def.isRequired() && !this.has(keyword)) {
                errors.push({
                    kind: GrammarConstants_1.GrammarConstantsErrors.missingRequiredKeywordError,
                    subkind: keyword,
                    level: 0,
                    context: 0,
                    message: `${GrammarConstants_1.GrammarConstantsErrors.missingRequiredKeywordError} Required keyword missing: "${keyword}" in node '${this.getLine()}' at line '${this.getPoint().y}'`
                });
            }
        });
        return errors;
    }
}
exports.default = AbstractRuntimeNode;
