"use strict";
// todo: change to enum?
Object.defineProperty(exports, "__esModule", { value: true });
var GrammarConstantsCompiler;
(function (GrammarConstantsCompiler) {
    GrammarConstantsCompiler["sub"] = "@sub";
    GrammarConstantsCompiler["indentCharacter"] = "@indentCharacter";
    GrammarConstantsCompiler["listDelimiter"] = "@listDelimiter";
    GrammarConstantsCompiler["openChildren"] = "@openChildren";
    GrammarConstantsCompiler["closeChildren"] = "@closeChildren";
})(GrammarConstantsCompiler || (GrammarConstantsCompiler = {}));
exports.GrammarConstantsCompiler = GrammarConstantsCompiler;
var GrammarConstants;
(function (GrammarConstants) {
    // node types
    GrammarConstants["grammar"] = "@grammar";
    GrammarConstants["extensions"] = "@extensions";
    GrammarConstants["version"] = "@version";
    GrammarConstants["keyword"] = "@keyword";
    GrammarConstants["wordType"] = "@wordType";
    GrammarConstants["abstract"] = "@abstract";
    // error check time
    GrammarConstants["regex"] = "@regex";
    GrammarConstants["keywordTable"] = "@keywordTable";
    GrammarConstants["enum"] = "@enum";
    GrammarConstants["parseWith"] = "@parseWith";
    // parse time
    GrammarConstants["keywords"] = "@keywords";
    GrammarConstants["columns"] = "@columns";
    GrammarConstants["catchAllKeyword"] = "@catchAllKeyword";
    GrammarConstants["defaults"] = "@defaults";
    GrammarConstants["constants"] = "@constants";
    GrammarConstants["group"] = "@group";
    GrammarConstants["any"] = "@any";
    GrammarConstants["required"] = "@required";
    GrammarConstants["single"] = "@single";
    GrammarConstants["tags"] = "@tags";
    // parse and interpret time
    GrammarConstants["constructors"] = "@constructors";
    GrammarConstants["constructorNodeJs"] = "nodejs";
    GrammarConstants["constructorBrowser"] = "browser";
    // compile time
    GrammarConstants["compilerKeyword"] = "@compiler";
    // develop time
    GrammarConstants["description"] = "@description";
    GrammarConstants["example"] = "@example";
    GrammarConstants["frequency"] = "@frequency";
    GrammarConstants["highlightScope"] = "@highlightScope";
})(GrammarConstants || (GrammarConstants = {}));
exports.GrammarConstants = GrammarConstants;
var GrammarConstantsErrors;
(function (GrammarConstantsErrors) {
    GrammarConstantsErrors["invalidKeywordError"] = "invalidKeywordError";
    GrammarConstantsErrors["invalidConstructorPathError"] = "invalidConstructorPathError";
    GrammarConstantsErrors["invalidWordError"] = "invalidWordError";
    GrammarConstantsErrors["grammarDefinitionError"] = "grammarDefinitionError";
    GrammarConstantsErrors["extraWordError"] = "extraWordError";
    GrammarConstantsErrors["unfilledColumnError"] = "unfilledColumnError";
    GrammarConstantsErrors["missingRequiredKeywordError"] = "missingRequiredKeywordError";
    GrammarConstantsErrors["keywordUsedMultipleTimesError"] = "keywordUsedMultipleTimesError";
})(GrammarConstantsErrors || (GrammarConstantsErrors = {}));
exports.GrammarConstantsErrors = GrammarConstantsErrors;
