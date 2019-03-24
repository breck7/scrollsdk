// todo: change to enum?
const GrammarConstants: any = {}

// node types
GrammarConstants.grammar = "@grammar"
GrammarConstants.keyword = "@keyword"
GrammarConstants.wordType = "@wordType"
GrammarConstants.abstract = "@abstract"

// word parsing
GrammarConstants.regex = "@regex" // temporary?
GrammarConstants.keywordTable = "@keywordTable" // temporary?
GrammarConstants.enum = "@enum" // temporary?
GrammarConstants.parseWith = "@parseWith" // temporary?

// parsing
GrammarConstants.keywords = "@keywords"
GrammarConstants.columns = "@columns"
GrammarConstants.catchAllKeyword = "@catchAllKeyword"
GrammarConstants.defaults = "@defaults"
GrammarConstants.constants = "@constants"
GrammarConstants.group = "@group"
GrammarConstants.any = "@any"
GrammarConstants.required = "@required" // Require this keyword to be present in a node or program
GrammarConstants.single = "@single" // Have at most 1 of these
GrammarConstants.tags = "@tags"

// parser/vm instantiating and executing
GrammarConstants.constructor = "@constructor"
GrammarConstants.constructorJs = "js"

// compiling
GrammarConstants.compilerKeyword = "@compiler"
GrammarConstants.compiler = {}
GrammarConstants.compiler.sub = "@sub" // replacement instructions
GrammarConstants.compiler.indentCharacter = "@indentCharacter"
GrammarConstants.compiler.listDelimiter = "@listDelimiter"
GrammarConstants.compiler.openChildren = "@openChildren"
GrammarConstants.compiler.closeChildren = "@closeChildren"

// developing
GrammarConstants.description = "@description"
GrammarConstants.frequency = "@frequency"
GrammarConstants.highlightScope = "@highlightScope"

// errors
GrammarConstants.errors = {}
GrammarConstants.errors.invalidKeywordError = "invalidKeywordError"
GrammarConstants.errors.invalidConstructorPathError = "invalidConstructorPathError"
GrammarConstants.errors.invalidWordError = "invalidWordError"
GrammarConstants.errors.grammarDefinitionError = "grammarDefinitionError"
GrammarConstants.errors.extraWordError = "extraWordError"
GrammarConstants.errors.unfilledColumnError = "unfilledColumnError"
GrammarConstants.errors.missingRequiredKeywordError = "missingRequiredKeywordError"
GrammarConstants.errors.keywordUsedMultipleTimesError = "keywordUsedMultipleTimesError"

export default GrammarConstants