declare enum GrammarConstantsCompiler {
    sub = "sub",
    indentCharacter = "indentCharacter",
    listDelimiter = "listDelimiter",
    openChildren = "openChildren",
    closeChildren = "closeChildren"
}
declare enum GrammarConstants {
    grammar = "grammar",
    extensions = "extensions",
    version = "version",
    name = "name",
    nodeTypeOrder = "nodeTypeOrder",
    nodeType = "nodeType",
    cellType = "cellType",
    abstract = "abstract",
    regex = "regex",
    enumFromGrammar = "enumFromGrammar",
    enum = "enum",
    nodeTypes = "nodeTypes",
    cells = "cells",
    catchAllCellType = "catchAllCellType",
    catchAllNodeType = "catchAllNodeType",
    defaults = "defaults",
    constants = "constants",
    group = "group",
    any = "any",
    required = "required",
    single = "single",
    tags = "tags",
    constructors = "constructors",
    constructorNodeJs = "nodejs",
    constructorBrowser = "browser",
    constructorJavascript = "javascript",
    compilerNodeType = "compiler",
    description = "description",
    example = "example",
    frequency = "frequency",
    highlightScope = "highlightScope"
}
declare enum GrammarConstantsErrors {
    invalidNodeTypeError = "invalidNodeTypeError",
    invalidConstructorPathError = "invalidConstructorPathError",
    invalidWordError = "invalidWordError",
    grammarDefinitionError = "grammarDefinitionError",
    extraWordError = "extraWordError",
    unfilledColumnError = "unfilledColumnError",
    missingRequiredNodeTypeError = "missingRequiredNodeTypeError",
    nodeTypeUsedMultipleTimesError = "nodeTypeUsedMultipleTimesError"
}
export { GrammarConstants, GrammarConstantsErrors, GrammarConstantsCompiler };
