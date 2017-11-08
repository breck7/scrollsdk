const GrammarConstants = {}

// word parsing
GrammarConstants.regex = "@regex" // temporary?

// parsing
GrammarConstants.keywords = "@keywords"
GrammarConstants.columns = "@columns"
GrammarConstants.catchAllKeyword = "@catchAllKeyword"
GrammarConstants.defaults = "@defaults"
GrammarConstants.constants = "@constants"

// parser/vm instantiating and executing
GrammarConstants.parser = "@parser"
GrammarConstants.parserJs = "js"

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

// ohayo ui. todo: remove all.
GrammarConstants.ohayoSvg = "@ohayoSvg"
GrammarConstants.ohayoTileSize = "@ohayoTileSize"
GrammarConstants.ohayoTileClass = "@ohayoTileClass"
GrammarConstants.ohayoTileScript = "@ohayoTileScript"
GrammarConstants.ohayoTileCssScript = "@ohayoTileCssScript"

module.exports = GrammarConstants
