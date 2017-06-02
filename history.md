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
