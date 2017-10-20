Tree Notation
=============

Tree Notation is a simple, universal syntax for programming languages. On top of Tree Notation, people can design "Tree Languages", that are as powerful as any traditional programming language.

An example program written in a Tree Language:

    if true
     print Hello world

In Tree Notation, the units of measure are words and nodes. Each line is equal to one node. The example program above has 5 words and 2 nodes. The first word of a node is called the keyword. This program has 2 keywords (if and print). Notice how the second line in the program above is intented by one space, this makes it a child node of the line above it.

Who this Library is For
-----------------------

This library is for people who want to design Tree Languages or make Tree Program editing tools.

Using this Library
-----------------

Instructions coming soon! If you'd like to create a new Tree Language, shoot me an email and I can help you until we have documentation.

Development Status
------------------

If you look at releaseNotes.md, you'll see Tree Program is undergoing rapid iteration and breaking changes are frequent.

By Version 10, things should settle down.

If you want to be an early adopter, it's not too bad. The library is relatively small, simple and stable, has decent code coverage(Istanbul numbers as of 6/15/2017: 94.86% Statements 1533/1616 76.57% Branches 268/350 93.25% Functions 152/163 96.32% Lines 1439/1494), and I do mention all breaking changes in releaseNotes.md and follow Semantic Versioning.

TN Libraries in Other Languages
-------------------------------

Building a TN implementation in a language other than Javascript should be straightforward. You can use this repo
as a reference. If you do build a library for another language, let me know and I'll add a link.


Theory
------

You can read the paper introducing Tree Notation here (https://github.com/breck7/treeprogram/blob/master/paper/treenotation.pdf).

The basic gist of the theory is that all structures are trees, tree notation is all you need to represent trees, and you can easily build Turing Complete programming languages using just Tree Notation.

Copyright & License
-------------------

Copyright (C) 2017 Breck Yunits - Released under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
