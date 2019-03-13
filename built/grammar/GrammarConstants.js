"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// todo: change to enum?
const GrammarConstants = {};
// node types
GrammarConstants.grammar = "@grammar";
GrammarConstants.keyword = "@keyword";
GrammarConstants.wordType = "@wordType";
GrammarConstants.abstract = "@abstract";
// word parsing
GrammarConstants.regex = "@regex"; // temporary?
GrammarConstants.keywordTable = "@keywordTable"; // temporary?
GrammarConstants.enum = "@enum"; // temporary?
GrammarConstants.parseWith = "@parseWith"; // temporary?
// parsing
GrammarConstants.keywords = "@keywords";
GrammarConstants.columns = "@columns";
GrammarConstants.catchAllKeyword = "@catchAllKeyword";
GrammarConstants.defaults = "@defaults";
GrammarConstants.constants = "@constants";
GrammarConstants.group = "@group";
GrammarConstants.any = "@any";
// parser/vm instantiating and executing
GrammarConstants.constructor = "@constructor";
GrammarConstants.constructorJs = "js";
// compiling
GrammarConstants.compilerKeyword = "@compiler";
GrammarConstants.compiler = {};
GrammarConstants.compiler.sub = "@sub"; // replacement instructions
GrammarConstants.compiler.indentCharacter = "@indentCharacter";
GrammarConstants.compiler.listDelimiter = "@listDelimiter";
GrammarConstants.compiler.openChildren = "@openChildren";
GrammarConstants.compiler.closeChildren = "@closeChildren";
// developing
GrammarConstants.description = "@description";
GrammarConstants.frequency = "@frequency";
// errors
GrammarConstants.invalidKeywordError = "invalidKeywordError";
GrammarConstants.invalidConstructorPathError = "invalidConstructorPathError";
exports.default = GrammarConstants;
