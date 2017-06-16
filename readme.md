Tree Notation
=============

Tree Notation is a minimal notation for encoding tree data structures. You can read the paper introducing Tree Notation here (https://github.com/breck7/treenotation/blob/master/paper/treenotation.pdf).

This library is designed to serve as a base for building higher level domain specific languages, called ETNs. Unlike antique languages, ETNs don't require a transformation to a discordant Abstract Syntax Tree. As a result, you can easily build efficient static code tools and new types of editing experiences.

ETNs allow you to do something that was previously not possible: create visual programming environments where a user can seamlessly transition between editing programs visually and editing the text source code.


A Simple Tree Notation Example
------------------------------

An object like this:

    JSON: {"title" : "About Ada", "stats" : { "pageViews" : 42}}
    XML: <page><title>About Ada</title><stats><pageViews>42</pageViews></stats></page>

Can be written in Tree Notation like this:

    title About Ada
    stats
     pageViews 42

Benefits of ETNs
----------------

- ETNs can be simple declarative formats or full Turing Complete languages
- Your source code maps to the XY plane and is in tree form already -- no need for an AST step
- You can write programs that produce the same results using an order-of-magnitude fewer nodes
- You can use an increasing number of ETN editors, visualizers, and static analysis tools
- No parse errors make it easier to build robust editing environments
- Your source documents can easily be composed of blocks written in different languages
- No ignored whitespace ensures all diffs are semantic only and eliminates a whole class of unnecessary merge conflicts

TN Libraries in Other Languages
-------------------------------

Building a TN implementation in a language other than Javascript should be straightforward. You can use this repo
as a reference. If you do build a library for another language, let me know and I'll add a link.


Using this Libary
-----------------

Node.js:

    npm install treenotation

Using this Library
------------------

    var TreeNotation = require("treenotation")
    // Creating a document
    var person = new TreeNotation(`name John`)
    // Accessing the head part of a node
    console.log(person.getNode(`name`).getHead())
    // Setting the tail part of a node
    person.append(`age 29`)
    console.log(person.getNode(`age`).getTail())
    // Printing the node
    console.log(person.toString())


Creating an ETN
---------------

      class AdditionNode extends TreeNotation.ExecutableETN {
        execute() {
          const words = this.getTail().split(" ")
          return words.map(word => parseFloat(word)).reduce((prev, current) => prev + current, 0)
        }
      }
      class MathETN extends TreeNotation.ExecutableETN {
        parseNodeType(line) {
          if (line.startsWith("+")) return AdditionNode
          return MathETN
        }
      }
      const source = `+ 2 7
    + 3 1
    + 15 1.0 200 100`
      const program = new MathETN(source)
      console.log(program.execute())


Development Status
------------------

As you can see by the History.md, Tree Notation is undergoing rapid iteration and breaking changes are frequent.

By Version 5, things should settle down.

If you want to be an early adopter, it's not too bad. The library is relatively small, simple and stable, has decent code coverage(Istanbul numbers as of 6/15/2017: 94.86% Statements 1533/1616 76.57% Branches 268/350 93.25% Functions 152/163 96.32% Lines 1439/1494), and I do mention all breaking changes in History.md and follow Semantic Versioning.


Copyright & License
-------------------

Copyright (C) 2017 Breck Yunits - Released under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
