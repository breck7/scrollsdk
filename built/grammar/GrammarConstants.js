"use strict";
// todo: change to enum?
Object.defineProperty(exports, "__esModule", { value: true });
var GrammarConstantsCompiler;
(function (GrammarConstantsCompiler) {
    GrammarConstantsCompiler["sub"] = "sub";
    GrammarConstantsCompiler["indentCharacter"] = "indentCharacter";
    GrammarConstantsCompiler["listDelimiter"] = "listDelimiter";
    GrammarConstantsCompiler["openChildren"] = "openChildren";
    GrammarConstantsCompiler["closeChildren"] = "closeChildren";
})(GrammarConstantsCompiler || (GrammarConstantsCompiler = {}));
exports.GrammarConstantsCompiler = GrammarConstantsCompiler;
var GrammarStandardCellTypes;
(function (GrammarStandardCellTypes) {
    GrammarStandardCellTypes["any"] = "any";
    GrammarStandardCellTypes["anyFirstWord"] = "anyFirstWord";
    GrammarStandardCellTypes["extraWord"] = "extraWord";
    GrammarStandardCellTypes["float"] = "float";
    GrammarStandardCellTypes["number"] = "number";
    GrammarStandardCellTypes["bit"] = "bit";
    GrammarStandardCellTypes["bool"] = "bool";
    GrammarStandardCellTypes["int"] = "int";
})(GrammarStandardCellTypes || (GrammarStandardCellTypes = {}));
exports.GrammarStandardCellTypes = GrammarStandardCellTypes;
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
exports.GrammarConstants = GrammarConstants;
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
exports.GrammarConstantsErrors = GrammarConstantsErrors;
