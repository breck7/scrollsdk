# Code Snippets from 6 Tree Languages

## Flow

Problem: How do I quickly create data dashboards?
Alternatives: R, Python, Tableau, Excel

    >subreddit programming
    >filter language
     >table
      title Reddit Stories in r/programming that contain "language"

## Stamp

Problem: how do I bundle a bunch of files in different formats into one distributable file?
Alternatives: tar

    prompt LANG lowercase Enter the file extension of your new language
    prompt DESCRIPTION any Enter a description for LANG
    folder LANG
    file LANG/.gitignore
     data
      node_modules/

## Grammar

Problem: how do you quickly create parsers with strong type checking that support multiple host languages?
Alternatives: ANTLR, Ohm, JavaCC, YACC

    @grammar stamp
     @description A Tree Language for creating distributable text template files that expand to folders and files.
     @catchAllKeyword error
     @parser js ./StampProgram.js
     @keywords
      #!
      prompt
      folder
      file
    @wordType any
     @regex .?
    @wordType filepath
     @regex .?
    @wordType inputType
     @regex ^(string|int|any)$
    @keyword #!
     @columns any*
    @keyword prompt
     @columns any inputType any*
     @parser js ./PromptNode.js
    @keyword error
     @parser js ErrorNode
    @keyword folder
     @columns filepath
     @parser js ./FolderNode.js
    @keyword executable
    @keyword file
     @columns filepath
     @parser js ./FileNode.js
     @keywords
      data
      executable
    @keyword any
     @columns any*
     @catchAllKeyword any
    @keyword data
     @catchAllKeyword any

## TQL

Problem: how do I upgrade a lot of tree language programs when the underlying language changes?
Alternatives: Scripting languages

    selectNodes
     y === 1
      insertWord 0 @grammar
    selectNodes
     y > 1
      x === 1
       insertWord 0 @keyword

## Swarm

Problem: how do I write unit tests using the minimal number of nodes?
Alternatives: ?

    #setup
    #test basics
     #setup
      require ../src/base/TreeNode.js
      %%|
       hello world
     getChildren
      =# 1
     nodeAt 0
      getBeam
       == world

## Chisel

Problem: How do I handle state in my react-like web apps, and also make them more testable?
Alternatives: ReactJS

    theme dark
    menu
    panel myprograms.flow
     tabs
      tab myprograms.flow
      tab releasenotes.flow
      tab untitled-4.flow
      flex
     gutter
      terminal
      console
