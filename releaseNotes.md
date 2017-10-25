8.1.0 / 2017-10-25
==================
- Breaking: renamed fixedWidthTable method to toTable and changed default to left aligned.

8.0.1 / 2017-10-15
==================
- Fix: fixed browser version

8.0.0 / 2017-10-15
==================
- New: Create new Tree Languages using a tree grammar file
- New: Tree Console app
- Breaking: ImmutableNode no longer exposed on TreeProgram

7.2.0 / 2017-10-14
==================
- Breaking: for use in browser, now use treeprogram.browser.js instead of treeprogram.js
- Infra: prep work for grammar and blaze library merger -- consoleApp and src directory

7.1.1 / 2017-9-17
=================
- New: getErrors and getWordTypeLine methods
- Fix: fix for executeFile static method when more than one #! line.

7.1.0 / 2017-9-15
=================
- Breaking; Symbol is now Keyword throughout. Same changes at 7.0.0, except substitute keyword for symbol.

7.0.0 / 2017-9-14
=================
- Breaking: getNodeTypes is now getSymbolMap
- Breaking: getDefaultNodeType is now getCatchAllNodeClass
- Breaking: getBase is now getSymbol
- Breaking: getBasePath is now getSymbolPath
- Breaking: getBases is now getSymbols
- Breaking: pathVectorToBasePath is now pathVectorToSymbolPath
- Breaking: setBase is now setSymbol

6.1.3 / 2017-9-8
================
- New: added executeSync method
- Docs: removed outdated ETNs
- Infra: switched to Tap from Tape to get code coverage working again with nyc

6.1.2 / 2017-9-6
================
- Fix: bug fix in getCMTime

6.1.1 / 2017-8-27
=================
- New: added getExpanded method

6.1.0 / 2017-8-25
=================
- New: added getDefaultNodeType and getNodeTypes methods
- New: added default compile method
- Fix: updated outdated code in readme

6.0.0 / 2017-8-24
=================
- Breaking: Renamed TreeNotation to TreeProgram.
- Breaking: github is now at breck7/treeprogram
- Breaking: npm install treenotation is now npm install treeprogram
- Fix: fixed timing bug in getTreeMTime

5.7.0 / 2017-8-24
=================
- New: getWord can now take a negative int
- New: added static method executeFile and cli.js

5.6.2 / 2017-8-20
=================
- Fix: child nodes can now inspect their parent's line at parse time to enable dependent types

5.6.1 / 2017-8-20
=================
- Fix: stale index when using setLine or setBase methods

5.6.0 / 2017-8-18
=================
- Breaking: base execute now returns a Promise.all that resolves when all children have resolves
- Added getIndentation method

5.5.0 / 2017-8-8
================
- Added getTreeMTime method

5.4.0 / 2017-8-8
================
- Breaking: getMTime now always returns a number (previously it could return undefined). Initializes lazily on first call.

5.3.0 / 2017-8-3
================
- Added nest static method

5.2.0 / 2017-8-1
================
- Added getInheritanceTree method

5.1.0 / 2017-7-25
=================
- Added "relativeTo" parameter to: getPoint, isRoot, getRootNode, getStack, getStackString, getBasePath, getPathVector

5.0.1 / 2017-7-24
=================
- Bug fix: getBasePath works

5.0.0 / 2017-7-24
=================
- Breaking: getWI is now getZI for consistency with X,Y,Z convention.
- Breaking: getHead is now getBase
- Breaking: setHead is now setBase
- Breaking: pathVectorToPathName is now pathVectorToBasePath
- Breaking: getPathName is now getBasePath
- Breaking: getTail is now getBeam
- Breaking: setTail is now setBeam
- Breaking: findTail is now findBeam
- Breaking: pushTailAndChildren is now pushBeamAndChildren
- Breaking: getTailWithChildren is now getBeamWithChildren
- Breaking: setTailWithChildren is now setBeamWithChildren
- Breaking: getTails is now getBeams

4.1.2 / 2017-6-26
=================
- Added setWord method

4.1.1 / 2017-6-26
=================
- Bug fix in getPoint method

4.1.0 / 2017-6-20
=================
- Breaking: removed toJavascript method on base class.

4.0.3 / 2017-6-20
=================
- Reverted last.

4.0.2 / 2017-6-20
=================
- Fix so Hakon works in browser

4.0.1 / 2017-6-20
=================
- Added HTML, CSS and Unit Testing ETNs (I named them Bray, Hakon, and Wall).

4.0.0 / 2017-6-18
=================
- Breaking: removed _getSize if any ETNs were using that
- Breaking: changes some output classes in toHtml() method
- getWords() now takes an optional starting WI location
- Final version of paper, mistakes and all.

3.10.0 / 2017-6-17
==================
- Breaking: getAncestorNodes is now getStack
- Added getStackString method

3.9.2 / 2017-6-17
=================
- getGraph method now also takes 0 params, in which case it uses word1.

3.9.1 / 2017-6-17
=================
- Added getGraph method

3.9.0 / 2017-6-16
=================
- Breaking: Removed TreeNode.ExecutableTreeNode. TreeNotation now has execute method by default.
- Breaking: getWord now ignores getSize. In fact, we'll probably ditch getSize.

3.8.0 / 2017-6-15
=================
- toOutline now takes an optional mapping fn

3.7.4 / 2017-6-15
=================
- setTailWithChildren Regression fix.

3.7.3 / 2017-6-15
=================
- Fix for closure compiler

3.7.2 / 2017-6-15
=================
- setChildren regression fix

3.7.1 / 2017-6-15
=================
- ETN parsing regression fix

3.7.0 / 2017-6-15
=================
- Breaking: expose TreeNotation now and not TreeNode
- Breaking: TreeNode.ExecutableTreeNode is now TreeNotation.ExecutableETN
- Breaking: TreeNotation.ImmutableTreeNode is now TreeNotation.ImmutableNode
- Fixed regression introduced in 3.6 in ETN parsing in parseString method
- Updated readme with an ETN example

3.6.0 / 2017-6-15
=================
- Breaking: parseNode is now parseNodeType and only takes a line param.
- Breaking: getMTime() now returns undefined if the node hasn't been modified.
- Added more laziness to get a ~2.5x improvement in parse time. Parses about ~1M loc of basic TN a sec on test machine

3.5.3 / 2017-6-14
=================
- Added getChildrenByNodeType method
- Expose a simple ExecutableTreeNode class
- Fixed bug when initiating from an ETN

3.5.2 / 2017-6-13
=================
- Added getNext and getPrevious methods

3.5.1 / 2017-6-13
=================
- Added getPoint method

3.5.0 / 2017-6-9
================
- Breaking: changed parseNode method to just return the new node class.

3.4.0 / 2017-6-6
================
- Breaking: removed reload method

3.3.0 / 2017-6-5
================
- Breaking: in the toHtml() method, the child nodes div now has class nodeChildren instead of nodeTree
- Breaking: pushTailAndTree is now pushTailAndChildren

3.2.1 / 2017-6-5
================
- Added getMTime method

3.2.0 / 2017-6-5
================
- Breaking: removed moveTo method. Use the new copyTo method follow by destroy.
- Breaking: destroy no longer returns the detached node.
- Experimental: expose ImmutableTreeNode
- Improvements to _parseNode(), increased test coverage, and reduced test code size

3.1.1 / 2017-6-2
================
- Regression fix in extend method

3.1.0 / 2017-6-1
================
- Breaking: removed every() method
- Added getTopDownArray (preorder), getChildrenFirstArray (postorder), getParentFirstArray(breadth first) methods

3.0.1 / 2017-5-30
=================
- Added findTail method

3.0.0 / 2017-5-30
=================
- Breaking: merged all subclasses into one TreeNode class.
- Breaking: getNodes is now getChildren
- Breaking: setName > setHead, setValue > setTail, getName > getHead, getValue > getTail
- Breaking: getNames > getHeads, getValues > getTails, setValue > setTail
- Breaking: removed seed methods
- Breaking: removed findTrees and findValues methods
- Breaking: removed tree next and prev methods
- Breaking: removed tree setText...do tree.touchNode().setTailWithChildren(text)
- Breaking: removed tree setTree...do tree.touchNode().setChildren()
- Breaking: removed tree setTail...do tree.touchNode().setTail()
- Breaking: removed tree getTail...do tree.getNode(path).getTail()
- Breaking: removed tree getTree...do tree.getNode(path).getTree()
- Breaking: removed tree getText...do tree.getNode(path).getText()
- Breaking: node setTree is now node setChildren
- Breaking: append now takes only 2 params, line and tree.
- Breaking: appendLine is now just append
- Breaking: getAncestorTrees is now getAncestorNodes
- Breaking: getText now getTailWithChildren
- Breaking: removed getTrees method.
- Breaking: removed tree clear method.
- Breaking: removed node initTree
- Breaking: removed treeAt method
- Breaking: insert now takes line and not head and tail params
- Breaking: pushValue is now pushTailAndTree
- Breaking: prepend method now takes line and not head and tail params
- Added insertNode public method
- Bug fix: toString no longer returns an empty line after you delete last node in a nested tree

2.3.0 / 2017-5-9
================
- Breaking: created abstract classes and language classes. PairTree = require("treenotation").PairTreeLanguage.PairTree
- Breaking: fromCsv and other from methods are now static methods on PairTreeLanguage, not PairTree.

2.2.4 / 2017-4-28
=================
- Dist npm fix

2.2.3 / 2017-4-28
=================
- Started using Prettier
- Swapped out Browserfy in favor of simple express router transform flow
- Created tasks folder in place of npm scripts
- Code cleanup: turned helper methods into statics

2.2.2 / 2017-4-17
=================
- Added getAncestorTrees method to node.

2.2.1 / 2017-4-17
=================
- Added getRootTree method to node.

2.2.0 / 2017-4-17
=================
- Breaking: extend method on PairTree is now recursive.

2.1.1 / 2017-4-16
=================
- Bug fix: fixed uncaught error when parsing malformed delimited input

2.1.0 / 2017-4-13
=================
- Breaking: in base and pair, values are now converted to strings. Use a higher level language to preserve types.

2.0.3 / 2017-4-05
=================
- Added prepublish hook

2.0.2 / 2017-4-05
=================
- Bug fix in node.setTree method

2.0.1 / 2017-4-05
=================
- NPM bundle fix

2.0.0 / 2017-4-05
=================
- Made TreeNotation the root namespace and separated PairTree out as a sublanguage
- Breaking: new Tree() now needs to be new TreeNotation.PairTree() or just add a Tree = TreeNotation.PairTree
- Breaking: node.getPath is now node.getPathName
- Brecking: indexPathToNamePath is now pathVectorToPathName
- Breaking: node.getNodeParentTree is now node.getParentTree
- Breaking: tree.push is now tree.pushValue
- Breaking: removed tree.toggleValue
- Breaking: tree.toFixedWidth is now tree.toFixedWidthTable
- Breaking: node.getIndexPath is now node.getPathVector
- Breaking: removed tree.deleteNodeAt
- Breaking: tree.getTrees() no longer accepts a parameter.
- Breaking: tree.getValues() no longer accepts a parameter.
- Breaking: in html returned from tree.toHtml(), data-path is now data-pathVector
- Breaking: fromDelimiter is now fromDelimited
- Removed gulp devDependency. Switched to browserify.

1.2.2 / 2017-4-02
=================
- Removed package.tree and fixed gulp version update script

1.2.1 / 2017-3-31
=================
- Breaking: append, insert, prepend, push, and shift now return the new Tree Nodes.

1.1.1 / 2017-3-26
=================
- Breaking: Removed each method

1.0.7 / 2017-3-25
=================
- Added moveTo method on TreeNode

1.0.6 / 2017-3-19
=================
- Added isTerminal, fromSeed, seedToTree, invert, remap, and toSeed methods

1.0.5 / 2017-3-17
=================
- Version number generator fix.

1.0.4 / 2017-3-17
=================
- Bug fix in node.setFromText

1.0.3 / 2017-3-15
=================
- Added extend method

1.0.2 / 2017-3-02
=================
- Initial release
