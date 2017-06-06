"use strict"

const TreeNode = require("./treenotation.js")

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

testStrings.toFixedWidthTable = `name score color
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
  equal(tree.getNode("hello").getTail(), "world", "Properties should be accessible")
  equal(typeof tree.getNode("hello").getTail(), "string", "Leafs should be strings")

  // Act
  tree.touchNode("foo").setTail("bar")

  // Assert
  equal(tree.getNode("foo").getTail(), "bar", "Trees should be modifiable")

  // Arrange
  const tree2 = new TreeNode("foobar\n one 1")

  // Assert
  equal(tree2.getNode("foobar").getTail(), undefined, "Value should be empty")
  equal(tree2.getNode("foobar").getNode("one").getTail(), "1", "Value should be 1")

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
  equal(tree5.getNode("foobar").getTail(), "hello", "Trees can be created from object literals")

  // Arrange
  const tree6 = new TreeNode({
    foobar: new TreeNode("hello world")
  })

  // Assert
  equal(tree6.getNode("foobar hello").getTail(), "world", "Trees can be created from objects mixed with trees")

  // Arrange
  const tree7 = new TreeNode({
    foobar: {
      hello: {
        world: "success"
      }
    }
  })

  // Assert
  equal(tree7.getNode("foobar hello world").getTail(), "success", "Trees can be created from deep objects")

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
    tree8.getNode("domains test.test.com pages home settings data title").getTail(),
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
  equal(node.getHead(), "")
  equal(node.getTail(), "")

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
    getWordDelimiter() {
      return ":"
    }
  }

  equal(new TestTree(test).nodeAt(0).length, 2)

  const rootTree = new TestTree()
  const tree = rootTree.append("", new TestTree())
  tree.append("")
  tree.append("")
  const newTree = new TestTree(rootTree.toString())
  equal(newTree.nodeAt(0).length, 2)
}

testTree.append = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Act
  tree.append("foo bar")
  tree.touchNode("foo2").setTail("bar")

  // Assert
  equal(tree.getNode("foo").getTail(), "bar")

  // Act
  tree.append("foo two")

  // Assert
  equal(tree.length, 4)
}

testTree.at = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhow are you\nhola friend")

  // Assert
  equal(value.nodeAt(0).getTail(), "world")
  equal(value.nodeAt(1).getTail(), "are you")
  equal(value.nodeAt(2).getTail(), "friend")
  equal(value.nodeAt(3), undefined)
  equal(value.nodeAt(-1).getTail(), "friend")
}

testTree.clone = equal => {
  // Arrange/Act
  const a = new TreeNode("hello world")
  const b = a.clone()

  // Assert
  equal(b.getNode("hello").getTail(), "world")
  equal(a.toString(), b.toString(), "string unchanged")

  // Act
  b.touchNode("hello").setTail("mom")

  // Assert
  equal(a.getNode("hello").getTail(), "world")

  // Arrange
  const c = a

  // Assert
  equal(c.getNode("hello").getTail(), "world")

  // Act
  c.touchNode("hello").setTail("foo")

  // Assert
  equal(a.getNode("hello").getTail(), "foo")

  // Arrange
  const d = c

  // Assert
  equal(d.getNode("hello").getTail(), "foo", "foo should be value")

  // Act
  d.touchNode("hello").setTail("hiya")

  // Assert
  equal(a.getNode("hello").getTail(), "hiya", "original unchanged")

  // Act
  a.touchNode("test").setTail("boom")

  // Assert
  equal(d.getNode("test").getTail(), "boom")

  // Act
  a.touchNode("foobar").setChildren(new TreeNode("123 456"))

  // Assert
  equal(c.getNode("foobar 123").getTail(), "456", "expected 456")

  // Arrange
  const e = a

  // Assert
  equal(e.getNode("foobar 123").getTail(), "456")

  // Arrange
  const f = a.clone()

  // Assert
  equal(f.getNode("foobar 123").getTail(), "456")

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
  equal(a.getNode("hi").getTail(), "mom")
  equal(newNodes.length, 1)
}

testTree.delete = equal => {
  // Arrange
  const tree = new TreeNode()
  tree.touchNode("name").setTail("Breck")

  // Assert
  equal(tree.getNode("name").getTail(), "Breck", "name is set")
  equal(tree.length, 1, "length okay")

  // Act
  tree.delete("name")

  // Assert
  equal(tree.getNode("name"), undefined, "name is gone")
  equal(tree.length, 0, "length okay")

  // Act
  tree.touchNode("name").setTail("Breck")
  tree.touchNode("age").setTail("100")
  tree.touchNode("table").setTail("true")
  tree.delete("age")

  // Assert
  equal(tree.getNode("age"), undefined, "age is gone")
  equal(tree.length, 2, "expected 2 elements remaining")

  // Test deep delete
  // Arrange
  const tree2 = new TreeNode()
  tree2.touchNode("earth north_america united_states california san_francisco").setTail("mission")

  // Assert
  equal(tree2.getNode("earth north_america united_states california") instanceof TreeNode, true, "node exists")
  equal(
    tree2.getNode("earth north_america united_states california san_francisco").getTail(),
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
  equal(tree3.getNode("property").getTail(), "meta", "delete a non existing entry works")

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
    if (!node.getHead().startsWith("p")) return true
    node.setTail("President")
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
      nodeTree.touchNode("format").setTail("csv")
      nodeTree.touchNode("content").setTailWithChildren(csv)
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
    const property = node.getHead()
    const v = node.getTail()
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
  value2.getChildren().filter(n => n.getHead() !== "hello").forEach(node => {
    const property = node.getHead()
    const value = node.getTail()
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
  const base = `>foo
 class main`
  const web = `>foo
 >bar
  >bam
   class boom
   ham
    hoom
    vroom`
  // Act
  const extended = new TreeNode(base).extend(web)

  // Assert
  equal(extended.getNode(">foo >bar >bam class").getTail(), "boom")
}

testTree.first = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getTail(), "world")

  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value2.nodeAt(0).toString(), "hello world")
}

testTree.firstProperty = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getHead(), "hello")
}

testTree.firstValue = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  equal(value.nodeAt(0).getTail(), "world")
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
  equal(tree2.nodeAt(0).getNode("Country").getTail(), "USA")

  // Arrange
  const tree3 = TreeNode.fromCsv("")

  // Assert
  equal(tree3.toString(), "", "Expected empty string to be handled correctly")

  // Assert
  equal(withQuotes.getNode("0 Date").getTail(), "123", "Expected quotes to be handled properly")

  // Arrange
  const tree4 = TreeNode.fromCsv('height\n"32,323"')

  // Assert
  equal(tree4.getNode("0 height").getTail(), "32,323")

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
  equal(testCase.getNode("1 age").getTail(), "32", "Expected return chars to be removed")

  // Act
  testCase.getNode("1").delete("name")

  // Assert
  equal(testCase.getNode("0").childrenToString(), "name joe\nage 21", "property change should not affect other objects")
  equal(testCase.getNode("1 name"), undefined, "property should be gone")
}

testTree.fromCsvNoHeaders = equal => {
  // Arrange
  const a = TreeNode.fromCsv(testStrings.csvNoHeaders, false)

  // Assert
  equal(a.length, 3)
  equal(a.getNode("1 2").getTail(), "blue")
}

testTree.fromDelimited = equal => {
  // Arrange
  const a = TreeNode.fromDelimited(testStrings.fromDelimited, "^", undefined, "~")

  // Assert
  equal(a.length, 2)
  equal(a.getNode("0 weight").getTail(), "2.2")
  equal(a.getNode("1 foodName").getTail(), "Banana")

  // Arrange
  const b = TreeNode.fromDelimited(
    `name,score

joe,23`
  )

  // Assert
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
  equal(fixedCol.nodeAt(0).getNode("comment").getTail(), testStrings.ssvFixedColumnComment1)
  equal(fixedCol.nodeAt(1).getNode("comment").getTail(), testStrings.ssvFixedColumnComment2)
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
  equal(b.getNode("0 age").getTail(), "2")
  equal(b.getNode("0 height").getTail(), "23")
}

testTree.getLine = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  const node = tree.getNode("hello")
  const mtime = node.getMTime()

  // Assert
  equal(node.getLine(), "hello world")

  // Act
  node.setLine("hi earth")

  // Assert
  equal(tree.toString(), "hi earth")
  equal(node.getMTime() > mtime, true)
}

testTree.getTail = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.getNode("hello").getTail(), "world")
  equal(tree.findTail("hello"), "world")

  // Act
  // Test get with ints
  tree.touchNode("2").setTail("hi")

  // Assert
  equal(tree.getNode("2").getTail(), "hi", "Expected int strings to work.")

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
  equal(tree2.getNode("height").getTail(), "50px", "Expected to get last value in instance with duplicate property.")

  // todo: remove ability of get to take non-strings
  // Arrange
  const treeWithNumbers = new TreeNode("1 bob\n0 brenda")

  // Act/Assert
  equal(treeWithNumbers.getNode("0").getTail(), "brenda")
  equal(treeWithNumbers.getNode("1").getTail(), "bob")
}

testTree.getLines = equal => {
  // Arrange
  const value = new TreeNode("hello\n world")

  // Assert
  equal(value.getLines().join("").indexOf(" "), -1)
}

testTree.getNodes = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhello world")
  var each = ""

  // Assert
  equal(value.findNodes("hello").length, 2)

  // Act
  const result = value.findNodes("hello").map(node => node.getTail()).join("")

  // Assert
  equal(result, "worldworld")
}

testTree.getTails = equal => {
  // Arrange
  const html = new TreeNode("h1 hello world\nh1 hello world")

  // Assert
  equal(html.getTails().join("\n"), "hello world\nhello world")
}

testTree.multiply = equal => {
  class MathNode extends TreeNode {
    getWordDelimiter() {
      return " "
    }

    getNodeDelimiter() {
      return "o"
    }

    getEdgeChar() {
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

testTree.getIndex = equal => {
  // Arrange
  const tree = new TreeNode("r1\n name bob\nr2\n name joe")
  const child0 = tree.getNode("r1")
  const child1 = tree.getNode("r2")

  // Act/Assert
  equal(child0.getIndex(), 0, "Has correct index")
  equal(child1.getIndex(), 1, "Has correct index")
}

testTree.getPathName = equal => {
  // Arrange
  const tree = new TreeNode(testStrings.every)
  const parent = tree.getNode("domains test.test.com pages home settings")
  const child = tree.getNode("domains test.test.com pages home settings data")
  const simple = new TreeNode("foo bar")

  // Assert
  equal(child.getPathName(), "domains test.test.com pages home settings data")
  equal(child.getParent(), parent)
  equal(child.getRootNode(), tree)
  equal(child.getAncestorNodes().length, 6)
  equal(simple.getNode("foo").getAncestorNodes().length, 1)
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
  const newNamePath = tree.pathVectorToPathName([5, 0, 4, 0, 0])

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

testTree.htmlDsl = equal => {
  // Arrange
  const html = new TreeNode("h1 hello world\nh1 hello world")
  var page = ""

  // Act
  html.getChildren().forEach(node => {
    const property = node.getHead()
    const value = node.getTail()
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
  tree.touchNode("color").setTail("")

  // Assert
  equal(tree.indexOf("color"), 1)

  // Act
  tree.append("hello world")

  // Assert
  equal(tree.indexOf("hello"), 0)
  equal(tree.indexOfLast("hello"), 2)
}

testTree.insert = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Act
  tree.insert("hi mom", undefined, 0)

  // Assert
  equal(tree.indexOf("hi"), 0, "Expected hi at position 0")

  // Insert using an index longer than the current object
  // Act
  tree.insert("test dad", undefined, 10)

  // Assert
  equal(tree.nodeAt(2).getTail(), "dad", "Expected insert at int greater than length to append")
  equal(tree.length, 3)

  // Insert using a negative index
  // Act
  tree.insert("test2 sister", undefined, -1)

  // Assert
  equal(tree.nodeAt(2).getTail(), "sister")
  equal(tree.nodeAt(3).getTail(), "dad")
}

testTree.last = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getTail(), "mom")

  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value2.nodeAt(-1).toString(), "hi mom")
}

testTree.lastProperty = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getHead(), "hi")
}

testTree.lastValue = equal => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  equal(value.nodeAt(-1).getTail(), "mom")
}

testTree.loadFromArray = equal => {
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

testTree.loadFromObject = equal => {
  // Arrange
  const tree = new TreeNode(testStrings.json)
  const date = new Date()
  const time = date.getTime()
  const treeWithDate = new TreeNode({ name: "John", date: date })

  // Assert
  equal(tree.getNode("lowestScore").getTail(), "-10")
  equal(treeWithDate.getNode("date").getTail(), time.toString())

  // Test against object with circular references
  // Arrange
  const a = { foo: "1" }
  const b = { bar: "2", ref: a }

  // Act
  // Create circular reference
  a.c = b
  const tree2 = new TreeNode(a)

  // Assert
  equal(tree2.getNode("c bar").getTail(), "2", "expected 2")
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

testTree.loadFromTree = equal => {
  // Arrange
  const a = new TreeNode("foo\n bar bam")
  const b = new TreeNode(a)

  // Assert
  equal(a.getNode("foo bar").getTail(), "bam")
  equal(b.getNode("foo bar").getTail(), "bam")

  // Act
  a.touchNode("foo bar").setTail("wham")

  // Assert
  equal(a.getNode("foo bar").getTail(), "wham")
  equal(b.getNode("foo bar").getTail(), "bam")
}

testTree.loadFromString = equal => {
  // Arrange/Act
  const startsWithSpace = new TreeNode(" name john")

  // Assert
  equal(startsWithSpace.length, 1, "Expected 1 node")

  // Arrange
  const a = new TreeNode("text \n this is a string\n and more")

  // Assert
  equal(a.getNode("text").getTailWithChildren(), "\nthis is a string\nand more", "Basic")

  // Arrange
  const b = new TreeNode("a\n text \n  this is a string\n  and more")

  // Assert
  equal(b.getNode("a text").getTailWithChildren(), "\nthis is a string\nand more")
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
  equal(c.getNode("children 1 children 1 age").getTail(), "12")
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
  equal(g.getNode("hi ").getTail(), "   somewhat invalid")

  const testCase = new TreeNode(testStrings.newLines)
  equal(testCase.toString().split("\n").length, 11, "All blank lines are preserved")
}

testTree.loadFromStringExtraTrees = equal => {
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
  const node = value.getChildren()[1].copyTo(node0)
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
    if (!node.getHead().startsWith(">")) return true
    if (node.length) {
      const cla = node.getNode("class").getTail()
      if (cla) node.setTail(cla)
      const css = node.getNode("css")
      if (css) {
        const nodes = css.getChildren()
        const toMove = []
        nodes.forEach(propNode => {
          const name = propNode.getHead().replace(":", " ")
          propNode.setHead("@" + name)
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

testTree.multiline = equal => {
  // Arrange
  const a = new TreeNode("my multiline\n string")
  // Assert
  equal(a.getNode("my").getTailWithChildren(), "multiline\nstring")

  // Arrange
  const a2 = new TreeNode("my \n \n multiline\n string")
  // Assert
  equal(a2.getNode("my").getTailWithChildren(), "\n\nmultiline\nstring")

  // Arrange
  const b = new TreeNode("brave new\n world")
  // Assert
  equal(b.getNode("brave").getTailWithChildren(), "new\nworld", "ml value correct")
  equal(b.toString(), "brave new\n world", "multiline does not begin with nl")

  // Arrange
  const c = new TreeNode("brave \n new\n world")
  // Assert
  equal(c.getNode("brave").getTailWithChildren(), "\nnew\nworld", "ml begin with nl value correct")
  equal(c.toString(), "brave \n new\n world", "multiline begins with nl")

  // Arrange
  const d = new TreeNode("brave \n \n new\n world")
  // Assert
  equal(d.getNode("brave").getTailWithChildren(), "\n\nnew\nworld", "ml begin with 2 nl value correct")
  equal(d.toString(), "brave \n \n new\n world", "multiline begins with 2 nl")

  // Arrange
  const e = new TreeNode("brave new\n world\n ")
  // Assert
  equal(e.getNode("brave").getTailWithChildren(), "new\nworld\n", "ml value end with nl correct")
  equal(e.toString(), "brave new\n world\n ", "multiline ends with a nl")

  // Arrange
  const f = new TreeNode("brave new\n world\n \n ")
  // Assert
  equal(f.getNode("brave").getTailWithChildren(), "new\nworld\n\n", "ml value end with 2 nl correct")
  equal(f.toString(), "brave new\n world\n \n ", "multiline ends with 2 nl")

  // Arrange
  const g = new TreeNode()
  g.touchNode("brave").setTailWithChildren("\nnew\nworld\n\n")
  // Assert
  equal(g.getNode("brave").getTailWithChildren(), "\nnew\nworld\n\n", "set ml works")
  equal(g.toString(), "brave \n new\n world\n \n ", "set ml works")

  // Arrange/Act
  const twoNodes = new TreeNode("title Untitled\n")
  const k = new TreeNode()
  k.touchNode("time").setTail("123")
  k.touchNode("settings").setTailWithChildren(twoNodes.toString())
  k.touchNode("day").setTail("1")

  // Assert
  equal(twoNodes.length, 2)
  equal(k.getNode("settings").length, 1, "Expected subtree to have 1 empty node")
  equal(
    k.getNode("settings").getTailWithChildren(),
    twoNodes.toString(),
    "Expected setTailWithChildren and getText to work with newlines"
  )
  equal(k.toString(), `time 123\nsettings title Untitled\n \nday 1`)

  // Arrange
  const someText = new TreeNode("a")
  const someNode = someText.getNode("a")

  // Act
  someNode.setTailWithChildren("const b = 1;\nconst c = 2;")

  // Assert
  equal(someText.toString(), "a const b = 1;\n const c = 2;")
}

testTree.order = equal => {
  // Arrange
  const a = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10")
  const types = a.getHeads().join(" ")

  // Assert
  equal(types, "john susy bob", "order is preserved")
}

testTree.prepend = equal => {
  // Arrange
  const a = new TreeNode("hello world")
  // Assert
  equal(a.toString(), "hello world")

  // Act
  const result = a.prepend("foo bar")
  // Assert
  equal(a.toString(), "foo bar\nhello world")
  equal(result instanceof TreeNode, true)
}

testTree.pushTailAndChildren = equal => {
  // Arrange
  const a = new TreeNode()

  // Act
  const result = a.pushTailAndChildren("hello world")

  // Assert
  equal(a.getNode("0").getTail(), "hello world")
  equal(result instanceof TreeNode, true)

  // Act
  a.pushTailAndChildren(undefined, new TreeNode())

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
  const contractMap = map.clone().invert().toObject()

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
  equal(a.getNode("breck age").getTail(), "5", "value okay")

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
  a.touchNode("hi").setTail("mom")

  // Assert
  equal(a.getHeads().join(" "), "hello hi", "order correct")

  // Act
  a.insert("yo pal", undefined, 0)

  // Assert
  equal(a.getHeads().join(" "), "yo hello hi", "order correct")

  // Act
  const result = a.insert("hola pal", undefined, 2)
  equal(result instanceof TreeNode, true)

  // Assert
  equal(a.getHeads().join(" "), "yo hello hola hi", "order correct")
}

testTree.reverse = equal => {
  // Arrange
  const tree = new TreeNode("hi mom\nhey sis\nhey dad")

  // Assert
  equal(tree.getNode("hey").getTail(), "dad")

  // Act
  tree.reverse()

  // Assert
  equal(tree.toString(), "hey dad\nhey sis\nhi mom")
  equal(tree.getNode("hey").getTail(), "sis")

  // Test reverse when using internal types

  // Arrange
  const tree2 = TreeNode.fromCsv("name,age\nbill,20\nmike,40\ntim,30")

  // Act
  tree2.nodeAt(0).reverse()

  // Assert
  equal(tree2.nodeAt(0).nodeAt(0).getHead(), "age", "Expected reversed properties")
  equal(tree2.nodeAt(1).nodeAt(0).getHead(), "name", "Expected unchanged properties")
}

testTree.set = equal => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  equal(tree.getNode("hello").getTail(), "world")
  equal(
    tree.touchNode("hello").setTail("mom") instanceof TreeNode,
    true,
    "set should return instance so we can chain it"
  )
  equal(tree.getNode("hello").getTail(), "mom")

  // Act
  tree.touchNode("boom").setTail("")
  // Assert
  equal(tree.getNode("boom").getTail(), "", "empty string")

  // Act
  tree.touchNode("head style color").setTail("blue")
  // Assert
  equal(tree.getNode("head style color").getTail(), "blue", "set should have worked")

  // Test dupes
  // Arrange
  tree.append("hello bob")

  // Act
  tree.touchNode("hello").setTail("tim")

  // Assert
  equal(tree.getNode("hello").getTail(), "tim", "Expected set to change last occurrence of property.")

  // TEST INT SCENARIOS
  // Arrange
  const tree2 = new TreeNode()

  // Act
  tree2.touchNode("2").setTail("hi")
  tree2.touchNode("3").setTail(3)
  // Assert
  equal(tree2.getNode("2").getTail(), "hi")
  equal(tree2.getNode("2").getTail(), "hi")
  equal(tree2.getNode("3").getTail(), "3")

  // TEST SPACEPATH SCENARIOS
  // Arrange
  const tree3 = new TreeNode("style\n")
  // Act
  tree3.touchNode("style color").setTail("red")
  tree3.touchNode("style width").setTail("100")

  // Assert
  equal(tree3.getNode("style color").getTail(), "red")
  equal(tree3.getNode("style width").getTail(), "100")

  // TEST ORDERING
  // Arrange
  const tree4 = new TreeNode("hello world")
  // Act
  tree4.touchNode("hi").setTail("mom")
  // Assert
  equal(tree4.getHeads().join(" "), "hello hi", "order correct")

  // Act
  tree4.insert("yo pal", undefined, 0)
  // Assert
  equal(tree4.getHeads().join(" "), "yo hello hi", "order correct")

  // Act
  tree4.insert("hola pal", undefined, 2)
  // Assert
  equal(tree4.getHeads().join(" "), "yo hello hola hi", "order correct")

  // Arrange
  const tree5 = new TreeNode()
  // Act
  tree5.touchNode("hi").setTail("hello world")
  tree5.touchNode("yo").setChildren(new TreeNode("hello world"))
  // Assert
  equal(tree5.getNode("hi").getTail() === tree5.getNode("yo").getTail(), false)

  // Arrange
  const tree6 = new TreeNode()

  // Act
  tree6.touchNode("meta x").setTail(123)
  tree6.touchNode("meta y").setTail(1235)
  tree6.touchNode("meta c").setTail(435)
  tree6.touchNode("meta x").setTail(1235123)

  // Assert
  equal(tree6.getNode("meta c").getTail(), "435")

  // Arrange
  const tree7 = new TreeNode("name John\nage\nfavoriteColors\n blue\n  blue1 1\n  blue2 2\n green\n red 1\n")

  // Act
  tree7.touchNode("favoriteColors blue").setTail("purple").toString()

  // Assert
  equal(tree7.getNode("favoriteColors blue").getTail(), "purple")

  // Act
  tree7.touchNode(" blanks").setTail("test")
  tree7.touchNode(" \nboom").setTail("test2")

  // Assert
  equal(tree7.getNode(" blanks").getTail(), "test", "Expected blank paths to be settable")
  equal(tree7.getNode(" boom").getTail(), "test2", "Expected newlines in path to be sanitized")

  // Arrange/Act
  const boom = new TreeNode("")
  boom.touchNode("description").setTail("some text with a \nnewline")

  // Assert
  equal(new TreeNode(boom.toString()).length, 1)

  // Test Blanks
  // Arrange
  const blank = new TreeNode()
  blank.touchNode("").setTail("")

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
  equal(tree.getHeads().join(" "), "john susy bob")
  // Act
  tree.sort((a, b) => {
    return b.getHead() < a.getHead()
  })
  // Assert
  equal(tree.getHeads().join(" "), "bob john susy")
}

testTree.sortBy = equal => {
  // Arrange
  const tree = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10\nsam\n age 21\nbrian\n age 6")
  // Assert
  equal(tree.getHeads().join(" "), "john susy bob sam brian")

  // Act
  tree.sortBy("age")

  // Assert
  equal(tree.getHeads().join(" "), "bob sam john susy brian")

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
  const test2 = `person;=name=Breck;=country=USA;=books;==one=SICP;==two=Pragmatic;=num=12;=multiline=this is a string;==over=multiple lines.;==== and this one has extra indents;=num=12;`

  class TestLanguage extends TreeNode {
    getWordDelimiter() {
      return "="
    }

    getNodeDelimiter() {
      return ";"
    }

    getEdgeChar() {
      return "="
    }
  }

  // Act
  const b = new TestLanguage(test2)

  // Assert
  equal(b.getNode("person=country").getTail(), "USA")
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

testTree.toFixedWidthTable = equal => {
  // Arrange
  const a = TreeNode.fromCsv("name,score,color\n" + testStrings.csvNoHeaders)
  // Act/Assert
  equal(a.toFixedWidthTable(), testStrings.toFixedWidthTable, "Expected correct spacing")

  // Arrange
  const b = TreeNode.fromCsv("name\njoe\nfrankenstein")
  // Act/Assert
  equal(b.toFixedWidthTable(1), "n\nj\nf", "Expected max width to be enforced")
}

testTree.toJavascript = equal => {
  // Arrange
  const multiline = new TreeNode("name John\nname John")
  // Assert
  equal(
    multiline.toJavascript(),
    `new TreeNode(\`name John
name John\`)`
  )
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

testTree.toString = equal => {
  // Arrange
  const tree = new TreeNode("hello world")
  // Assert
  equal(tree.toString(), "hello world", "Expected correct string.")
  // Act
  tree.touchNode("foo").setTail("bar")
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
  tree3.touchNode("empty").setTail("")
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
  a.touchNode("multiline").setTailWithChildren("hello\nworld")
  // Assert
  equal(a.toString(), "john\n age 5\nmultiline hello\n world")

  // Act
  a.touchNode("other").setTail("foobar")
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
  const preOrder = traversal.getTopDownArray().map(node => node.getLine()).join(" ")
  const postOrder = traversal.getChildrenFirstArray().map(node => node.getLine()).join(" ")
  const breadthfirst = traversal.getParentFirstArray().map(node => node.getLine()).join(" ")

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
  const wikipreorder = wikipediaBinaryTree.getTopDownArray().map(node => node.getLine()).join("")
  const wikibreadthfirst = wikipediaBinaryTree.getParentFirstArray().map(node => node.getLine()).join("")
  const wikipostorder = wikipediaBinaryTree.getChildrenFirstArray().map(node => node.getLine()).join("")

  // Assert
  equal(wikipreorder, "fbadcegih")
  equal(wikibreadthfirst, "fbgadiceh")
  equal(wikipostorder, "acedbhigf")
}

testTree.getVersion = equal => {
  // AAA
  equal(!!TreeNode.getVersion(), true)
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

testTree.immutable = equal => {
  // Arrange
  const ImmutableTreeNode = TreeNode.ImmutableTreeNode
  const immutableNode = new ImmutableTreeNode("hello world")
  const mutableNode = new TreeNode("hello world")

  // Assert
  equal(typeof immutableNode.setTail, "undefined")
  equal(typeof mutableNode.setTail, "function")
}

testTree.treeNodes = equal => {
  // Arrange
  const a = new TreeNode("text")
  const node = a.nodeAt(0)

  // Assert
  equal(node.isTerminal(), true)
  equal(node.getHead(), "text")
  equal(node.getTail(), undefined)
  equal(node.length, 0)

  // Act
  node.setTail("hello world")

  // Assert
  equal(node.getTail(), "hello world")
  equal(a.toString(), "text hello world")

  // Act
  node.setChildren("color blue")

  // Assert
  equal(node.isTerminal(), false)
  equal(node.childrenToString(), "color blue")
  equal(a.toString(), "text hello world\n color blue")

  // Act
  const mtime = node.getMTime()
  node.setHead("foo")

  // Assert
  equal(a.toString(), "foo hello world\n color blue")
  equal(node.getMTime() > mtime, true)

  // Act
  node.setChildren("")

  // Assert
  equal(!!node.toString(), true)
}

module.exports = testTree
