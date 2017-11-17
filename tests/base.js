"use strict"

const TreeNode = require("../src/base/TreeNode.js")

const testStrings = {}

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

testStrings.json2 = [{ id: 755, settings: "123" }, { id: 756, settings: "456" }]
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

testStrings.json = {
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

const testTree = {}

testTree.constructorTests = equal => {
  // Assert
  equal(!!TreeNode, true, "TreeNode class should exist")
  equal(new TreeNode() instanceof TreeNode, true, "TreeNode should return a tree")

  // Arrange/Act
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.length, 1, "types array should have 1 property")
  equal(tree.indexOf("hello"), 0, "types array should be correct")
  equal(tree.getNode("hello").getBeam(), "world", "Properties should be accessible")
  equal(typeof tree.getNode("hello").getBeam(), "string", "Leafs should be strings")

  // Act
  tree.touchNode("foo").setBeam("bar")

  // Assert
  equal(tree.getNode("foo").getBeam(), "bar", "Trees should be modifiable")

  // Arrange
  const tree2 = new TreeNode("foobar\n one 1")

  // Assert
  equal(tree2.getNode("foobar").getBeam(), undefined, "Value should be empty")
  equal(
    tree2
      .getNode("foobar")
      .getNode("one")
      .getBeam(),
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
  equal(tree5.getNode("foobar").getBeam(), "hello", "Trees can be created from object literals")

  // Arrange
  const tree6 = new TreeNode({
    foobar: new TreeNode("hello world")
  })

  // Assert
  equal(tree6.getNode("foobar hello").getBeam(), "world", "Trees can be created from objects mixed with trees")

  // Arrange
  const tree7 = new TreeNode({
    foobar: {
      hello: {
        world: "success"
      }
    }
  })

  // Assert
  equal(tree7.getNode("foobar hello world").getBeam(), "success", "Trees can be created from deep objects")

  // Test multline creation
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
  equal(
    tree8.getNode("domains test.test.com pages home settings data title").getBeam(),
    "Hello, World",
    "Multiline creation should be okay."
  )

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
  equal(node.getKeyword(), "")
  equal(node.getBeam(), "")

  // Arrange
  let s = `
 
 
 `
  // Act/Assert
  equal(new TreeNode(s).nodeAt(0).length, 3)

  // Arrange
  s = `
  
 `
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
    getZI() {
      return ":"
    }
  }

  equal(new TestTree(test).nodeAt(0).length, 2)

  const rootTree = new TestTree()
  const tree = rootTree.appendLineAndChildren("", new TestTree())
  tree.appendLine("")
  tree.appendLine("")
  const newTree = new TestTree(rootTree.toString())
  equal(newTree.nodeAt(0).length, 2)
}

testTree.append = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Act
  tree.appendLine("foo bar")
  tree.touchNode("foo2").setBeam("bar")

  // Assert
  equal(tree.getNode("foo").getBeam(), "bar")

  // Act
  tree.appendLine("foo two")

  // Assert
  equal(tree.length, 4)
}

testTree.getWord = equal => {
  // Arrange
  const tree = new TreeNode("a b c")
  const aNode = tree.getNode("a")

  // Act/Assert
  equal(aNode.getWord(1), "b")
  equal(aNode.getWord(-1), "c")
}

testTree.at = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhow are you\nhola friend")

  // Assert
  equal(value.nodeAt(0).getBeam(), "world")
  equal(value.nodeAt(1).getBeam(), "are you")
  equal(value.nodeAt(2).getBeam(), "friend")
  equal(value.nodeAt(3), undefined)
  equal(value.nodeAt(-1).getBeam(), "friend")
}

testTree.clone = equal => {
  // Arrange/Act
  const a = new TreeNode("hello world")
  const b = a.clone()

  // Assert
  equal(b.getNode("hello").getBeam(), "world")
  equal(a.toString(), b.toString(), "string unchanged")

  // Act
  b.touchNode("hello").setBeam("mom")

  // Assert
  equal(a.getNode("hello").getBeam(), "world")

  // Arrange
  const c = a

  // Assert
  equal(c.getNode("hello").getBeam(), "world")

  // Act
  c.touchNode("hello").setBeam("foo")

  // Assert
  equal(a.getNode("hello").getBeam(), "foo")

  // Arrange
  const d = c

  // Assert
  equal(d.getNode("hello").getBeam(), "foo", "foo should be value")

  // Act
  d.touchNode("hello").setBeam("hiya")

  // Assert
  equal(a.getNode("hello").getBeam(), "hiya", "original unchanged")

  // Act
  a.touchNode("test").setBeam("boom")

  // Assert
  equal(d.getNode("test").getBeam(), "boom")

  // Act
  a.touchNode("foobar").setChildren(new TreeNode("123 456"))

  // Assert
  equal(c.getNode("foobar 123").getBeam(), "456", "expected 456")

  // Arrange
  const e = a

  // Assert
  equal(e.getNode("foobar 123").getBeam(), "456")

  // Arrange
  const f = a.clone()

  // Assert
  equal(f.getNode("foobar 123").getBeam(), "456")

  // Act
  f.hi = "test"

  // Assert
  equal(a.hi, undefined)
}

testTree.concat = equal => {
  // Arrange
  const a = new TreeNode("hello world")
  const b = new TreeNode("hi mom")

  // Act
  const newNodes = a.concat(b)

  // Assert
  equal(a.getNode("hi").getBeam(), "mom")
  equal(newNodes.length, 1)
}

testTree.getNodeByColumns = equal => {
  // Arrange
  const test = new TreeNode(testStrings.sortByMultiple)

  // Act
  const node = test.getNodeByColumns("name", "Success")

  // Assert
  equal(node.getParent().findBeam("key"), "b")

  // Arrange
  const jib = new TreeNode(`jibberish
 @description Test a root parser node
 @parser js ./jibberishProgram.js
 @compiler txt
 @keywords
  baseNode`)

  // Act
  const node2 = jib.getNodeByColumns("@parser", "js")

  // Assert
  equal(node2.getKeyword(), "@parser")
}

testTree.delete = equal => {
  // Arrange
  const tree = new TreeNode()
  tree.touchNode("name").setBeam("Breck")

  // Assert
  equal(tree.getNode("name").getBeam(), "Breck", "name is set")
  equal(tree.length, 1, "length okay")

  // Act
  tree.delete("name")

  // Assert
  equal(tree.getNode("name"), undefined, "name is gone")
  equal(tree.length, 0, "length okay")

  // Act
  tree.touchNode("name").setBeam("Breck")
  tree.touchNode("age").setBeam("100")
  tree.touchNode("table").setBeam("true")
  tree.delete("age")

  // Assert
  equal(tree.getNode("age"), undefined, "age is gone")
  equal(tree.length, 2, "expected 2 elements remaining")

  // Test deep delete
  // Arrange
  const tree2 = new TreeNode()
  tree2.touchNode("earth north_america united_states california san_francisco").setBeam("mission")

  // Assert
  equal(tree2.getNode("earth north_america united_states california") instanceof TreeNode, true, "node exists")
  equal(
    tree2.getNode("earth north_america united_states california san_francisco").getBeam(),
    "mission",
    "neighborhood is set"
  )
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
  equal(tree3.getNode("property").getBeam(), "meta", "delete a non existing entry works")

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
  tree6.getChildren().forEach(node => {
    if (!node.getKeyword().startsWith("p")) return true
    node.setBeam("President")
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
  const migrateFn = str => {
    const board = new TreeNode(str)
    const dataNodes = board.findNodes("data")
    dataNodes.forEach(nodeTree => {
      const rows = nodeTree.findNodes("row")
      if (!rows.length) return
      const mapped = rows.map(row => row.toObject())
      const csv = new TreeNode(mapped).toCsv()
      nodeTree.touchNode("format").setBeam("csv")
      nodeTree.touchNode("content").setBeamWithChildren(csv)
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
  value.getChildren().forEach(function(node) {
    const property = node.getKeyword()
    const v = node.getBeam()
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
    .getChildren()
    .filter(n => n.getKeyword() !== "hello")
    .forEach(node => {
      const property = node.getKeyword()
      const value = node.getBeam()
      count++
    })
  // Assert
  equal(count, 1)

  // Arrange
  const tree = new TreeNode("hello world\nhi world")
  var i = 0

  // Act
  tree.getChildren().forEach((node, index) => {
    i = i + index
  })

  // Assert
  equal(i, 1, "index worked")
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
  equal(extended.getNode(">foo >bar >bam class").getBeam(), "boom")
}

testTree.first = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getBeam(), "world")

  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value2.nodeAt(0).toString(), "hello world")
}

testTree.firstProperty = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getKeyword(), "hello")
}

testTree.firstValue = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getBeam(), "world")
}

testTree.format = equal => {
  // Arrange
  const str = "Hi {firstName} {lastName}! I hope you are enjoying the weather in {address city}!"
  const person = new TreeNode("firstName Tom\nlastName B\naddress\n city Boston")

  // Act
  const result = person.format(str)

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
      .getBeam(),
    "USA"
  )

  // Arrange
  const tree3 = TreeNode.fromCsv("")

  // Assert
  equal(tree3.toString(), "", "Expected empty string to be handled correctly")

  // Assert
  equal(withQuotes.getNode("0 Date").getBeam(), "123", "Expected quotes to be handled properly")

  // Arrange
  const tree4 = TreeNode.fromCsv('height\n"32,323"')

  // Assert
  equal(tree4.getNode("0 height").getBeam(), "32,323")

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
  equal(testCase.getNode("1 age").getBeam(), "32", "Expected return chars to be removed")

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
  equal(a.getNode("1 2").getBeam(), "blue")
}

testTree.fromDelimited = equal => {
  // Arrange
  const a = TreeNode.fromDelimited(testStrings.fromDelimited, "^", "~")

  // Assert
  equal(a.length, 2)
  equal(a.getNode("0 weight").getBeam(), "2.2")
  equal(a.getNode("1 foodName").getBeam(), "Banana")

  // Arrange
  const b = TreeNode.fromDelimited(
    `name,score

joe,23`,
    ",",
    '"'
  )

  // Assert
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
}

testTree.replaceNode = equal => {
  // Arrange
  const test = new TreeNode(`a
b`)
  const a = test.getNode("a")

  // Act
  a.replaceNode(str => str.replace("a", "z"))

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
      .getBeam(),
    testStrings.ssvFixedColumnComment1
  )
  equal(
    fixedCol
      .nodeAt(1)
      .getNode("comment")
      .getBeam(),
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
  equal(b.getNode("0 age").getBeam(), "2")
  equal(b.getNode("0 height").getBeam(), "23")
}

testTree.getLine = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  const node = tree.getNode("hello")
  const mtime = node.getMTime() || 0

  // Assert
  equal(node.getLine(), "hello world")
  equal(tree.has("hello"), true)

  // Act
  node.setLine("hi earth")

  // Assert
  equal(tree.toString(), "hi earth")
  equal(node.getMTime() > mtime, true)
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
      .map(line => line.getIndentation() + line.getLine())
      .join("\n")
  )
}

testTree.getBeam = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.getNode("hello").getBeam(), "world")
  equal(tree.findBeam("hello"), "world")

  // Act
  // Test get with ints
  tree.touchNode("2").setBeam("hi")

  // Assert
  equal(tree.getNode("2").getBeam(), "hi", "Expected int strings to work.")

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
  equal(tree2.getNode("height").getBeam(), "50px", "Expected to get last value in instance with duplicate property.")

  // todo: remove ability of get to take non-strings
  // Arrange
  const treeWithNumbers = new TreeNode("1 bob\n0 brenda")

  // Act/Assert
  equal(treeWithNumbers.getNode("0").getBeam(), "brenda")
  equal(treeWithNumbers.getNode("1").getBeam(), "bob")
}

testTree.getInheritanceTree = equal => {
  // Arrange
  const classes = `abstractKeyword
abstractModalKeyword abstractKeyword
helpModal abstractModalKeyword
abstractButton abstractKeyword
helpButton abstractButton`

  // Act
  const inheritanceTree = new TreeNode(classes).getInheritanceTree()

  // Assert
  equal(
    inheritanceTree.toString(),
    `abstractKeyword
 abstractModalKeyword
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
  var each = ""

  // Assert
  equal(value.findNodes("hello").length, 2)

  // Act
  const result = value
    .findNodes("hello")
    .map(node => node.getBeam())
    .join("")

  // Assert
  equal(result, "worldworld")
}

testTree.getBeams = equal => {
  // Arrange
  const html = new TreeNode("h1 hello world\nh1 hello world")

  // Assert
  equal(html.getBeams().join("\n"), "hello world\nhello world")
}

testTree.multiply = equal => {
  class MathNode extends TreeNode {
    getZI() {
      return " "
    }

    getYI() {
      return "o"
    }

    getXI() {
      return "-"
    }
  }

  // Arrange
  const two = new MathNode(`o`)
  const three = new MathNode(`oo`)

  // Act/Assert
  const result = MathNode.multiply(two, three)

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

  // Assert
  equal(nodes[0].getLine(), "color orange")
  equal(nodes2.length, 2)
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
    getKeywordMap() {
      return { "+": AdditionNode, "-": SubstractionNode }
    }
  }

  class SubstractionNode extends TreeNode {}

  class AdditionNode extends TreeNode {
    // Look! You created an interpreter!
    executeSync() {
      return this.getNumbers().reduce((prev, current) => prev + current, 0)
    }

    // Look! You created a declarative file format!
    getNumbers() {
      return this.getWordsFrom(1).map(word => parseFloat(word))
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
  const program = new MathProgram(source)
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
  const results = program.executeSync()
  // Assert
  equal(
    results.join("\n"),
    `9
4
316.1`
  )

  // Edit the program and assure parsing is correct
  // Assert
  equal(program.getChildrenByNodeType(AdditionNode).length, 3)
  equal(program.getChildrenByNodeType(SubstractionNode).length, 0)

  // Act
  program.nodeAt(0).replaceNode(str => str.replace("+", "-"))

  // Assert
  equal(program.getChildrenByNodeType(AdditionNode).length, 2)
  equal(program.getChildrenByNodeType(SubstractionNode).length, 1)
  equal(program.getNodeByType(SubstractionNode) instanceof SubstractionNode, true)
}

testTree.getKeywordPath = equal => {
  // Arrange
  const tree = new TreeNode(testStrings.every)
  const parent = tree.getNode("domains test.test.com pages home settings")
  const child = tree.getNode("domains test.test.com pages home settings data")
  const simple = new TreeNode("foo bar")

  // Assert
  equal(child.getKeywordPath(), "domains test.test.com pages home settings data")
  equal(child.getParent(), parent)
  equal(child.getRootNode(), tree)
  equal(child.getStack().length, 6)
  equal(simple.getNode("foo").getStack().length, 1)
  equal(child.getKeywordPathRelativeTo(parent), "data")
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
  const newNamePath = tree.pathVectorToKeywordPath([5, 0, 4, 0, 0])

  // Assert
  equal(newNamePath.join(" "), namePath)
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
  equal(tree.getNode("Monkey").getGraphByKey("extends").length, 4)
  equal(tree.getNode("Thing").getGraphByKey("extends").length, 1)
  equal(tree.getNode("Animal").getGraphByKey("extends").length, 2)
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
  equal(tree.getNode("Monkey").getGraph(0, 1).length, 4)
  equal(tree.getNode("Thing").getGraph(0, 1).length, 1)
  equal(tree.getNode("Animal").getGraph(0, 1).length, 2)
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

testTree.getExpanded = equal => {
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
    tree.getExpanded(0, 1),
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
    tree2.getExpanded(0, 1),
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
    badMap.getExpanded(0, 1)
    equal(true, false, "expanding with missing id should throw")
  } catch (err) {
    equal(err.toString().includes("non-existant"), true, "expanding with missing id throws")
  }
}

testTree.htmlDsl = equal => {
  // Arrange
  const html = new TreeNode("h1 hello world\nh1 hello world")
  var page = ""

  // Act
  html.getChildren().forEach(node => {
    const property = node.getKeyword()
    const value = node.getBeam()
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
  tree.touchNode("color").setBeam("")

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
  equal(tree.nodeAt(2).getBeam(), "dad", "Expected insert at int greater than length to append")
  equal(tree.length, 3)

  // Insert using a negative index
  // Act
  tree.insertLine("test2 sister", -1)

  // Assert
  equal(tree.nodeAt(2).getBeam(), "sister")
  equal(tree.nodeAt(3).getBeam(), "dad")
}

testTree.last = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getBeam(), "mom")

  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value2.nodeAt(-1).toString(), "hi mom")
}

testTree.lastProperty = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getKeyword(), "hi")
}

testTree.lastValue = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getBeam(), "mom")
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
  const tree = new TreeNode(testStrings.json)
  const date = new Date()
  const time = date.getTime()
  const treeWithDate = new TreeNode({ name: "John", date: date })

  // Assert
  equal(tree.getNode("lowestScore").getBeam(), "-10")
  equal(treeWithDate.getNode("date").getBeam(), time.toString())

  // Test against object with circular references
  // Arrange
  const a = { foo: "1" }
  const b = { bar: "2", ref: a }

  // Act
  // Create circular reference
  a.c = b
  const tree2 = new TreeNode(a)

  // Assert
  equal(tree2.getNode("c bar").getBeam(), "2", "expected 2")
  equal(tree2.getNode("c ref"), undefined)

  // Arrange
  const tree3 = new TreeNode()
  tree3.touchNode("docs").setChildren(testStrings.json2)

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
  equal(a.getNode("foo bar").getBeam(), "bam")
  equal(b.getNode("foo bar").getBeam(), "bam")

  // Act
  a.touchNode("foo bar").setBeam("wham")

  // Assert
  equal(a.getNode("foo bar").getBeam(), "wham")
  equal(b.getNode("foo bar").getBeam(), "bam")
}

testTree.createFromString = equal => {
  // Arrange/Act
  const startsWithSpace = new TreeNode(" name john")

  // Assert
  equal(startsWithSpace.length, 1, "Expected 1 node")

  // Arrange
  const a = new TreeNode("text \n this is a string\n and more")

  // Assert
  equal(a.getNode("text").getBeamWithChildren(), "\nthis is a string\nand more", "Basic")

  // Arrange
  const b = new TreeNode("a\n text \n  this is a string\n  and more")

  // Assert
  equal(b.getNode("a text").getBeamWithChildren(), "\nthis is a string\nand more")
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
  equal(c.getNode("children 1 children 1 age").getBeam(), "12")
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
  equal(g.getNode("hi ").getBeam(), "   somewhat invalid")

  const testCase = new TreeNode(testStrings.newLines)
  equal(testCase.toString().split("\n").length, 11, "All blank lines are preserved")
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

  const migrateNode = node => {
    if (!node.getKeyword().startsWith(">")) return true
    if (node.length) {
      const cla = node.getNode("class").getBeam()
      if (cla) node.setBeam(cla)
      const css = node.getNode("css")
      if (css) {
        const nodes = css.getChildren()
        const toMove = []
        nodes.forEach(propNode => {
          const name = propNode.getKeyword().replace(":", " ")
          propNode.setKeyword("@" + name)
          toMove.push(propNode)
        })
        toMove.reverse()
        toMove.forEach(prop => prop.copyTo(node, 0))
      }
      node.delete("class")
      node.delete("css")
      node.getChildren().forEach(migrateNode)
    }
  }

  // Act
  tree.getChildren().forEach(migrateNode)

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
    parseNodeType(line) {
      this.getParent().getLine()
      return TreeNode
    }
  }

  class TestLanguage extends TreeNode {
    parseNodeType() {
      return ReverseEtnNode
    }
  }

  // Act
  // This tests against a regression, it should not throw.
  const program = new TestLanguage(`foo
 bar`)
  // Assert.
  equal(program.length, 1)
}

testTree.multiline = equal => {
  // Arrange
  const a = new TreeNode("my multiline\n string")
  // Assert
  equal(a.getNode("my").getBeamWithChildren(), "multiline\nstring")

  // Arrange
  const a2 = new TreeNode("my \n \n multiline\n string")
  // Assert
  equal(a2.getNode("my").getBeamWithChildren(), "\n\nmultiline\nstring")

  // Arrange
  const b = new TreeNode("brave new\n world")
  // Assert
  equal(b.getNode("brave").getBeamWithChildren(), "new\nworld", "ml value correct")
  equal(b.toString(), "brave new\n world", "multiline does not begin with nl")

  // Arrange
  const c = new TreeNode("brave \n new\n world")
  // Assert
  equal(c.getNode("brave").getBeamWithChildren(), "\nnew\nworld", "ml begin with nl value correct")
  equal(c.toString(), "brave \n new\n world", "multiline begins with nl")

  // Arrange
  const d = new TreeNode("brave \n \n new\n world")
  // Assert
  equal(d.getNode("brave").getBeamWithChildren(), "\n\nnew\nworld", "ml begin with 2 nl value correct")
  equal(d.toString(), "brave \n \n new\n world", "multiline begins with 2 nl")

  // Arrange
  const e = new TreeNode("brave new\n world\n ")
  // Assert
  equal(e.getNode("brave").getBeamWithChildren(), "new\nworld\n", "ml value end with nl correct")
  equal(e.toString(), "brave new\n world\n ", "multiline ends with a nl")

  // Arrange
  const f = new TreeNode("brave new\n world\n \n ")
  // Assert
  equal(f.getNode("brave").getBeamWithChildren(), "new\nworld\n\n", "ml value end with 2 nl correct")
  equal(f.toString(), "brave new\n world\n \n ", "multiline ends with 2 nl")

  // Arrange
  const g = new TreeNode()
  g.touchNode("brave").setBeamWithChildren("\nnew\nworld\n\n")
  // Assert
  equal(g.getNode("brave").getBeamWithChildren(), "\nnew\nworld\n\n", "set ml works")
  equal(g.toString(), "brave \n new\n world\n \n ", "set ml works")

  // Arrange/Act
  const twoNodes = new TreeNode("title Untitled\n")
  const k = new TreeNode()
  k.touchNode("time").setBeam("123")
  k.touchNode("settings").setBeamWithChildren(twoNodes.toString())
  k.touchNode("day").setBeam("1")

  // Assert
  equal(twoNodes.length, 2)
  equal(k.getNode("settings").length, 1, "Expected subtree to have 1 empty node")
  equal(
    k.getNode("settings").getBeamWithChildren(),
    twoNodes.toString(),
    "Expected setBeamWithChildren and getText to work with newlines"
  )
  equal(k.toString(), `time 123\nsettings title Untitled\n \nday 1`)

  // Arrange
  const someText = new TreeNode("a")
  const someNode = someText.getNode("a")

  // Act
  someNode.setBeamWithChildren("const b = 1;\nconst c = 2;")

  // Assert
  equal(someText.toString(), "a const b = 1;\n const c = 2;")
}

testTree.order = equal => {
  // Arrange
  const a = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10")
  const types = a.getKeywords().join(" ")

  // Assert
  equal(types, "john susy bob", "order is preserved")
}

testTree.parseNode = equal => {
  // Arrange
  class LeafNode extends TreeNode {}
  class SubNode extends TreeNode {
    parseNodeType(line) {
      if (line.startsWith("leaf")) return LeafNode
      return SubNode
    }
  }
  class TestLanguageNode extends TreeNode {
    parseNodeType(line) {
      if (line.startsWith("tree")) return TreeNode
      if (line.startsWith("sub")) return SubNode
      return TestLanguageNode
    }
  }

  // Act
  const node = new TestLanguageNode(
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

testTree.getPoint = equal => {
  // Arrange/Act
  const a = new TreeNode(
    `hello
 world
ohayo
 good
  morning
  sunshine`
  )
  const coordinates = a.getPoint()
  const coordinates2 = a.getNode("ohayo good sunshine").getPoint()

  // Assert
  equal(coordinates.x, 0)
  equal(coordinates.y, 0)
  equal(coordinates2.x, 3)
  equal(coordinates2.y, 6)

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
    .map(node => node.getPoint().y)
    .join(" ")
  equal(result, "1 2 3 4 5")
  equal(reg.getNode("a").getPoint().y, 1)
}

testTree.pushBeamAndChildren = equal => {
  // Arrange
  const a = new TreeNode()

  // Act
  const result = a.pushBeamAndChildren("hello world")

  // Assert
  equal(a.getNode("0").getBeam(), "hello world")
  equal(result instanceof TreeNode, true)

  // Act
  a.pushBeamAndChildren(undefined, new TreeNode())

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
  remapped.getChildren().forEach(t => t.remap(expandMapObj))

  const expected = remapped.clone()
  expected.getChildren().forEach(t => t.remap(contractMap))

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
  equal(a.getNode("breck age").getBeam(), "5", "value okay")

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
}

testTree.reorder = equal => {
  // Arrange
  const a = new TreeNode("hello world")

  // Act
  a.touchNode("hi").setBeam("mom")

  // Assert
  equal(a.getKeywords().join(" "), "hello hi", "order correct")

  // Act
  a.insertLine("yo pal", 0)

  // Assert
  equal(a.getKeywords().join(" "), "yo hello hi", "order correct")

  // Act
  const result = a.insertLine("hola pal", 2)
  equal(result instanceof TreeNode, true)

  // Assert
  equal(a.getKeywords().join(" "), "yo hello hola hi", "order correct")
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
  equal(b.getPrevious().getKeyword(), "bob")
  equal(b.getNext().getKeyword(), "susy")
  equal(c.getNext().getKeyword(), "score")
  equal(c.getPrevious().getKeyword(), "score")
}

testTree.reverse = equal => {
  // Arrange
  const tree = new TreeNode("hi mom\nhey sis\nhey dad")

  // Assert
  equal(tree.getNode("hey").getBeam(), "dad")

  // Act
  tree.reverse()

  // Assert
  equal(tree.toString(), "hey dad\nhey sis\nhi mom")
  equal(tree.getNode("hey").getBeam(), "sis")

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
      .getKeyword(),
    "age",
    "Expected reversed properties"
  )
  equal(
    tree2
      .nodeAt(1)
      .nodeAt(0)
      .getKeyword(),
    "name",
    "Expected unchanged properties"
  )
}

testTree.set = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.getNode("hello").getBeam(), "world")
  equal(
    tree.touchNode("hello").setBeam("mom") instanceof TreeNode,
    true,
    "set should return instance so we can chain it"
  )
  equal(tree.getNode("hello").getBeam(), "mom")

  // Act
  tree.touchNode("boom").setBeam("")
  // Assert
  equal(tree.getNode("boom").getBeam(), "", "empty string")

  // Act
  tree.touchNode("head style color").setBeam("blue")
  // Assert
  equal(tree.getNode("head style color").getBeam(), "blue", "set should have worked")

  // Test dupes
  // Arrange
  tree.appendLine("hello bob")

  // Act
  tree.touchNode("hello").setBeam("tim")

  // Assert
  equal(tree.getNode("hello").getBeam(), "tim", "Expected set to change last occurrence of property.")

  // TEST INT SCENARIOS
  // Arrange
  const tree2 = new TreeNode()

  // Act
  tree2.touchNode("2").setBeam("hi")
  tree2.touchNode("3").setBeam(3)
  // Assert
  equal(tree2.getNode("2").getBeam(), "hi")
  equal(tree2.getNode("2").getBeam(), "hi")
  equal(tree2.getNode("3").getBeam(), "3")

  // TEST SPACEPATH SCENARIOS
  // Arrange
  const tree3 = new TreeNode("style\n")
  // Act
  tree3.touchNode("style color").setBeam("red")
  tree3.touchNode("style width").setBeam("100")

  // Assert
  equal(tree3.getNode("style color").getBeam(), "red")
  equal(tree3.getNode("style width").getBeam(), "100")

  // TEST ORDERING
  // Arrange
  const tree4 = new TreeNode("hello world")
  // Act
  tree4.touchNode("hi").setBeam("mom")
  // Assert
  equal(tree4.getKeywords().join(" "), "hello hi", "order correct")

  // Act
  tree4.insertLine("yo pal", 0)
  // Assert
  equal(tree4.getKeywords().join(" "), "yo hello hi", "order correct")

  // Act
  tree4.insertLine("hola pal", 2)
  // Assert
  equal(tree4.getKeywords().join(" "), "yo hello hola hi", "order correct")

  // Arrange
  const tree5 = new TreeNode()
  // Act
  tree5.touchNode("hi").setBeam("hello world")
  tree5.touchNode("yo").setChildren(new TreeNode("hello world"))
  // Assert
  equal(tree5.getNode("hi").getBeam() === tree5.getNode("yo").getBeam(), false)

  // Arrange
  const tree6 = new TreeNode()

  // Act
  tree6.touchNode("meta x").setBeam(123)
  tree6.touchNode("meta y").setBeam(1235)
  tree6.touchNode("meta c").setBeam(435)
  tree6.touchNode("meta x").setBeam(1235123)

  // Assert
  equal(tree6.getNode("meta c").getBeam(), "435")

  // Arrange
  const tree7 = new TreeNode("name John\nage\nfavoriteColors\n blue\n  blue1 1\n  blue2 2\n green\n red 1\n")

  // Act
  tree7
    .touchNode("favoriteColors blue")
    .setBeam("purple")
    .toString()

  // Assert
  equal(tree7.getNode("favoriteColors blue").getBeam(), "purple")

  // Act
  tree7.touchNode(" blanks").setBeam("test")
  tree7.touchNode(" \nboom").setBeam("test2")

  // Assert
  equal(tree7.getNode(" blanks").getBeam(), "test", "Expected blank paths to be settable")
  equal(tree7.getNode(" boom").getBeam(), "test2", "Expected newlines in path to be sanitized")

  // Arrange/Act
  const boom = new TreeNode("")
  boom.touchNode("description").setBeam("some text with a \nnewline")

  // Assert
  equal(new TreeNode(boom.toString()).length, 1)

  // Test Blanks
  // Arrange
  const blank = new TreeNode()
  blank.touchNode("").setBeam("")

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
  equal(tree.getKeywords().join(" "), "john susy bob")
  // Act
  tree.sort((a, b) => {
    return b.getKeyword() < a.getKeyword()
  })
  // Assert
  equal(tree.getKeywords().join(" "), "bob john susy")
}

testTree.sortBy = equal => {
  // Arrange
  const tree = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10\nsam\n age 21\nbrian\n age 6")
  // Assert
  equal(tree.getKeywords().join(" "), "john susy bob sam brian")

  // Act
  tree.sortBy("age")

  // Assert
  equal(tree.getKeywords().join(" "), "bob sam john susy brian")

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
    getZI() {
      return "="
    }

    getYI() {
      return ";"
    }

    getXI() {
      return "="
    }
  }

  // Act
  const b = new TestLanguage(test2)

  // Assert
  equal(b.getNode("person=country").getBeam(), "USA")
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

testTree.toTable = equal => {
  // Arrange
  const a = TreeNode.fromCsv("name,score,color\n" + testStrings.csvNoHeaders)
  // Act/Assert
  equal(a.toTable(), testStrings.toTableLeft, "Expected correct spacing")
  equal(a.toFormattedTable(100, true), testStrings.toTable, "Expected correct spacing")

  // Arrange
  const b = TreeNode.fromCsv("name\njoe\nfrankenstein")
  // Act/Assert
  equal(b.toFormattedTable(1, false), "n\nj\nf", "Expected max width to be enforced")
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
  equal(test.getNode("html head body").getChildren().length, 3)
  equal(test.getNode("html head body h2").getBeam(), "2")

  equal(new TreeNode(`${TreeNode.nest("foo bar", 0)}`).getNode("foo").getBeam(), "bar")
  equal(new TreeNode(`${TreeNode.nest("foo bar", 1)}`).getNode(" foo").getBeam(), "bar")
  equal(new TreeNode(`${TreeNode.nest("foo bar", 2)}`).nodeAt([0, 0]).getBeam(), "foo bar")
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

  const ucfirst = str => str.charAt(0).toUpperCase() + str.slice(1)

  // Act
  const simple = tree.toMarkdownTable()
  const table = tree.toMarkdownTableAdvanced(
    ["title", "date", "location", "website"],
    (value, row, col) => (row ? value : ucfirst(value))
  )

  // Assert
  equal(table, expected, "markdown ok")
  equal(simple, simpleExpected, "markdown simple ok")
}

testTree.setBeamWithChildrenRegression = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  const hello = tree.getNode("hello")
  // Act
  hello.setBeamWithChildren(
    `brave
 new world`
  )
  hello.setBeamWithChildren(`earth`)
  // Assert
  equal(tree.toString(), "hello earth")
}

testTree.toString = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  // Assert
  equal(tree.toString(), "hello world", "Expected correct string.")
  // Act
  tree.touchNode("foo").setBeam("bar")
  // Assert
  equal(tree.toString(), "hello world\nfoo bar")

  // Arrange
  const tree2 = new TreeNode("z-index 0")
  // Act
  tree2["z-index"] = 0
  // Assert
  equal(tree2.toString(), "z-index 0")

  // Test empty values
  // Arrange
  const tree3 = new TreeNode()

  // Act
  tree3.touchNode("empty").setBeam("")
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
  a.touchNode("multiline").setBeamWithChildren("hello\nworld")
  // Assert
  equal(a.toString(), "john\n age 5\nmultiline hello\n world")

  // Act
  a.touchNode("other").setBeam("foobar")
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
  equal(
    a.toString(),
    "john\n age 5\nmultiline hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more"
  )

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
    .map(node => node.getLine())
    .join(" ")
  const postOrder = traversal
    .getChildrenFirstArray()
    .map(node => node.getLine())
    .join(" ")
  const breadthfirst = traversal
    .getParentFirstArray()
    .map(node => node.getLine())
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
    .map(node => node.getLine())
    .join("")
  const wikibreadthfirst = wikipediaBinaryTree
    .getParentFirstArray()
    .map(node => node.getLine())
    .join("")
  const wikipostorder = wikipediaBinaryTree
    .getChildrenFirstArray()
    .map(node => node.getLine())
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

testTree.fromJson = equal => {
  // AAA
  equal(
    TreeNode.fromJson(JSON.stringify(testStrings.json2)).toString(),
    new TreeNode(testStrings.json2tree).getNode("docs").childrenToString()
  )
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
    treeNode.toMappedOutline(node => "o"),
    `└o
 └o
`
  )
}

testTree.getTreeMTime = equal => {
  // Arrange
  const a = new TreeNode(`text
 foo
  bar
some
 other`)
  const mtime = a.getTreeMTime()
  const fooTime = a.getNode("text foo").getTreeMTime()

  // Act
  a.delete("some other")

  // Assert
  const newTime = a.getTreeMTime()
  equal(newTime > mtime, true, `newtime is greater than mtime ${newTime} ${mtime}`)
  equal(a.getNode("text foo").getTreeMTime() === fooTime, true, "times are equal")

  // Act
  a.getNode("text foo").setBeam("wham")

  // Assert
  equal(a.getNode("text foo").getTreeMTime() > fooTime, true, "mod child updates")

  // Arrange
  const b = new TreeNode(`foo`)
  b.appendLine("bar")
  const bTime = b.getTreeMTime()

  // Act
  b.getNode("foo").destroy()

  // Assert
  equal(b.getTreeMTime() > bTime, true, "time increased")
}

testTree.typeTests = equal => {
  // Arrange
  const a = new TreeNode("text")
  // Assert
  equal(a.getErrors().length, 0)
  equal(a.getLineSyntax(), "any")
}

testTree.treeNodes = equal => {
  // Arrange
  const a = new TreeNode("text")
  const node = a.nodeAt(0)
  const originalMtime = node.getMTime()

  // Assert
  equal(originalMtime > 0, true)
  equal(node.isTerminal(), true)
  equal(node.getKeyword(), "text")
  equal(node.getBeam(), undefined)
  equal(node.length, 0)

  // Act
  node.setBeam("hello world")

  // Assert
  equal(node.getBeam(), "hello world")
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
  const mtime = node.getMTime()
  node.setKeyword("foo")

  // Assert
  equal(a.toString(), "foo hello world\n color blue")
  equal(node.getMTime() > mtime, true)
  equal(a.has("text"), false)

  // Act
  node.setChildren("")

  // Assert
  equal(!!node.toString(), true)
}

module.exports = testTree
