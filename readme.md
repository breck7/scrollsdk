Tree Notation
=============

Tree Notation is a minimal notation for encoding tree data structures.

Tree Notation Basics
--------------------

A JSON object like:

    {
     "title" : "Hello world",
     "visitors": {
      "mozilla": 802
     }
    }

Can be written in Tree Notation like this:

    title Hello world
    visitors
     mozilla 802


Who this Library is For
-----------------------

If you want to build languages on top of Tree Notation, or build Tree editing tools, this library is for you.

If you are building new languages on top of Tree Notation, we additionally have another library that we
haven't released yet that makes doing so much easier. Drop us a message to test it out.

Using this Library
-----------------

Node.js:

    npm install treeprogram

    const TreeProgram = require("treeprogram")
    const program = new TreeProgram(`message hello World`)
    console.log(program.getNode(`message`).getTail())


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

You can read the paper introducing Tree Notation here (https://github.com/breck7/treenotation/blob/master/paper/treenotation.pdf).

The basic gist of the theory is that all structures are trees and that tree notation is all you need to represent trees.

Copyright & License
-------------------

Copyright (C) 2017 Breck Yunits - Released under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
