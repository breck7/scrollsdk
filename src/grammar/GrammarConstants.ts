// todo: change to enum?

enum GrammarConstantsCompiler {
  sub = "sub", // replacement instructions
  indentCharacter = "indentCharacter",
  listDelimiter = "listDelimiter",
  openChildren = "openChildren",
  closeChildren = "closeChildren"
}

enum GrammarConstants {
  // node types
  grammar = "grammar",
  extensions = "extensions",
  version = "version",
  name = "name",
  nodeTypeOrder = "nodeTypeOrder",
  nodeType = "nodeType",
  cellType = "cellType",
  abstract = "abstract",

  // error check time
  regex = "regex", // temporary?
  enumFromGrammar = "enumFromGrammar", // temporary?
  enum = "enum", // temporary?

  // parse time
  nodeTypes = "nodeTypes",
  cells = "cells",
  catchAllCellType = "catchAllCellType",
  catchAllNodeType = "catchAllNodeType",
  defaults = "defaults",
  constants = "constants",
  group = "group",
  any = "any",
  required = "required", // Require this nodeType to be present in a node or program
  single = "single", // Have at most 1 of these
  tags = "tags",

  // parse and interpret time
  constructors = "constructors",
  constructorNodeJs = "nodejs",
  constructorBrowser = "browser", // for browser
  constructorJavascript = "javascript", // for eval

  // compile time
  compilerNodeType = "compiler",

  // develop time
  description = "description",
  example = "example",
  frequency = "frequency",
  highlightScope = "highlightScope"
}

enum GrammarConstantsErrors {
  invalidNodeTypeError = "invalidNodeTypeError",
  invalidConstructorPathError = "invalidConstructorPathError",
  invalidWordError = "invalidWordError",
  grammarDefinitionError = "grammarDefinitionError",
  extraWordError = "extraWordError",
  unfilledColumnError = "unfilledColumnError",
  missingRequiredNodeTypeError = "missingRequiredNodeTypeError",
  nodeTypeUsedMultipleTimesError = "nodeTypeUsedMultipleTimesError"
}

export { GrammarConstants, GrammarConstantsErrors, GrammarConstantsCompiler }
