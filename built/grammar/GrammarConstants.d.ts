declare enum GrammarConstantsCompiler {
    sub = "@sub",
    indentCharacter = "@indentCharacter",
    listDelimiter = "@listDelimiter",
    openChildren = "@openChildren",
    closeChildren = "@closeChildren"
}
declare enum GrammarConstants {
    grammar = "@grammar",
    extensions = "@extensions",
    version = "@version",
    keyword = "@keyword",
    wordType = "@wordType",
    abstract = "@abstract",
    regex = "@regex",
    keywordTable = "@keywordTable",
    enum = "@enum",
    parseWith = "@parseWith",
    keywords = "@keywords",
    columns = "@columns",
    catchAllKeyword = "@catchAllKeyword",
    defaults = "@defaults",
    constants = "@constants",
    group = "@group",
    any = "@any",
    required = "@required",
    single = "@single",
    tags = "@tags",
    constructors = "@constructors",
    constructorNodeJs = "nodejs",
    constructorBrowser = "browser",
    compilerKeyword = "@compiler",
    description = "@description",
    example = "@example",
    frequency = "@frequency",
    highlightScope = "@highlightScope"
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
