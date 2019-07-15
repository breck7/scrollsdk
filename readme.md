Tree Notation
=============

[![Build Status](https://travis-ci.org/breck7/jtree.svg?branch=master)](https://travis-ci.org/breck7/jtree)

Tree Notation is a metalanguage like JSON, XML, YAML or S-expressions.

On top of Tree Notation, you can design "Tree Languages". Tree Languages can do lots of things. They can be simple file formats. They can even be general purpose programming languages, as powerful as any traditional programming language.

[Try it out](http://treenotation.org/sandbox/)

[FAQ](http://treenotation.org/faq.html)

[TypeScript Implementation on GitHub](https://github.com/breck7/jtree)

[Discuss TreeNotation on Reddit](https://www.reddit.com/r/treenotation/)

Quick Examples
--------------

#### For file formats:

Tree Notation makes a great base for formats where you traditionally might use JSON or XML.

Compare the two files below. The first uses Tree Notation and the second uses JSON.

package.tree:

    name mypackage
    version 2.1.1
    description A package
    repository
     type git
     url git://github.com/username/mypackage

package.json:

    {
      "name": "mypackage"
      "version": "2.1.1"
      "description": "A package",
      "repository": {
        "type": "git",
        "url": "git://github.com/username/mypackage"
      }
    }

Note: the JSON example above works correctly, but JSON and Tree Notation are not isomorphic by default. If you want JSON features such as keys with spaces, numbers, or arrays, you'll need to use a higher level Tree Language that has a 1-to-1 relationship to JSON.

#### For programming languages:

In the example below, Tree Notation is used as a base for a math language where traditionally S-Expressions/Lisp might be used.

make8.tree:

    *
     + 1 1
     + 2 2

make8.lisp:

    (* (+ 1 1) (+ 2 2))



Terminology
-----------

Example:

    if true
     print Hello world

In Tree Notation, the units of measure are words and nodes. Each line is equal to one node. The example program above has 5 words and 2 nodes. In this language the nodeType is termined by the first words (if and print). Notice how the second line in the program above is indented by one space, this makes the print node a child node of the line above it, the if node.

If you are familiar with Lisp terminology, you can think of words as atoms.

Grammar files add the additional concept of "cells", which can be thought of as placeholders and type information for words. Grammar files define new languages with nodeTypes and cellTypes. In the example language above, the word "true" would be in a boolean cell type.


Grammar Files
-------------

This library contains a Tree Language called "Grammar". You can write new Grammar files to define new languages. By creating a grammar file you get a parser, a type checker, syntax highlighting, autocomplete, a compiler, and virtual machine for executing your new language.

To make your language do really interesting things, you'll want to write some code to extend your language nodes in another language that you know. This jtree library lets you create new languages using just Tree Notation, Tree Notation + TypeScript, or Tree Notation + Javascript.

Tree Notation and Tree Languages can be built with any language, however, not just TypeScript and Javascript. I also have a PyTree library and CTree library which let you create new languages using just Tree Notation + Python or Tree Notation + C++. Those libraries are behind this one due to time constraints, and I'm hoping someone else will create those implementations and/or implementations in other languages.


Who this Library is For
-----------------------

This library is for people who want to design Tree Languages or make Tree editing tools.

Using this Library
-----------------

This library ships with a command line utility:

    npm install jtree
    jtree help

To use it in an npm project:

    const jtree = require("jtree")
    const tree = new jtree.TreeNode("hello world")
    console.log(tree.toString())


If you want to make your own Tree Language, launch the jtree sandbox and play around with the grammar examples:

    npm install -g jtree
    jtree sandbox 3333
    # Open http://localhost:3333/sandbox/grammars.html

More instructions coming soon! If you need help creating your language, shoot me an email and I can help you until we have more documentation.

Development Status
------------------

All breaking changes are mentioned in releaseNotes.md. I follow semantic versioning, so breaking changes should not happen if you stay on the same major version.

Tree Notation Libraries in Other Languages
------------------------------------------

If you build a Tree Notation library in another language, let me know and I'll add a link.

Building a Tree Notation implementation in other languages is not too hard. You can use this repo as a reference.

Besides this TypeScript/Javascript implementation, I have implementations written in Python and C++. I may release those at some point, but due to time constraints would prefer to link to other people's implementations!

Research
--------

You can read my half-baked papers about Tree Notation here (https://github.com/breck7/jtree/tree/master/papers).

The basic gist of the theory is that all structures are trees, Tree Notation is all you need to represent trees, and by building things up from Tree Notation we might be able to make things simpler *AND better*.

Copyright & License
-------------------

Copyright (C) 2017-2019 Breck Yunits - Released under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
