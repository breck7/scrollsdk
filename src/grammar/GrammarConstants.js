const GrammarConstants = {}

// parsing
GrammarConstants.keywords = "@keywords"
GrammarConstants.columns = "@columns"
GrammarConstants.catchAllKeyword = "@catchAllKeyword"
GrammarConstants.defaults = "@defaults"
GrammarConstants.constants = "@constants"

// virtual machines instantiating and executing
GrammarConstants.parseClass = "@parseClass" // todo: make a map to support different cc and vms
// @machines js

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
