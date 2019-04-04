"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
class AbstractRuntimeNode extends TreeNode_1.default {
    getGrammarProgram() {
        return this.getProgram().getGrammarProgram();
    }
    getProgram() {
        return this;
    }
    _getKeywordDefinitionByName(path) {
        return (this.getProgram()
            .getGrammarProgram()
            // todo: do we need a relative to with this keyword path?
            .getKeywordDefinitionByKeywordPath(path));
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
