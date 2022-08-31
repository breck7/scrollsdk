#! /usr/bin/env node
{
  const { jtree } = require("../index.js")

  class grammarNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        catchAllErrorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { todo: todoNode, tooling: toolingNode }),
        [{ regex: /^[a-zA-Z0-9_]+Cell$/, nodeConstructor: cellTypeDefinitionNode }, { regex: /^[a-zA-Z0-9_]+Node$/, nodeConstructor: nodeTypeDefinitionNode }]
      )
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang grammar
todo Add imports nodeTypes, along with source maps, so we can correctly support grammars split across multiple files, and better enable grammars from compositions of reusable bits?
todo Do error checking for if you have a firstwordCellType, cells, and/or catchAllCellType with same name.
todo Add enumOption root level type?
todo compile cells. add javascript property. move getRunTimeEnumOptions to cells.
abstractConstantCell
 highlightScope entity.name.tag
javascriptSafeAlphaNumericIdentifierCell
 regex [a-zA-Z0-9_]+
 reservedWords enum extends function static if while export return class for default require var let const new
anyCell
baseNodeTypesCell
 description There are a few classes of special nodeTypes. BlobNodes don't have their children parsed. Error nodes always report an error.
 todo Remove?
 enum blobNode errorNode
 highlightScope variable.parameter
boolCell
 enum true false
 highlightScope constant.numeric
cellParserCell
 enum prefix postfix omnifix
 highlightScope constant.numeric
cellPropertyNameCell
 highlightScope variable.parameter
cellTypeIdCell
 examples intCell keywordCell someCustomCell
 extends javascriptSafeAlphaNumericIdentifierCell
 enumFromCellTypes cellTypeIdCell
 highlightScope storage
constantIdentifierCell
 examples someId myVar
 todo Extend javascriptSafeAlphaNumericIdentifier
 regex [a-zA-Z]\\w+
 highlightScope constant.other
 description A word that can be assigned to the node class in the target language.
constructorFilePathCell
enumOptionCell
 todo Add an enumOption top level type, so we can add data to an enum option such as a description.
 highlightScope string
cellExampleCell
 description Holds an example for a cell with a wide range of options.
 highlightScope string
extraCell
 highlightScope invalid
fileExtensionCell
 examples js txt doc exe
 regex [a-zA-Z0-9]+
 highlightScope string
numericCell
 description A float or an int.
 highlightScope constant.numeric
floatCell
 regex \\-?[0-9]*\\.?[0-9]*
 highlightScope constant.numeric
intCell
 regex \\-?[0-9]+
 highlightScope constant.numeric
javascriptCodeCell
lowercaseCell
 regex [a-z]+
nodeTypeIdCell
 examples commentNode addNode
 description This doubles as the class name in Javascript. If this begins with \`abstract\`, then the node type will be considered an abstract nodeType, which cannot be used by itself but provides common functionality to nodeTypes that extend it.
 highlightScope variable.parameter
 extends javascriptSafeAlphaNumericIdentifierCell
 enumFromCellTypes nodeTypeIdCell
propertyKeywordCell
 highlightScope constant.language
regexCell
 highlightScope string.regexp
reservedWordCell
 description A word that a cell cannot contain.
 highlightScope string
scopeNameCell
 enum comment comment.block comment.block.documentation comment.line constant constant.character.escape constant.language constant.numeric constant.numeric.complex constant.numeric.complex.imaginary constant.numeric.complex.real constant.numeric.float constant.numeric.float.binary constant.numeric.float.decimal constant.numeric.float.hexadecimal constant.numeric.float.octal constant.numeric.float.other constant.numeric.integer constant.numeric.integer.binary constant.numeric.integer.decimal constant.numeric.integer.hexadecimal constant.numeric.integer.octal constant.numeric.integer.other constant.other constant.other.placeholder entity entity.name entity.name.class entity.name.class.forward-decl entity.name.constant entity.name.enum entity.name.function entity.name.function.constructor entity.name.function.destructor entity.name.impl entity.name.interface entity.name.label entity.name.namespace entity.name.section entity.name.struct entity.name.tag entity.name.trait entity.name.type entity.name.union entity.other.attribute-name entity.other.inherited-class invalid invalid.deprecated invalid.illegal keyword keyword.control keyword.control.conditional keyword.control.import keyword.declaration keyword.operator keyword.operator.arithmetic keyword.operator.assignment keyword.operator.bitwise keyword.operator.logical keyword.operator.word keyword.other markup markup.bold markup.deleted markup.heading markup.inserted markup.italic markup.list.numbered markup.list.unnumbered markup.other markup.quote markup.raw.block markup.raw.inline markup.underline markup.underline.link meta meta.annotation meta.annotation.identifier meta.annotation.parameters meta.block meta.braces meta.brackets meta.class meta.enum meta.function meta.function-call meta.function.parameters meta.function.return-type meta.generic meta.group meta.impl meta.interface meta.interpolation meta.namespace meta.paragraph meta.parens meta.path meta.preprocessor meta.string meta.struct meta.tag meta.toc-list meta.trait meta.type meta.union punctuation punctuation.accessor punctuation.definition.annotation punctuation.definition.comment punctuation.definition.generic.begin punctuation.definition.generic.end punctuation.definition.keyword punctuation.definition.string.begin punctuation.definition.string.end punctuation.definition.variable punctuation.section.block.begin punctuation.section.block.end punctuation.section.braces.begin punctuation.section.braces.end punctuation.section.brackets.begin punctuation.section.brackets.end punctuation.section.group.begin punctuation.section.group.end punctuation.section.interpolation.begin punctuation.section.interpolation.end punctuation.section.parens.begin punctuation.section.parens.end punctuation.separator punctuation.separator.continuation punctuation.terminator source source.language-suffix.embedded storage storage.modifier storage.type storage.type keyword.declaration.type storage.type.class keyword.declaration.class storage.type.enum keyword.declaration.enum storage.type.function keyword.declaration.function storage.type.impl keyword.declaration.impl storage.type.interface keyword.declaration.interface storage.type.struct keyword.declaration.struct storage.type.trait keyword.declaration.trait storage.type.union keyword.declaration.union string string.quoted.double string.quoted.other string.quoted.single string.quoted.triple string.regexp string.unquoted support support.class support.constant support.function support.module support.type text text.html text.xml variable variable.annotation variable.function variable.language variable.other variable.other.constant variable.other.member variable.other.readwrite variable.parameter
 highlightScope string
scriptUrlCell
semanticVersionCell
 examples 1.0.0 2.2.1
 regex [0-9]+\\.[0-9]+\\.[0-9]+
 highlightScope constant.numeric
stringCell
 highlightScope string
 examples lorem ipsum
tagCell
 highlightScope string
todoCell
 highlightScope comment
toolingDirectiveCell
 highlightScope comment
wordCell
 regex [a-zA-Z]+
 highlightScope variable.parameter
exampleAnyCell
 examples lorem ipsem
 todo Eventually we want to be able to parse correctly the examples.
 highlightScope comment
 extends stringCell
grammarNode
 root
 description Grammar is a Tree Language for creating new Tree Languages. By creating a grammar file you get a parser, a type checker, syntax highlighting, autocomplete, a compiler, and virtual machine for executing your new language. Grammar uses both postfix and prefix language features.
 catchAllNodeType catchAllErrorNode
 extensions grammar gram
 example A grammar that parses anything:
  latinNode
   root
   catchAllNodeType anyNode
  anyNode
   baseNodeType blobNode
 version 3.0.0
 inScope toolingNode todoNode cellTypeDefinitionNode nodeTypeDefinitionNode
abstractCompilerRuleNode
 catchAllCellType anyCell
 cells propertyKeywordCell
closeChildrenNode
 extends abstractCompilerRuleNode
 description When compiling a parent node to a string, this string is appended to the compiled and joined children. Default is blank.
 cruxFromId
indentCharacterNode
 extends abstractCompilerRuleNode
 description You can change the indent character for compiled children. Default is a space.
 cruxFromId
catchAllCellDelimiterNode
 description If a node has a catchAllCell, this is the string delimiter that will be used to join those cells. Default is comma.
 extends abstractCompilerRuleNode
 cruxFromId
openChildrenNode
 extends abstractCompilerRuleNode
 description When compiling a parent node to a string, this string is prepended to the compiled and joined children. Default is blank.
 cruxFromId
stringTemplateNode
 extends abstractCompilerRuleNode
 description This template string is used to compile this line, and accepts strings of the format: const var = {someCellId}
 cruxFromId
joinChildrenWithNode
 description When compiling a parent node to a string, child nodes are compiled to strings and joined by this character. Default is a newline.
 extends abstractCompilerRuleNode
 cruxFromId
abstractConstantNode
 description Assign a constant to a nodeType which will be available in the compiled nodeType classes.
 cells propertyKeywordCell
 cruxFromId
booleanNode
 cells propertyKeywordCell constantIdentifierCell
 catchAllCellType boolCell
 extends abstractConstantNode
floatNode
 cells propertyKeywordCell constantIdentifierCell
 catchAllCellType floatCell
 extends abstractConstantNode
intNode
 cells propertyKeywordCell constantIdentifierCell
 catchAllCellType intCell
 extends abstractConstantNode
stringNode
 cells propertyKeywordCell constantIdentifierCell
 catchAllCellType stringCell
 catchAllNodeType catchAllMultilineStringConstantNode
 extends abstractConstantNode
abstractNodeTypeRuleNode
 single
 cells propertyKeywordCell
compilesToNode
 cells propertyKeywordCell fileExtensionCell
 extends abstractNodeTypeRuleNode
 description Optionally specify a file extension that will be used when compiling your language to a file. Generally used on nodeTypes marked root.
 cruxFromId
extensionsNode
 extends abstractNodeTypeRuleNode
 catchAllCellType fileExtensionCell
 description File extensions of your language. Generally used for nodeTypes marked "root". Sometimes your language might have multiple extensions. If you don't add this, the root node's nodeTypeId will be used as the default file extension.
 cruxFromId
versionNode
 cells propertyKeywordCell semanticVersionCell
 description Version number of your language. Generally used on nodeTypes marked root.
 extends abstractNodeTypeRuleNode
 cruxFromId
abstractNonTerminalNodeTypeRuleNode
 extends abstractNodeTypeRuleNode
baseNodeTypeNode
 cells propertyKeywordCell baseNodeTypesCell
 description In rare cases with untyped content you can use a blobNode, for now, to skip parsing for performance gains. The base errorNode will report errors when parsed. Use that if you don't want to implement your own error nodeType.
 extends abstractNodeTypeRuleNode
 cruxFromId
catchAllCellTypeNode
 cells propertyKeywordCell cellTypeIdCell
 description If there are extra words in the node's line, parse these words as this type.
 extends abstractNodeTypeRuleNode
 cruxFromId
cellParserNode
 cells propertyKeywordCell cellParserCell
 description prefix/postfix/omnifix parsing strategy. If missing, defaults to prefix.
 extends abstractNodeTypeRuleNode
 cruxFromId
catchAllNodeTypeNode
 description If a nodeType is not found in the inScope list, instantiate this type of node instead.
 cells propertyKeywordCell nodeTypeIdCell
 extends abstractNodeTypeRuleNode
 cruxFromId
cellsNode
 catchAllCellType cellTypeIdCell
 description Describes the word type of each word in the line.
 extends abstractNodeTypeRuleNode
 cruxFromId
compilerNode
 todo Remove this and its children?
 inScope stringTemplateNode catchAllCellDelimiterNode openChildrenNode closeChildrenNode indentCharacterNode joinChildrenWithNode
 extends abstractNodeTypeRuleNode
 cruxFromId
descriptionNode
 catchAllCellType stringCell
 todo Should we make this multiline?
 extends abstractNodeTypeRuleNode
 cruxFromId
exampleNode
 todo Should this just be a "string" constant on nodes?
 description Provide a one line description and then a snippet of example code.
 catchAllCellType exampleAnyCell
 catchAllNodeType catchAllExampleLineNode
 extends abstractNodeTypeRuleNode
 cruxFromId
extendsNodeTypeNode
 crux extends
 description nodeType definitions can extend others.
 todo Add mixin support in addition to/in place of extends?
 cells propertyKeywordCell nodeTypeIdCell
 extends abstractNodeTypeRuleNode
frequencyNode
 todo Remove this nodeType. Switch to conditional frequencies.
 cells propertyKeywordCell floatCell
 extends abstractNodeTypeRuleNode
 cruxFromId
inScopeNode
 description A list of possible child nodeTypes for a node.
 catchAllCellType nodeTypeIdCell
 extends abstractNodeTypeRuleNode
 cruxFromId
javascriptNode
 todo Urgently need to get submode syntax highlighting running! (And eventually LSP)
 description Provide raw javascript code that will be inserted into a node type's class.
 catchAllNodeType catchAllJavascriptCodeLineNode
 extends abstractNodeTypeRuleNode
 javascript
  format() {
   if (this.isNodeJs()) {
    const template = \`class FOO{ \${this.childrenToString()}}\`
    this.setChildren(
     require("prettier")
      .format(template, { semi: false, useTabs: true, parser: "babel", printWidth: 240 })
      .replace(/class FOO \\{\\s+/, "")
      .replace(/\\s+\\}\\s+$/, "")
      .replace(/\\n\\t/g, "\\n") // drop one level of indent
      .replace(/\\t/g, " ") // we used tabs instead of spaces to be able to dedent without breaking literals.
    )
   }
   return this
  }
 cruxFromId
abstractParseRuleNode
 description Each node should have a pattern that it matches on unless it's a catch all node.
 extends abstractNodeTypeRuleNode
 cruxFromId
cruxNode
 cells propertyKeywordCell stringCell
 description Use this property for prefix languages where the first word is the keyword.
 extends abstractParseRuleNode
cruxFromIdNode
 cells propertyKeywordCell
 description Include this to derive the crux word from the node type id, for example 'fooNode' would have crux of 'foo'.
 extends abstractParseRuleNode
patternNode
 catchAllCellType regexCell
 description If present, this regex will be used to determine the nodeType instead of the cruxNode.
 extends abstractParseRuleNode
requiredNode
 description If present, the parent node will have an error if one of these nodes is not provided.
 extends abstractNodeTypeRuleNode
 cruxFromId
singleNode
 description If present and there are more than 1 of these nodes on the parent, an error will be present. Can be overridden by a child class by setting to false.
 extends abstractNodeTypeRuleNode
 cruxFromId
 catchAllCellType boolCell
uniqueFirstWordNode
 description For catch all nodeTypes or pattern nodes, use this to indicate the first words should be unique.
 extends abstractNodeTypeRuleNode
 cruxFromId
 catchAllCellType boolCell
contentDelimiterNode
 description If present will serialize the content of the node to an array of strings split on the provided delimiter.
 extends abstractNodeTypeRuleNode
 cruxFromId
 catchAllCellType stringCell
contentKeyNode
 description If present will serialize the node to an object and set a property with this key and the value set to the node's content.
 extends abstractNodeTypeRuleNode
 cruxFromId
 catchAllCellType stringCell
childrenKeyNode
 description If present will serialize the node to an object and set a property with this key and the value set to the node's children.
 extends abstractNodeTypeRuleNode
 cruxFromId
 catchAllCellType stringCell
tagsNode
 catchAllCellType tagCell
 extends abstractNodeTypeRuleNode
 cruxFromId
catchAllErrorNode
 baseNodeType errorNode
catchAllExampleLineNode
 catchAllCellType exampleAnyCell
 catchAllNodeType catchAllExampleLineNode
 cells exampleAnyCell
catchAllJavascriptCodeLineNode
 catchAllCellType javascriptCodeCell
 catchAllNodeType catchAllJavascriptCodeLineNode
catchAllMultilineStringConstantNode
 description String constants can span multiple lines.
 catchAllCellType stringCell
 catchAllNodeType catchAllMultilineStringConstantNode
 cells stringCell
cellTypeDefinitionNode
 todo Generate a class for each cell type?
 todo Allow abstract cell types?
 todo Change pattern to postfix.
 pattern ^[a-zA-Z0-9_]+Cell$
 inScope highlightScopeNode regexNode reservedWordsNode enumFromCellTypesNode descriptionNode enumNode todoNode extendsCellTypeNode examplesNode cellMinNode cellMaxNode
 cells cellTypeIdCell
enumFromCellTypesNode
 catchAllCellType cellTypeIdCell
 cells cellPropertyNameCell
 cruxFromId
enumNode
 cruxFromId
 catchAllCellType enumOptionCell
 cells cellPropertyNameCell
examplesNode
 description If the domain of possible cell values is large, such as a string type, it can help certain methods—such as program synthesis—to provide a few examples.
 cruxFromId
 catchAllCellType cellExampleCell
 cells cellPropertyNameCell
cellMinNode
 description For numeric cell types you can specify a min
 crux min
 cells cellPropertyNameCell numericCell
cellMaxNode
 description For numeric cell types you can specify a max
 crux max
 cells cellPropertyNameCell numericCell
highlightScopeNode
 cells propertyKeywordCell scopeNameCell
 description Provide this to get syntax highlighting in editors like Sublime and CodeMirror.
 single
 cruxFromId
rootFlagNode
 crux root
 description Mark a nodeType as root if it is the root of your programming language. The nodeTypeId will be the name of your language. The nodeTypeId will also serve as the default file extension, if you don't specify another. If more than 1 nodeType is marked as "root", the last one wins.
 cells propertyKeywordCell
nodeTypeDefinitionNode
 todo Add multiple dispatch?
 pattern ^[a-zA-Z0-9_]+Node$
 description Node types are a core unit of your language. They translate to 1 class per nodeType. Examples of nodeType would be "header", "person", "if", "+", "define", etc.
 catchAllNodeType catchAllErrorNode
 inScope rootFlagNode abstractNodeTypeRuleNode abstractConstantNode todoNode
 cells nodeTypeIdCell
_extendsJsClassNode
 extends abstractNodeTypeRuleNode
 todo remove
 description Deprecated
 cells propertyKeywordCell anyCell
 cruxFromId
_rootNodeJsHeaderNode
 extends abstractNodeTypeRuleNode
 todo remove
 description Deprecated
 catchAllNodeType catchAllJavascriptCodeLineNode
 cruxFromId
regexNode
 catchAllCellType regexCell
 description The word must match this pattern or it shall be marked as an error.
 single
 cells cellPropertyNameCell
 cruxFromId
reservedWordsNode
 single
 description A list of words that a cell cannot contain.
 catchAllCellType reservedWordCell
 cells cellPropertyNameCell
 cruxFromId
todoNode
 description Todos let you add notes about what is coming in the future in the source code. They are like comments in other languages except should only be used for todos.
 catchAllCellType todoCell
 catchAllNodeType todoNode
 cells todoCell
 cruxFromId
toolingNode
 description Tooling directives are not part of the language grammar but used for tools like editors, preprocessors and compilers. Something like "tooling onsave {bash command}". Should be at top of file, if present at all.
 catchAllCellType toolingDirectiveCell
 catchAllNodeType toolingNode
 cells toolingDirectiveCell
 cruxFromId
extendsCellTypeNode
 crux extends
 description cellType definitions can extend others.
 todo Add mixin support in addition to/in place of extends?
 cells propertyKeywordCell cellTypeIdCell
 single`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        grammarNode: grammarNode,
        abstractCompilerRuleNode: abstractCompilerRuleNode,
        closeChildrenNode: closeChildrenNode,
        indentCharacterNode: indentCharacterNode,
        catchAllCellDelimiterNode: catchAllCellDelimiterNode,
        openChildrenNode: openChildrenNode,
        stringTemplateNode: stringTemplateNode,
        joinChildrenWithNode: joinChildrenWithNode,
        abstractConstantNode: abstractConstantNode,
        booleanNode: booleanNode,
        floatNode: floatNode,
        intNode: intNode,
        stringNode: stringNode,
        abstractNodeTypeRuleNode: abstractNodeTypeRuleNode,
        compilesToNode: compilesToNode,
        extensionsNode: extensionsNode,
        versionNode: versionNode,
        abstractNonTerminalNodeTypeRuleNode: abstractNonTerminalNodeTypeRuleNode,
        baseNodeTypeNode: baseNodeTypeNode,
        catchAllCellTypeNode: catchAllCellTypeNode,
        cellParserNode: cellParserNode,
        catchAllNodeTypeNode: catchAllNodeTypeNode,
        cellsNode: cellsNode,
        compilerNode: compilerNode,
        descriptionNode: descriptionNode,
        exampleNode: exampleNode,
        extendsNodeTypeNode: extendsNodeTypeNode,
        frequencyNode: frequencyNode,
        inScopeNode: inScopeNode,
        javascriptNode: javascriptNode,
        abstractParseRuleNode: abstractParseRuleNode,
        cruxNode: cruxNode,
        cruxFromIdNode: cruxFromIdNode,
        patternNode: patternNode,
        requiredNode: requiredNode,
        singleNode: singleNode,
        uniqueFirstWordNode: uniqueFirstWordNode,
        contentDelimiterNode: contentDelimiterNode,
        contentKeyNode: contentKeyNode,
        childrenKeyNode: childrenKeyNode,
        tagsNode: tagsNode,
        catchAllErrorNode: catchAllErrorNode,
        catchAllExampleLineNode: catchAllExampleLineNode,
        catchAllJavascriptCodeLineNode: catchAllJavascriptCodeLineNode,
        catchAllMultilineStringConstantNode: catchAllMultilineStringConstantNode,
        cellTypeDefinitionNode: cellTypeDefinitionNode,
        enumFromCellTypesNode: enumFromCellTypesNode,
        enumNode: enumNode,
        examplesNode: examplesNode,
        cellMinNode: cellMinNode,
        cellMaxNode: cellMaxNode,
        highlightScopeNode: highlightScopeNode,
        rootFlagNode: rootFlagNode,
        nodeTypeDefinitionNode: nodeTypeDefinitionNode,
        _extendsJsClassNode: _extendsJsClassNode,
        _rootNodeJsHeaderNode: _rootNodeJsHeaderNode,
        regexNode: regexNode,
        reservedWordsNode: reservedWordsNode,
        todoNode: todoNode,
        toolingNode: toolingNode,
        extendsCellTypeNode: extendsCellTypeNode
      }
    }
  }

  class abstractCompilerRuleNode extends jtree.GrammarBackedNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get anyCell() {
      return this.getWordsFrom(1)
    }
  }

  class closeChildrenNode extends abstractCompilerRuleNode {}

  class indentCharacterNode extends abstractCompilerRuleNode {}

  class catchAllCellDelimiterNode extends abstractCompilerRuleNode {}

  class openChildrenNode extends abstractCompilerRuleNode {}

  class stringTemplateNode extends abstractCompilerRuleNode {}

  class joinChildrenWithNode extends abstractCompilerRuleNode {}

  class abstractConstantNode extends jtree.GrammarBackedNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
  }

  class booleanNode extends abstractConstantNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get constantIdentifierCell() {
      return this.getWord(1)
    }
    get boolCell() {
      return this.getWordsFrom(2)
    }
  }

  class floatNode extends abstractConstantNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get constantIdentifierCell() {
      return this.getWord(1)
    }
    get floatCell() {
      return this.getWordsFrom(2).map(val => parseFloat(val))
    }
  }

  class intNode extends abstractConstantNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get constantIdentifierCell() {
      return this.getWord(1)
    }
    get intCell() {
      return this.getWordsFrom(2).map(val => parseInt(val))
    }
  }

  class stringNode extends abstractConstantNode {
    createParser() {
      return new jtree.TreeNode.Parser(catchAllMultilineStringConstantNode, undefined, undefined)
    }
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get constantIdentifierCell() {
      return this.getWord(1)
    }
    get stringCell() {
      return this.getWordsFrom(2)
    }
  }

  class abstractNodeTypeRuleNode extends jtree.GrammarBackedNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
  }

  class compilesToNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get fileExtensionCell() {
      return this.getWord(1)
    }
  }

  class extensionsNode extends abstractNodeTypeRuleNode {
    get fileExtensionCell() {
      return this.getWordsFrom(0)
    }
  }

  class versionNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get semanticVersionCell() {
      return this.getWord(1)
    }
  }

  class abstractNonTerminalNodeTypeRuleNode extends abstractNodeTypeRuleNode {}

  class baseNodeTypeNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get baseNodeTypesCell() {
      return this.getWord(1)
    }
  }

  class catchAllCellTypeNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get cellTypeIdCell() {
      return this.getWord(1)
    }
  }

  class cellParserNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get cellParserCell() {
      return this.getWord(1)
    }
  }

  class catchAllNodeTypeNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get nodeTypeIdCell() {
      return this.getWord(1)
    }
  }

  class cellsNode extends abstractNodeTypeRuleNode {
    get cellTypeIdCell() {
      return this.getWordsFrom(0)
    }
  }

  class compilerNode extends abstractNodeTypeRuleNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          closeChildren: closeChildrenNode,
          indentCharacter: indentCharacterNode,
          catchAllCellDelimiter: catchAllCellDelimiterNode,
          openChildren: openChildrenNode,
          stringTemplate: stringTemplateNode,
          joinChildrenWith: joinChildrenWithNode
        }),
        undefined
      )
    }
  }

  class descriptionNode extends abstractNodeTypeRuleNode {
    get stringCell() {
      return this.getWordsFrom(0)
    }
  }

  class exampleNode extends abstractNodeTypeRuleNode {
    createParser() {
      return new jtree.TreeNode.Parser(catchAllExampleLineNode, undefined, undefined)
    }
    get exampleAnyCell() {
      return this.getWordsFrom(0)
    }
  }

  class extendsNodeTypeNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get nodeTypeIdCell() {
      return this.getWord(1)
    }
  }

  class frequencyNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get floatCell() {
      return parseFloat(this.getWord(1))
    }
  }

  class inScopeNode extends abstractNodeTypeRuleNode {
    get nodeTypeIdCell() {
      return this.getWordsFrom(0)
    }
  }

  class javascriptNode extends abstractNodeTypeRuleNode {
    createParser() {
      return new jtree.TreeNode.Parser(catchAllJavascriptCodeLineNode, undefined, undefined)
    }
    format() {
      if (this.isNodeJs()) {
        const template = `class FOO{ ${this.childrenToString()}}`
        this.setChildren(
          require("prettier")
            .format(template, { semi: false, useTabs: true, parser: "babel", printWidth: 240 })
            .replace(/class FOO \{\s+/, "")
            .replace(/\s+\}\s+$/, "")
            .replace(/\n\t/g, "\n") // drop one level of indent
            .replace(/\t/g, " ") // we used tabs instead of spaces to be able to dedent without breaking literals.
        )
      }
      return this
    }
  }

  class abstractParseRuleNode extends abstractNodeTypeRuleNode {}

  class cruxNode extends abstractParseRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get stringCell() {
      return this.getWord(1)
    }
  }

  class cruxFromIdNode extends abstractParseRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
  }

  class patternNode extends abstractParseRuleNode {
    get regexCell() {
      return this.getWordsFrom(0)
    }
  }

  class requiredNode extends abstractNodeTypeRuleNode {}

  class singleNode extends abstractNodeTypeRuleNode {
    get boolCell() {
      return this.getWordsFrom(0)
    }
  }

  class uniqueFirstWordNode extends abstractNodeTypeRuleNode {
    get boolCell() {
      return this.getWordsFrom(0)
    }
  }

  class contentDelimiterNode extends abstractNodeTypeRuleNode {
    get stringCell() {
      return this.getWordsFrom(0)
    }
  }

  class contentKeyNode extends abstractNodeTypeRuleNode {
    get stringCell() {
      return this.getWordsFrom(0)
    }
  }

  class childrenKeyNode extends abstractNodeTypeRuleNode {
    get stringCell() {
      return this.getWordsFrom(0)
    }
  }

  class tagsNode extends abstractNodeTypeRuleNode {
    get tagCell() {
      return this.getWordsFrom(0)
    }
  }

  class catchAllErrorNode extends jtree.GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  class catchAllExampleLineNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(catchAllExampleLineNode, undefined, undefined)
    }
    get exampleAnyCell() {
      return this.getWord(0)
    }
    get exampleAnyCell() {
      return this.getWordsFrom(1)
    }
  }

  class catchAllJavascriptCodeLineNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(catchAllJavascriptCodeLineNode, undefined, undefined)
    }
    get javascriptCodeCell() {
      return this.getWordsFrom(0)
    }
  }

  class catchAllMultilineStringConstantNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(catchAllMultilineStringConstantNode, undefined, undefined)
    }
    get stringCell() {
      return this.getWord(0)
    }
    get stringCell() {
      return this.getWordsFrom(1)
    }
  }

  class cellTypeDefinitionNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          description: descriptionNode,
          enumFromCellTypes: enumFromCellTypesNode,
          enum: enumNode,
          examples: examplesNode,
          min: cellMinNode,
          max: cellMaxNode,
          highlightScope: highlightScopeNode,
          regex: regexNode,
          reservedWords: reservedWordsNode,
          todo: todoNode,
          extends: extendsCellTypeNode
        }),
        undefined
      )
    }
    get cellTypeIdCell() {
      return this.getWord(0)
    }
  }

  class enumFromCellTypesNode extends jtree.GrammarBackedNode {
    get cellPropertyNameCell() {
      return this.getWord(0)
    }
    get cellTypeIdCell() {
      return this.getWordsFrom(1)
    }
  }

  class enumNode extends jtree.GrammarBackedNode {
    get cellPropertyNameCell() {
      return this.getWord(0)
    }
    get enumOptionCell() {
      return this.getWordsFrom(1)
    }
  }

  class examplesNode extends jtree.GrammarBackedNode {
    get cellPropertyNameCell() {
      return this.getWord(0)
    }
    get cellExampleCell() {
      return this.getWordsFrom(1)
    }
  }

  class cellMinNode extends jtree.GrammarBackedNode {
    get cellPropertyNameCell() {
      return this.getWord(0)
    }
    get numericCell() {
      return this.getWord(1)
    }
  }

  class cellMaxNode extends jtree.GrammarBackedNode {
    get cellPropertyNameCell() {
      return this.getWord(0)
    }
    get numericCell() {
      return this.getWord(1)
    }
  }

  class highlightScopeNode extends jtree.GrammarBackedNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get scopeNameCell() {
      return this.getWord(1)
    }
  }

  class rootFlagNode extends jtree.GrammarBackedNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
  }

  class nodeTypeDefinitionNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        catchAllErrorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          boolean: booleanNode,
          float: floatNode,
          int: intNode,
          string: stringNode,
          compilesTo: compilesToNode,
          extensions: extensionsNode,
          version: versionNode,
          baseNodeType: baseNodeTypeNode,
          catchAllCellType: catchAllCellTypeNode,
          cellParser: cellParserNode,
          catchAllNodeType: catchAllNodeTypeNode,
          cells: cellsNode,
          compiler: compilerNode,
          description: descriptionNode,
          example: exampleNode,
          extends: extendsNodeTypeNode,
          frequency: frequencyNode,
          inScope: inScopeNode,
          javascript: javascriptNode,
          crux: cruxNode,
          cruxFromId: cruxFromIdNode,
          pattern: patternNode,
          required: requiredNode,
          single: singleNode,
          uniqueFirstWord: uniqueFirstWordNode,
          contentDelimiter: contentDelimiterNode,
          contentKey: contentKeyNode,
          childrenKey: childrenKeyNode,
          tags: tagsNode,
          root: rootFlagNode,
          _extendsJsClass: _extendsJsClassNode,
          _rootNodeJsHeader: _rootNodeJsHeaderNode,
          todo: todoNode
        }),
        undefined
      )
    }
    get nodeTypeIdCell() {
      return this.getWord(0)
    }
  }

  class _extendsJsClassNode extends abstractNodeTypeRuleNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get anyCell() {
      return this.getWord(1)
    }
  }

  class _rootNodeJsHeaderNode extends abstractNodeTypeRuleNode {
    createParser() {
      return new jtree.TreeNode.Parser(catchAllJavascriptCodeLineNode, undefined, undefined)
    }
  }

  class regexNode extends jtree.GrammarBackedNode {
    get cellPropertyNameCell() {
      return this.getWord(0)
    }
    get regexCell() {
      return this.getWordsFrom(1)
    }
  }

  class reservedWordsNode extends jtree.GrammarBackedNode {
    get cellPropertyNameCell() {
      return this.getWord(0)
    }
    get reservedWordCell() {
      return this.getWordsFrom(1)
    }
  }

  class todoNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(todoNode, undefined, undefined)
    }
    get todoCell() {
      return this.getWord(0)
    }
    get todoCell() {
      return this.getWordsFrom(1)
    }
  }

  class toolingNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(toolingNode, undefined, undefined)
    }
    get toolingDirectiveCell() {
      return this.getWord(0)
    }
    get toolingDirectiveCell() {
      return this.getWordsFrom(1)
    }
  }

  class extendsCellTypeNode extends jtree.GrammarBackedNode {
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get cellTypeIdCell() {
      return this.getWord(1)
    }
  }

  module.exports = grammarNode
  grammarNode

  if (!module.parent) new grammarNode(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
