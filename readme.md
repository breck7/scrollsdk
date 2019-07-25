Tree Notation
=============

[![Build Status](https://travis-ci.org/breck7/jtree.svg?branch=master)](https://travis-ci.org/breck7/jtree)

Links
-----

🌴 [Try Tree Notation](http://treenotation.org/sandbox/)  
🌴 [FAQ](http://treenotation.org/faq.html)  
🌴 [TypeScript Implementation on GitHub](https://github.com/breck7/jtree)  
🌴 [Discuss TreeNotation on Reddit](https://www.reddit.com/r/treenotation/)  
🌴 [Ohayo: A Data Science App Powered By Tree Notation](https://github.com/breck7/ohayo)  

What is Tree Notation?
----------------------

Tree Notation is a tiny new notation with big ambitions. Tree Notation is an error-free base notation like binary. Currently our stack of computer languages look like this:

1 Binary => 1,000+ Syntaxes => 10,000+ languages

In the future we think the stack may look like this:

1 Binary => 1 Tree Notation => 10,000+ Tree Languages

This would eliminate a lot of unnecessary complexity in programming and computing. We think this will happen as more people join the Tree Notation ecosystem leading to significant network effects.

What is so special about Tree Notation?
---------------------------------------

Compared to notations like JSON, XML, YAML or S-expressions, Tree Notation may seem very similar. However, Tree Notation is the most minimal, and the concept of syntax errors does not exist. Our bet is that this makes Tree Notation substantially different and will cause a *major improvement* in computing, for a number of reasons, particularly these 3:

1. Program synthesis. Deep Learning models are only as good as the data you train it on. Tree Notation code is noiseless, clean data, which we posit will enable at least a 10x improvement in the performance of programs that write code and/or assist users in writing code.
2. Clean data. In data science, it is a rule of thumb that 20% of your time will go toward doing data science, and 80% of your time will go toward getting, cleaning, and organizing your data. Tree Notation offers a number of breakthroughs that will solve that 80% dilemma once and for all.
3. Visual programming. Tree Notation is the first notation where a visual design tool can generate code as good as someone can write by hand. The languages listed above have a critical flaw--there are infinite ways to represent any given structure. In Tree Notation there is only 1 way to represent 1 structure. This simplification is one of the main reasons why Tree Notation is solving the Visual Programming problem.

We are building the data science app [Ohayo](https://github.com/breck7/ohayo) in part to demonstrate these 3 advantages of Tree Notation.

Simpler Examples
----------------

Check out the [Ohayo](https://github.com/breck7/ohayo) project or the [Tree Language Builder](http://treenotation.org/sandbox/build/) for advanced examples of Tree Notation in action.

Below are some very simple examples to explain some of the very basics.

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

This library contains a Tree Language called "Grammar". You can write new Grammar files to define new languages. By creating a grammar file you get a parser, a type checker, syntax highlighting, autocomplete, a compiler, and virtual machine for executing your new language. This library also includes a simple web [Tree Language Builder](http://treenotation.org/sandbox/build/).

To make your language do really interesting things, you'll want to write some code to extend your language nodes in another language that you know. This jtree library lets you create new languages using just Tree Notation, Tree Notation + TypeScript, or Tree Notation + Javascript.

Tree Notation and Tree Languages can be built with any language, however, not just TypeScript and Javascript. We also have a PyTree library and CTree library which let you create new languages using just Tree Notation + Python or Tree Notation + C++. Those libraries are behind this one due to time constraints, and we're hoping someone else will create those implementations and/or implementations in other languages.


Who this Library is For
-----------------------

This library is for people who want to design Tree Languages or make Tree editing tools.

You can think of this library as similar to the Java Development Kit, except for Tree Notation instead of Java.

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

Monorepo
--------

This library is a [monorepo](https://en.wikipedia.org/wiki/Monorepo). With on average over 1 major version released each month for the past 2.5 years, it would take a lot of overhead to constantly be updating 10+ different repositories and modules every month. Once we're more confident in the theory and best practices, it might make sense to break this repo into independent modules.

That being said, we despise unnecessary dependencies as much as anyone. If anyone wants to create some automated submodules built from the projects in this monorepo, to allow for consuming of a smaller subset of the code and dependencies in this module, feel free to do so.

Who is working on Tree Notation?
--------------------------------

The Tree Notation Lab at the University of Hawaii Cancer Center is focused entirely on building and supporting the Tree Notation ecosystem, with a special focus on building data science applications that leverage Tree Notation to advance cancer research.

Development Status
------------------

All breaking changes are mentioned in releaseNotes.md. We follow semantic versioning, so breaking changes should not happen if you stay on the same major version.

Tree Notation Libraries in Other Languages
------------------------------------------

If you build a Tree Notation library in another language, let us know and we'll add a link.

Besides this TypeScript/Javascript implementation, we have implementations written in Python and C++. Due to time constraints we would prefer to link to other people's implementations!

If you are working on a Tree Notation library in a new host language, feel free to post an issue or ask for help in the [TreeNotation subreddit](https://www.reddit.com/r/treenotation/).

Research
--------

You can read the half-baked [papers about Tree Notation](https://github.com/breck7/jtree/tree/master/papers).

The basic gist of the theory is that all structures are trees, Tree Notation is all you need to represent trees, and by building things up from Tree Notation we might be able to make things simpler *AND better*.

Copyright & License
-------------------

Copyright (C) 2017-2019 Breck Yunits - Released under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
