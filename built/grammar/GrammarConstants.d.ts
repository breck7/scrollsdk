declare enum GrammarConstantsCompiler {
    sub = "sub",
    indentCharacter = "indentCharacter",
    listDelimiter = "listDelimiter",
    openChildren = "openChildren",
    closeChildren = "closeChildren"
}
declare enum GrammarStandardCellTypes {
    any = "any",
    anyFirstWord = "anyFirstWord",
    extraWord = "extraWord",
    float = "float",
    number = "number",
    bit = "bit",
    bool = "bool",
    int = "int"
}
declare enum GrammarConstants {
    grammar = "grammar",
    extensions = "extensions",
    fileDirective = "#",
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
    firstCellType = "firstCellType",
    catchAllNodeType = "catchAllNodeType",
    defaults = "defaults",
    constants = "constants",
    group = "group",
    blob = "blob",
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
export { GrammarConstants, GrammarConstantsCompiler, GrammarStandardCellTypes };
