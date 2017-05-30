Tree Notation
=============

Tree Notation is a minimal notation for encoding tree data structures. This library is designed to serve as a base for building higher level domain specific languages.

Tree Notation Example
---------------------

An object like this:

    JSON: {"title" : "About Ada", "stats" : { "pageViews" : 42}}
    XML: <page><title>About Ada</title><stats><pageViews>42</pageViews></stats></page>

Can be written in Tree Notation like this:

    title About Ada
    stats
     pageViews 42

Benefits of Tree Notation
-------------------------

- Easily create documents composed of blocks written in different languages
- No ignored whitespace ensures all diffs are meaningful and reduces merge conflicts
- No parse errors make it easier to build robust editors

Installing
----------

Node.js:

    npm install treenotation

Using this Library
------------------

    var TreeNode = require("treenotation")
    // Creating a node
    var person = new TreeNode(`name John`)
    // Accessing the head part of a node
    console.log(person.getNode(`name`).getHead())
    // Setting the tail part of a node
    person.append(`age 29`)
    console.log(person.getNode(`age`).getTail())
    // Printing the node
    console.log(person.toString())


More Tree Notation Examples
---------------------------

Here's how you could encode a tax return in Tree Notation:

    socialSecurityNumber 555-55-5555
    name John Smith
    taxYear 2012
    income 10,000
    dependents 1
    exemptions 2
    address 123 Main Street
    city San Francisco
    state California

Tree supports recursion. Here's an example of web page stats:

    homepage
     pageviews 2312
     uniques 231
     referers
      about 23
      contact 41
    about
     pageviews 314
     uniques 201
     referers
      home 100
      contact 21
    contact
     pageviews 214
     uniques 124
     referers
      home 110
      about 10

Using this library with the above stats example:

    var stats = new TreeNode(exampleStringFromAbove)
    // Get a nested property using an xpath like query
    var views = stats.getNode("contact referers home").getTail()
    console.log(views) // 110

Copyright & License
-------------------

Copyright (C) 2017 Breck Yunits - Released under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
