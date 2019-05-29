"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jTreeTypes;
(function (jTreeTypes) {
    let GrammarConstantsErrors;
    (function (GrammarConstantsErrors) {
        GrammarConstantsErrors["invalidNodeTypeError"] = "invalidNodeTypeError";
        GrammarConstantsErrors["invalidConstructorPathError"] = "invalidConstructorPathError";
        GrammarConstantsErrors["invalidWordError"] = "invalidWordError";
        GrammarConstantsErrors["grammarDefinitionError"] = "grammarDefinitionError";
        GrammarConstantsErrors["extraWordError"] = "extraWordError";
        GrammarConstantsErrors["unfilledColumnError"] = "unfilledColumnError";
        GrammarConstantsErrors["missingRequiredNodeTypeError"] = "missingRequiredNodeTypeError";
        GrammarConstantsErrors["nodeTypeUsedMultipleTimesError"] = "nodeTypeUsedMultipleTimesError";
    })(GrammarConstantsErrors = jTreeTypes.GrammarConstantsErrors || (jTreeTypes.GrammarConstantsErrors = {}));
})(jTreeTypes = exports.jTreeTypes || (exports.jTreeTypes = {}));
exports.default = jTreeTypes;
