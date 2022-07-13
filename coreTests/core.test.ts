#!/usr/bin/env ts-node

import { treeNotationTypes } from "../products/treeNotationTypes"

const testTree: treeNotationTypes.testTree = {}
const { jtree } = require("../index.js")

/*NODE_JS_ONLY*/ const TreeNode = jtree.TreeNode

const testStrings: treeNotationTypes.stringMap = {}
const testObjects: any = {}

testStrings.webpage = `head
body
 div
 div
 div
  class main
  content yo
 div
 div
  class footer
  content hi`

testStrings.webpageTrimmed = `body
 div
  class main
  content yo
 div
  class footer
  content hi
`

testStrings.lime = `name cref
file_extensions c
scope source.c
contexts
 main
  pattern
   match (if|else|for|while)
   scope keyword.control.c
  pattern
   match Q
   push string
 string
  meta_scope string.quoted.double.c
  pattern
   match !.
   scope constant.character.escape.c
  pattern
   match Q
   pop true`

testStrings.limeToYaml = `%YAML 1.2
---
name: cref
file_extensions: c
scope: source.c
contexts:
 main:
  - pattern:
     match: (if|else|for|while)
     scope: keyword.control.c
  - pattern:
     match: Q
     push: string
 string:
  - meta_scope: string.quoted.double.c
  - pattern:
     match: !.
     scope: constant.character.escape.c
  - pattern:
     match: Q
     pop: true`

testStrings.sortByMultiple = `
state
 name Error
 date 4/1/10
 key a
state
 name Success
 date 2/2/11
 key b
state
 name Error
 date 1/3/32
 key c
`

testObjects.json2tree = [{ id: 755, settings: "123" }, { id: 756, settings: "456" }]
testStrings.json2tree = `docs
 0
  id 755
  settings 123
 1
  id 756
  settings 456`

testStrings.every = `user
name Aristotle
admin false
stage
 name home
 domain test.test.com
pro false
domains
 test.test.com
  images
  blocks
  users
  stage home
  pages
   home
    settings
     data
      title Hello, World
    block1
     content Hello world`

testStrings.toXml = `html
 head
 body
  div
  div
   class main
   content yo
  div
   class footer
   content hi`

testStrings.toXmlPrettyResult = `<html>
  <head></head>
  <body>
    <div></div>
    <div>
      <class>main</class>
      <content>yo</content>
    </div>
    <div>
      <class>footer</class>
      <content>hi</content>
    </div>
  </body>
</html>
`

testStrings.fromXmlTree = `html
 class main
 children
  head
  body
   style color: red;
   children
    div
     class main
     children
      0 Hello world`

testStrings.fromXml = `<html class="main">
  <head></head>
  <body style="color: red;">
    <div class="main">Hello world</div>
  </body>
</html>
`

testStrings.fromDelimited = `foodName^weight^Pri
~Apple~^2.2^1
~Banana~^3.2^1`

testStrings.splitTest = `
thisWillBe ignored
title This is a test
content Hello world
date 2/25/2014
title This is not a test
content Hello planet
date 2/25/2015
title This is definitely a test
content Hello earth
date 2/25/2016
`

testStrings.delimited = `0
 id 1
 title Some book
 summary An expose, on the result of one "plus" one
1
 id 2
 title The answer, my friend, is...
 summary "Two"`

testStrings.renameTest = `title b on GitHub
description
hideLabels true
public true
arrangeables stargazers_count created_at forks_count open_issues_count language
aliases
 stargazers_count Stars
 created_at Created
 forks_count Forks
 language Language
 open_issues_count Issues
formats
 stargazers_count 0a
types
 language string
 created_at date
x language
y stargazers_counter
`

testStrings.csv = `id,title,summary
1,Some book,"An expose, on the result of one ""plus"" one"
2,"The answer, my friend, is...","""Two"""`

testStrings.csvNoHeaders = `bob,12,red
mike,321,blue
al,1214,green`

testStrings.toTableLeft = `name score color
bob  12    red  
mike 321   blue 
al   1214  green`

testStrings.toTable = `name score color
 bob    12   red
mike   321  blue
  al  1214 green`

testStrings.ssv = `id title summary
1 "Some book" "An expose, on the result of one ""plus"" one"
2 "The answer, my friend, is..." """Two"""`

testStrings.ssvFixedColumnComment1 = "This is some comment with trees"
testStrings.ssvFixedColumnComment2 = "Each row should be capped to 2 columns"
testStrings.ssvFixedColumns = `id comment
123 ${testStrings.ssvFixedColumnComment1}
456 ${testStrings.ssvFixedColumnComment2}
`

testStrings.ssvMissingColumns = `state abbreviation population
california ca 35000000
texas tx
washington wa 6000000`

testStrings.renameTreesBy = `
0
 name John Doe
 email johndoe@email.com
1
 name Mary Jane
 email maryjane@email.com
`

testStrings.newLines = `
tree
 palm
  green true

  location Cali
 pine

  location Maine
bush foo
`

testStrings.tsv = `id\ttitle\tsummary
1\tSome book\t\"An expose, on the result of one \"\"plus\"\" one\"
2\tThe answer, my friend, is...\t\"\"\"Two\"\"\"`

testObjects.tsv = {
  firstName: "John",
  lastName: "Smith",
  isAlive: true,
  lowScore: 0,
  lowestScore: -10,
  age: 25,
  height_cm: 167.6,
  numbers: [12, 132.2, 312, true, null, false, {}, ""],
  address: {
    streetAddress: "21 2nd Street",
    city: "New York",
    state: "NY",
    postalCode: "10021-3100",
    blankString: ""
  },
  phoneNumbers: [
    {
      type: "home",
      number: "212 555-1234"
    },
    {
      type: "office",
      number: "646 555-4567"
    }
  ],
  spouse: null
}

testTree.constructorTests = equal => {
  // Assert
  equal(!!TreeNode, true, "TreeNode class should exist")
  equal(new TreeNode() instanceof TreeNode, true, "TreeNode should return a tree")

  // Arrange/Act
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.length, 1, "types array should have 1 property")
  equal(tree.indexOf("hello"), 0, "types array should be correct")
  equal(tree.getNode("hello").getContent(), "world", "Properties should be accessible")
  equal(typeof tree.getNode("hello").getContent(), "string", "Leafs should be strings")

  // Act
  tree.touchNode("foo").setContent("bar")

  // Assert
  equal(tree.getNode("foo").getContent(), "bar", "Trees should be modifiable")

  // Arrange
  const tree2 = new TreeNode("foobar\n one 1")

  // Assert
  equal(tree2.getNode("foobar").getContent(), undefined, "Value should be empty")
  equal(
    tree2
      .getNode("foobar")
      .getNode("one")
      .getContent(),
    "1",
    "Value should be 1"
  )

  equal(typeof tree2.getNode("foobar"), "object", "Trees should be objects")
  equal(tree2.getNode("foobar") instanceof TreeNode, true, "Nested trees should be trees")

  // Arrange
  const tree3 = new TreeNode("list\nsingle value")

  // Assert
  equal(tree3.length, 2, "TreeNode should have 2 names")
  equal(tree3.getNode("list").length, 0, "A name without a trailing tree should be length 0")

  // Arrange
  const tree4 = new TreeNode("body")

  // Assert
  equal(tree4.getNode("body").length, 0, "A name without a trailing tree should be a tree")

  // Arrange
  const tree5 = new TreeNode({
    foobar: "hello"
  })

  // Assert
  equal(tree5.getNode("foobar").getContent(), "hello", "Trees can be created from object literals")

  // Arrange
  const tree6 = new TreeNode({
    foobar: new TreeNode("hello world")
  })

  // Assert
  equal(tree6.getNode("foobar hello").getContent(), "world", "Trees can be created from objects mixed with trees")

  // Arrange
  const tree7 = new TreeNode({
    foobar: {
      hello: {
        world: "success"
      }
    }
  })

  // Assert
  equal(tree7.getNode("foobar hello world").getContent(), "success", "Trees can be created from deep objects")
}

testTree.multlineConstructorTests = equal => {
  // Arrange
  const treeString = `user
name Aristotle
admin false
stage
name home
domain test.test.com
pro false
domains
 test.test.com
  images
  blocks
  users
  stage home
  pages
   home
    settings
     data
      title Hello, World
    block1
     content Hello world`
  const tree8 = new TreeNode(treeString)

  // Assert
  equal(tree8.getTopDownArray().length, 20)
  equal(tree8.getNumberOfLines(), 20)
  equal(tree8.getNumberOfWords(), 30)
  equal(tree8.getNode("domains test.test.com pages home settings data title").getContent(), "Hello, World", "Multiline creation should be okay.")

  // Arrange
  const emptyArray = { post: { kind: {}, age: 100 } }
  const expectedStr = `post
 kind
 age 100`
  // Act
  const tree10 = new TreeNode(emptyArray)
  // Assert
  equal(tree10.toString(), expectedStr)

  // Arrange
  const node = new TreeNode(" ").nodeAt(0)

  // Act/Assert
  equal(node.getFirstWord(), "")
  equal(node.getContent(), "")

  // Arrange
  const spaceChar = " "
  let s = `
${spaceChar}
${spaceChar}
${spaceChar}`
  // Act/Assert
  equal(new TreeNode(s).nodeAt(0).length, 3)

  // Arrange
  s = `
${spaceChar}${spaceChar}
${spaceChar}`
  // Act/Assert
  equal(new TreeNode(s).nodeAt(0).length, 2)
}

testTree.ambiguityFixWhenAssignmentAndEdgeCharsMatch = equal => {
  // Arrange
  let test = `
 :
 :`
  // Act/Assert
  class TestTree extends TreeNode {
    getWordBreakSymbol() {
      return ":"
    }
  }
  const iHateTypeScript = <any>TestTree

  equal(new iHateTypeScript(test).nodeAt(0).length, 2)

  const rootTree = new iHateTypeScript()
  const tree = rootTree.appendLineAndChildren("", new iHateTypeScript())
  tree.appendLine("")
  tree.appendLine("")
  const newTree = new iHateTypeScript(rootTree.toString())
  equal(newTree.nodeAt(0).length, 2)
}

testTree.duplicateReferences = equal => {
  // Arrange
  let b = ["abc"]
  let a = {
    one: b,
    two: b
  }

  // Act/Assert
  equal(new TreeNode(a).get("two 0"), "abc")

  // Arrange
  let boo = { foo: "bar" }
  let abc = {
    one: boo,
    two: boo
  }

  // Act/Assert
  equal(new TreeNode(abc).get("two foo"), "bar")
}

testTree.append = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Act
  tree.appendLine("foo bar")
  tree.touchNode("foo2").setContent("bar")

  // Assert
  equal(tree.getNode("foo").getContent(), "bar")

  // Act
  tree.appendLine("foo two")

  // Assert
  equal(tree.length, 4)
}

testTree.deleteBlanks = equal => {
  // AAA
  equal(new TreeNode("hello world\n\n\nhelmet\nthe").deleteBlanks().length, 3)
}

testTree.getNodesByRegex = equal => {
  // AAA
  equal(new TreeNode("hello world\nhelmet\nthe").getNodesByRegex(/^he/).length, 2)
}

testTree.getWord = equal => {
  // Arrange
  const tree = new TreeNode("a b c")
  const aNode = tree.getNode("a")

  // Act/Assert
  equal(aNode.getWord(1), "b")
  equal(aNode.getWord(-1), "c")
}

testTree.getOneOf = equal => {
  // Arrange
  const tree = new TreeNode(`tint blue\nColor red`)

  // Act/Assert
  equal(tree.getOneOf(["Color", "tint"]), "red")
  equal(tree.getOneOf(["tint", "Color"]), "blue")
  equal(tree.getOneOf(["height"]), "")
}

testTree.pick = equal => {
  // Arrange
  const tree = new TreeNode(`tint blue\nColor red`)

  // Act/Assert
  equal(tree.pick(["Color", "tint"]).toString(), `tint blue\nColor red`)
  equal(tree.getOneOf(["height"]).toString(), "")
}

testTree.setProperties = equal => {
  // Arrange
  const tree = new TreeNode(``)
  tree.setProperties({ foo: "bar", one: "2" })

  // Act/Assert
  equal(tree.get("one"), "2")
}

testTree.setPropertyIfMissing = equal => {
  // Arrange
  const tree = new TreeNode(``)
  tree.setProperties({ foo: "bar", one: "2" })
  tree.setPropertyIfMissing("one", "3")
  tree.setPropertyIfMissing("two", "a")

  // Act/Assert
  equal(tree.get("one"), "2")
  equal(tree.get("two"), "a")
}

testTree.setWords = equal => {
  // Arrange
  const tree = new TreeNode("a b c")
  const aNode = tree.getNode("a")

  // Act/Assert
  equal(aNode.appendWord("d").toString(), "a b c d")
  equal(aNode.setWords(["f", "g"]).toString(), "f g")
  equal(aNode.setWordsFrom(1, ["h", "i"]).toString(), "f h i")
  equal(aNode.deleteWordAt(2).toString(), "f h")
}

testTree.at = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhow are you\nhola friend")

  // Assert
  equal(value.nodeAt(0).getContent(), "world")
  equal(value.nodeAt(1).getContent(), "are you")
  equal(value.nodeAt(2).getContent(), "friend")
  equal(value.nodeAt(3), undefined)
  equal(value.nodeAt(-1).getContent(), "friend")
}

testTree.getWordBoundaryCharIndices = equal => {
  // Arrange
  const tree = new TreeNode(`
a
web 25 zzzz OK
 notes No notes`)

  // Act
  const boundaries = tree.getAllWordBoundaryCoordinates()

  // Assert
  equal(boundaries.length, 9)
}

testTree.toDelimited = equal => {
  const test = `name|example
python|"Hello world"`
  const tree = TreeNode.fromDelimited(test, "|", "'")

  // Act/Assert
  equal(tree.toDelimited("|", undefined, false), test)
}

testTree.fill = equal => {
  Object.keys(testStrings).forEach(key => {
    // Arrange
    const tree = new TreeNode(testStrings[key])
    const filledTree = tree.clone().fill("x")
    // Act/Assert
    equal(tree.length, filledTree.length)
    equal(tree.getNumberOfLines(), filledTree.getNumberOfLines())
    equal(tree.getNumberOfWords(), filledTree.getNumberOfWords())
  })
}

testTree.getWordProperties = equal => {
  // Arrange
  const tree = new TreeNode(`
a
web 25 zzzz OK
 notes No notes`)

  // Act/Assert
  const props = tree.nodeAtLine(3).getWordProperties(2)
  equal(props.startCharIndex, 10)
  equal(props.endCharIndex, 15)
}

testTree.getWordIndexAtCharacterIndex = equal => {
  // Arrange
  const tree = new TreeNode(`
a
web 25 zzzz OK
 notes No notes`)
  const tests = `0
00
000011122222333
 000000111222222`

  // Act/Assert
  const lineNodes = tree.getTopDownArray()
  tests.split("\n").forEach((testLine, lineIndex) => {
    const node = lineNodes[lineIndex]
    testLine.split("").forEach((char, charIndex) => {
      if (char !== " ") equal(node.getWordIndexAtCharacterIndex(charIndex), parseInt(char), `Character is '${char}'`)
    })
  })

  // Arrange
  const nested = new TreeNode(`a
 b
  c
   d`)

  // Act/Assert
  equal(nested.getNode("a b").getWordIndexAtCharacterIndex(0), -1)
}

testTree.clone = equal => {
  // Arrange/Act
  const a = new TreeNode("hello world")
  const b = a.clone()

  // Assert
  equal(b.getNode("hello").getContent(), "world")
  equal(a.toString(), b.toString(), "string unchanged")

  // Act
  b.touchNode("hello").setContent("mom")

  // Assert
  equal(a.getNode("hello").getContent(), "world")

  // Arrange
  const c = a

  // Assert
  equal(c.getNode("hello").getContent(), "world")

  // Act
  c.touchNode("hello").setContent("foo")

  // Assert
  equal(a.getNode("hello").getContent(), "foo")

  // Arrange
  const d = c

  // Assert
  equal(d.getNode("hello").getContent(), "foo", "foo should be value")

  // Act
  d.touchNode("hello").setContent("hiya")

  // Assert
  equal(a.getNode("hello").getContent(), "hiya", "original unchanged")

  // Act
  a.touchNode("test").setContent("boom")

  // Assert
  equal(d.getNode("test").getContent(), "boom")

  // Act
  a.touchNode("foobar").setChildren(new TreeNode("123 456"))

  // Assert
  equal(c.getNode("foobar 123").getContent(), "456", "expected 456")

  // Arrange
  const e = a

  // Assert
  equal(e.getNode("foobar 123").getContent(), "456")

  // Arrange
  const f: any = a.clone()

  // Assert
  equal(f.getNode("foobar 123").getContent(), "456")

  // Act
  f.hi = "test"

  // Assert
  equal((<any>a).hi, undefined)
}

testTree.concat = equal => {
  // Arrange
  const a = new TreeNode("hello world")
  const b = new TreeNode("hi mom")

  // Act
  const newNodes = a.concat(b)

  // Assert
  equal(a.getNode("hi").getContent(), "mom")
  equal(newNodes.length, 1)
}

testTree.getNodesByGlobPath = equal => {
  // Arrange/Act/Assert
  equal(new TreeNode(testStrings.webpage).getNodesByGlobPath("* div").length, 5)
  equal(new TreeNode(testStrings.webpage).getNodesByGlobPath("*").length, new TreeNode(testStrings.webpage).length)
  equal(new TreeNode(testStrings.webpage).getNodesByGlobPath("body div class").length, 2)
}

testTree.nodesThatStartWith = equal => {
  equal(new TreeNode(testStrings.webpage).nodesThatStartWith("body")[0].nodesThatStartWith("div").length, 5)
}

testTree.getNodeByColumns = equal => {
  // Arrange
  const test = new TreeNode(testStrings.sortByMultiple)

  // Act
  const node = test.getNodeByColumns("name", "Success")

  // Assert
  equal(node.getParent().get("key"), "b")
}

testTree.delete = equal => {
  // Arrange
  const tree = new TreeNode()
  tree.touchNode("name").setContent("Breck")

  // Assert
  equal(tree.getNode("name").getContent(), "Breck", "name is set")
  equal(tree.length, 1, "length okay")
  equal(tree.getFirstNode().getContent(), "Breck")

  // Act
  tree.delete("name")

  // Assert
  equal(tree.getNode("name"), undefined, "name is gone")
  equal(tree.length, 0, "length okay")

  // Act
  tree.touchNode("name").setContent("Breck")
  tree.touchNode("age").setContent("100")
  tree.touchNode("table").setContent("true")
  tree.delete("age")

  // Assert
  equal(tree.getNode("age"), undefined, "age is gone")
  equal(tree.length, 2, "expected 2 elements remaining")

  // Test deep delete
  // Arrange
  const tree2 = new TreeNode()
  tree2.touchNode("earth north_america united_states california san_francisco").setContent("mission")

  // Assert
  equal(tree2.getNode("earth north_america united_states california") instanceof TreeNode, true, "node exists")
  equal(tree2.getNode("earth north_america united_states california san_francisco").getContent(), "mission", "neighborhood is set")
  equal(tree2.getNode("earth north_america united_states california").length, 1, "length okay")
  equal(tree2.length, 1, "length okay")

  // Act
  const deleteResult = tree2.delete("earth north_america united_states california san_francisco")

  // Assert
  equal(deleteResult instanceof TreeNode, true, "returns tree")
  equal(tree2.getNode("earth north_america united_states california san_francisco"), undefined, "neighborhood is gone")

  // Test deleting a non-existant property
  // Arrange
  const tree3 = new TreeNode("property meta\n")

  // Act
  tree3.delete("content")

  // Assert
  equal(tree3.getNode("property").getContent(), "meta", "delete a non existing entry works")

  // Delete a property that has multiple matches
  // Arrange
  const tree4 = new TreeNode("time 123\ntime 456")

  // Assert
  equal(tree4.length, 2)

  // Act
  tree4.delete("time")

  // Assert
  equal(tree4.length, 0)

  // Arrange
  const blankTest = `presidents
 class President
other`
  const tree6 = new TreeNode(blankTest)

  // Act
  tree6.forEach((node: treeNotationTypes.treeNode) => {
    if (!node.getFirstWord().startsWith("p")) return true
    node.setContent("President")
    node.delete("class")
  })

  // Assert
  equal(
    tree6.toString(),
    `presidents President
other`
  )
}

testTree.deleteRegression = equal => {
  // Arrange
  const test = `data
 row
  time 2015/01/02 09:00:00
  count 1
 row
  time 2015/01/02 10:00:00
  count 3
 row
  time 2015/01/02 12:00:00
  count 2
 row
  time 2015/01/02 13:00:00
  count 2
 row
  time 2015/01/02 21:00:00
  count 3
 row
  time 2015/01/02 23:00:00
  count 1
 row
  time 2015/01/03 00:00:00
  count 2
 row
  time 2015/01/03 08:00:00
  count 2
 row
  time 2015/01/16 04:00:00
  count 2
 row
  time 2015/01/16 14:00:00
  count 2
 row
  time 2015/01/16 15:00:00
  count 1
 row
  time 2015/01/16 17:00:00
  count 1`

  // Act
  const migrateFn = (str: string) => {
    const board = new TreeNode(str)
    const dataNodes = board.findNodes("data")
    dataNodes.forEach((nodeTree: treeNotationTypes.treeNode) => {
      const rows = nodeTree.findNodes("row")
      if (!rows.length) return
      const mapped = rows.map((row: treeNotationTypes.treeNode) => row.toObject())
      const csv = new TreeNode(mapped).toCsv()
      nodeTree.touchNode("format").setContent("csv")
      nodeTree.touchNode("content").setContentWithChildren(csv)
      nodeTree.delete("row")
    })
    return board.toString()
  }
  const result = new TreeNode(migrateFn(test)).getNode("data")

  // Assert
  equal(result.findNodes("row").length, 0)
}

testTree.destroy = equal => {
  const template = `hey ho
hi
 hello world
yo hey`
  // Arrange
  const tree = new TreeNode(template)

  // Act
  tree.nodeAt(1).destroy()

  // Assert
  equal(tree.toString(), "hey ho\nyo hey")
}

testTree.duplicateProperties = equal => {
  // Arrange
  const tree = new TreeNode("time 123\ntime 456")

  // Assert
  equal(tree.length, 2)
  equal(tree.toString(), "time 123\ntime 456")
}

testTree.duplicate = equal => {
  // Arrange
  const tree = new TreeNode(testStrings.fromXmlTree)
  const lineCount = tree.toString().split(/\n/).length
  const node = tree.getNode("html")

  // Act
  node.duplicate()

  // Assert
  equal(tree.toString().split(/\n/).length, lineCount * 2)
}

testTree.forEach = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  var count = 0
  var result = ""

  // Act
  value.forEach(function(node: treeNotationTypes.treeNode) {
    const property = node.getFirstWord()
    const v = node.getContent()
    result += property.toUpperCase()
    result += v.toUpperCase()
    result += value.length
  })

  // Assert
  equal(value.length, 2, "test chaining")
  equal(result, "HELLOWORLD2HIMOM2")

  // Test that returning false breaks out of each
  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")

  // Act
  value2
    .filter((node: treeNotationTypes.treeNode) => node.getFirstWord() !== "hello")
    .forEach((node: treeNotationTypes.treeNode) => {
      const property = node.getFirstWord()
      const value = node.getContent()
      count++
    })
  // Assert
  equal(count, 1)

  // Arrange
  const tree = new TreeNode("hello world\nhi world")
  var inc = 0

  // Act
  tree.forEach((node: treeNotationTypes.treeNode, index: number) => {
    inc = inc + index
  })

  // Assert
  equal(inc, 1, "index worked")
}

testTree.every = equal => {
  // Arrange/Act/Assert
  equal(new TreeNode(`a 2\nb 2\nc 2`).every((node: treeNotationTypes.treeNode) => node.getWord(1) === "2"), true)
}

testTree.extend = equal => {
  // Arrange
  const sourceStr = `name Jane
color blue`
  const destinationStr = `username jane`
  const source = new TreeNode(sourceStr)
  const destination = new TreeNode(destinationStr)
  // Act
  destination.extend(source)
  // Assert
  equal(destination.toString(), [destinationStr, sourceStr].join("\n"))

  // Test deep
  const original = { person: "Abe", age: "24", items: { car: "blue" } }
  const extension = { person: "Joe", weight: 100, items: { car: "red", foo: "bar" } }

  // Act
  const tree = new TreeNode(original).extend(extension)
  const result = tree.toObject()

  // Assert
  equal(result.person, "Joe")
  equal(result.age, "24")
  equal(result.weight, "100")
  equal(result.items.car, "red", "expected deep to work")
  equal(result.items.foo, "bar")
  equal(tree.getNode("items").length, 2)

  // Arrange
  const test = `>foo
 class main`
  const web = `>foo
 >bar
  >bam
   class boom
   ham
    hoom
    vroom`
  // Act
  const extended = new TreeNode(test).extend(web)

  // Assert
  equal(extended.getNode(">foo >bar >bam class").getContent(), "boom")
}

testTree.first = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getContent(), "world")

  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value2.nodeAt(0).toString(), "hello world")
}

testTree.firstProperty = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getFirstWord(), "hello")
}

testTree.hasDuplicates = equal => {
  // Arrange/Act/Assert
  equal(new TreeNode(testStrings.sortByMultiple).hasDuplicateFirstWords(), true)
  equal(new TreeNode().hasDuplicateFirstWords(), false, "empty")
  equal(new TreeNode("a\na").hasDuplicateFirstWords(), true)
  equal(new TreeNode("a\n a\n b").nodeAt(0).hasDuplicateFirstWords(), false)
  equal(new TreeNode("a\n b\n b").nodeAt(0).hasDuplicateFirstWords(), true)
}

testTree.toYaml = equal => {
  // Arrange/Act/Assert
  equal(new TreeNode(testStrings.lime).toYaml(), testStrings.limeToYaml)
}

testTree.toGridJson = equal => {
  // Arrange/Act/Assert
  const tests = Object.keys(testStrings).forEach(key => {
    const program = testStrings[key]
    const serialized = new TreeNode(program).toGridJson()
    equal(TreeNode.fromGridJson(serialized).toString(), program)
  })
}

testTree.toJson = equal => {
  // Arrange/Act/Assert
  const tests = Object.keys(testStrings).forEach(key => {
    const program = testStrings[key]
    const serialized = new TreeNode(program).toJson()
    equal(TreeNode.fromJson(serialized).toString(), program)
  })
}

testTree.firstValue = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getContent(), "world")
}

testTree.toggleLine = equal => {
  // Arrange
  const node = new TreeNode("chart").nodeAt(0)
  equal(node.has("hidden"), false)

  // Act
  node.toggleLine("hidden")

  // Assert
  equal(node.hasLine("hidden"), true)
  equal(node.has("hidden"), true)

  // Act
  node.toggleLine("hidden")

  // Assert
  equal(node.hasLine("hidden"), false)
  equal(node.has("hidden"), false)
}

testTree.pasteText = equal => {
  // Arrange
  const tree = new TreeNode(`a
 b`)
  // Act
  tree.getNode("a b").pasteText(`foo
 bar`)
  // Assert
  equal(
    tree.toString(),
    `a
 foo
  bar`
  )
}

testTree.templateToString = equal => {
  // Arrange
  const templateString = new TreeNode(`html
 head
  title {title}
  style {height} {width}
 body
  {elements}`)
  // Act
  const str = templateString.templateToString({
    title: "Hello world",
    height: "10",
    width: "20",
    elements: `h1 header
h2 subheader
div
 div Some text`
  })
  // Assert
  const expected = `html
 head
  title Hello world
  style 10 20
 body
  h1 header
  h2 subheader
  div
   div Some text`
  equal(str, expected, "templateToString works")

  // Act
  try {
    templateString.templateToString({})
    equal(false, true, "template strings currently require all params. should have thrown.")
  } catch (err) {
    equal(true, true, "error caught")
  }

  // Act
  let str2 = templateString.templateToString({ title: "", height: "", width: "", elements: "" })
  equal(
    str2,
    `html
 head
  title 
  style  
 body
  `,
    "blanks work"
  )
}

testTree.evalTemplateString = equal => {
  // Arrange
  const templateString = "Hi {firstName} {lastName}! I hope you are enjoying the weather in {address city}!"
  const person = new TreeNode("firstName Tom\nlastName B\naddress\n city Boston")

  // Act
  const result = person.evalTemplateString(templateString)

  // Assert
  equal(result, "Hi Tom B! I hope you are enjoying the weather in Boston!")
}

testTree.fromCsv = equal => {
  // Arrange/Act
  const tree = TreeNode.fromCsv(testStrings.csv)
  const withQuotes = TreeNode.fromCsv('"Date","Age"\n"123","345"')

  // Assert
  equal(tree.toString(), testStrings.delimited)
  equal(tree.length, 2, "expected 2 rows")
  equal(tree.toCsv(), testStrings.csv, "Expected toCsv to output same data as fromCsv")

  // Arrange
  const tree2 = TreeNode.fromCsv("Age,Birth Place,Country\n12,Brockton,USA")

  // Assert
  equal(tree2.length, 1)
  equal(
    tree2
      .nodeAt(0)
      .getNode("Country")
      .getContent(),
    "USA"
  )

  // Arrange
  const tree3 = TreeNode.fromCsv("")

  // Assert
  equal(tree3.toString(), "", "Expected empty string to be handled correctly")

  // Assert
  equal(withQuotes.getNode("0 Date").getContent(), "123", "Expected quotes to be handled properly")

  // Arrange
  const tree4 = TreeNode.fromCsv('height\n"32,323"')

  // Assert
  equal(tree4.getNode("0 height").getContent(), "32,323")

  // Test quote escaping
  // Arrange
  const csvWithQuotes = 'name,favoriteChar\nbob,"""."'

  // Act
  const tree5 = TreeNode.fromCsv(csvWithQuotes)

  // Assert
  equal(tree5.toString(), '0\n name bob\n favoriteChar ".', "Four double quotes should return one double quote")

  // Test \r characters
  // Arrange
  const csv = "name,age\r\njoe,21\r\nbill,32\r\n"

  // Act
  const testCase = TreeNode.fromCsv(csv.replace(/\r/g, ""))

  // Assert
  equal(testCase.getNode("1 age").getContent(), "32", "Expected return chars to be removed")

  // Act
  testCase.getNode("1").delete("name")

  // Assert
  equal(testCase.getNode("0").childrenToString(), "name joe\nage 21", "property change should not affect other objects")
  equal(testCase.getNode("1 name"), undefined, "property should be gone")
}

testTree.fromCsvNoHeaders = equal => {
  // Arrange
  const a = TreeNode.fromDelimitedNoHeaders(testStrings.csvNoHeaders, ",", '"')

  // Assert
  equal(a.length, 3)
  equal(a.getNode("1 2").getContent(), "blue")
}

testTree.fromDelimited = equal => {
  // Arrange
  const a = TreeNode.fromDelimited(testStrings.fromDelimited, "^", "~")

  // Assert
  equal(a.length, 2)
  equal(a.getNode("0 weight").getContent(), "2.2")
  equal(a.getNode("1 foodName").getContent(), "Banana")

  // Arrange
  const b = TreeNode.fromDelimited(
    `name,score

joe,23`,
    ",",
    '"'
  )

  // Assert
}

testTree.fromDelimitedWindowsLineEndings = equal => {
  // Arrange
  const str = "A,B\n1,3"
  const str2 = "A,B\n\r1,3"
  // Act
  const result = TreeNode.fromCsv(str)
  const result2 = TreeNode.fromCsv(str2)

  // Assert
  equal(result.get("0 B"), "3")
  equal(result2.get("0 B"), "3")
}

testTree.siblingsWithClone = equal => {
  // Arrange
  const test = new TreeNode(`a
b
c`)

  // Act
  const clone = test.clone()

  // Assert
  equal(test.lastNode().getOlderSiblings().length, 2)
  equal(clone.lastNode().getOlderSiblings().length, 2)
}

testTree.siblings = equal => {
  // Arrange
  const test = new TreeNode(`a
b
c`)

  // Act
  const a = test.getNode("a")
  const b = test.getNode("b")
  const c = test.getNode("c")

  // Assert
  equal(a.getSiblings().length, 2)
  equal(a.getOlderSiblings().length, 0)
  equal(a.getYoungerSiblings().length, 2)
  equal(b.getSiblings().length, 2)
  equal(b.getOlderSiblings().length, 1)
  equal(b.getYoungerSiblings().length, 1)
  equal(c.getSiblings().length, 2)
  equal(c.getOlderSiblings().length, 2)
  equal(c.getYoungerSiblings().length, 0)

  // Act
  a.appendSibling("a2", "foo")
  a.prependSibling("a-1", "foo")

  // Assert
  equal(
    test.toString(),
    `a-1
 foo
a
a2
 foo
b
c`
  )
}

testTree.expandLastFromTopMatter = equal => {
  // Arrange
  const test = new TreeNode(`titleComponent
 class title
articleComponent hi
 h1 title
html
 titleComponent
 articleComponent`)
  // Act
  const expanded = test.expandLastFromTopMatter().toString()

  // Assert
  equal(
    expanded,
    `html
 titleComponent
  class title
 articleComponent hi
  h1 title`
  )
}

testTree.replaceNode = equal => {
  // Arrange
  const test = new TreeNode(`a
b`)
  const a = test.getNode("a")

  // Act
  a.replaceNode((str: any) => str.replace("a", "z"))

  // Assert
  equal(
    test.toString(),
    `z
b`
  )
}

testTree.fromSsv = equal => {
  // Arrange/Act
  const a = TreeNode.fromSsv(testStrings.ssv)

  // Assert
  equal(a.toString(), testStrings.delimited)
  equal(a.toSsv(), testStrings.ssv, "toSsv ok")

  // Arrange/Act
  const fixedCol = TreeNode.fromSsv(testStrings.ssvFixedColumns)

  // Assert
  equal(
    fixedCol
      .nodeAt(0)
      .getNode("comment")
      .getContent(),
    testStrings.ssvFixedColumnComment1
  )
  equal(
    fixedCol
      .nodeAt(1)
      .getNode("comment")
      .getContent(),
    testStrings.ssvFixedColumnComment2
  )
  equal(fixedCol.nodeAt(1).length, 2)

  // Arrange/Act
  const missingCols = TreeNode.fromSsv(testStrings.ssvMissingColumns)

  // Assert
  equal(missingCols.nodeAt(0).length, 3)
  equal(missingCols.nodeAt(1).length, 3)
  equal(missingCols.nodeAt(2).length, 3)
}

testTree.fromTsv = equal => {
  // Arrange/Act
  const a = TreeNode.fromTsv(testStrings.tsv)

  // Assert
  equal(a.toString(), testStrings.delimited, "From TSV worked")
  equal(a.toTsv(), testStrings.tsv, "ToTsv Worked")

  // Test simple path
  // Act
  const b = TreeNode.fromTsv("color\tage\theight\nred\t2\t23")

  // Assert
  equal(b.getNode("0 age").getContent(), "2")
  equal(b.getNode("0 height").getContent(), "23")
}

testTree.lengthen = equal => {
  // AAA
  equal(new TreeNode().lengthen(3).toString(), "\n\n")
}

testTree.getLine = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  const node = tree.getNode("hello")
  const mtime = node.getLineModifiedTime() || 0

  // Assert
  equal(node.getLine(), "hello world")
  equal(tree.has("hello"), true)

  // Act
  node.setLine("hi earth")

  // Assert
  equal(tree.toString(), "hi earth")
  equal(node.getLineModifiedTime() > mtime, true)
  equal(tree.has("hello"), false)
}

testTree.getIndentation = equal => {
  // Arrange
  const tree = new TreeNode(testStrings.webpageTrimmed)

  // Act/assert
  equal(tree.getNode("body").getIndentation(), "")
  equal(tree.getNode("body div").getIndentation(), " ")
  equal(tree.getNode("body div content").getIndentation(), "  ")

  equal(
    testStrings.webpageTrimmed,
    tree
      .getTopDownArray()
      .map((line: treeNotationTypes.treeNode) => line.getIndentation() + line.getLine())
      .join("\n")
  )
}

testTree.getContent = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.getNode("hello").getContent(), "world")
  equal(tree.get("hello"), "world")

  // Act
  // Test get with ints
  tree.touchNode("2").setContent("hi")

  // Assert
  equal(tree.getNode("2").getContent(), "hi", "Expected int strings to work.")

  // Assert
  // Test get with invalid values
  equal(new TreeNode().getNode("some"), undefined, "expected undefined")
  equal(new TreeNode().getNode("some long path"), undefined)
  equal(tree.getNode(""), undefined)

  // Test get with duplicate properties
  // Arrange
  const tree2 = new TreeNode("height 45px\nheight 50px\nwidth 56px")

  // Assert
  equal(tree2.length, 3)

  // Act/Assert
  // When getting a duplicate property last item should win
  equal(tree2.getNode("height").getContent(), "50px", "Expected to get last value in instance with duplicate property.")

  // todo: remove ability of get to take non-strings
  // Arrange
  const treeWithNumbers = new TreeNode("1 bob\n0 brenda")

  // Act/Assert
  equal(treeWithNumbers.getNode("0").getContent(), "brenda")
  equal(treeWithNumbers.getNode("1").getContent(), "bob")
}

testTree.getInheritanceTree = equal => {
  // Arrange
  const classes = `abstractNodeType
abstractModalNodeType abstractNodeType
helpModal abstractModalNodeType
abstractButton abstractNodeType
helpButton abstractButton`

  // Act
  const inheritanceTree = new TreeNode(classes).getInheritanceTree()

  // Assert
  equal(
    inheritanceTree.toString(),
    `abstractNodeType
 abstractModalNodeType
  helpModal
 abstractButton
  helpButton`
  )
}

testTree.getLines = equal => {
  // Arrange
  const value = new TreeNode("hello\n world")

  // Assert
  equal(
    value
      .getLines()
      .join("")
      .indexOf(" "),
    -1
  )
}

testTree.getNodes = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhello world")
  const deep = new TreeNode(`language
 line
  score 2
 line
  score 12`)

  // Assert
  equal(value.findNodes("hello").length, 2)

  // Act
  const result = value
    .findNodes("hello")
    .map((node: treeNotationTypes.treeNode) => node.getContent())
    .join("")

  // Assert
  equal(result, "worldworld")
  equal(deep.findNodes("language line score").length, 2)
  equal(
    deep
      .findNodes("language line score")
      .map((node: treeNotationTypes.treeNode) => node.getContent())
      .join(""),
    "212"
  )
}

testTree.getContentsArray = equal => {
  // Arrange
  const html = new TreeNode("h1 hello world\nh1 hello world")

  // Assert
  equal(html.getContentsArray().join("\n"), "hello world\nhello world")
}

testTree.multiply = equal => {
  class MathNode extends TreeNode {
    getWordBreakSymbol() {
      return " "
    }

    getNodeBreakSymbol() {
      return "o"
    }

    getEdgeSymbol() {
      return "-"
    }
  }

  const iHateTypeScript = <any>MathNode

  // Arrange
  const two = new iHateTypeScript(`o`)
  const three = new iHateTypeScript(`oo`)

  // Act/Assert
  const result = iHateTypeScript.multiply(two, three)

  equal(result.toString(), "o-o-o-oo-o-o-", "multipling empty structures (in this case 1D primes) works as expected")

  // Non blanks
  const four = new TreeNode(
    `o
 o
 o
o
 o
 o`
  )
  const five = new TreeNode(
    `o
o
o
o
o
o`
  )
  const twenty = `o
 o
  o
  o
 o
  o
  o
o
 o
  o
  o
 o
  o
  o
o
 o
  o
  o
 o
  o
  o
o
 o
  o
  o
 o
  o
  o
o
 o
  o
  o
 o
  o
  o
o
 o
  o
  o
 o
  o
  o`

  equal(TreeNode.multiply(five, four).toString(), twenty, "multiplying visible nodes works as expected")
}

testTree.getExpectingABranchButHittingALeaf = equal => {
  // Arrange
  const value = new TreeNode("posts leaf")

  // Assert
  equal(value.getNode("posts branch"), undefined)
}

testTree.getNodesByPrefixes = equal => {
  // Arrange
  const test = `id foobar
 link
 link blue
  color orange
 link black
  color green`
  const tree = new TreeNode(test)

  // Act
  const nodes = tree.getNodesByLinePrefixes(["id foobar", "link blue", "color"])
  const nodes2 = tree.getNodesByLinePrefixes(["id foobar", "link bl"])
  const nodes3 = tree.getNodesByLinePrefixes(["id foobar", "ink"])

  // Assert
  equal(nodes[0].getLine(), "color orange")
  equal(nodes2.length, 2)
  equal(nodes3.length, 0)
}

testTree.getIndex = equal => {
  // Arrange
  const tree = new TreeNode("r1\n name bob\nr2\n name joe")
  const child0 = tree.getNode("r1")
  const child1 = tree.getNode("r2")

  // Act/Assert
  equal(child0.getIndex(), 0, "Has correct index")
  equal(child1.getIndex(), 1, "Has correct index")
}

testTree.simpleTreeLanguage = equal => {
  // Arrange
  class MathProgram extends TreeNode {
    // Look! You created a top down parser!
    createParser() {
      return new TreeNode.Parser(undefined, { "+": AdditionNode, "-": SubstractionNode })
    }

    execute() {
      return this.map((child: any) => child.execute())
    }
  }

  class SubstractionNode extends TreeNode {}

  class AdditionNode extends TreeNode {
    // Look! You created an interpreter!
    execute() {
      return [this.getNumbers().reduce((prev: number, current: number) => prev + current, 0)]
    }

    // Look! You created a declarative file format!
    getNumbers() {
      return this.getWordsFrom(1).map((word: string) => parseFloat(word))
    }

    // Look! You created a compiler!
    compile() {
      return this.getNumbers().join(" + ")
    }
  }
  const source = `+ 2 7
+ 3 1
+ 15 1.1 200 100`

  // Act
  const iHateTypeScript = <any>MathProgram
  const program = new iHateTypeScript(source)
  const compiled = program.compile()

  // Assert
  equal(program.length, 3)
  equal(
    compiled,
    `2 + 7
3 + 1
15 + 1.1 + 200 + 100`
  )

  // Act
  const results = program.execute()
  // Assert
  equal(
    results.join("\n"),
    `9
4
316.1`
  )

  // Edit the program and assure parsing is correct
  // Assert
  equal(program.getChildrenByNodeConstructor(AdditionNode).length, 3)
  equal(program.getChildrenByNodeConstructor(SubstractionNode).length, 0)

  // Act
  program.nodeAt(0).replaceNode((str: any) => str.replace("+", "-"))

  // Assert
  equal(program.getChildrenByNodeConstructor(AdditionNode).length, 2)
  equal(program.getChildrenByNodeConstructor(SubstractionNode).length, 1)
  equal(program.getNodeByType(SubstractionNode) instanceof SubstractionNode, true)
}

testTree.getFirstWordPath = equal => {
  // Arrange
  const tree = new TreeNode(testStrings.every)
  const parent = tree.getNode("domains test.test.com pages home settings")
  const child = tree.getNode("domains test.test.com pages home settings data")
  const simple = new TreeNode("foo bar")

  // Assert
  equal(child.getFirstWordPath(), "domains test.test.com pages home settings data")
  equal(child.getParent(), parent)
  equal(child.getRootNode(), tree)
  equal(child.getStack().length, 6)
  equal(simple.getNode("foo").getStack().length, 1)
  equal(child.getFirstWordPathRelativeTo(parent), "data")
}

testTree.getPathVector = equal => {
  // Arrange
  const tree = new TreeNode(testStrings.every)
  const indexPath = [5, 0, 4, 0, 0]
  const namePath = "domains test.test.com pages home settings"
  const parent = tree.getNode(namePath)
  const child = tree.getNode("domains test.test.com pages home settings data")

  // Assert
  equal(parent.getPathVector().join(" "), indexPath.join(" "))
  equal(child.getPathVector().join(" "), "5 0 4 0 0 0")
  equal(tree.nodeAt(parent.getPathVector()), parent)
  equal(tree.nodeAt(child.getPathVector()), child)

  // Act
  const newNamePath = tree.pathVectorToFirstWordPath([5, 0, 4, 0, 0])

  // Assert
  equal(newNamePath.join(" "), namePath)
}

testTree.getSlice = equal => {
  // Arrange
  const tree = new TreeNode(`a
b
c
d`)
  // Act/Assert
  equal(tree.getSlice(3, 4).toString(), "d")
}

testTree.has = equal => {
  // Arrange
  const tree = new TreeNode("hello world\nnested\nfoo ")

  // Assert
  equal(tree.has("hello"), true)
  equal(tree.has("world"), false)
  equal(tree.has("foo"), true)
  equal(tree.has("nested"), true)
}

testTree.hasNode = equal => {
  // Arrange
  const tree = new TreeNode(testStrings.every)
  equal(tree.hasNode(`admin false`), true)
  equal(
    tree.hasNode(`stage
 name home
 domain test.test.com`),
    true
  )
  equal(tree.hasNode(`name Plato`), false)
  equal(tree.hasNode(`domain test.test.com`), false)
}

testTree.getStackString = equal => {
  const tree = new TreeNode(
    `Thing
 color
  blue
  green`
  )
  // Act/assert
  equal(
    tree.getNode("Thing color green").getStackString(),
    `Thing
 color
  green`
  )
}

testTree.getGraph = equal => {
  // Arrange
  const tree = new TreeNode(
    `Thing
 color
Animal
 dna
 extends Thing
Monkey
 extends Mammal
 oohoohahah
Mammal
 extends Animal
 milk`
  )
  // Act/Assert
  equal(tree.getNode("Monkey").getAncestorNodesByInheritanceViaExtendsKeyword("extends").length, 4)
  equal(tree.getNode("Thing").getAncestorNodesByInheritanceViaExtendsKeyword("extends").length, 1)
  equal(tree.getNode("Animal").getAncestorNodesByInheritanceViaExtendsKeyword("extends").length, 2)
}

testTree.getGraphConventional = equal => {
  // Arrange
  const tree = new TreeNode(
    `Thing
 color
Animal Thing
 dna
Monkey Mammal
 oohoohahah
Mammal Animal
 milk`
  )
  // Act/Assert
  equal(tree.getNode("Monkey").getAncestorNodesByInheritanceViaColumnIndices(0, 1).length, 4)
  equal(tree.getNode("Thing").getAncestorNodesByInheritanceViaColumnIndices(0, 1).length, 1)
  equal(tree.getNode("Animal").getAncestorNodesByInheritanceViaColumnIndices(0, 1).length, 2)
}

testTree.getGraphLoop = equal => {
  // Arrange
  const tree = new TreeNode(
    `Thing Animal
 color
Animal Thing
 dna`
  )

  // Act/Assert
  try {
    tree.getNode("Animal").getAncestorNodesByInheritanceViaColumnIndices(0, 1)
    equal(true, false, "Expected an error")
  } catch (err) {
    equal(true, true)
  }
}

testTree.macroExpand = equal => {
  // Arrange
  const test = `macro red SUBREDDIT
 >reddit SUBREDDIT
  >h2 Top stories in SUBREDDIT
  >pie
  >table
  >line
use red programming
use red programmingLanguages`

  // Act
  const expanded = new TreeNode(test).macroExpand("macro", "use")

  // Assert
  equal(
    expanded.toString(),
    `>reddit programming
 >h2 Top stories in programming
 >pie
 >table
 >line
>reddit programmingLanguages
 >h2 Top stories in programmingLanguages
 >pie
 >table
 >line`
  )
}

testTree.split = equal => {
  // Arrange
  const test = `#file foobar.csv
name,score
j,21
frank,321
#file index.html
<body> hi world</body>
#file foo.css #file
body {
 }`
  const test2 = test
    .split("\n")
    .slice(1)
    .join("\n") // Same without leading #file
  const tree = new TreeNode(test)
  const tree2 = new TreeNode(test2)

  // Act
  const splitTrees = tree.split(`#file`)
  const splitTrees2 = tree2.split(`#file`)

  // Assert
  equal(splitTrees.length, 3)
  equal(splitTrees2.length, 3)
  equal(new TreeNode(`abc\n#find`).split(`#fi`).length, 1, "should not split on partial matches")
  equal(new TreeNode(`abc\n#find\n`).split(`#find`).length, 2, "should split on end of line")
  equal(splitTrees[1].nodeAt(1).getWord(1), "hi")

  // Act/Assert
  equal(splitTrees.join("\n"), test)
  equal(splitTrees2.join("\n"), test2)

  // Arrange/Act/Assert
  Object.keys(testStrings).forEach(key => {
    const tree = new TreeNode(testStrings[key])
    const splitOn = tree.getFirstWords()[0] || "foo"
    equal(tree.split(splitOn).join("\n"), tree.toString(), `split join failed for ${key}`)
  })
}

testTree.shifts = equal => {
  // Arrange
  const str = `reddit
table
chart`
  const tree = new TreeNode(str)

  // Act/Assert
  // Test Noops:
  equal(tree.shiftLeft() && tree.shiftRight() && tree.nodeAt(0).shiftLeft() && true, true)

  equal(tree.length, 3)
  equal(
    tree
      .nodeAt(1)
      .shiftRight()
      .getParent()
      .getLine(),
    "reddit"
  )
  equal(tree.length, 2)

  // Act/Assert
  equal(
    tree
      .nodeAtLine(1)
      .shiftLeft()
      .getParent()
      .toString(),
    str
  )
  equal(tree.length, 3)

  // Arrange
  const str2 = `reddit
 table
 chart
 pie`
  const tree2 = new TreeNode(str2)

  // Act
  tree2.nodeAtLine(2).shiftRight()
  tree2.nodeAtLine(3).shiftRight()
  equal(tree2.nodeAtLine(1).length, 2)

  // Arrange/Act/Assert
  equal(
    new TreeNode(`file foo.js
a = 2
b = 3
c = 4`)
      .nodeAtLine(0)
      .shiftYoungerSibsRight()
      .getRootNode()
      .toString(),
    `file foo.js
 a = 2
 b = 3
 c = 4`
  )

  // Arrange
  const node = new TreeNode(`#file /foo/test-combined2.delete.js
foobar
 test
foo`)
  // Assert
  equal(node.nodeAt(0).getYoungerSiblings().length, 2, "2 younger sibs")

  // Act
  node.nodeAt(0).shiftYoungerSibsRight()
  // Assert
  const expected = `foobar
 test
foo`
  equal(node.nodeAt(0).childrenToString(), expected)
}

testTree.expandChildren = equal => {
  // Arrange
  const tree = new TreeNode(
    `Thing
 color
 ab
Animal Thing
 dna
 ab overridden`
  )
  // Act/Assert
  equal(
    tree._expandChildren(0, 1).toString(),
    `Thing
 color
 ab
Animal Thing
 color
 ab overridden
 dna`
  )

  // Arrange
  const tree2 = new TreeNode(
    `Thing
 color
Animal Thing
 dna
Monkey Mammal
 oohoohahah
Mammal Animal
 milk`
  )
  // Act/Assert
  equal(
    tree2._expandChildren(0, 1).toString(),
    `Thing
 color
Animal Thing
 color
 dna
Monkey Mammal
 color
 dna
 milk
 oohoohahah
Mammal Animal
 color
 dna
 milk`
  )

  const badMap = new TreeNode(`foo
bar foo
car non-existant`)
  try {
    badMap._expandChildren(0, 1)
    equal(true, false, "expanding with missing id should throw")
  } catch (err) {
    equal(err.toString().includes("non-existant"), true, "expanding with missing id throws")
  }
}

testTree.expandedShouldAppendNonMaps = equal => {
  // todo: we need to work on extend so its more straightforward
  // Arrange
  const tree = new TreeNode(
    `constructors
 example
 example foobar`
  )
  // Act/Assert
  equal(tree._expandChildren(0, 1).toString(), tree.toString(), "should have thrown")
}

testTree.htmlDsl = equal => {
  // Arrange
  const html = new TreeNode("h1 hello world\nh1 hello world")
  var page = ""

  // Act
  html.forEach((node: treeNotationTypes.treeNode) => {
    const property = node.getFirstWord()
    const value = node.getContent()
    page += "<" + property + ">" + value + "</" + property + ">"
  })

  // Assert
  equal(page, "<h1>hello world</h1><h1>hello world</h1>")
}

testTree.indexOf = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.indexOf("hello"), 0)
  equal(tree.indexOf("hello2"), -1)

  // Act
  tree.touchNode("color").setContent("")

  // Assert
  equal(tree.indexOf("color"), 1)

  // Act
  tree.appendLine("hello world")

  // Assert
  equal(tree.indexOf("hello"), 0)
  equal(tree.indexOfLast("hello"), 2)
}

testTree.insert = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Act
  tree.insertLine("hi mom", 0)

  // Assert
  equal(tree.indexOf("hi"), 0, "Expected hi at position 0")

  // Insert using an index longer than the current object
  // Act
  tree.insertLine("test dad", 10)

  // Assert
  equal(tree.nodeAt(2).getContent(), "dad", "Expected insert at int greater than length to append")
  equal(tree.length, 3)

  // Insert using a negative index
  // Act
  tree.insertLine("test2 sister", -1)

  // Assert
  equal(tree.nodeAt(2).getContent(), "sister")
  equal(tree.nodeAt(3).getContent(), "dad")
}

testTree.last = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getContent(), "mom")

  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value2.nodeAt(-1).toString(), "hi mom")
}

testTree.lastProperty = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getFirstWord(), "hi")
}

testTree.lastValue = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getContent(), "mom")
}

testTree.createFromArray = equal => {
  // Arrange
  const a = new TreeNode([1, 2, 3])
  // Assert
  equal(a.toString(), "0 1\n1 2\n2 3")

  // Arrange
  const b = new TreeNode({
    data: [
      {
        charge: 1
      },
      {
        charge: 2
      }
    ]
  })

  // Assert
  equal(b.toString(), "data\n 0\n  charge 1\n 1\n  charge 2")
}

testTree.createFromObject = equal => {
  // Arrange
  const tree = new TreeNode(testObjects.tsv)
  const date = new Date()
  const time = date.getTime()
  const treeWithDate = new TreeNode({ name: "John", date: date })

  // Assert
  equal(tree.getNode("lowestScore").getContent(), "-10")
  equal(treeWithDate.getNode("date").getContent(), time.toString())

  // Test against object with circular references
  // Arrange
  const a: any = { foo: "1" }
  const b = { bar: "2", ref: a }

  // Act
  // Create circular reference
  a.c = b
  const tree2 = new TreeNode(a)

  // Assert
  equal(tree2.getNode("c bar").getContent(), "2", "expected 2")
  equal(tree2.getNode("c ref"), undefined)

  // Arrange
  const tree3 = new TreeNode()
  tree3.touchNode("docs").setChildren(testObjects.json2tree)

  // Assert
  equal(tree3.toString(), testStrings.json2tree, "expected json2tree")

  // Arrange
  const test4 = new TreeNode({ score: undefined })

  // Assert
  equal(test4.toString(), "score", "expected blank")
}

testTree.createFromTree = equal => {
  // Arrange
  const a = new TreeNode("foo\n bar bam")
  const b = new TreeNode(a)

  // Assert
  equal(a.getNode("foo bar").getContent(), "bam")
  equal(b.getNode("foo bar").getContent(), "bam")

  // Act
  a.touchNode("foo bar").setContent("wham")

  // Assert
  equal(a.getNode("foo bar").getContent(), "wham")
  equal(b.getNode("foo bar").getContent(), "bam")
}

testTree.createFromString = equal => {
  // Arrange/Act
  const startsWithSpace = new TreeNode(" name john")

  // Assert
  equal(startsWithSpace.length, 1, "Expected 1 node")

  // Arrange
  const a = new TreeNode("text \n this is a string\n and more")

  // Assert
  equal(a.getNode("text").getContentWithChildren(), "\nthis is a string\nand more", "Basic")

  // Arrange
  const b = new TreeNode("a\n text \n  this is a string\n  and more")

  // Assert
  equal(b.getNode("a text").getContentWithChildren(), "\nthis is a string\nand more")
  equal(b.toString(), "a\n text \n  this is a string\n  and more")

  // Arrange
  const string = `first_name John
last_name Doe
children
 1
  first_name Joe
  last_name Doe
  children
   1
    first_name Joe Jr.
    last_name Doe
    age 12
colors
 blue
 red
bio
 Hello this is
 my multline
 biography

 Theres a blank line in there as well

 Two blank lines above this one.
code <p></p>
`
  const c = new TreeNode(string)

  // Assert
  equal(c.getNode("children 1 children 1 age").getContent(), "12")
  equal(c.toString().length, string.length)
  equal(c.toString(), string)

  // Arrange
  const d = new TreeNode("\n\na b\n")

  // Assert
  equal(d.toString(), "\n\na b\n", "Expected extra newlines at start of string to be preserved")

  // Arrange
  const e = new TreeNode("a b\n\nb c\n")
  // Assert
  equal(e.toString(), "a b\n\nb c\n", "Expected extra newlines in middle of string to be preserved")

  // Arrange
  const f = new TreeNode("a b\n\n\n")
  // Assert
  equal(f.toString(), "a b\n\n\n", "Expected extra newlines at end of string to be preserved")

  // Arrange
  const g = new TreeNode("hi\n     somewhat invalid")
  // Assert
  equal(g.getNode("hi ").getContent(), "   somewhat invalid")

  const testCase = new TreeNode(testStrings.newLines)
  equal(testCase.toString().split("\n").length, 11, "All blank lines are preserved")
}

testTree.protoRegression = equal => {
  // Arrange
  const a = `__proto__`
  const tree = new TreeNode(a)
  equal(tree.toString(), a, "proto regression fixed")

  // Arrange
  const b = `constructor`
  const tree2 = new TreeNode(b)
  equal(tree2.toString(), b, "constructor regression fixed")
}

testTree.createFromStringExtraTrees = equal => {
  // Arrange
  const d = new TreeNode("one\ntwo\n  three\n    four\nfive six")
  // Assert
  equal(d.length, 3)
}

testTree.copyTo = equal => {
  // Arrange
  const value = new TreeNode(
    `chart
 title Hello
chart2
 title 2`
  )
  const expected = `chart
 title Hello
 chart2
  title 2`
  const expected2 = `chart
 chart2
  title 2
 title Hello`
  const node0 = value.getChildren()[0]

  // Act
  const node = value.getChildren()[1].copyTo(node0, node0.length)
  value.getChildren()[1].destroy()

  // Assert
  equal(value.toString(), expected)

  // Act
  node.copyTo(node0, 0)

  // Assert
  node.destroy()
  equal(value.toString(), expected2)
}

testTree.braid = equal => {
  // Arrange
  const tree = new TreeNode(`score 1`)
  const tree2 = new TreeNode(`keyword number`)

  // Act/Assert
  equal(
    tree.toBraid([tree2]).toString(),
    `score 1
keyword number`
  )
  equal(tree.toSideBySide([tree2]).toString(), `score 1 keyword number`)
  equal(
    tree
      .toSideBySide([
        `foo

bar`
      ])
      .toString(),
    `score 1 foo
        
        bar`
  )
}

testTree.copyToRegression = equal => {
  // Arrange
  const tree = new TreeNode(
    `>something
 class SomeClass
 css
  red
  green
  blue
 >div`
  )
  const expected = `>something SomeClass
 @red
 @green
 @blue
 >div`

  const migrateNode = (node: treeNotationTypes.treeNode) => {
    if (!node.getFirstWord().startsWith(">")) return true
    if (node.length) {
      const cla = node.getNode("class").getContent()
      if (cla) node.setContent(cla)
      const css = node.getNode("css")
      if (css) {
        const nodes = css.getChildren()
        const toMove: any = []
        nodes.forEach((propNode: treeNotationTypes.treeNode) => {
          const name = propNode.getFirstWord().replace(":", " ")
          propNode.setFirstWord("@" + name)
          toMove.push(propNode)
        })
        toMove.reverse()
        toMove.forEach((prop: treeNotationTypes.treeNode) => prop.copyTo(node, 0))
      }
      node.delete("class")
      node.delete("css")
      node.forEach(migrateNode)
    }
  }

  // Act
  tree.forEach(migrateNode)

  // Assert
  equal(tree.toString(), expected)
}

testTree.insertWord = equal => {
  // Arrange
  const a = new TreeNode("? result chekThis 1 2").getNode("?")
  // Act
  a.insertWord(2, "checkThis")
  // Assert
  equal(a.getLine(), "? result checkThis chekThis 1 2")
}

testTree.setWord = equal => {
  // Arrange
  const a = new TreeNode("? result chekThis 1 2").getNode("?")
  // Act
  a.setWord(2, "checkThis")
  // Assert
  equal(a.getLine(), "? result checkThis 1 2")
}

testTree.treeLanguageDependingOnParent = equal => {
  // Arrange
  class ReverseEtnNode extends TreeNode {
    createParser() {
      return new TreeNode.Parser(TreeNode, {})
    }
  }

  class TestLanguage extends TreeNode {
    createParser() {
      return new TreeNode.Parser(ReverseEtnNode, {})
    }
  }

  // Act
  // This tests against a regression, it should not throw.
  const iHateTypeScript = <any>TestLanguage
  const program = new iHateTypeScript(`foo
 bar`)
  // Assert.
  equal(program.length, 1)
}

testTree.multiline = equal => {
  // Arrange
  const a = new TreeNode("my multiline\n string")
  // Assert
  equal(a.getNode("my").getContentWithChildren(), "multiline\nstring")

  // Arrange
  const a2 = new TreeNode("my \n \n multiline\n string")
  // Assert
  equal(a2.getNode("my").getContentWithChildren(), "\n\nmultiline\nstring")

  // Arrange
  const b = new TreeNode("brave new\n world")
  // Assert
  equal(b.getNode("brave").getContentWithChildren(), "new\nworld", "ml value correct")
  equal(b.toString(), "brave new\n world", "multiline does not begin with nl")

  // Arrange
  const c = new TreeNode("brave \n new\n world")
  // Assert
  equal(c.getNode("brave").getContentWithChildren(), "\nnew\nworld", "ml begin with nl value correct")
  equal(c.toString(), "brave \n new\n world", "multiline begins with nl")

  // Arrange
  const d = new TreeNode("brave \n \n new\n world")
  // Assert
  equal(d.getNode("brave").getContentWithChildren(), "\n\nnew\nworld", "ml begin with 2 nl value correct")
  equal(d.toString(), "brave \n \n new\n world", "multiline begins with 2 nl")

  // Arrange
  const e = new TreeNode("brave new\n world\n ")
  // Assert
  equal(e.getNode("brave").getContentWithChildren(), "new\nworld\n", "ml value end with nl correct")
  equal(e.toString(), "brave new\n world\n ", "multiline ends with a nl")

  // Arrange
  const f = new TreeNode("brave new\n world\n \n ")
  // Assert
  equal(f.getNode("brave").getContentWithChildren(), "new\nworld\n\n", "ml value end with 2 nl correct")
  equal(f.toString(), "brave new\n world\n \n ", "multiline ends with 2 nl")

  // Arrange
  const g = new TreeNode()
  g.touchNode("brave").setContentWithChildren("\nnew\nworld\n\n")
  // Assert
  equal(g.getNode("brave").getContentWithChildren(), "\nnew\nworld\n\n", "set ml works")
  equal(g.toString(), "brave \n new\n world\n \n ", "set ml works")

  // Arrange/Act
  const twoNodes = new TreeNode("title Untitled\n")
  const k = new TreeNode()
  k.touchNode("time").setContent("123")
  k.touchNode("settings").setContentWithChildren(twoNodes.toString())
  k.touchNode("day").setContent("1")

  // Assert
  equal(twoNodes.length, 2)
  equal(k.getNode("settings").length, 1, "Expected subtree to have 1 empty node")
  equal(k.getNode("settings").getContentWithChildren(), twoNodes.toString(), "Expected setContentWithChildren and getText to work with newlines")
  equal(k.toString(), `time 123\nsettings title Untitled\n \nday 1`)

  // Arrange
  const someText = new TreeNode("a")
  const someNode = someText.getNode("a")

  // Act
  someNode.setContentWithChildren("const b = 1;\nconst c = 2;")

  // Assert
  equal(someText.toString(), "a const b = 1;\n const c = 2;")
}

testTree.order = equal => {
  // Arrange
  const a = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10")
  const types = a.getFirstWords().join(" ")

  // Assert
  equal(types, "john susy bob", "order is preserved")
}

testTree.parseNode = equal => {
  // Arrange
  class LeafNode extends TreeNode {}
  class SubNode extends TreeNode {
    createParser() {
      return new TreeNode.Parser(SubNode, {}, [{ regex: /^leaf/, nodeConstructor: LeafNode }])
    }
  }
  class TestLanguageNode extends TreeNode {
    createParser() {
      return new TreeNode.Parser(TestLanguageNode, {}, [{ regex: /^tree/, nodeConstructor: TreeNode }, { regex: /^sub/, nodeConstructor: SubNode }])
    }
  }

  // Act
  const iHateTypeScript = <any>TestLanguageNode
  const node = new iHateTypeScript(
    `foo bar
 foo bar
  tree bar
sub
 leaf`
  )

  // Assert
  equal(node.getNode("foo foo tree") instanceof TreeNode, true)
  equal(node.getNode("foo foo") instanceof TestLanguageNode, true)
  equal(node.getNode("sub leaf") instanceof LeafNode, true)
}

testTree.prependLine = equal => {
  // Arrange
  const a = new TreeNode("hello world")
  // Assert
  equal(a.toString(), "hello world")

  // Act
  const result = a.prependLine("foo bar")
  // Assert
  equal(a.toString(), "foo bar\nhello world")
  equal(result instanceof TreeNode, true)
}

testTree.getLocations = equal => {
  // Arrange/Act
  const a = new TreeNode(
    `hello
 world
ohayo
 good
  morning
  sunshine`
  )
  const b = a.getNode("ohayo good sunshine")

  // Assert
  equal(a.getIndentLevel(), 0, "a indent level")
  equal(a.getLineNumber(), 0)
  equal(b.getIndentLevel(), 3, "b indent level")
  equal(b.getLineNumber(), 6)

  // Arrange
  const reg = new TreeNode(
    `a
 b
  c
d
 e`
  )

  // Act/Assert
  const result = reg
    .getTopDownArray()
    .map((node: treeNotationTypes.treeNode) => node.getLineNumber())
    .join(" ")
  equal(result, "1 2 3 4 5")
  equal(reg.getNode("a").getLineNumber(), 1)
}

testTree.pushContentAndChildren = equal => {
  // Arrange
  const a = new TreeNode()

  // Act
  const result = a.pushContentAndChildren("hello world")

  // Assert
  equal(a.getNode("0").getContent(), "hello world")
  equal(result instanceof TreeNode, true)

  // Act
  a.pushContentAndChildren(undefined, new TreeNode())

  // Assert
  equal(a.getNode("1") instanceof TreeNode, true, "1 is instance of TreeNode")
}

testTree.remap = equal => {
  // Arrange
  const test = `mark
 d 2
 p 3
 c 4
 v 5
 q 6
mark
 p 7

 v 9`

  const map = new TreeNode(
    `d date
p price
c cost
v value
q quantity`
  )

  const expandMapObj = map.clone().toObject()
  const contractMap = map
    .clone()
    .invert()
    .toObject()

  // Act
  const remapped = new TreeNode(test)
  remapped.forEach((node: treeNotationTypes.treeNode) => node.remap(expandMapObj))

  const expected = remapped.clone()
  expected.forEach((node: treeNotationTypes.treeNode) => node.remap(contractMap))

  // Assert
  equal(test, expected.toString())
}

testTree.rename = equal => {
  // Arrange
  const a = new TreeNode("john\n age 5\nsusy\n age 6\ncandy bar\nx 123\ny 45\n")
  const originalLength = a.length
  const originalString = a.toString()
  const index = a.indexOf("john")

  // Assert
  equal(index, 0, "index okay")

  // Act
  equal(a.rename("john", "breck") instanceof TreeNode, true, "returns itself for chaining")
  a.rename("candy", "ice")

  // Assert
  const index2 = a.indexOf("breck")
  equal(index2, 0, "index okay")
  equal(a.getNode("breck age").getContent(), "5", "value okay")

  // Act
  a.rename("breck", "john")
  a.rename("ice", "candy")

  // Assert
  equal(a.length, originalLength, "Length unchanged")
  equal(a.toString(), originalString, "String unchanged")

  // Arrange
  const b = new TreeNode(testStrings.renameTest)
  const originalString2 = b.toString()

  // Act
  b.rename("dimensions", "columns")

  // Assert
  equal(b.toString(), originalString2)

  // Arrange
  const c = new TreeNode("a\na\n")

  // Act
  c.rename("a", "b")
  c.rename("a", "b")

  // Assert
  equal(c.toString(), "b\nb\n")
  equal(c.has("a"), false)
}

testTree.renameAll = equal => {
  // Arrange
  const a = new TreeNode("hello world\nhello world")

  // Act
  a.renameAll("hello", "hey")

  // Assert
  equal(a.toString(), "hey world\nhey world")
  equal(a.has("hello"), false)

  // Arrange
  const b = new TreeNode(`foo.tree
 age 23
foo.tree2
 age 24`)

  // Act
  b.getNode("foo.tree2").renameAll("age", "bage")

  // Assert
  equal(b.get("foo.tree2 bage"), "24")
}

testTree.reorder = equal => {
  // Arrange
  const a = new TreeNode("hello world")

  // Act
  a.touchNode("hi").setContent("mom")

  // Assert
  equal(a.getFirstWords().join(" "), "hello hi", "order correct")

  // Act
  a.insertLine("yo pal", 0)

  // Assert
  equal(a.getFirstWords().join(" "), "yo hello hi", "order correct")

  // Act
  const result = a.insertLine("hola pal", 2)
  equal(result instanceof TreeNode, true)

  // Assert
  equal(a.getFirstWords().join(" "), "yo hello hola hi", "order correct")
}

testTree.next = equal => {
  // Arrange
  const a = new TreeNode(
    `john
 age 5
susy
 age 6
 score 100
bob
 age 10`
  )
  const b = a.getNode("john")
  const c = a.getNode("susy age")

  // Assert
  equal(a.getNext().toString(), a.toString())
  equal(a.getPrevious().toString(), a.toString())
  equal(b.getPrevious().getFirstWord(), "bob")
  equal(
    b
      .getPrevious()
      .getNext()
      .getFirstWord(),
    "john"
  )
  equal(b.getNext().getFirstWord(), "susy")
  equal(c.getNext().getFirstWord(), "score")
  equal(c.getPrevious().getFirstWord(), "score")
}

testTree.reverse = equal => {
  // Arrange
  const tree = new TreeNode("hi mom\nhey sis\nhey dad")

  // Assert
  equal(tree.getNode("hey").getContent(), "dad")

  // Act
  tree.reverse()

  // Assert
  equal(tree.toString(), "hey dad\nhey sis\nhi mom")
  equal(tree.getNode("hey").getContent(), "sis")

  // Test reverse when using internal types

  // Arrange
  const tree2 = TreeNode.fromCsv("name,age\nbill,20\nmike,40\ntim,30")

  // Act
  tree2.nodeAt(0).reverse()

  // Assert
  equal(
    tree2
      .nodeAt(0)
      .nodeAt(0)
      .getFirstWord(),
    "age",
    "Expected reversed properties"
  )
  equal(
    tree2
      .nodeAt(1)
      .nodeAt(0)
      .getFirstWord(),
    "name",
    "Expected unchanged properties"
  )
}

testTree.set = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.getNode("hello").getContent(), "world")
  equal(tree.touchNode("hello").setContent("mom") instanceof TreeNode, true, "set should return instance so we can chain it")
  equal(tree.getNode("hello").getContent(), "mom")

  // Act
  tree.touchNode("boom").setContent("")
  // Assert
  equal(tree.getNode("boom").getContent(), "", "empty string")

  // Act
  tree.touchNode("head style color").setContent("blue")
  // Assert
  equal(tree.getNode("head style color").getContent(), "blue", "set should have worked")

  // Test dupes
  // Arrange
  tree.appendLine("hello bob")

  // Act
  tree.touchNode("hello").setContent("tim")

  // Assert
  equal(tree.getNode("hello").getContent(), "tim", "Expected set to change last occurrence of property.")

  // TEST INT SCENARIOS
  // Arrange
  const tree2 = new TreeNode()

  // Act
  tree2.touchNode("2").setContent("hi")
  tree2.touchNode("3").setContent("3")
  // Assert
  equal(tree2.getNode("2").getContent(), "hi")
  equal(tree2.getNode("2").getContent(), "hi")
  equal(tree2.getNode("3").getContent(), "3")

  // TEST SPACEPATH SCENARIOS
  // Arrange
  const tree3 = new TreeNode("style\n")
  // Act
  tree3.touchNode("style color").setContent("red")
  tree3.touchNode("style width").setContent("100")

  // Assert
  equal(tree3.getNode("style color").getContent(), "red")
  equal(tree3.getNode("style width").getContent(), "100")

  // TEST ORDERING
  // Arrange
  const tree4 = new TreeNode("hello world")
  // Act
  tree4.touchNode("hi").setContent("mom")
  // Assert
  equal(tree4.getFirstWords().join(" "), "hello hi", "order correct")

  // Act
  tree4.insertLine("yo pal", 0)
  // Assert
  equal(tree4.getFirstWords().join(" "), "yo hello hi", "order correct")

  // Act
  tree4.insertLine("hola pal", 2)
  // Assert
  equal(tree4.getFirstWords().join(" "), "yo hello hola hi", "order correct")

  // Arrange
  const tree5 = new TreeNode()
  // Act
  tree5.touchNode("hi").setContent("hello world")
  tree5.touchNode("yo").setChildren(new TreeNode("hello world"))
  // Assert
  equal(tree5.getNode("hi").getContent() === tree5.getNode("yo").getContent(), false)

  // Arrange
  const tree6 = new TreeNode()

  // Act
  tree6.touchNode("meta x").setContent("123")
  tree6.touchNode("meta y").setContent("1235")
  tree6.touchNode("meta c").setContent("435")
  tree6.touchNode("meta x").setContent("1235123")

  // Assert
  equal(tree6.getNode("meta c").getContent(), "435")

  // Arrange
  const tree7 = new TreeNode("name John\nage\nfavoriteColors\n blue\n  blue1 1\n  blue2 2\n green\n red 1\n")

  // Act
  tree7
    .touchNode("favoriteColors blue")
    .setContent("purple")
    .toString()

  // Assert
  equal(tree7.getNode("favoriteColors blue").getContent(), "purple")

  // Act
  tree7.touchNode(" blanks").setContent("test")
  tree7.touchNode(" \nboom").setContent("test2")

  // Assert
  equal(tree7.getNode(" blanks").getContent(), "test", "Expected blank paths to be settable")
  equal(tree7.getNode(" boom").getContent(), "test2", "Expected newlines in path to be sanitized")

  // Arrange/Act
  const boom = new TreeNode("")
  boom.touchNode("description").setContent("some text with a \nnewline")

  // Assert
  equal(new TreeNode(boom.toString()).length, 1)

  // Test Blanks
  // Arrange
  const blank = new TreeNode()
  blank.touchNode("").setContent("")

  // Assert
  equal(blank.length, 1, "Expected blanks to work")
  equal(blank.toString(), " ", "Expected blanks to work")
}

testTree.setFromArray = equal => {
  // Arrange/Act
  const boom = new TreeNode([{ description: "some text with a \nnewline" }])
  const output = boom.toString()

  // Assert
  equal(new TreeNode(output).length, 1)
}

testTree.set = equal => {
  // Arrange
  const tree = new TreeNode(`title Foo`)

  // Act
  tree.set("body div h1", "Hello world")

  // Assert
  equal(
    tree.toString(),
    `title Foo
body
 div
  h1 Hello world`
  )
}

testTree.setFromText = equal => {
  // Arrange
  const str = `john doe
 age 50`
  const tree = new TreeNode(str)
  const node = tree.getNode("john")

  // Act
  node.setFromText(str)

  // Assert
  equal(node.toString(), str)

  // Act
  node.setFromText("john")

  // Assert
  equal(node.toString(), "john")
}

testTree.shift = equal => {
  // Arrange
  const tree = new TreeNode(
    `john
 age 5
susy
 age 6
bob
 age 10`
  )

  const empty = new TreeNode()

  // Act/Assert
  equal(tree.length, 3, "length ok")
  equal(
    tree.shift().toString(),
    `john
 age 5`,
    "expected correct string returned"
  )
  equal(tree.length, 2)
  equal(empty.shift(), null)

  // Arrange
  const one = new TreeNode("first\n nested")

  // Act
  one.getNode("first").shift()

  // Assert
  equal(one.getNode("first").length, 0)
  equal(one.toString(), "first")
}

testTree.sort = equal => {
  // Arrange
  const tree = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10")
  // Assert
  equal(tree.getFirstWords().join(" "), "john susy bob")
  // Act
  tree.sort((a: treeNotationTypes.treeNode, b: treeNotationTypes.treeNode) => (b.getFirstWord() < a.getFirstWord() ? 1 : b.getFirstWord() === a.getFirstWord() ? 0 : -1))
  // Assert
  equal(tree.getFirstWords().join(" "), "bob john susy")
}

testTree.sortBy = equal => {
  // Arrange
  const tree = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10\nsam\n age 21\nbrian\n age 6")
  // Assert
  equal(tree.getFirstWords().join(" "), "john susy bob sam brian")

  // Act
  tree.sortBy(["age"])

  // Assert
  equal(tree.getFirstWords().join(" "), "bob sam john susy brian")

  // Sort by multiple properties
  // Arrange
  const tree2 = new TreeNode(testStrings.sortByMultiple)

  // Act
  tree2.sortBy(["name", "date"])

  // Assert
  equal(tree2.getColumn("key").join(""), "cab")

  // Act
  tree2.sortBy(["name", "key"])

  // Assert
  equal(tree2.getColumn("key").join(""), "acb")
}

testTree.firstWordSort = equal => {
  // Arrange
  const tree = new TreeNode(`body
footer
div
header
div`)
  // Act
  tree.firstWordSort("header body div footer".split(" "))
  // Assert
  equal(
    tree.toString(),
    `header
body
div
div
footer`
  )
}

testTree.syntax = equal => {
  // Arrange
  const test = `person
 name Breck
 country USA
 books
  one SICP
  two Pragmatic
 num 12
 multiline this is a string
  over multiple lines.
     and this one has extra indents
 num 12
`
  const a = new TreeNode(test)
  const test2 = `person;=name=Breck;=country=USA;=books;==one=SICP;==two=Pragmatic;=num=12;=multiline=this=is=a=string;==over=multiple=lines.;=====and=this=one=has=extra=indents;=num=12;`

  class TestLanguage extends TreeNode {
    getWordBreakSymbol() {
      return "="
    }

    getNodeBreakSymbol() {
      return ";"
    }

    getEdgeSymbol() {
      return "="
    }
  }

  // Act
  const iHateTypeScript = <any>TestLanguage
  const b = new iHateTypeScript(test2)

  // Assert
  equal(b.getNode("person=country").getContent(), "USA")
  equal(a.toString(undefined, b), test2, "syntax conversion works")

  // Assert
  equal(a.toString(undefined, b), b.toString())

  // Assert
  equal(b.toString(undefined, a), test)
}

testTree.toCsv = equal => {
  // Arrange
  const a = new TreeNode(testStrings.delimited)
  // Act/Assert
  equal(a.toCsv(), testStrings.csv, "Expected correct csv")

  // Arrange
  const b = new TreeNode([{ lines: "1\n2\n3" }])
  // Act/equal
  equal(b.toCsv(), `lines\n"1\n2\n3"`)
}

testTree.getOneHot = equal => {
  // Arrange
  const a = TreeNode.fromCsv(TreeNode.iris)
  // Act
  const col = a.getOneHot("species").getColumn("species_setosa")

  // Assert
  equal(col.length, 10)
  equal(col[0], "0")
  equal(col[9], "1")
}

testTree.deleteColumn = equal => {
  // Arrange
  const a = TreeNode.fromCsv(TreeNode.iris)
  // Assert
  equal(a.getColumnNames().length, 5)

  // Act
  a.deleteColumn("species")

  // Assert
  equal(a.getColumnNames().length, 4)
}

testTree.toTable = equal => {
  // Arrange
  const a = TreeNode.fromCsv("name,score,color\n" + testStrings.csvNoHeaders)
  // Act/Assert
  equal(a.toTable(), testStrings.toTableLeft, "Expected correct spacing")
  equal(a.toFormattedTable(100, true), testStrings.toTable, "Expected correct spacing")

  // Arrange
  const b = TreeNode.fromCsv("name\njoe\nfrankenstein")
  // Act/Assert
  equal(b.toFormattedTable(1, false), "n...\nj...\nf...", "Expected max width to be enforced")
}

testTree.nest = equal => {
  // Arrange/Act
  const testStr2 = `html
 head
  body
   h3${TreeNode.nest("", 3)}
   h1${TreeNode.nest("h2 2", 3)}`
  const test = new TreeNode(testStr2)

  // Assert
  equal(test.getNode("html head body").length, 3)
  equal(test.getNode("html head body h2").getContent(), "2")

  equal(new TreeNode(`${TreeNode.nest("foo bar", 0)}`).getNode("foo").getContent(), "bar")
  equal(new TreeNode(`${TreeNode.nest("foo bar", 1)}`).getNode(" foo").getContent(), "bar")
  equal(new TreeNode(`${TreeNode.nest("foo bar", 2)}`).nodeAt([0, 0]).getContent(), "foo bar")
}

testTree.toDataTable = equal => {
  // Arrange
  const data = [["name", "age", "score"], ["coke", 29, 86], ["pepsi", 48, 16], ["soda", 32, 43]]

  // Act
  const tree = TreeNode.fromDataTable(data)

  // Assert
  equal(tree.getNode("2 age").getContent(), "32")

  // Act
  const dt = tree.toDataTable()

  // Assert
  equal(dt[2][2], 16)
  equal(dt[0][1], "age")
  equal(dt[3][0], "soda")
}

testTree.toObject = equal => {
  // Arrange
  const a = new TreeNode("hello world")
  const b = new TreeNode("foo bar")

  // Assert
  equal(typeof a.toObject(), "object")
  equal(a.toObject()["hello"], "world")

  // Act
  a.touchNode("b").setChildren(b)
  // Assert
  equal(a.toObject()["b"]["foo"], "bar")

  // Arrange
  const objectWithTreesAndValues = `div
 input checked
  type checkbox`

  // Act
  const obj = new TreeNode(objectWithTreesAndValues).toObject()

  // Assert
  equal(typeof obj.div.input, "string")
}

testTree.toSsv = equal => {
  // Arrange
  const a = new TreeNode(testStrings.delimited)
  // Assert
  equal(a.toSsv(), testStrings.ssv)
  const b = new TreeNode([{ name: "john", age: 12 }])
  equal(!!b.toSsv(), true)
}

testTree.toMarkdownTable = equal => {
  // Arrange
  const test = `event abc
 title ABC 2017
 date 09/18/2017 - 09/10/2017
 location Boston, MA
 website https://www.foobar.com/
event lala2018
 title Lala 2018
 date 11/02/2018 - 11/03/2018
 location San Fran
 twitter foo
 website http://www.blah.com`
  const expected = `|Title|Date|Location|Website|
|-|-|-|-|
|ABC 2017|09/18/2017 - 09/10/2017|Boston, MA|https://www.foobar.com/|
|Lala 2018|11/02/2018 - 11/03/2018|San Fran|http://www.blah.com|`
  const simpleExpected = `|title|date|location|website|twitter|
|-|-|-|-|-|
|ABC 2017|09/18/2017 - 09/10/2017|Boston, MA|https://www.foobar.com/||
|Lala 2018|11/02/2018 - 11/03/2018|San Fran|http://www.blah.com|foo|`
  const tree = new TreeNode(test)

  // Act
  const simple = tree.toMarkdownTable()
  const table = tree.toMarkdownTableAdvanced(["title", "date", "location", "website"], (value: any, row: any, col: any) => (row ? value : jtree.Utils.ucfirst(value)))

  // Assert
  equal(table, expected, "markdown ok")
  equal(simple, simpleExpected, "markdown simple ok")
}

testTree.setContentWithChildrenRegression = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  const hello = tree.getNode("hello")
  // Act
  hello.setContentWithChildren(
    `brave
 new world`
  )
  hello.setContentWithChildren(`earth`)
  // Assert
  equal(tree.toString(), "hello earth")
}

testTree.toStringMethod = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  // Assert
  equal(tree.toString(), "hello world", "Expected correct string.")
  equal(tree.toStringWithLineNumbers(), "1 hello world")
  // Act
  tree.touchNode("foo").setContent("bar")
  // Assert
  equal(tree.toString(), "hello world\nfoo bar")

  // Arrange
  const tree2: any = new TreeNode("z-index 0")
  // Act
  tree2["z-index"] = 0
  // Assert
  equal(tree2.toString(), "z-index 0")

  // Test empty values
  // Arrange
  const tree3 = new TreeNode()

  // Act
  tree3.touchNode("empty").setContent("")
  // Assert
  equal(tree3.toString(), "empty ")

  // Arrange
  const a = new TreeNode("john\n age 5")
  // Assert
  equal(a.toString(), "john\n age 5")

  // Arrange
  const r = new TreeNode("joe\njane\njim")
  // Act/Assert
  equal(!!r.toString(), true)

  // Act
  a.touchNode("multiline").setContentWithChildren("hello\nworld")
  // Assert
  equal(a.toString(), "john\n age 5\nmultiline hello\n world")

  // Act
  a.touchNode("other").setContent("foobar")
  // Assert
  equal(a.toString(), "john\n age 5\nmultiline hello\n world\nother foobar")

  // Arrange
  const b = new TreeNode("a\n text \n  this is a multline string\n  and more")
  // Assert
  equal(b.toString(), "a\n text \n  this is a multline string\n  and more")

  // Test setting an instance as a value in another instance
  // Act
  a.touchNode("even_more").setChildren(b)
  // Assert
  equal(a.toString(), "john\n age 5\nmultiline hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more")

  // Arrange
  const testCases = ["", "\n", "\n\n", "\n \n ", "   \n   \n", "foo\nbar\n\n", "\n\n foo \nbar\n"]

  // Act/Assert
  testCases.forEach(someStr => equal(new TreeNode(someStr).toString(), someStr, "Expected identity"))

  // Arrange
  const str = "view\n type bar"
  const treeNode = new TreeNode(str).getNode("view")
  // Act/Assert
  equal(treeNode.toString(), str)
}

testTree.toHtml = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  // Act
  const str = tree.toHtml()
  // Assert
  equal(str.includes("<span"), true)

  // Arrange
  const parent = new TreeNode(testStrings.every)

  // Assert
  equal(parent.toHtml().includes("5 0 4 0 0"), true)
}

testTree.toTsv = equal => {
  // Arrange
  const a = new TreeNode(testStrings.delimited)
  // Assert
  equal(a.toTsv(), testStrings.tsv)
}

testTree.toXml = equal => {
  // Arrange
  const a = new TreeNode(testStrings.toXml)
  // Assert
  equal(a.toXml(), testStrings.toXmlPrettyResult)
}

testTree.windowsReturnChars = equal => {
  // Arrange
  const tree = new TreeNode(
    `one
\r
\rtwo
\r
\r
\rthree`
  )

  // Assert
  equal(tree.length, 6)
}

testTree.traverse = equal => {
  // Arrange
  const traversal = new TreeNode(
    `0
 01
 02
  020
  021
1
 10
 11
  110
 12
2`
  )

  // Act
  const preOrder = traversal
    .getTopDownArray()
    .map((node: treeNotationTypes.treeNode) => node.getLine())
    .join(" ")
  const postOrder = traversal
    .getChildrenFirstArray()
    .map((node: treeNotationTypes.treeNode) => node.getLine())
    .join(" ")
  const breadthfirst = traversal
    .getParentFirstArray()
    .map((node: treeNotationTypes.treeNode) => node.getLine())
    .join(" ")

  // Assert
  equal(preOrder, "0 01 02 020 021 1 10 11 110 12 2", "expected topDown visiting to work")
  equal(postOrder, "01 020 021 02 0 10 110 11 12 1 2", "expected postOrder visiting to work")
  equal(breadthfirst, "0 1 2 01 02 10 11 12 020 021 110", "expected breadthfirst visiting to work")

  // Arrange
  const wikipediaBinaryTree = new TreeNode(
    `f
 b
  a
  d
   c
   e
 g
  i
   h`
  )

  // Act
  const wikipreorder = wikipediaBinaryTree
    .getTopDownArray()
    .map((node: treeNotationTypes.treeNode) => node.getLine())
    .join("")
  const wikibreadthfirst = wikipediaBinaryTree
    .getParentFirstArray()
    .map((node: treeNotationTypes.treeNode) => node.getLine())
    .join("")
  const wikipostorder = wikipediaBinaryTree
    .getChildrenFirstArray()
    .map((node: treeNotationTypes.treeNode) => node.getLine())
    .join("")

  // Assert
  equal(wikipreorder, "fbadcegih")
  equal(wikibreadthfirst, "fbgadiceh")
  equal(wikipostorder, "acedbhigf")
}

testTree.toOutline = equal => {
  // AAA
  equal(typeof new TreeNode(testStrings.every).toOutline(), "string")
}

testTree.fromJsonSubset = equal => {
  // AAA
  equal(TreeNode.fromJsonSubset(JSON.stringify(testObjects.json2tree)).toString(), new TreeNode(testStrings.json2tree).getNode("docs").childrenToString())
}

testTree.getFiltered = equal => {
  // AAA
  equal(
    new TreeNode(`a
a
a
b
 a
b
 a
c`).getFiltered((node: treeNotationTypes.treeNode) => node.getFirstWord() === "a").length,
    3
  )
}

testTree.deleteDuplicates = equal => {
  // AAA
  equal(
    new TreeNode(`a
a
a
b
 a
b
 a
c`).deleteDuplicates().length,
    3
  )
}

testTree.fromShape = equal => {
  // AAA
  equal(
    TreeNode.fromShape([2, 2]).toString(),
    `0
 0
 1
1
 0
 1`
  )
}

testTree.getFrom = equal => {
  // Arrange
  const treeNode = new TreeNode(
    `name
 string title The book of
 string person Jai`
  )
  // Act/Assert
  equal(treeNode.nodeAt(0).getFrom("string person"), "Jai")
}

testTree.toOutline = equal => {
  // Arrange
  const treeNode = new TreeNode(
    `hello
 world`
  )

  // Act/assert
  equal(
    treeNode.toOutline(),
    `└hello
 └world
`
  )
  equal(
    treeNode.toMappedOutline((node: treeNotationTypes.treeNode) => "o"),
    `└o
 └o
`
  )
}

testTree.getLineOrChildrenModifiedTime = equal => {
  // Arrange
  const a = new TreeNode(`text
 foo
  bar
some
 other`)
  const mtime = a.getLineOrChildrenModifiedTime()
  const fooTime = a.getNode("text foo").getLineOrChildrenModifiedTime()

  // Act
  a.delete("some other")

  // Assert
  const newTime = a.getLineOrChildrenModifiedTime()
  equal(newTime > mtime, true, `newtime is greater than mtime ${newTime} ${mtime}`)
  equal(a.getNode("text foo").getLineOrChildrenModifiedTime() === fooTime, true, "times are equal")

  // Act
  a.getNode("text foo").setContent("wham")

  // Assert
  equal(a.getNode("text foo").getLineOrChildrenModifiedTime() > fooTime, true, "mod child updates")

  // Arrange
  const b = new TreeNode(`foo`)
  b.appendLine("bar")
  const bTime = b.getLineOrChildrenModifiedTime()

  // Act
  b.getNode("foo").destroy()

  // Assert
  equal(b.getLineOrChildrenModifiedTime() > bTime, true, `time increased from ${bTime} to ${b.getLineOrChildrenModifiedTime()}`)
}

testTree.destroyLoop = equal => {
  // Arrange
  const a = new TreeNode(`a
 d
b
 d
c
 d`)
  // Act
  a.forEach((child: treeNotationTypes.treeNode) => {
    child.destroy()
  })

  // Assert
  equal(a.length, 0)
}

testTree.typeTests = equal => {
  // Arrange
  const a = new TreeNode("text")
  // Assert
  equal(a.getErrors().length, 0)
  equal(a.getLineCellTypes(), "undefinedCellType") // todo: make this a constant
}

testTree.setTests = equal => {
  let base = new TreeNode(`foo bar`).nodeAt(0)
  equal(base.getWordsAsSet().has("bar"), true)
  equal(base.getWordsAsSet().has("bar2"), false)
  equal(base.appendWordIfMissing("bar").toString(), `foo bar`)
  equal(
    base
      .appendWordIfMissing("bam")
      .getWordsAsSet()
      .has("bam"),
    true,
    "word should be appended"
  )
}

testTree.getBiDirectionalMaps = equal => {
  const csv = TreeNode.fromCsv(TreeNode.iris)
  const maps = csv.getBiDirectionalMaps("species", "sepal_length")
  equal(maps[0]["versicolor"][0], "5.6")
  equal(maps[1]["5.6"][0], "versicolor")
}

testTree.delimitedTests = equal => {
  let base = new TreeNode(`foo.csv`).nodeAt(0)
  equal(base.addObjectsAsDelimited([{ name: "Joe", age: 100 }]).toString(), `foo.csv\n name,age\n Joe,100`)

  base = new TreeNode(`foo.csv`).nodeAt(0)
  equal(base.setChildrenAsDelimited(`person\n name Joe\n age 100`).toString(), `foo.csv\n name,age\n Joe,100`)

  let template = `foo.csv\n person\n  name Joe\n  age 100`

  base = new TreeNode(template).nodeAt(0)
  equal(base.convertChildrenToDelimited().toString(), `foo.csv\n name,age\n Joe,100`, "convert children to delimited works")

  base = new TreeNode(template).nodeAt(0)
  equal(base.convertChildrenToDelimited().addUniqueRowsToNestedDelimited(`name,age`, [`Frank,100`]).length, 3)

  base = new TreeNode(template).nodeAt(0)
  equal(base.convertChildrenToDelimited().addUniqueRowsToNestedDelimited(`name,age`, [`Joe,100`]).length, 2)
}

testTree.printLines = equal => {
  // Arrange
  let lastLogMessage = ""
  const orig = console.log
  console.log = (msg: string) => (lastLogMessage += msg + "\n")
  const a = new TreeNode(`text\n hello`)
  // Act/Assert
  a.printLinesFrom(0, 1)
  equal(lastLogMessage, "text\n")

  // Arrange
  lastLogMessage = ""
  // Act
  a.printLinesWithLineNumbersFrom(0, 2)
  equal(lastLogMessage, "0 text\n1  hello\n")
  // Cleanup
  console.log = orig
}

testTree.with = equal => {
  // Arrange
  const dummy = new jtree.TreeNode(`0
 color red
 age 100
1
 color blue`)
  // Act/Assert
  equal(dummy.with("color").length, 2)
  equal(dummy.with("age").length, 1)
  equal(dummy.with("score").length, 0)
  equal(dummy.without("color").length, 0)
  equal(dummy.without("age").length, 1)
  equal(dummy.without("score").length, 2)
}

testTree.extendible = equal => {
  // Arrange
  const a = new jtree.ExtendibleTreeNode(`a
 color red
b
 extends a`)
  // Assert
  equal(
    a._getFamilyTree().toString(),
    `a
 b`
  )
}

testTree.toComparison = equal => {
  equal(
    new TreeNode(testStrings.webpage)
      .toComparison(testStrings.webpage)
      .toString()
      .trim().length,
    0,
    "should be equal"
  )
}

testTree.isBlank = equal => {
  // Arrange
  const a = new TreeNode("text\n\ntest \ntest2  ")
  // Assert
  equal(a.nodeAt(0).isBlankLine(), false)
  equal(a.nodeAt(1).isBlankLine(), true)
  equal(a.nodeAt(0).isEmpty(), true)
  equal(a.nodeAt(0).isEmpty(), true)
  equal(a.isEmpty(), false)
  equal(a.isBlankLine(), false)
  equal(a.getNode("test").isBlankLine(), false)
  equal(a.getNode("test").isEmpty(), true)
  equal(a.getNode("test2").isBlankLine(), false)
  equal(a.getNode("test2").isEmpty(), false)

  // Act/Assert
  equal(a.deleteChildren().length, 0)
}

testTree.treeNodes = equal => {
  // Arrange
  const a = new TreeNode("text")
  const node = a.nodeAt(0)
  const originalMtime = node.getLineModifiedTime()

  // Assert
  equal(originalMtime > 0, true)
  equal(node.isTerminal(), true)
  equal(node.getFirstWord(), "text")
  equal(node.getContent(), undefined)
  equal(node.length, 0)

  // Act
  node.setContent("hello world")

  // Assert
  equal(node.getContent(), "hello world")
  equal(a.toString(), "text hello world")

  // Act
  node.setChildren("color blue")
  node.setChildren("color blue")

  // Assert
  equal(node.isTerminal(), false)
  equal(node.childrenToString(), "color blue")
  equal(a.toString(), "text hello world\n color blue")
  equal(a.has("text"), true)

  // Act
  const mtime = node.getLineModifiedTime()
  node.setFirstWord("foo")

  // Assert
  equal(a.toString(), "foo hello world\n color blue")
  equal(node.getLineModifiedTime() > mtime, true)
  equal(a.has("text"), false)
  equal(node.has("color"), true)

  // Act
  node.setChildren("")

  // Assert
  equal(!!node.toString(), true)
  equal(node.has("color"), false)
}

testTree.mTimeNotIncrementingRegressionTest = equal => {
  // Arrange
  const node = new TreeNode("text").nodeAt(0)
  let lastMTime = node.getLineModifiedTime()
  const numOfTrials = 100
  // Previously we would get a flakey test about every 10k trials
  for (let i = 0; i < numOfTrials; i++) {
    node.setContent(i.toString())
    let newMTime = node.getLineModifiedTime()

    // Assert
    equal(newMTime > lastMTime, true, "mtime should have increased")
    lastMTime = newMTime
  }
}

testTree.asyncUndoRedo = async equal => {
  // Arrange
  const node = new TreeNode("hello world")

  // Assert
  await node.saveVersion()
  equal(node.getChangeHistory().length, 1)
  equal(node.hasUnsavedChanges(), false)

  // Act
  node.set("hello", "earth")
  equal(node.hasUnsavedChanges(), true)
  await node.saveVersion()
  // Assert
  equal(node.getChangeHistory().length, 2)
  equal(node.get("hello"), "earth")
  equal(node.hasUnsavedChanges(), false)
  // Act
  await node.undo()
  // Assert
  equal(node.get("hello"), "world")
  equal(node.hasUnsavedChanges(), true)
  // Act
  await node.undo()
  // Assert
  equal(node.get("hello"), "world")
  // Act
  await node.redo()
  // Assert
  equal(node.get("hello"), "earth")
  // Act
  await node.redo()
  // Assert
  equal(node.get("hello"), "earth")
}

testTree.trim = equal => {
  // Arrange/Act/Assert
  const tree = new jtree.TreeNode("\n\n\n")
  equal(tree.length, 4)
  equal(tree.trim().length, 0)

  const tree2 = new jtree.TreeNode(testStrings.webpage)
  equal(tree2.length, tree2.trim().length)
}

testTree.queryMethods = equal => {
  // Arrange
  const tree = <any>TreeNode.fromCsv(TreeNode.iris)

  // Act/Assert
  let result = tree.select(["sepal_width", "species"]).where("sepal_width", ">", 3.7)
  equal(result.length, 1)
  equal(result.nodeAt(0).get("species"), "virginica")

  // Act/Assert
  equal(tree.select(["sepal_width"]).length, 10)
  equal(tree.where("sepal_width", "<", 3.7).length, 8)
  equal(tree.where("sepal_width", ">=", 3.7).length, 2)
  equal(tree.where("sepal_width", "<=", 3.7).length, 9)
  equal(tree.where("sepal_width", "=", 3.7).length, 1)
  equal(tree.where("sepal_width", "!=", 3.7).length, 9)
  equal(tree.where("species", "=", "setosa").length, 3)
  equal(tree.where("sepal_width", "in", [3.7, 3.8]).length, 2, "in test")
  equal(tree.where("sepal_width", "notIn", [3.7, 3.8]).length, 8, "not in test")
  equal(tree.where("species", "includes", "vers").length, 1)
  equal(tree.where("species", "doesNotInclude", "vers").length, 9, "does not include")
  equal(tree.where("species", "notEmpty").length, 10)
  equal(tree.where("species", "empty").length, 0)
  equal(tree.where("foobar", "empty").limit(10).length, 10)
  equal(tree.where("foobar", "empty").limit(20).length, 10)
  equal(tree.where("foobar", "empty").where("species", "includes", "vers").length, 1, "nesting works")

  equal(
    new TreeNode(`boston
 wp
  id Boston`).where("wp id", "notEmpty").length,
    1
  )

  equal(
    tree
      .where("sepal_width", "!=", 3.7)
      .first(3)
      .select("species")
      .last(1)
      .sortBy("species")
      .nodeAt(0)
      .get("species"),
    "virginica",
    "last and first work"
  )
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)

export { testTree }
