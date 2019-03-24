Tree Notation
=============

Tree Notation is a metalanguage like JSON, XML, YAML or S-expressions.

On top of Tree Notation, you can design "Tree Languages". Tree Languages can do lots of things. They can be simple file formats. They can even be general purpose programming languages, as powerful as any traditional programming language.

Quick Examples
--------------

### For file formats:

Tree Notation makes a great base for formats where you traditionally might use JSON or XML.

Compare the two files below. The first uses Tree Notation and the second uses JSON.

package.tree:

    name mypackage
    version 2.1.1
    description A package

package.json:

    {
      "name": "mypackage"
      "version": "2.1.1"
      "description": "A package"
    }

### For programming languages:

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

In Tree Notation, the units of measure are words and nodes. Each line is equal to one node. The example program above has 5 words and 2 nodes. The first word of a node is called the keyword. This program has 2 keywords (if and print). Notice how the second line in the program above is indented by one space, this makes it a child node of the line above it.

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

More instructions coming soon! If you'd like to create a new Tree Language, shoot me an email and I can help you until I have more documentation.

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
