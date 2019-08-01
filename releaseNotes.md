36.2.0 / 2019-08-01
===================
- Breaking: builder refactor. Instead "jbuild.js" now do "builder.js".

36.1.0 / 2019-07-31
===================
- Infra: jBuild
- Infra: improved error messaging for invalid nodeType.
- Breaking: some method names changed in Project Tree Language. See that readme for details.

36.0.2 / 2019-07-30
===================
- Fix: TreeBase Disk path fix

36.0.1 / 2019-07-30
===================
- Fix: TreeBase path fix

36.0.0 / 2019-07-30
===================
- New: added TreeBase and "base" command to CLI
- New: added methods to base class: getWordsAsSet, appendWordIfMissing, addObjectsAsDelimited, setChildrenAsDelimited, convertChildrenToDelimited, addUniqueRowsToNestedDelimited, with, getBiDirectionalMaps, getSparsity
- Fix: fixed grammar concatenation bug where you might have 2 nodeTypes extending from RootNode
- Breaking: removed nodeTypeOrder property from Grammar Language. Now just uses inScope order.
- Breaking: getPrettified() is now "sortNodesByInScopeOrder().getSortedByInheritance()"
- Infra: added basic tests for treeBase and made sure treeComponent framework test getting run
- Infra: moved repo from breck7/jtree to treenotation/jtree

35.1.0 / 2019-07-25
===================
- New: printLinesFrom and printLinesWithLineNumbersFrom methods
- Fix: fix for npm install -g dependency issues

35.0.1 / 2019-07-25
===================
- Fix: fixed uncaught error when an old grammar is used with a "root" subnode
- Fix: more precise pattern matching in Grammar Language
- Fix: improved highlight scopes for Grammar Language

35.0.0 / 2019-07-24
===================
- New: "pattern" property on nodeType to support any type of "fix" notation: prefix, postfix, etc.
- New: polymorphism and symbol tables via enumFromCellTypes
- New: Grammar Language now uses suffix notation instead of prefix notation for root node types.
- New: in Grammar Language instead of `nodeType person` now do `personNode` and instead of `cellType int` do `intCell`
- New: findAllWordsWithCellType and findAllNodesWithNodeType methods in Grammar Programs which are like our versions of "findAllReferences"
- New: getAllTypedWords method in Grammar Programs
- Fix: removed all "grammarPath" 2nd params to new jtree.GrammarProgram(grammarCode, gammarPath), since it is no longer used.
- Breaking: Javascript code and compiler nodes that previously referred to cellTypes that have been renamed, must be updated manually
- Breaking: Javascript code that previously referred to nodeTypeIds that have been renamed, must be updated manually (check uses of getChildInstancesOfNodeTypeId and doesExtend)
- Breaking: lineHints string is different
- Breaking: enumFromGrammar is now enumFromCellTypes and accepts any cellTypeId
- Breaking: cellTypes that ended in "Word" now end in "Cell".
- Breaking: removed public "getFirstWordMap" method.
- Breaking: removed "updateNodeTypeIds" method. Use findAllWordsWithCellType and findAllNodesWithNodeType
- Breaking: use createParser() instead of getNodeConstructor

34.2.0 / 2019-07-21
===================
- New: compiled nodejs grammar files are now executables and accept an input filepath
- Fix: switched all hashbangs to "#! /usr/bin/env node" for better cross platform support

34.1.0 / 2019-07-19
===================
- New: root nodes can now extend other root nodes for easier grammar combinations and extensions

34.0.0 / 2019-07-16
===================
- New: the empty Grammar "" is now a valid Grammar and works properly
- New: the default catch all node for Grammar Backed Languages is now Blob Node, and not Error Node
- Fix: now the empty Grammar language returns a forgiving grammar by default.
- Fix: now an empty nodeTypeId won't break the grammar parser
- Fix: fixes for Download Bundle command
- Breaking: getConcreteAndAbstractNodeTypeDefinitions is now getValidConcreteAndAbstractNodeTypeDefinitions
- Breaking: the empty Grammar is now valid. Should not break anything but could allow for code removal.
- Breaking: removed getTheAnyLanguageRootConstructor(). Just use the empty grammar now.
- Breaking: the default catch all node is now Blob node, not error node.

33.0.2 / 2019-07-15
===================
- New: added "infer" button to Grammar Builder
- Fix: polyfill flat method
- Fix: CLI fixes
- Infra: upgrade version script

33.0.1 / 2019-07-15
===================
- Fix: changed browser target to es2016 to fix the "flat" bug in Linux Chrome

33.0.0 / 2019-07-10
===================
- Breaking: no more "constants" or "nodeTypeMap" exports in compiled. Now 1 export per grammar, of root language node. You can still access the others via that.
- Breaking: removed runTimeFirstWord methods. Now that grammars are compiled, just use normal firstWord methods.
- Breaking: removed unused getTheGrammarFilePath method
- Breaking: compile to node/browser now saves a lang named "foo" to "foo.browser.js" instead of "fooLanguage"
- Fix: prettify grammar files multiple inheritance sort fix and added regression test
- Fix: getErrorsInGrammarExamples now prints correct source line where errors occur
- Fix: fixed bug and added test where inScope was not extending correctly
- Infra: removed dead code
- Infra: compiled grammars are now much less code and rely on native JS class tree
- Infra: compiled grammar vs runtime code paths are largely merged

32.0.0 / 2019-07-07
===================
- New: getParseTable method on Grammar backed programs
- New: CLI "parse" command
- Fix: fixed blobNode and errorNode regressions
- Breaking: removed getDoc
- Breaking: no longer export BlobNode or ErrorNode
- Breaking: toFormattedTable now adds ellipsis ("...") when columns overrun limit
- Breaking: removed toNodeJsJavascriptPrettier and toBrowserJavascriptPrettier. Use compileGrammarForNodeJs and compileGrammarForBrowser w/prettier param instead.
- Infra: fixed 2.5x test speed regression and got them back down to 2s

31.0.0 / 2019-07-05
===================
- New: added "joinChildrenWith" word to compiler nodeTypes in grammar language
- New: added "dug" language which compiles to JSON
- New: improved documentation for grammar compiler nodeTypes
- New: in compiler nodes, and generated classes, you can now access the firstCellType in this.cells just like other cells
- Fix: fixed bugs in runtime extended nodeType constructor loading
- Breaking: rarely used listDelimiter compiler property in Grammar Language is now "catchAllCellDelimiter"
- Breaking: Terminal vs NonTerminal nodeTypes are now determined by duck typing. Use GrammarBackedNonRootNode in place of those now.

30.0.0 / 2019-07-03
===================
- New: much easier way to do Grammar Composition => simple concatenate strings & define a new nodeType as root!
- Breaking: removed newFromCondensed method, which became a noOp. Use new GrammarProgram(grammarCode, grammarPath) instead
- Breaking: removed "grammar" root node type in GrammarLanguage. Add a "root" property to a nodeType for the new root node.
- Breaking: instead of "{grammarName}ProgramRoot" as the root class, the root class is now just "grammarName"
- Breaking: paths to shipped language program constructors are now like "fire.js" instead of "FireProgram.js"

29.0.0 / 2019-07-02
===================
- New: doesExtend and getChildInstancesOfNodeTypeId methods on Extendible nodes
- New: GrammarUpgrader additions
- Infra: refactor of Swarm/Stamp/Project/Jibberish/Stump to be 1 file.
- Breaking: no more "constructors" node for nodeTypes or root programs.

28.0.0 / 2019-07-02
===================
- New: "match" keyword in Grammar Language to use if you have a non-alphanumeric keyword as the first word match
- New: "reservedWords" attribute on cellTypes in Grammar Language
- Breaking: removed "abstract" nodeType in Grammar Language. now its a property of nodeType
- Breaking: compileGrammar method is now compileGrammarForNodeJs and compileGrammarForBrowser
- Breaking: nodeTypeId's now can only be alphanumeric
- Breaking: nodeTypeId's are now identical to the generated Javascript class names. Some nodeTypeIds are now reserved and those now require using a "match" node
- Breaking: cellTypeId's now can only be alphanumeric
- Breaking: constants in Grammar Language alphanumeric
- Breaking: removed "group" property on abstract nodeTypes. To achieve the same affect use a build script.
- Breaking: "constructors" now no longer take a class name. The class name must be identical to nodeTypeId.

27.2.0 / 2019-06-26
===================
- New: /sandbox/build/ => refactored Tree Language IDE
- New: added "New" simple grammar language template
- New: added deep linking to /sandbox/build/
- Breaking: removed undocumented BackupConstructor feature as IDE should no longer need it
- Fix: stump compile fix

27.1.0 / 2019-06-25
===================
- New: appendNode, select, where, limit, first, last, and print methods

27.0.0 / 2019-06-23
===================
- New: simplified compile method to take 0 params
- New: refactored Fire language
- New: compilesTo property on grammar node in GrammarLanguage
- New: perf fix for compiled languages
- Fix: fire grammar fixes
- Fix: compilation open and close children fixes
- Breaking: you can now only have 1 target compilation language per grammar. If you want multiple targets just extend the grammar.
- Breaking: "sub" compiler property is now "templateString"
- Breaking: Fire experimental language changed a lot
- Breaking: for internal use only makeGraphSortFunction util function is now _makeGraphSortFunction and method signature changed

26.5.0 / 2019-06-23
===================
- New: todos in swarm
- Fix: escaping backslash fix for compiled files
- Infra: more testing of compiled code

26.4.0 / 2019-06-23
===================
- Breaking/Fix: moved getLineHints back to definition node

26.3.0 / 2019-06-23
===================
- Fix: extension bug in classes with more than 1 ancestor
- Breaking: getNodeTypeDefintions is now getConcreteAndAbstractNodeTypeDefinitions

26.2.0 / 2019-06-22
===================
- Fix: extends now works correctly
- New: added "todo" nodeType to grammar language
- New: added "extends" keyword in place of previous one line method
- Breaking: instead of "nodeType/cellType foo extendsFoo" now do "nodeType foo\n extends extendsFoo"

26.1.1 / 2019-06-21
===================
- Fix: support for mutliline strings in getConstantsObject

26.1.0 / 2019-06-21
===================
- New: restored getConstantsObject on definition nodes

26.0.2 / 2019-06-21
===================
- Fix: backtick escaping in getter generation
- Fix: migrate constants in grammar updater
- New: dump generated code for more information when something goes wrong

26.0.1 / 2019-06-21
===================
- Fix: fixed require bug

26.0.0 / 2019-06-21
===================
- Warning: this was a major refactor that may have introduced new bugs, so if using please be ready to ping me with bug reports
- New: ability to compile grammar files to Javascript
- New: grammar sandbox now has "download bundle"
- New: Upgrader class for making Tree Language upgrades easier
- New: added support for "tooling" directives in Grammar language
- New: getFirstNode method
- New: getNodeTypeId on NonRootRunTime nodes
- New: findNodes in base can now take an array of first words
- New: "nodeType javascript" property
- New: add custom javascript to rootNodeTypes in grammar files
- Breaking: stamp.js script is now stamp.cli.js
- Breaking: removed "defaults" from grammar
- Breaking: avoid getDefinition() when possible--use methods on nodes directly: getConstantsObject, getNodeTypeId, getLineHints,
- Breaking: removed getExpectedLineCellTypes--use getLineHints
- Breaking: nodeTypes in grammar is now "inScope", and is one line instead of parent/children
- Breaking: removed unused isLeafColumn, _getDuplicateLinesMap(), _getFirstWordByIndex, toFlatTree
- Breaking: fromJson is now fromJsonSubset and toJson is now toJsonSubset
- Breaking: deprecating getExpanded. Now renamed to _expandChildren and now has a 3rd parameter.
- Breaking: removed getCompiledProgramName
- Breaking: getAncestorNodeTypeNamesArray is now getAncestorNodeTypeIdsArray
- Breaking: getCatchAllCellTypeName is now getCatchAllCellTypeId
- Breaking: getRequiredCellTypeNames is now getRequiredCellTypeIds
- Breaking: getRunTimeNodeTypeNames is now getRunTimeFirstWordsInScope
- Breaking: removed getProgramErrorMessages. Use getAllErrors
- Breaking: getFirstCellType is now getFirstCellTypeId
- Breaking: getProgram() is now get getRootProgramNode and getProgram on grammar programs is getLanguageDefinitionProgram
- Breaking: getGrammarProgram is now getGrammarProgramRoot
- Breaking: getParsedWords removed
- Breaking: getCellTypeName is now getCellTypeId
- Breaking: getCellTypeDefinition is now getCellTypeDefinitionById
- Breaking: getNodeTypeDefinitionByName is now getNodeTypeDefinitionByNodeTypeId
- Breaking: getProgramErrors is now getAllErrors, getProgramErrorsIterator is now getAllErrorsIterator
- Breaking: getCompiledIndentation, getCompiledLine, getCompilerNode are now protected
- Breaking: removed "nodeType constructors javascript" in GrammarLanguage. Use "nodeType javascript" directly.
- Breaking: no more getConstantsObject. No more "constants". Instead use "nodeType > boolean|int|string|float id value...". Adds getters to generated nodeType classes.
- Breaking: in GrammarLanguage, use "stringCell" instead of "string", "intCell" instead of "int", "floatCell" instead of "float"
- Breaking: no more "ErrorNode", "BlobNode", "Terminal/NonTerminal" built in constructors. BlobNode is no longer exported. Now use "baseNodeType" to specify a base node type.
- Breaking: the nodeType name for each nodeType is now based on the nodeTypeId. It is no longer TerminalNode, NonTerminalNode, etc.
- Regex for finding breaks in untyped code: \b(defaults|getExpectedLineCellTypes|nodeTypes|isLeafColumn|_getDuplicateLinesMap|_getFirstWordByIndex|toFlatTree|fromJson|toJson|getExpanded|getCompiledProgramName|getAncestorNodeTypeNamesArray|getCatchAllCellTypeName|getRequiredCellTypeNames|getRunTimeNodeTypeNames|getProgramErrorMessages|getFirstCellType|getProgram|getGrammarProgram|getParsedWords|getCellTypeName|getCellTypeDefinition|getNodeTypeDefinitionByName|getProgramErrors|getCompiledIndentation|getCompiledLine|getCompilerNode|getProgramErrorsIterator)\b

25.2.0 / 2019-05-30
===================
- Fix: Node.js fix for _getNow and renamed to _getProcessTimeInMilliseconds
- Fix: Stump div is now no longer an inputType unless it has contenteditable

25.1.0 / 2019-05-29
===================
- New: Added BlankLineError type.
- New: Added inline syntax highlighting with error correction suggestions to grammar sandbox.
- New: Added parameters hints for nodeTypes with required cells in codeMirror
- New: enabled using backup constructors in browser to allow Grammar Sandbox without access to constructor files
- New: ErrorType messaging improvments

25.0.0 / 2019-05-28
===================
- New: standardized error messages with suggested fixes!
- New: added deleteWordAt method
- Fix: minor fixes to grammar sandbox and updated to use new error message code
- Breaking: interface of errors changed, so code that uses getErrors, getErrorsInGrammarExamples, or getProgramErrors needs to change
- Infra: refactored "types" file into "jTreeTypes"
- Infra: removed unneeded npm packages
- Infra: fixed TypeScript browser target build issues

24.2.0 / 2019-05-27
===================
- New: extraWord syntax highlighting
- New: improved syntax highlighting for Hakon, Stump, and others

24.1.0 / 2019-05-27
===================
- New: getAncestorNodeTypeNamesArray method on definition nodes
- New: getNodeTypeFamilyTree method on grammarPrograms
- New: setWords, setWordsFrom and appendWord methods on base tree

24.0.0 / 2019-05-21
===================
- New: targeting es2017
- Fix: sandbox onload fix

23.2.1 / 2019-05-21
===================
- Fix: fix for updateNodeTypeIds recursion bug

23.2.0 / 2019-05-21
===================
- New: updateNodeTypeIds method
- New: Swarm files now no longer require a root level setup node.
- Infra: added prettier config to package.json
- Breaking: in Swarm, createTestDummy is now getTestSubject
- Breaking: Swarm grammar changed. Use code below to update programs:
swarmProgram.updateNodeTypeIds(`#setup arrangeTestSubject
%%| constructWithBlockString
%| blockStringParam
=# lengthIs
=+ stringIncludes
=- stringExcludes
== stringIs
=| blockStringIs
=~ typeIs
#test test
+#test testOnly
-#test skipTest`)

23.1.0 / 2019-05-21
===================
- New: executeFiles method
- New: 50% speed improvement in getExpanded and extend and GrammarProgram.newFromCondensed
- Breaking: getGraphByKey is now getAncestorNodesByInheritanceViaExtendsKeyword
- Breaking: getGraph is now getAncestorNodesByInheritanceViaColumnIndices

23.0.1 / 2019-05-20
===================
- Fix: sublime syntax regression fix
- Fix: small lang regression fixes

23.0.0 / 2019-05-20
===================
- Breaking: highlightScope is now defined only on cellTypes (no longer on nodeTypes)
- Breaking: "any" grammar nodeType property is now "blob", and jtree.AnyNode is now jtree.BlobNode
- Breaking: grammars should all define a "cellType any" if they have leave any firstCellTypes undefined
- Breaking: getKeyword is now getFirstWord, getKeywords is getFirstWords, hasDuplicateKeywords is now hasDuplicateFirstWords, setKeyword is now setFirstWord, getKeywordPath is getFirstWordPath, pathVectorToKeywordPath is pathVectorToFirstWordPath, getKeywordMap is getFirstWordMap, keywordSort is firstWordSort
- Breaking: in grammar, keyword is nodeType, catchAllKeyword is catchAllNodeType, keywords is nodeTypes, keywordOrder is nodeTypeOrder
- Breaking: def.getId() is now def.getNodeTypeIdFromDefinition(), def.getTopNodeTypes is now def.getTopNodeTypeIds, def.getKeywordDefinitionByName is now def.getNodeTypeDefinitionByName, def.getRunTimeKeywordMap is now def.getRunTimeFirstWordMap, def.getRunTimeKeywordNames is def.getRunTimeNodeTypeNames, def.getRunTimeKeywordMapWithDefinitions is def.getRunTimeFirstWordMapWithDefinitions, def.isOrExtendsAKeywordInScope is def.isOrExtendsANodeTypeInScope, def.getKeywordInheritanceSet is def.getNodeTypeInheritanceSet, def.getSyntaxContextId is def.getSublimeSyntaxContextId
- Breaking: program.getKeywordDefinitions is program def.getNodeTypeDefinitions, program.getKeywordUsage is now getNodeTypeUsage, program.getKeywordDefinitionByKeywordPath is program.getNodeTypeDefinitionByFirstWordPath, program.getInvalidKeywords is program.getInvalidNodeTypes, program.getInPlaceSyntaxTreeWithNodeTypes is program.getInPlaceCellTypeTreeWithNodeConstructorNames, program.getInPlaceSyntaxTree is now program.getInPlaceCellTypeTree
- Breaking: in stump, findStumpNodeByKeyword is now findStumpNodeByFirstWord
- Breaking: getLineSyntax is now getLineCellTypes

22.3.0 / 2019-05-16
===================
- Breaking: instead of FireProgram.js do Fire.js Program and same for Hakon and Numbers and Project and Stump and Swarm

22.2.0 / 2019-05-16
===================
- Breaking: jtree.program is now jtree.programRoot
- Breaking: renamed root program lang nodes so things like StumpProgram now refer to the grammar generated constructor and StumpProgramRoot to the program root instance
- Breaking: instead of "index.js" files in the langs packages, we now have FireProgram.js, HakonProgram.js, ProjectProgram.js, StampProgram.js, StumpProgram.js, and SwarmProgram.js

22.1.1 / 2019-05-16
===================
- Fix: missing constant

22.1.0 / 2019-05-16
===================
- New: expand will append rather than set if a node is obviously not a map

22.0.0 / 2019-05-15
===================
- New: Hakon, Stump and Fire languages moved into this repo, monorepo style
- New: wrote grammars for Hakon and Stump
- New: getNodesByGlobPath, every, hasLine, getNodesByLine, toggleLine methods
- New: combineFiles method in node version with glob patterns
- New: compile and execute button in grammar sandbox
- New: basic browser module constructor loading in grammar sandbox
- Fix: better reset functionality in grammar sandbox
- Breaking: getChildrenByNodeType is now getChildrenByNodeConstructor
- Breaking: extend now throws if attempting to extend with a non-map. Better solution to come.
- Breaking: removed combine.js script
- Breaking: GrammarProgram.predictGrammarFile is now new UnknownGrammarProgram(input).getPredictedGrammarFile()
- Breaking: instead of title or style tags in Stump use "titleTag" or "styleTag" to overcome the inherent attribute/tag html name conflict.
- Breaking: no more @ prefix in Stump
- Breaking: for Stump collapseNode, just have it, don't set it to "true"
- Breaking: fire has been refactored a bit

21.0.0 / 2019-05-04
===================
- New: getRunTimeEnumOptions method allows for run time autocomplete and run time validation
- New: autocomplete for grammar cellTypes
- New: grammar name keyword
- New: cells property on grammar non-root runtime nodes
- New: makeGraphSort function. Also now used in grammar file prettification
- Breaking: in grammar language: wordType to cellType, columns to cells, catchAllColumn to catchAllCellType
- Breaking: removed ability in grammar files to have a wordType and keyword share the same name
- Breaking: getGraph now requires a uniqueId column. Throws if you attempt to extend a non-unique id
- Breaking: instead of "grammar grammarName" oneliner now use the grammar name keyword
- Breaking: removed parseWith cellType property
- Breaking: removed jtree.getLanguage. Instead do require('.../langs/...').
- Breaking: in grammar keywordTable now enumFromGrammar
- Fix: all word types now have default regex of [^ ]* so no need to specify it
- Fix: grammar code cleanup
- Fix: small fixes to grammar sandbox
- Infra: repo folder cleanup

20.0.0 / 2019-04-30
===================
- New: simpler grammar files (no more @ prefix)
- New: catchAllColumn grammar keyword
- New: new methods shiftLeft, shiftRight, shiftYoungerSibsRight, split
- New: new methods keywordSort, getPrettified
- New: new method getCatchAllCellTypeName
- Breaking: the "@" prefix on grammar keywords has been removed
- Breaking: for catch all columns use catchAllColumn instead of *
- Breaking: getNodeColumnTypes is now getRequiredCellTypeNames
- Breaking: autocomplete help now only gets description and does not fall back to showing required columns
- Breaking: removed getNodeColumnRegexes method

19.5.1 / 2019-04-26
===================
- Fix: codeMirror autocomplete will now close if 1 option matching input text
- Fix: fixed 0 autocomplete results when at position 0,0 on a blank line
- Fix: fixed codeMirror bug in long documents

19.5.0 / 2019-04-25
===================
- New: @example keyword in grammar
- New: getErrorsInGrammarExamples method on GrammarProgram

19.4.0 / 2019-04-24
===================
- New: getKeywordInheritanceSet method

19.3.2 / 2019-04-23
===================
- Fix: better error handling for incomplete grammars

19.3.1 / 2019-04-22
===================
- Fix: grammar checking of grammar files now only checks constructors if in correct env

19.3.0 / 2019-04-22
===================
- New: autocomplete for words beyond keywords
- New: new base methods nodeAtLine, getNodeInScopeAtCharIndex, getWordIndexAtCharacterIndex, getWordProperties, getWordBoundaryIndices,   getAllWordBoundaryCoordinates
- New: on runtime programs: getAutocompleteWordsAt and getAllSuggestions
- New: getAutocompleteResults now provides descriptions, if present, along with completion word
- Fix: error highlight scope fixes
- Breaking: instead of getAutocompleteWords use getAutocompleteWordsAt

19.2.1 / 2019-04-20
===================
- Fix: grammar sandbox bug on first visit

19.2.0 / 2019-04-20
===================
- New: @highlightScope is now an enum for better checking and autocomplete
- New: CodeMirror now uses @highlightScope for styles.
- Fix: we sort @enum options to now match largest hit first
- Fix: fixed cache bug in @keywordTable
- Breaking: CodeMirror now uses @highlightScope for styles so colors may have changed.

19.1.0 / 2019-04-20
===================
- New: custom constructors can now specify a "." nested path to the JS constructor
- New: added error printing in Grammar sandbox

19.0.0 / 2019-04-19
===================
- New: CodeMirror support
- New: Tree Language Sandbox webpage using CodeMirror
- New: in Grammar files we now have support for different constructors for node and browser environments
- Breaking: in grammar files @constructor is now @constructors. Browser and nodejs constructors must be specified separately.

18.2.0 / 2019-04-11
===================
- New: very basic toYaml method

18.1.3 / 2019-03-26
===================
- New: more TypeScript typings

18.1.2 / 2019-03-25
===================
- New: more TypeScript typings

18.1.1 / 2019-03-25
===================
- Fix: added "types" field to package.json

18.1.0 / 2019-03-25
===================
- New: now with d.ts files

18.0.0 / 2019-03-24
===================
- New: basic .sublime-syntax file generation works. Scopes not yet integrated.
- New: added gen command to cli.js for generating syntax files
- New: added @highlightScope property to @keyword and @wordType in grammar language
- New: added @required feature to grammar with appropriate error messages
- New: added @single feature to grammar with appropriate error messages
- New: added @tags feature to grammar
- Breaking: @wordType > @regex with `.?` should now be `.*`
- Breaking: in @wordType > @regex now all @regex are enclosed by ^$ automatically
- Breaking: AbstractGrammarDefinitionNode: getDefinitionByName is now getKeywordDefinitionByName
- Breaking: _isOrExtendsAKeywordInScope is now isOrExtendsAKeywordInScope

17.1.3 / 2019-03-14
===================
- Fix: added support for constructors with nested paths in grammar languages in browser

17.1.2 / 2019-03-14
===================
- Fix: added support for spaces in filenames in langs-project

17.1.1 / 2019-03-13
===================
- Fix: circular array check false positives when creating tree from Javascript object.

17.1.0 / 2019-03-13
===================
- Breaking: getCatchAllNodeClass is now getCatchAllNodeConstructor
- Breaking: getRunTimeCatchAllNodeClass is now getRunTimeCatchAllNodeConstructor
- Fix: catchAllKeywords can now instantiate a custom class
- New: checking a grammar programmatically now throws an error a constructor path in a grammar file does not exist
- Infra: added tap-mocha-reporter for clearer test run output

17.0.0 / 2019-03-11
===================
- Breaking: In TreeNode, parseNodeType is now getNodeConstructor
- Breaking: jtree.getParser is now jtree.getProgramConstructor
- Breaking: In .grammar files @parser is now @constructor
- Breaking: In grammar JS getParserClass is now getDefinedConstructor
- Breaking: In grammar JS getRootParserClass is now getRootConstructor
- New: moved BrowserScript and swarm, project and stamp languages into this project to avoid circular dependencies
- New: (temporary) getLanguage method for accessing included languages
- New: error message when you have an inheritance loop in grammar file
- Fix: line number error message regression fix
- Infra: minor CLI app refactor

16.0.1 / 2019-03-03
===================
- Fix: minor migration fix

16.0.0 / 2019-03-03
===================
- Infra: migrated to TypeScript

15.3.0 / 2019-03-01
===================
- New: for convenience added map, forEach, filter, find and slice methods aliasing getChildren().map ...
- New: sortByColumns method
- New: predictGrammarFile method
- New: getInvalidKeywords method
- New: @abstract keyword in grammars
- New: @any keyword in grammars
- New: any, bit, bool, float, int default word types
- New: toDisk method in node.js version
- New: getOneHot method
- New: deleteColumn method
- New: getColumnNames method
- New: isBlankLine method
- New: isEmpty method
- New: deleteChildren method
- New: deleteDuplicates method
- New: deleteBlanks method
- New: getNodesByRegex method
- New: fromShape method
- New: getFiltered method
- New: added sample of iris dataset to static TreeNode for handy testing and exploring
- Fix: renameAll fix
- Breaking: getExpanded - if multiple parent nodes match, getExpanded will extend node with matching keyword
- Breaking: getProgramErrors() is now getProgramErrorMessages(). getProgramErrors() now returns err objects
- Infra: makeRandomTree method & updates to perf test pages
- Infra: Default sandbox port now 3333

15.2.0 / 2019-02-10
===================
- New: added getNumberOfLines() method
- Perf: GrammarProgram speedup 20%+
- Perf: getProgramErrors speedup 10x+
- Perf: toString speedup 5%+

15.1.0 / 2019-02-10
===================
- Perf: 10x+ faster typechecking of "any" nodes
- Perf: 60% faster typechecking of other types
- Perf: 50% faster parsing for large trees
- Infra: sandbox cleanup
- New: added getProgramErrorsIterator() method
- New: experimental _getSyntaxTreeHtml() method

15.0.2 / 2019-02-07
===================
- Fix: setChildren wasn't clearing cache
- Fix: findNodes wasn't recursing

15.0.1 / 2019-01-02
===================
- Fix: Chrome wasn't always monotonically increasing perf.now due to precision

15.0.0 / 2018-12-01
===================
- New: added toDataTable and fromDataTable methods
- New: added getSlice method
- New: added set method (to revert to original get/set behavior)
- Breaking: renamed findBeam to get
- Breaking: renamed getBeam to getContent
- Breaking: renamed getBeams to getContentsArray
- Breaking: removed undocumented getRest method
- Infra: renamed "garden" to "sandbox" for clarity
- Infra: moved "papers" to one folder

14.6.0 / 2018-09-23
===================
- Fix: Fix for browsers removing monotonically increasing perf.now
- New: getChildren() now returns a copy of array enabling in loop deletes

14.5.1 / 2017-11-24
===================
- Infra: removed dead code

14.5.0 / 2017-11-23
===================
- New: standardized error messages into a grammar
- New: @parseWith wordType property

14.4.0 / 2017-11-19
===================
- New: added @enum wordType

14.3.3 / 2017-11-17
===================
- New: added toMarkdownTable methods

14.3.2 / 2017-11-16
===================
- New: getNodesByLinePrefixes method

14.3.1 / 2017-11-14
===================
- New: cases cli command

14.3.0 / 2017-11-13
===================
- New: added macroExpand method
- New: hasWord method

14.2.0 / 2017-11-12
===================
- New: added @version keyword to grammar
- Infra: renamed TreeGrammar.grammar to grammar.grammar
- Infra: removed ohayo constants

14.1.0 / 2017-11-11
===================
- New: split check into check and checkAll commands
- New: compile cli command can now take a target extension

14.0.1 / 2017-11-11
===================
- Infra: Moved dependencies to devDependencies

14.0.0 / 2017-11-10
===================
- Breaking: renamed otree to jtree

13.0.0 / 2017-11-09
===================
- Breaking: Tree Grammar switched to @wordType nodes for defining word types, no more implicit types
- Breaking: replaceNode now returns an array

12.2.1 / 2017-11-09
===================
- Fix: bug fix in getExpanded

12.2.0 / 2017-11-09
===================
- New: insertWord method
- Fix: fixes to usage reports
- Breaking: renamed getBeamParameters to getNodeColumnTypes

12.1.0 / 2017-11-09
===================
- Breaking: getWordTypeLine is now getLineSyntax
- Breaking: getProgramWordTypeString is now getInPlaceSyntaxTree
- New: getTreeWithNodeTypes and getInPlaceSyntaxTreeWithNodeTypes methods for inspecting the parse

12.0.0 / 2017-11-09
===================
- Breaking: grammar file grammar change, first node should be @grammar, keywords should be @keyword
- Breaking: getGraph now takes 2 params, use getGraph(0, 1) for previous behavior
- Breaking: getExpanded now takes 2 params, use getExpanded(0, 1) for previous behavior
- New: getNodeByColumn method

11.5.0 / 2017-11-08
===================
- New: appendLine method
- New: insertLine method
- Breaking: append is now appendLineAndChildren
- Breaking: insert is now insertLineAndChildren
- Breaking: prepend is now prependLine and takes only 1 param
- Breaking: copyTo now requires second arg
- Breaking: toOutline now takes 0 args. use toMappedOutline to pass a mapping fn
- Breaking: fromCsv, fromSsv, fromTsv no longer take optional hasHeaders param. Use new fromDelimitedNoHeaders
- Breaking: fromDelimited now requires quoteChar param
- Breaking: toTable now accepts 0 params, use toFormattedTable to pass params
- Breaking: getPoint now takes no params, use getPointRelativeTo; getPathVector => getPathVectorRelativeTo
- Breaking: getKeywordPath now takes no params, use getKeywordPathRelativeTo
- Breaking: getStack, getRootNode now take no params
- Breaking: getWords now takes 0 params. use getWordsFrom
- Breaking: use getGraphByKey to getGraphByKey

11.4.1 / 2017-11-08
===================
- New: export GrammarProgram

11.4.0 / 2017-11-08
===================
- Breaking: getGrammarUsage is now getKeywordUsage
- Breaking: removed undocumented getNodeClasses, run, and getErrorCount methods

11.3.0 / 2017-11-07
===================
- New: added support for putting multiple parse nodes in one file

11.2.3 / 2017-11-06
===================
- Infra: TestCoverage 90.44% Smt 2137/2363 72.32% Brnch 384/531 85.37% Fn 496/581 91.89% Loc 2017/2195

11.2.2 / 2017-11-06
===================
- Infra: updated ProjectLang

11.2.1 / 2017-11-06
===================
- Fix: path fixes

11.2.0 / 2017-11-06
===================
- Breaking: otree.getProgramClassFromGrammarFile is now otree.getParser
- Breaking: otree.AbstractGrammarBackedProgram is now otree.program

11.1.0 / 2017-11-06
===================
- Fix: path and other fixes from otree move

11.0.0 / 2017-11-06
===================
- Breaking: renamed TreeProgram to otree

10.1.2 / 2017-11-06
===================
- Infra: rearranged code into base node and grammar backed folders

10.1.1 / 2017-11-05
===================
- New: started Tree Garden web console
- Fix: Fixed create command line tool

10.1.0 / 2017-11-04
===================
- Fix: parsing top level program class fix
- Fix: getNodeByColumns now works when search and target have different # of columns
- Infra: started tests for console, static, and grammar classes

10.0.1 / 2017-11-03
===================
- Fix: static method path bug fixes

10.0.0 / 2017-11-03
===================
- New: getNodeByColumns method
- Breaking: grammar file is now primary file, use static getProgramClassFromGrammarFile method to create a VM/compiler
- Breaking: languages.tree => grammars.tree
- Breaking: grammars.tree now points to grammar files, not index files

9.2.0 / 2017-11-03
==================
- Breaking: TreeProgram.getGrammarErrors => TreeProgram.Tools.getGrammarErrors
- Breaking: TreeProgram.executeFile => TreeProgram.Tools.executeFile
- Infra: cleanup for making grammar files source of truth

9.1.0 / 2017-11-02
==================
- New: refactored Tree Grammar to support compiler-compilers and vms in languages other than ES6
- Breaking: "@parseClass" => "@constructor js"
- Fix: @ char is now acceptable in filepaths

9.0.0 / 2017-11-02
==================
- New: support for multiple compile targets
- New: CLI history command can show all history
- New: CLI check command now alternately accepts a language extension to check a collection
- Breaking: @targetExtension => @compiler, @compiled => @sub, @compiledIndentCharacter => @indentCharacter
- Breaking: @sub, @indentCharacter, @listDelimiter, @openChildren, @closeChildren moved under @compiler
- Breaking: compile method now requires a target extension
- Infra: renamed slot types to columnTypes and better error messaging for when graph expansion fails

8.6.0 / 2017-10-30
==================
- Breaking: renamed @parameters to @columns in Grammar Tree Language

8.5.0 / 2017-10-30
==================
- New usage command line tool
- New getGrammarUsage method

8.4.1 / 2017-10-28
==================
- Fix: init the languages and history file on cli first use
- Infra: added a tiny bit of documentation to readme

8.4.0 / 2017-10-28
==================
- New: added getNodeClasses method to TreeProgram to support multiple node classes in 1 file

8.3.1 / 2017-10-28
==================
- Fix: expose TerminalNode and NonTerminalNode in browser distribution

8.3.0 / 2017-10-27
==================
- New: replaceNode method
- New: getSiblings, getYoungerSiblings, getOlderSiblings methods

8.2.3 / 2017-10-27
==================
- New: export TreeTerminalNode class
- Infra: minor cleanup of cli app

8.2.2 / 2017-10-26
==================
- Infra: recursive dependency fix and console code cleanup

8.2.1 / 2017-10-26
==================
- New: support absolute paths in grammar files

8.2.0 / 2017-10-26
==================
- New: export TreeNonTerminalNode class
- New: support for relative paths in grammar files

8.1.0 / 2017-10-25
==================
- Breaking: renamed fixedWidthTable method to toTable and changed default to left aligned.

8.0.1 / 2017-10-15
==================
- Fix: fixed browser version

8.0.0 / 2017-10-15
==================
- New: Create new Tree Languages using a tree grammar file
- New: Tree Console app
- Breaking: ImmutableNode no longer exposed on TreeProgram

7.2.0 / 2017-10-14
==================
- Breaking: for use in browser, now use treeprogram.browser.js instead of treeprogram.js
- Infra: prep work for grammar and blaze library merger -- consoleApp and src directory

7.1.1 / 2017-9-17
=================
- New: getErrors and getWordTypeLine methods
- Fix: fix for executeFile static method when more than one #! line.

7.1.0 / 2017-9-15
=================
- Breaking; Symbol is now Keyword throughout. Same changes at 7.0.0, except substitute keyword for symbol.

7.0.0 / 2017-9-14
=================
- Breaking: getNodeTypes is now getSymbolMap
- Breaking: getDefaultNodeType is now getCatchAllNodeClass
- Breaking: getBase is now getSymbol
- Breaking: getBasePath is now getSymbolPath
- Breaking: getBases is now getSymbols
- Breaking: pathVectorToBasePath is now pathVectorToSymbolPath
- Breaking: setBase is now setSymbol

6.1.3 / 2017-9-8
================
- New: added executeSync method
- Docs: removed outdated ETNs
- Infra: switched to Tap from Tape to get code coverage working again with nyc

6.1.2 / 2017-9-6
================
- Fix: bug fix in getCMTime

6.1.1 / 2017-8-27
=================
- New: added getExpanded method

6.1.0 / 2017-8-25
=================
- New: added getDefaultNodeType and getNodeTypes methods
- New: added default compile method
- Fix: updated outdated code in readme

6.0.0 / 2017-8-24
=================
- Breaking: Renamed TreeNotation to TreeProgram.
- Breaking: github is now at breck7/treeprogram
- Breaking: npm install treenotation is now npm install treeprogram
- Fix: fixed timing bug in getTreeMTime

5.7.0 / 2017-8-24
=================
- New: getWord can now take a negative int
- New: added static method executeFile and cli.js

5.6.2 / 2017-8-20
=================
- Fix: child nodes can now inspect their parent's line at parse time to enable dependent types

5.6.1 / 2017-8-20
=================
- Fix: stale index when using setLine or setBase methods

5.6.0 / 2017-8-18
=================
- Breaking: base execute now returns a Promise.all that resolves when all children have resolves
- Added getIndentation method

5.5.0 / 2017-8-8
================
- Added getTreeMTime method

5.4.0 / 2017-8-8
================
- Breaking: getMTime now always returns a number (previously it could return undefined). Initializes lazily on first call.

5.3.0 / 2017-8-3
================
- Added nest static method

5.2.0 / 2017-8-1
================
- Added getInheritanceTree method

5.1.0 / 2017-7-25
=================
- Added "relativeTo" parameter to: getPoint, isRoot, getRootNode, getStack, getStackString, getBasePath, getPathVector

5.0.1 / 2017-7-24
=================
- Bug fix: getBasePath works

5.0.0 / 2017-7-24
=================
- Breaking: getWI is now getZI for consistency with X,Y,Z convention.
- Breaking: getHead is now getBase
- Breaking: setHead is now setBase
- Breaking: pathVectorToPathName is now pathVectorToBasePath
- Breaking: getPathName is now getBasePath
- Breaking: getTail is now getBeam
- Breaking: setTail is now setBeam
- Breaking: findTail is now findBeam
- Breaking: pushTailAndChildren is now pushBeamAndChildren
- Breaking: getTailWithChildren is now getBeamWithChildren
- Breaking: setTailWithChildren is now setBeamWithChildren
- Breaking: getTails is now getBeams

4.1.2 / 2017-6-26
=================
- Added setWord method

4.1.1 / 2017-6-26
=================
- Bug fix in getPoint method

4.1.0 / 2017-6-20
=================
- Breaking: removed toJavascript method on base class.

4.0.3 / 2017-6-20
=================
- Reverted last.

4.0.2 / 2017-6-20
=================
- Fix so Hakon works in browser

4.0.1 / 2017-6-20
=================
- Added HTML, CSS and Unit Testing ETNs (I named them Bray, Hakon, and Wall).

4.0.0 / 2017-6-18
=================
- Breaking: removed _getSize if any ETNs were using that
- Breaking: changes some output classes in toHtml() method
- getWords() now takes an optional starting WI location
- Final version of paper, mistakes and all.

3.10.0 / 2017-6-17
==================
- Breaking: getAncestorNodes is now getStack
- Added getStackString method

3.9.2 / 2017-6-17
=================
- getGraph method now also takes 0 params, in which case it uses word1.

3.9.1 / 2017-6-17
=================
- Added getGraph method

3.9.0 / 2017-6-16
=================
- Breaking: Removed TreeNode.ExecutableTreeNode. TreeNotation now has execute method by default.
- Breaking: getWord now ignores getSize. In fact, we'll probably ditch getSize.

3.8.0 / 2017-6-15
=================
- toOutline now takes an optional mapping fn

3.7.4 / 2017-6-15
=================
- setTailWithChildren Regression fix.

3.7.3 / 2017-6-15
=================
- Fix for closure compiler

3.7.2 / 2017-6-15
=================
- setChildren regression fix

3.7.1 / 2017-6-15
=================
- ETN parsing regression fix

3.7.0 / 2017-6-15
=================
- Breaking: expose TreeNotation now and not TreeNode
- Breaking: TreeNode.ExecutableTreeNode is now TreeNotation.ExecutableETN
- Breaking: TreeNotation.ImmutableTreeNode is now TreeNotation.ImmutableNode
- Fixed regression introduced in 3.6 in ETN parsing in parseString method
- Updated readme with an ETN example

3.6.0 / 2017-6-15
=================
- Breaking: parseNode is now parseNodeType and only takes a line param.
- Breaking: getMTime() now returns undefined if the node hasn't been modified.
- Added more laziness to get a ~2.5x improvement in parse time. Parses about ~1M loc of basic TN a sec on test machine

3.5.3 / 2017-6-14
=================
- Added getChildrenByNodeType method
- Expose a simple ExecutableTreeNode class
- Fixed bug when initiating from an ETN

3.5.2 / 2017-6-13
=================
- Added getNext and getPrevious methods

3.5.1 / 2017-6-13
=================
- Added getPoint method

3.5.0 / 2017-6-9
================
- Breaking: changed parseNode method to just return the new node class.

3.4.0 / 2017-6-6
================
- Breaking: removed reload method

3.3.0 / 2017-6-5
================
- Breaking: in the toHtml() method, the child nodes div now has class nodeChildren instead of nodeTree
- Breaking: pushTailAndTree is now pushTailAndChildren

3.2.1 / 2017-6-5
================
- Added getMTime method

3.2.0 / 2017-6-5
================
- Breaking: removed moveTo method. Use the new copyTo method follow by destroy.
- Breaking: destroy no longer returns the detached node.
- Experimental: expose ImmutableTreeNode
- Improvements to _parseNode(), increased test coverage, and reduced test code size

3.1.1 / 2017-6-2
================
- Regression fix in extend method

3.1.0 / 2017-6-1
================
- Breaking: removed every() method
- Added getTopDownArray (preorder), getChildrenFirstArray (postorder), getParentFirstArray(breadth first) methods

3.0.1 / 2017-5-30
=================
- Added findTail method

3.0.0 / 2017-5-30
=================
- Breaking: merged all subclasses into one TreeNode class.
- Breaking: getNodes is now getChildren
- Breaking: setName > setHead, setValue > setTail, getName > getHead, getValue > getTail
- Breaking: getNames > getHeads, getValues > getTails, setValue > setTail
- Breaking: removed seed methods
- Breaking: removed findTrees and findValues methods
- Breaking: removed tree next and prev methods
- Breaking: removed tree setText...do tree.touchNode().setTailWithChildren(text)
- Breaking: removed tree setTree...do tree.touchNode().setChildren()
- Breaking: removed tree setTail...do tree.touchNode().setTail()
- Breaking: removed tree getTail...do tree.getNode(path).getTail()
- Breaking: removed tree getTree...do tree.getNode(path).getTree()
- Breaking: removed tree getText...do tree.getNode(path).getText()
- Breaking: node setTree is now node setChildren
- Breaking: append now takes only 2 params, line and tree.
- Breaking: appendLine is now just append
- Breaking: getAncestorTrees is now getAncestorNodes
- Breaking: getText now getTailWithChildren
- Breaking: removed getTrees method.
- Breaking: removed tree clear method.
- Breaking: removed node initTree
- Breaking: removed treeAt method
- Breaking: insert now takes line and not head and tail params
- Breaking: pushValue is now pushTailAndTree
- Breaking: prepend method now takes line and not head and tail params
- Added insertNode public method
- Bug fix: toString no longer returns an empty line after you delete last node in a nested tree

2.3.0 / 2017-5-9
================
- Breaking: created abstract classes and language classes. PairTree = require("treenotation").PairTreeLanguage.PairTree
- Breaking: fromCsv and other from methods are now static methods on PairTreeLanguage, not PairTree.

2.2.4 / 2017-4-28
=================
- Dist npm fix

2.2.3 / 2017-4-28
=================
- Started using Prettier
- Swapped out Browserfy in favor of simple express router transform flow
- Created tasks folder in place of npm scripts
- Code cleanup: turned helper methods into statics

2.2.2 / 2017-4-17
=================
- Added getAncestorTrees method to node.

2.2.1 / 2017-4-17
=================
- Added getRootTree method to node.

2.2.0 / 2017-4-17
=================
- Breaking: extend method on PairTree is now recursive.

2.1.1 / 2017-4-16
=================
- Bug fix: fixed uncaught error when parsing malformed delimited input

2.1.0 / 2017-4-13
=================
- Breaking: in base and pair, values are now converted to strings. Use a higher level language to preserve types.

2.0.3 / 2017-4-05
=================
- Added prepublish hook

2.0.2 / 2017-4-05
=================
- Bug fix in node.setTree method

2.0.1 / 2017-4-05
=================
- NPM bundle fix

2.0.0 / 2017-4-05
=================
- Made TreeNotation the root namespace and separated PairTree out as a sublanguage
- Breaking: new Tree() now needs to be new TreeNotation.PairTree() or just add a Tree = TreeNotation.PairTree
- Breaking: node.getPath is now node.getPathName
- Brecking: indexPathToNamePath is now pathVectorToPathName
- Breaking: node.getNodeParentTree is now node.getParentTree
- Breaking: tree.push is now tree.pushValue
- Breaking: removed tree.toggleValue
- Breaking: tree.toFixedWidth is now tree.toFixedWidthTable
- Breaking: node.getIndexPath is now node.getPathVector
- Breaking: removed tree.deleteNodeAt
- Breaking: tree.getTrees() no longer accepts a parameter.
- Breaking: tree.getValues() no longer accepts a parameter.
- Breaking: in html returned from tree.toHtml(), data-path is now data-pathVector
- Breaking: fromDelimiter is now fromDelimited
- Removed gulp devDependency. Switched to browserify.

1.2.2 / 2017-4-02
=================
- Removed package.tree and fixed gulp version update script

1.2.1 / 2017-3-31
=================
- Breaking: append, insert, prepend, push, and shift now return the new Tree Nodes.

1.1.1 / 2017-3-26
=================
- Breaking: Removed each method

1.0.7 / 2017-3-25
=================
- Added moveTo method on TreeNode

1.0.6 / 2017-3-19
=================
- Added isTerminal, fromSeed, seedToTree, invert, remap, and toSeed methods

1.0.5 / 2017-3-17
=================
- Version number generator fix.

1.0.4 / 2017-3-17
=================
- Bug fix in node.setFromText

1.0.3 / 2017-3-15
=================
- Added extend method

1.0.2 / 2017-3-02
=================
- Initial release
