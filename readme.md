Tree Notation
=============

Tree Notation is a minimal notation for encoding tree data structures. You can read the paper introducing Tree Notation here (https://github.com/breck7/treenotation/blob/master/paper/treenotation.pdf).

This Tree Program library is designed to serve as a base for building higher level domain specific languages, called ETNs. Unlike antique languages, ETNs don't require a transformation to a discordant Abstract Syntax Tree. As a result, you can easily build efficient static code tools and new types of editing experiences.

ETNs allow you to do things that were previously not possible. For example, using TN and ETNs, you can create visual programming environments where a user can seamlessly transition between editing a program visually and editing its text source code.


Tree Notation Basics
--------------------

A JSON object like:

    {
     "title" : "Jack and Ada at BCHS",
     "visitors": {
      "mozilla": 802
     }
    }

Can be written in Tree Notation like this:

    title Jack and Ada at BCHS
    visitors
     mozilla 802

Benefits of TN & ETNs
---------------------

- ETNs can be simple declarative formats or powerful Turing Complete languages
- Your source code maps to the XY plane and is in tree form already -- no need for an AST step
- You can write programs that produce the same results using an order-of-magnitude fewer nodes
- If you find an ETN for an AL, you can use ETN tools, visualizers, and static analysis tools and compile to that language
- No parse errors in TN make it easier to build robust editing environments
- Your TN source documents can easily be composed of blocks written in different languages
- No ignored whitespace ensures all diffs are semantic only and eliminates a whole class of unnecessary merge conflicts


Using this Libary
-----------------

Node.js:

    npm install treeprogram

    const TreeProgram = require("treeprogram")
    const program = new TreeProgram(`message hello World`)
    console.log(program.getNode(`message`).getTail())


Example ETNs
------------

This library includes 3 simple demo ETNs, located in the etns/ subfolder:

- BrayProgram => An HTML ETN
- HakonProgram => A CSS ETN
- WallProgram => A Unit Testing ETN

They demonstrate how easy it is to create an ETN. (Note: they are a little outdated. More examples to come.)

Creating an ETN
---------------

Creating your own ETN with this library is somewhat more advanced, but much simpler than other tools.

1. Create a class for each node type in your new language. You can do this incrementally.

2. Create a root node class. The convention is to suffix your root node with Program.

3. Add a parseNodeType method to your root node and/or intermediate and child nodes. ETNs use a top down parsing strategy.

4a. If you are making a simple declarative ETN, you might add some getters to parse the words in your nodes into the correct in-memory types.

OR

4b. If you are making an executable ETN, add execute methods.

OR

4c. If you are making a compiling ETN, add compile methods.

5. Start writing code in your new programming language!

Feel free to reach out if you have any questions. Happy ETNing!

      class MathProgram extends TreeProgram {
        // Look! You created a top down parser!
        getNodeTypes() {
          return {"+" : AdditionNode}
        }
      }

      class AdditionNode extends TreeProgram {
        // Look! You created an interpreter!
        execute() {
          return this.getNumbers().reduce((prev, current) => prev + current, 0)
        }

        // Look! You created a declarative file format!
        getNumbers() {
          return this.getWords(1).map(word => parseFloat(word))
        }

        // Look! You created a compiler!
        compile() {
          return this.getNumbers().join(" + ")
        }
      }
      const source = `+ 2 7
    + 3 1
    + 15 1.1 200 100`
      const program = new MathProgram(source)
      console.log(program.execute())


In 28 lines of code, we created a simple programming language, wrote a program in that language, wrote a parser, interpreter, and compiler, and ran that program! Not bad.


Development Status
------------------

As you can see by the History.md, Tree Program is undergoing rapid iteration and breaking changes are frequent.

By Version 10, things should settle down.

If you want to be an early adopter, it's not too bad. The library is relatively small, simple and stable, has decent code coverage(Istanbul numbers as of 6/15/2017: 94.86% Statements 1533/1616 76.57% Branches 268/350 93.25% Functions 152/163 96.32% Lines 1439/1494), and I do mention all breaking changes in History.md and follow Semantic Versioning.

TN Libraries in Other Languages
-------------------------------

Building a TN implementation in a language other than Javascript should be straightforward. You can use this repo
as a reference. If you do build a library for another language, let me know and I'll add a link.


One More Thing
--------------

The world's first ETN editor, Ohayo.

http://ohayo.computer

Copyright & License
-------------------

Copyright (C) 2017 Breck Yunits - Released under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
