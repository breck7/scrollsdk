jtree
=====

[![Build Status](https://travis-ci.org/treenotation/jtree.svg?branch=master)](https://travis-ci.org/treenotation/jtree)

A Tree Notation library and SDK for TypeScript and Javascript.

Links
-----

🌴 [Tree Notation Homepage](https://treenotation.org/)  
🌴 [Try Tree Notation](http://jtree.treenotation.org/sandbox/)  
🌴 [Tree Language Designer](http://jtree.treenotation.org/designer/)  
🌴 [FAQ](http://jtree.treenotation.org/faq.html)  
🌴 [TreeBase](http://jtree.treenotation.org/treeBase/)  
🌴 [TypeScript Implementation on GitHub](https://github.com/treenotation/jtree)  
🌴 [Discuss TreeNotation on Reddit](https://www.reddit.com/r/treenotation/)  
🌴 [Ohayo: A Data Science App Powered By Tree Notation](https://github.com/treenotation/ohayo)  
🌴 [Unit Tests](/sandbox/test.html)  
🌴 [Perf Tests](/sandbox/perfTests.html)  

Who this package is for
-----------------------

Jtree is for people who want to design Tree Languages, make Tree editing tools, use TreeBase, or use the Tree Component Web Framework.

You can think of jtree as similar to the Java Development Kit, except for Tree Notation instead of Java.

Grammar Files
-------------

Jtree contains a Tree Language called "Grammar". You can write new Grammar files to define new languages. By creating a grammar file you get a parser, a type checker, syntax highlighting, autocomplete, a compiler, and virtual machine for executing your new language. Jtree also includes a simple web [Tree Language Builder](http://jtree.treenotation.org/designer/).

To make your language do really interesting things, you'll want to write some code to extend your language nodes in another language that you know. Jtree lets you create new languages using just Tree Notation, Tree Notation + TypeScript, or Tree Notation + Javascript. Tree Notation and Tree Languages can be built with any language, however, not just TypeScript and Javascript. We are looking for volunteers to build libraries/sdks in other host languages.

Using Jtree
-----------

Jtree currently includes around 10 compiled projects (aka "products") and more than a dozen Tree Languages.

### jtree base library for npm projects:

    const {jtree} = require("jtree")
    const tree = new jtree.TreeNode("hello world")
    console.log(tree.toString())

### jtree base library for the browser:

    <script src="node_modules/jtree/products/jtree.browser.js"

### jtree command line tool

    npm install -g jtree
    jtree help

### TreeBase

    npm install -g jtree
    jtree base

### jtree "sandbox" web app for exploring base Tree Notation

    npm install -g jtree
    jtree sandbox

### jtree "Designer" web app for building new Tree Languages

    npm install -g jtree
    jtree sandbox
    open http://localhost:3333/designer

### TreeComponentFramework for building web apps

(directions coming soon)

### More than 12 example Tree Languages for helping with various tasks

See the "langs/" folder.

### Build Tools

If you look at the source, you will also see a set of build tools (such as Builder and TypeScriptRewriter). These are currently undocumented and not recommended for external use.

Monorepo
--------

Jtree is a [monorepo](https://en.wikipedia.org/wiki/Monorepo). With on average over 1 major version released each month for the past 2.5 years, it would take a lot of overhead to constantly be updating 10+ different repositories and modules every month. Once we're more confident in the theory and best practices, it might make sense to break this repo into independent modules.

That being said, we despise unnecessary dependencies as much as anyone. If anyone wants to create some automated submodules built from the projects in this monorepo, to allow for consuming of a smaller subset of the code and dependencies in this module, feel free to do so.

Development Status
------------------

All breaking changes are mentioned in releaseNotes.md. We follow semantic versioning, so breaking changes should not happen if you stay on the same major version.

Tree Notation Libraries in Other Languages
------------------------------------------

If you build a Tree Notation library/SDK in another language, let us know and we'll add a link.

If you are working on a Tree Notation library in a new host language, feel free to post an issue or ask for help in the [TreeNotation subreddit](https://www.reddit.com/r/treenotation/).

[BSD Zero Clause License](https://choosealicense.com/licenses/0bsd/) ([0BSD](https://spdx.org/licenses/0BSD))
---------

Copyright (c) 2017-2019 Tree Notation Lab

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
