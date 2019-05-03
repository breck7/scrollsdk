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
    keywordOrder = "keywordOrder",
    keyword = "keyword",
    cellType = "cellType",
    abstract = "abstract",
    regex = "regex",
    keywordTable = "keywordTable",
    enum = "enum",
    keywords = "keywords",
    cells = "cells",
    catchAllCellType = "catchAllCellType",
    catchAllKeyword = "catchAllKeyword",
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
    compilerKeyword = "compiler",
    description = "description",
    example = "example",
    frequency = "frequency",
    highlightScope = "highlightScope"
}
declare enum GrammarConstantsErrors {
    invalidKeywordError = "invalidKeywordError",
    invalidConstructorPathError = "invalidConstructorPathError",
    invalidWordError = "invalidWordError",
    grammarDefinitionError = "grammarDefinitionError",
    extraWordError = "extraWordError",
    unfilledColumnError = "unfilledColumnError",
    missingRequiredKeywordError = "missingRequiredKeywordError",
    keywordUsedMultipleTimesError = "keywordUsedMultipleTimesError"
}
export { GrammarConstants, GrammarConstantsErrors, GrammarConstantsCompiler };
