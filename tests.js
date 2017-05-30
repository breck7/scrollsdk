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

testTree.constructorTests = assert => {
  // Assert
  assert.ok(TreeNode, "TreeNode class should exist")
  assert.ok(new TreeNode() instanceof TreeNode, "TreeNode should return a tree")

  // Arrange/Act
  const tree = new TreeNode("hello world")

  // Assert
  assert.strictEqual(tree.length, 1, "types array should have 1 property")
  assert.strictEqual(tree.indexOf("hello"), 0, "types array should be correct")
  assert.strictEqual(tree.getNode("hello").getTail(), "world", "Properties should be accessible")
  assert.strictEqual(typeof tree.getNode("hello").getTail(), "string", "Leafs should be strings")

  // Act
  tree.touchNode("foo").setTail("bar")

  // Assert
  assert.strictEqual(tree.getNode("foo").getTail(), "bar", "Trees should be modifiable")

  // Arrange
  const tree2 = new TreeNode("foobar\n one 1")

  // Assert
  assert.strictEqual(tree2.getNode("foobar").getTail(), undefined, "Value should be empty")
  assert.strictEqual(tree2.getNode("foobar").getNode("one").getTail(), "1", "Value should be 1")

  assert.strictEqual(typeof tree2.getNode("foobar"), "object", "Trees should be objects")
  assert.ok(tree2.getNode("foobar") instanceof TreeNode, "Nested trees should be trees")

  // Arrange
  const tree3 = new TreeNode("list\nsingle value")

  // Assert
  assert.strictEqual(tree3.length, 2, "TreeNode should have 2 names")
  assert.strictEqual(tree3.getNode("list").length, 0, "A name without a trailing tree should be length 0")

  // Arrange
  const tree4 = new TreeNode("body")

  // Assert
  assert.strictEqual(tree4.getNode("body").length, 0, "A name without a trailing tree should be a tree")

  // Arrange
  const tree5 = new TreeNode({
    foobar: "hello"
  })

  // Assert
  assert.strictEqual(tree5.getNode("foobar").getTail(), "hello", "Trees can be created from object literals")

  // Arrange
  const tree6 = new TreeNode({
    foobar: new TreeNode("hello world")
  })

  // Assert
  assert.strictEqual(
    tree6.getNode("foobar hello").getTail(),
    "world",
    "Trees can be created from objects mixed with trees"
  )

  // Arrange
  const tree7 = new TreeNode({
    foobar: {
      hello: {
        world: "success"
      }
    }
  })

  // Assert
  assert.strictEqual(tree7.getNode("foobar hello world").getTail(), "success", "Trees can be created from deep objects")

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
  assert.strictEqual(
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
  assert.strictEqual(tree10.toString(), expectedStr)

  // Arrange
  const node = new TreeNode(" ").nodeAt(0)

  // Act/Assert
  assert.strictEqual(node.getHead(), "")
  assert.strictEqual(node.getTail(), "")

  // Arrange
  let s = `
 
 
 `
  // Act/Assert
  assert.strictEqual(new TreeNode(s).nodeAt(0).length, 3)

  // Arrange
  s = `
  
 `
  // Act/Assert
  assert.strictEqual(new TreeNode(s).nodeAt(0).length, 2)
}

testTree.ambiguityFixWhenAssignmentAndEdgeCharsMatch = assert => {
  // Arrange
  let test = `
 :
 :`
  // Act/Assert
  class TestTree extends TreeNode {
    getWordDelimiter() {
      return ":"
    }

    _parseNode(node) {
      return new TestTree(node.childrenToString(), node.getLine())
    }
  }

  assert.strictEqual(new TestTree(test).nodeAt(0).length, 2)

  const rootTree = new TestTree()
  const tree = rootTree.append("", new TestTree())
  tree.append("")
  tree.append("")
  const newTree = new TestTree(rootTree.toString())
  assert.strictEqual(newTree.nodeAt(0).length, 2)
}

testTree.append = assert => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Act
  tree.append("foo bar")
  tree.touchNode("foo2").setTail("bar")

  // Assert
  assert.strictEqual(tree.getNode("foo").getTail(), "bar")

  // Act
  tree.append("foo two")

  // Assert
  assert.strictEqual(tree.length, 4)
}

testTree.at = assert => {
  // Arrange
  const value = new TreeNode("hello world\nhow are you\nhola friend")

  // Assert
  assert.strictEqual(value.nodeAt(0).getTail(), "world")
  assert.strictEqual(value.nodeAt(1).getTail(), "are you")
  assert.strictEqual(value.nodeAt(2).getTail(), "friend")
  assert.strictEqual(value.nodeAt(3), undefined)
  assert.strictEqual(value.nodeAt(-1).getTail(), "friend")
}

testTree.clone = assert => {
  // Arrange/Act
  const a = new TreeNode("hello world")
  const b = a.clone()

  // Assert
  assert.strictEqual(b.getNode("hello").getTail(), "world")
  assert.strictEqual(a.toString(), b.toString(), "string unchanged")

  // Act
  b.touchNode("hello").setTail("mom")

  // Assert
  assert.strictEqual(a.getNode("hello").getTail(), "world")

  // Arrange
  const c = a

  // Assert
  assert.strictEqual(c.getNode("hello").getTail(), "world")

  // Act
  c.touchNode("hello").setTail("foo")

  // Assert
  assert.strictEqual(a.getNode("hello").getTail(), "foo")

  // Arrange
  const d = c

  // Assert
  assert.strictEqual(d.getNode("hello").getTail(), "foo", "foo should be value")

  // Act
  d.touchNode("hello").setTail("hiya")

  // Assert
  assert.strictEqual(a.getNode("hello").getTail(), "hiya", "original unchanged")

  // Act
  a.touchNode("test").setTail("boom")

  // Assert
  assert.strictEqual(d.getNode("test").getTail(), "boom")

  // Act
  a.touchNode("foobar").setChildren(new TreeNode("123 456"))

  // Assert
  assert.strictEqual(c.getNode("foobar 123").getTail(), "456", "expected 456")

  // Arrange
  const e = a

  // Assert
  assert.strictEqual(e.getNode("foobar 123").getTail(), "456")

  // Arrange
  const f = a.clone()

  // Assert
  assert.strictEqual(f.getNode("foobar 123").getTail(), "456")

  // Act
  f.hi = "test"

  // Assert
  assert.strictEqual(a.hi, undefined)
}

testTree.concat = assert => {
  // Arrange
  const a = new TreeNode("hello world")
  const b = new TreeNode("hi mom")

  // Act
  const newNodes = a.concat(b)

  // Assert
  assert.strictEqual(a.getNode("hi").getTail(), "mom")
  assert.strictEqual(newNodes.length, 1)
}

testTree.delete = assert => {
  // Arrange
  const tree = new TreeNode()
  tree.touchNode("name").setTail("Breck")

  // Assert
  assert.strictEqual(tree.getNode("name").getTail(), "Breck", "name is set")
  assert.strictEqual(tree.length, 1, "length okay")

  // Act
  tree.delete("name")

  // Assert
  assert.strictEqual(tree.getNode("name"), undefined, "name is gone")
  assert.strictEqual(tree.length, 0, "length okay")

  // Act
  tree.touchNode("name").setTail("Breck")
  tree.touchNode("age").setTail("100")
  tree.touchNode("table").setTail("true")
  tree.delete("age")

  // Assert
  assert.strictEqual(tree.getNode("age"), undefined, "age is gone")
  assert.strictEqual(tree.length, 2, "expected 2 elements remaining")

  // Test deep delete
  // Arrange
  const tree2 = new TreeNode()
  tree2.touchNode("earth north_america united_states california san_francisco").setTail("mission")

  // Assert
  assert.ok(tree2.getNode("earth north_america united_states california") instanceof TreeNode, "node exists")
  assert.strictEqual(
    tree2.getNode("earth north_america united_states california san_francisco").getTail(),
    "mission",
    "neighborhood is set"
  )
  assert.strictEqual(tree2.getNode("earth north_america united_states california").length, 1, "length okay")
  assert.strictEqual(tree2.length, 1, "length okay")

  // Act
  const deleteResult = tree2.delete("earth north_america united_states california san_francisco")

  // Assert
  assert.ok(deleteResult instanceof TreeNode, "returns tree")
  assert.strictEqual(
    tree2.getNode("earth north_america united_states california san_francisco"),
    undefined,
    "neighborhood is gone"
  )

  // Test deleting a non-existant property
  // Arrange
  const tree3 = new TreeNode("property meta\n")

  // Act
  tree3.delete("content")

  // Assert
  assert.strictEqual(tree3.getNode("property").getTail(), "meta", "delete a non existing entry works")

  // Delete a property that has multiple matches
  // Arrange
  const tree4 = new TreeNode("time 123\ntime 456")

  // Assert
  assert.strictEqual(tree4.length, 2)

  // Act
  tree4.delete("time")

  // Assert
  assert.strictEqual(tree4.length, 0)

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
  assert.strictEqual(
    tree6.toString(),
    `presidents President
other`
  )
}

testTree.deleteRegression = assert => {
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
  assert.strictEqual(result.findNodes("row").length, 0)
}

testTree.destroy = assert => {
  const template = `hey ho
hi
 hello world
yo hey`
  // Arrange
  const tree = new TreeNode(template)

  // Act
  tree.nodeAt(1).destroy()

  // Assert
  assert.strictEqual(tree.toString(), "hey ho\nyo hey")
}

testTree.duplicateProperties = assert => {
  // Arrange
  const tree = new TreeNode("time 123\ntime 456")

  // Assert
  assert.strictEqual(tree.length, 2)
  assert.strictEqual(tree.toString(), "time 123\ntime 456")
}

testTree.duplicate = assert => {
  // Arrange
  const tree = new TreeNode(testStrings.fromXmlTree)
  const lineCount = tree.toString().split(/\n/).length
  const node = tree.getNode("html")

  // Act
  node.duplicate()

  // Assert
  assert.strictEqual(tree.toString().split(/\n/).length, lineCount * 2)
}

testTree.forEach = assert => {
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
  assert.strictEqual(value.length, 2, "test chaining")
  assert.strictEqual(result, "HELLOWORLD2HIMOM2")

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
  assert.strictEqual(count, 1)

  // Arrange
  const tree = new TreeNode("hello world\nhi world")
  var i = 0

  // Act
  tree.getChildren().forEach((node, index) => {
    i = i + index
  })

  // Assert
  assert.strictEqual(i, 1, "index worked")
}

testTree.extend = assert => {
  // Arrange
  const sourceStr = `name Jane
color blue`
  const destinationStr = `username jane`
  const source = new TreeNode(sourceStr)
  const destination = new TreeNode(destinationStr)
  // Act
  destination.extend(source)
  // Assert
  assert.strictEqual(destination.toString(), [destinationStr, sourceStr].join("\n"))

  // Test deep
  const original = { person: "Abe", age: "24", items: { car: "blue" } }
  const extension = { person: "Joe", weight: 100, items: { car: "red", foo: "bar" } }

  // Act
  const tree = new TreeNode(original).extend(extension)
  const result = tree.toObject()

  // Assert
  assert.strictEqual(result.person, "Joe")
  assert.strictEqual(result.age, "24")
  assert.strictEqual(result.weight, "100")
  assert.strictEqual(result.items.car, "red", "expected deep to work")
  assert.strictEqual(result.items.foo, "bar")
  assert.strictEqual(tree.getNode("items").length, 2)
}

testTree.every = assert => {
  // Arrange
  const tree = new TreeNode(testStrings.fromXmlTree)
  let count = 0
  // Act
  tree.every(node => count++)
  // Assert
  assert.strictEqual(count, 11)
}

testTree.first = assert => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  assert.strictEqual(value.nodeAt(0).getTail(), "world")

  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")

  // Assert
  assert.strictEqual(value2.nodeAt(0).toString(), "hello world")
}

testTree.firstProperty = assert => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  assert.strictEqual(value.nodeAt(0).getHead(), "hello")
}

testTree.firstValue = assert => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")

  // Assert
  assert.strictEqual(value.nodeAt(0).getTail(), "world")
}

testTree.format = assert => {
  // Arrange
  const str = "Hi {firstName} {lastName}! I hope you are enjoying the weather in {address city}!"
  const person = new TreeNode("firstName Tom\nlastName B\naddress\n city Boston")

  // Act
  const result = person.format(str)

  // Assert
  assert.strictEqual(result, "Hi Tom B! I hope you are enjoying the weather in Boston!")
}

testTree.fromCsv = assert => {
  // Arrange/Act
  const tree = TreeNode.fromCsv(testStrings.csv)
  const withQuotes = TreeNode.fromCsv('"Date","Age"\n"123","345"')

  // Assert
  assert.strictEqual(tree.toString(), testStrings.delimited)
  assert.strictEqual(tree.length, 2, "expected 2 rows")
  assert.strictEqual(tree.toCsv(), testStrings.csv, "Expected toCsv to output same data as fromCsv")

  // Arrange
  const tree2 = TreeNode.fromCsv("Age,Birth Place,Country\n12,Brockton,USA")

  // Assert
  assert.strictEqual(tree2.length, 1)
  assert.strictEqual(tree2.nodeAt(0).getNode("Country").getTail(), "USA")

  // Arrange
  const tree3 = TreeNode.fromCsv("")

  // Assert
  assert.strictEqual(tree3.toString(), "", "Expected empty string to be handled correctly")

  // Assert
  assert.strictEqual(withQuotes.getNode("0 Date").getTail(), "123", "Expected quotes to be handled properly")

  // Arrange
  const tree4 = TreeNode.fromCsv('height\n"32,323"')

  // Assert
  assert.strictEqual(tree4.getNode("0 height").getTail(), "32,323")

  // Test quote escaping
  // Arrange
  const csvWithQuotes = 'name,favoriteChar\nbob,"""."'

  // Act
  const tree5 = TreeNode.fromCsv(csvWithQuotes)

  // Assert
  assert.strictEqual(
    tree5.toString(),
    '0\n name bob\n favoriteChar ".',
    "Four double quotes should return one double quote"
  )

  // Test \r characters
  // Arrange
  const csv = "name,age\r\njoe,21\r\nbill,32\r\n"

  // Act
  const testCase = TreeNode.fromCsv(csv.replace(/\r/g, ""))

  // Assert
  assert.strictEqual(testCase.getNode("1 age").getTail(), "32", "Expected return chars to be removed")

  // Act
  testCase.getNode("1").delete("name")

  // Assert
  assert.strictEqual(
    testCase.getNode("0").childrenToString(),
    "name joe\nage 21",
    "property change should not affect other objects"
  )
  assert.strictEqual(testCase.getNode("1 name"), undefined, "property should be gone")
}

testTree.fromCsvNoHeaders = assert => {
  // Arrange
  const a = TreeNode.fromCsv(testStrings.csvNoHeaders, false)

  // Assert
  assert.strictEqual(a.length, 3)
  assert.strictEqual(a.getNode("1 2").getTail(), "blue")
}

testTree.fromDelimited = assert => {
  // Arrange
  const a = TreeNode.fromDelimited(testStrings.fromDelimited, "^", undefined, "~")

  // Assert
  assert.strictEqual(a.length, 2)
  assert.strictEqual(a.getNode("0 weight").getTail(), "2.2")
  assert.strictEqual(a.getNode("1 foodName").getTail(), "Banana")

  // Arrange
  const b = TreeNode.fromDelimited(
    `name,score

joe,23`
  )

  // Assert
}

testTree.fromSsv = assert => {
  // Arrange/Act
  const a = TreeNode.fromSsv(testStrings.ssv)

  // Assert
  assert.strictEqual(a.toString(), testStrings.delimited)
  assert.strictEqual(a.toSsv(), testStrings.ssv, "toSsv ok")

  // Arrange/Act
  const fixedCol = TreeNode.fromSsv(testStrings.ssvFixedColumns)

  // Assert
  assert.strictEqual(fixedCol.nodeAt(0).getNode("comment").getTail(), testStrings.ssvFixedColumnComment1)
  assert.strictEqual(fixedCol.nodeAt(1).getNode("comment").getTail(), testStrings.ssvFixedColumnComment2)
  assert.strictEqual(fixedCol.nodeAt(1).length, 2)

  // Arrange/Act
  const missingCols = TreeNode.fromSsv(testStrings.ssvMissingColumns)

  // Assert
  assert.strictEqual(missingCols.nodeAt(0).length, 3)
  assert.strictEqual(missingCols.nodeAt(1).length, 3)
  assert.strictEqual(missingCols.nodeAt(2).length, 3)
}

testTree.fromTsv = assert => {
  // Arrange/Act
  const a = TreeNode.fromTsv(testStrings.tsv)

  // Assert
  assert.strictEqual(a.toString(), testStrings.delimited, "From TSV worked")
  assert.strictEqual(a.toTsv(), testStrings.tsv, "ToTsv Worked")

  // Test simple path
  // Act
  const b = TreeNode.fromTsv("color\tage\theight\nred\t2\t23")

  // Assert
  assert.strictEqual(b.getNode("0 age").getTail(), "2")
  assert.strictEqual(b.getNode("0 height").getTail(), "23")
}

testTree.getLine = assert => {
  // Arrange
  const tree = new TreeNode("hello world")
  const node = tree.getNode("hello")

  // Assert
  assert.strictEqual(node.getLine(), "hello world")

  // Act
  node.setLine("hi earth")

  // Assert
  assert.strictEqual(tree.toString(), "hi earth")
}

testTree.getTail = assert => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  assert.strictEqual(tree.getNode("hello").getTail(), "world")

  // Act
  // Test get with ints
  tree.touchNode("2").setTail("hi")

  // Assert
  assert.strictEqual(tree.getNode("2").getTail(), "hi", "Expected int strings to work.")

  // Assert
  // Test get with invalid values
  assert.strictEqual(new TreeNode().getNode("some"), undefined, "expected undefined")
  assert.strictEqual(new TreeNode().getNode("some long path"), undefined)
  assert.strictEqual(tree.getNode(""), undefined)

  // Test get with duplicate properties
  // Arrange
  const tree2 = new TreeNode("height 45px\nheight 50px\nwidth 56px")

  // Assert
  assert.strictEqual(tree2.length, 3)

  // Act/Assert
  // When getting a duplicate property last item should win
  assert.strictEqual(
    tree2.getNode("height").getTail(),
    "50px",
    "Expected to get last value in instance with duplicate property."
  )

  // todo: remove ability of get to take non-strings
  // Arrange
  const treeWithNumbers = new TreeNode("1 bob\n0 brenda")

  // Act/Assert
  assert.strictEqual(treeWithNumbers.getNode("0").getTail(), "brenda")
  assert.strictEqual(treeWithNumbers.getNode("1").getTail(), "bob")
}

testTree.getLines = assert => {
  // Arrange
  const value = new TreeNode("hello\n world")

  // Assert
  assert.strictEqual(value.getLines().join("").indexOf(" "), -1)
}

testTree.getNodes = assert => {
  // Arrange
  const value = new TreeNode("hello world\nhello world")
  var each = ""

  // Assert
  assert.strictEqual(value.findNodes("hello").length, 2)

  // Act
  const result = value.findNodes("hello").map(node => node.getTail()).join("")

  // Assert
  assert.strictEqual(result, "worldworld")
}

testTree.getTails = assert => {
  // Arrange
  const html = new TreeNode("h1 hello world\nh1 hello world")

  // Assert
  assert.strictEqual(html.getTails().join("\n"), "hello world\nhello world")
}

testTree.multiply = assert => {
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

    _parseNode(node) {
      return new MathNode(node.childrenToString(), node.getLine())
    }
  }

  // Arrange
  const two = new MathNode(`o`)
  const three = new MathNode(`oo`)

  // Act/Assert
  const result = MathNode.multiply(two, three)

  assert.strictEqual(
    result.toString(),
    "o-o-o-oo-o-o-",
    "multipling empty structures (in this case 1D primes) works as expected"
  )

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

  assert.strictEqual(TreeNode.multiply(five, four).toString(), twenty, "multiplying visible nodes works as expected")
}

testTree.getExpectingABranchButHittingALeaf = assert => {
  // Arrange
  const value = new TreeNode("posts leaf")

  // Assert
  assert.strictEqual(value.getNode("posts branch"), undefined)
}

testTree.getIndex = assert => {
  // Arrange
  const tree = new TreeNode("r1\n name bob\nr2\n name joe")
  const child0 = tree.getNode("r1")
  const child1 = tree.getNode("r2")

  // Act/Assert
  assert.strictEqual(child0.getIndex(), 0, "Has correct index")
  assert.strictEqual(child1.getIndex(), 1, "Has correct index")
}

testTree.getPathName = assert => {
  // Arrange
  const tree = new TreeNode(testStrings.every)
  const parent = tree.getNode("domains test.test.com pages home settings")
  const child = tree.getNode("domains test.test.com pages home settings data")
  const simple = new TreeNode("foo bar")

  // Assert
  assert.strictEqual(child.getPathName(), "domains test.test.com pages home settings data")
  assert.strictEqual(child.getParent(), parent)
  assert.strictEqual(child.getRootNode(), tree)
  assert.strictEqual(child.getAncestorNodes().length, 6)
  assert.strictEqual(simple.getNode("foo").getAncestorNodes().length, 1)
}

testTree.getPathVector = assert => {
  // Arrange
  const tree = new TreeNode(testStrings.every)
  const indexPath = [5, 0, 4, 0, 0]
  const namePath = "domains test.test.com pages home settings"
  const parent = tree.getNode(namePath)
  const child = tree.getNode("domains test.test.com pages home settings data")

  // Assert
  assert.strictEqual(parent.getPathVector().join(" "), indexPath.join(" "))
  assert.strictEqual(child.getPathVector().join(" "), "5 0 4 0 0 0")
  assert.strictEqual(tree.nodeAt(parent.getPathVector()), parent)
  assert.strictEqual(tree.nodeAt(child.getPathVector()), child)

  // Act
  const newNamePath = tree.pathVectorToPathName([5, 0, 4, 0, 0])

  // Assert
  assert.strictEqual(newNamePath.join(" "), namePath)
}

testTree.has = assert => {
  // Arrange
  const tree = new TreeNode("hello world\nnested\nfoo ")

  // Assert
  assert.strictEqual(tree.has("hello"), true)
  assert.strictEqual(tree.has("world"), false)
  assert.strictEqual(tree.has("foo"), true)
  assert.strictEqual(tree.has("nested"), true)
}

testTree.htmlDsl = assert => {
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
  assert.strictEqual(page, "<h1>hello world</h1><h1>hello world</h1>")
}

testTree.indexOf = assert => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  assert.strictEqual(tree.indexOf("hello"), 0)
  assert.strictEqual(tree.indexOf("hello2"), -1)

  // Act
  tree.touchNode("color").setTail("")

  // Assert
  assert.strictEqual(tree.indexOf("color"), 1)

  // Act
  tree.append("hello world")

  // Assert
  assert.strictEqual(tree.indexOf("hello"), 0)
  assert.strictEqual(tree.indexOfLast("hello"), 2)
}

testTree.insert = assert => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Act
  tree.insert("hi mom", undefined, 0)

  // Assert
  assert.strictEqual(tree.indexOf("hi"), 0, "Expected hi at position 0")

  // Insert using an index longer than the current object
  // Act
  tree.insert("test dad", undefined, 10)

  // Assert
  assert.strictEqual(tree.nodeAt(2).getTail(), "dad", "Expected insert at int greater than length to append")
  assert.strictEqual(tree.length, 3)

  // Insert using a negative index
  // Act
  tree.insert("test2 sister", undefined, -1)

  // Assert
  assert.strictEqual(tree.nodeAt(2).getTail(), "sister")
  assert.strictEqual(tree.nodeAt(3).getTail(), "dad")
}

testTree.last = assert => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  assert.strictEqual(value.nodeAt(-1).getTail(), "mom")

  // Arrange
  const value2 = new TreeNode("hello world\nhi mom")
  // Assert
  assert.strictEqual(value2.nodeAt(-1).toString(), "hi mom")
}

testTree.lastProperty = assert => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  assert.strictEqual(value.nodeAt(-1).getHead(), "hi")
}

testTree.lastValue = assert => {
  // Arrange
  const value = new TreeNode("hello world\nhi mom")
  // Assert
  assert.strictEqual(value.nodeAt(-1).getTail(), "mom")
}

testTree.loadFromArray = assert => {
  // Arrange
  const a = new TreeNode([1, 2, 3])
  // Assert
  assert.strictEqual(a.toString(), "0 1\n1 2\n2 3")

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
  assert.strictEqual(b.toString(), "data\n 0\n  charge 1\n 1\n  charge 2")
}

testTree.loadFromObject = assert => {
  // Arrange
  const tree = new TreeNode(testStrings.json)
  const date = new Date()
  const time = date.getTime()
  const treeWithDate = new TreeNode({ name: "John", date: date })

  // Assert
  assert.strictEqual(tree.getNode("lowestScore").getTail(), "-10")
  assert.strictEqual(treeWithDate.getNode("date").getTail(), time.toString())

  // Test against object with circular references
  // Arrange
  const a = { foo: "1" }
  const b = { bar: "2", ref: a }

  // Act
  // Create circular reference
  a.c = b
  const tree2 = new TreeNode(a)

  // Assert
  assert.strictEqual(tree2.getNode("c bar").getTail(), "2", "expected 2")
  assert.strictEqual(tree2.getNode("c ref"), undefined)

  // Arrange
  const tree3 = new TreeNode()
  tree3.touchNode("docs").setChildren(testStrings.json2)

  // Assert
  assert.strictEqual(tree3.toString(), testStrings.json2tree, "expected json2tree")

  // Arrange
  const test4 = new TreeNode({ score: undefined })

  // Assert
  assert.strictEqual(test4.toString(), "score", "expected blank")
}

testTree.loadFromTree = assert => {
  // Arrange
  const a = new TreeNode("foo\n bar bam")
  const b = new TreeNode(a)

  // Assert
  assert.strictEqual(a.getNode("foo bar").getTail(), "bam")
  assert.strictEqual(b.getNode("foo bar").getTail(), "bam")

  // Act
  a.touchNode("foo bar").setTail("wham")

  // Assert
  assert.strictEqual(a.getNode("foo bar").getTail(), "wham")
  assert.strictEqual(b.getNode("foo bar").getTail(), "bam")
}

testTree.loadFromString = assert => {
  // Arrange/Act
  const startsWithSpace = new TreeNode(" name john")

  // Assert
  assert.strictEqual(startsWithSpace.length, 1, "Expected 1 node")

  // Arrange
  const a = new TreeNode("text \n this is a string\n and more")

  // Assert
  assert.strictEqual(a.getNode("text").getTailWithChildren(), "\nthis is a string\nand more", "Basic")

  // Arrange
  const b = new TreeNode("a\n text \n  this is a string\n  and more")

  // Assert
  assert.strictEqual(b.getNode("a text").getTailWithChildren(), "\nthis is a string\nand more")
  assert.strictEqual(b.toString(), "a\n text \n  this is a string\n  and more")

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
  assert.strictEqual(c.getNode("children 1 children 1 age").getTail(), "12")
  assert.strictEqual(c.toString().length, string.length)
  assert.strictEqual(c.toString(), string)

  // Arrange
  const d = new TreeNode("\n\na b\n")

  // Assert
  assert.strictEqual(d.toString(), "\n\na b\n", "Expected extra newlines at start of string to be preserved")

  // Arrange
  const e = new TreeNode("a b\n\nb c\n")
  // Assert
  assert.strictEqual(e.toString(), "a b\n\nb c\n", "Expected extra newlines in middle of string to be preserved")

  // Arrange
  const f = new TreeNode("a b\n\n\n")
  // Assert
  assert.strictEqual(f.toString(), "a b\n\n\n", "Expected extra newlines at end of string to be preserved")

  // Arrange
  const g = new TreeNode("hi\n     somewhat invalid")
  // Assert
  assert.strictEqual(g.getNode("hi ").getTail(), "   somewhat invalid")

  const testCase = new TreeNode(testStrings.newLines)
  assert.strictEqual(testCase.toString().split("\n").length, 11, "All blank lines are preserved")
}

testTree.loadFromStringExtraTrees = assert => {
  // Arrange
  const d = new TreeNode("one\ntwo\n  three\n    four\nfive six")
  // Assert
  assert.strictEqual(d.length, 3)
}

testTree.moveNode = assert => {
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
  const node = value.getChildren()[1].moveTo(node0)

  // Assert
  assert.strictEqual(value.toString(), expected)

  // Act
  node.moveTo(node0, 0)

  // Assert
  assert.strictEqual(value.toString(), expected2)
}

testTree.moveToReg = assert => {
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
        toMove.forEach(prop => prop.moveTo(node, 0))
      }
      node.delete("class")
      node.delete("css")
      node.getChildren().forEach(migrateNode)
    }
  }

  // Act
  tree.getChildren().forEach(migrateNode)

  // Assert
  assert.strictEqual(tree.toString(), expected)
}

testTree.multiline = assert => {
  // Arrange
  const a = new TreeNode("my multiline\n string")
  // Assert
  assert.strictEqual(a.getNode("my").getTailWithChildren(), "multiline\nstring")

  // Arrange
  const a2 = new TreeNode("my \n \n multiline\n string")
  // Assert
  assert.strictEqual(a2.getNode("my").getTailWithChildren(), "\n\nmultiline\nstring")

  // Arrange
  const b = new TreeNode("brave new\n world")
  // Assert
  assert.strictEqual(b.getNode("brave").getTailWithChildren(), "new\nworld", "ml value correct")
  assert.strictEqual(b.toString(), "brave new\n world", "multiline does not begin with nl")

  // Arrange
  const c = new TreeNode("brave \n new\n world")
  // Assert
  assert.strictEqual(c.getNode("brave").getTailWithChildren(), "\nnew\nworld", "ml begin with nl value correct")
  assert.strictEqual(c.toString(), "brave \n new\n world", "multiline begins with nl")

  // Arrange
  const d = new TreeNode("brave \n \n new\n world")
  // Assert
  assert.strictEqual(d.getNode("brave").getTailWithChildren(), "\n\nnew\nworld", "ml begin with 2 nl value correct")
  assert.strictEqual(d.toString(), "brave \n \n new\n world", "multiline begins with 2 nl")

  // Arrange
  const e = new TreeNode("brave new\n world\n ")
  // Assert
  assert.strictEqual(e.getNode("brave").getTailWithChildren(), "new\nworld\n", "ml value end with nl correct")
  assert.strictEqual(e.toString(), "brave new\n world\n ", "multiline ends with a nl")

  // Arrange
  const f = new TreeNode("brave new\n world\n \n ")
  // Assert
  assert.strictEqual(f.getNode("brave").getTailWithChildren(), "new\nworld\n\n", "ml value end with 2 nl correct")
  assert.strictEqual(f.toString(), "brave new\n world\n \n ", "multiline ends with 2 nl")

  // Arrange
  const g = new TreeNode()
  g.touchNode("brave").setTailWithChildren("\nnew\nworld\n\n")
  // Assert
  assert.strictEqual(g.getNode("brave").getTailWithChildren(), "\nnew\nworld\n\n", "set ml works")
  assert.strictEqual(g.toString(), "brave \n new\n world\n \n ", "set ml works")

  // Arrange/Act
  const twoNodes = new TreeNode("title Untitled\n")
  const k = new TreeNode()
  k.touchNode("time").setTail("123")
  k.touchNode("settings").setTailWithChildren(twoNodes.toString())
  k.touchNode("day").setTail("1")

  // Assert
  assert.strictEqual(twoNodes.length, 2)
  assert.strictEqual(k.getNode("settings").length, 1, "Expected subtree to have 1 empty node")
  assert.strictEqual(
    k.getNode("settings").getTailWithChildren(),
    twoNodes.toString(),
    "Expected setTailWithChildren and getText to work with newlines"
  )
  assert.strictEqual(k.toString(), `time 123\nsettings title Untitled\n \nday 1`)

  // Arrange
  const someText = new TreeNode("a")
  const someNode = someText.getNode("a")

  // Act
  someNode.setTailWithChildren("const b = 1;\nconst c = 2;")

  // Assert
  assert.strictEqual(someText.toString(), "a const b = 1;\n const c = 2;")
}

testTree.order = assert => {
  // Arrange
  const a = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10")
  const types = a.getHeads().join(" ")

  // Assert
  assert.strictEqual(types, "john susy bob", "order is preserved")
}

testTree.prepend = assert => {
  // Arrange
  const a = new TreeNode("hello world")
  // Assert
  assert.strictEqual(a.toString(), "hello world")

  // Act
  const result = a.prepend("foo bar")
  // Assert
  assert.strictEqual(a.toString(), "foo bar\nhello world")
  assert.ok(result instanceof TreeNode)
}

testTree.pushTailAndTree = assert => {
  // Arrange
  const a = new TreeNode()

  // Act
  const result = a.pushTailAndTree("hello world")

  // Assert
  assert.strictEqual(a.getNode("0").getTail(), "hello world")
  assert.ok(result instanceof TreeNode)

  // Act
  a.pushTailAndTree(undefined, new TreeNode())

  // Assert
  assert.ok(a.getNode("1") instanceof TreeNode, "1 is instance of TreeNode")
}

testTree.reload = assert => {
  // Arrange
  const a = new TreeNode("john\n age 5\nsusy\n age 6")

  // Act
  assert.ok(a.reload())

  // Assert
  assert.strictEqual(a.length, 0, "empty reload cleared object")

  // Act
  a.reload("john 1")
  a.reload("john 2")

  // Assert
  assert.strictEqual(a.length, 1)
  assert.strictEqual(a.getNode("john").getTail(), "2")
}

testTree.remap = assert => {
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
  assert.strictEqual(test, expected.toString())
}

testTree.rename = assert => {
  // Arrange
  const a = new TreeNode("john\n age 5\nsusy\n age 6\ncandy bar\nx 123\ny 45\n")
  const originalLength = a.length
  const originalString = a.toString()
  const index = a.indexOf("john")

  // Assert
  assert.strictEqual(index, 0, "index okay")

  // Act
  assert.ok(a.rename("john", "breck") instanceof TreeNode, "returns itself for chaining")
  a.rename("candy", "ice")

  // Assert
  const index2 = a.indexOf("breck")
  assert.strictEqual(index2, 0, "index okay")
  assert.strictEqual(a.getNode("breck age").getTail(), "5", "value okay")

  // Act
  a.rename("breck", "john")
  a.rename("ice", "candy")

  // Assert
  assert.strictEqual(a.length, originalLength, "Length unchanged")
  assert.strictEqual(a.toString(), originalString, "String unchanged")

  // Arrange
  const b = new TreeNode(testStrings.renameTest)
  const originalString2 = b.toString()

  // Act
  b.rename("dimensions", "columns")

  // Assert
  assert.strictEqual(b.toString(), originalString2)

  // Arrange
  const c = new TreeNode("a\na\n")

  // Act
  c.rename("a", "b")
  c.rename("a", "b")

  // Assert
  assert.strictEqual(c.toString(), "b\nb\n")
  assert.strictEqual(c.has("a"), false)
}

testTree.renameAll = assert => {
  // Arrange
  const a = new TreeNode("hello world\nhello world")

  // Act
  a.renameAll("hello", "hey")

  // Assert
  assert.strictEqual(a.toString(), "hey world\nhey world")
  assert.strictEqual(a.has("hello"), false)
}

testTree.reorder = assert => {
  // Arrange
  const a = new TreeNode("hello world")

  // Act
  a.touchNode("hi").setTail("mom")

  // Assert
  assert.strictEqual(a.getHeads().join(" "), "hello hi", "order correct")

  // Act
  a.insert("yo pal", undefined, 0)

  // Assert
  assert.strictEqual(a.getHeads().join(" "), "yo hello hi", "order correct")

  // Act
  const result = a.insert("hola pal", undefined, 2)
  assert.ok(result instanceof TreeNode)

  // Assert
  assert.strictEqual(a.getHeads().join(" "), "yo hello hola hi", "order correct")
}

testTree.reverse = assert => {
  // Arrange
  const tree = new TreeNode("hi mom\nhey sis\nhey dad")

  // Assert
  assert.strictEqual(tree.getNode("hey").getTail(), "dad")

  // Act
  tree.reverse()

  // Assert
  assert.strictEqual(tree.toString(), "hey dad\nhey sis\nhi mom")
  assert.strictEqual(tree.getNode("hey").getTail(), "sis")

  // Test reverse when using internal types

  // Arrange
  const tree2 = TreeNode.fromCsv("name,age\nbill,20\nmike,40\ntim,30")

  // Act
  tree2.nodeAt(0).reverse()

  // Assert
  assert.strictEqual(tree2.nodeAt(0).nodeAt(0).getHead(), "age", "Expected reversed properties")
  assert.strictEqual(tree2.nodeAt(1).nodeAt(0).getHead(), "name", "Expected unchanged properties")
}

testTree.set = assert => {
  // Arrange
  const tree = new TreeNode("hello world")

  // Assert
  assert.strictEqual(tree.getNode("hello").getTail(), "world")
  assert.ok(tree.touchNode("hello").setTail("mom") instanceof TreeNode, "set should return instance so we can chain it")
  assert.strictEqual(tree.getNode("hello").getTail(), "mom")

  // Act
  tree.touchNode("boom").setTail("")
  // Assert
  assert.strictEqual(tree.getNode("boom").getTail(), "", "empty string")

  // Act
  tree.touchNode("head style color").setTail("blue")
  // Assert
  assert.strictEqual(tree.getNode("head style color").getTail(), "blue", "set should have worked")

  // Test dupes
  // Arrange
  tree.append("hello bob")

  // Act
  tree.touchNode("hello").setTail("tim")

  // Assert
  assert.strictEqual(tree.getNode("hello").getTail(), "tim", "Expected set to change last occurrence of property.")

  // TEST INT SCENARIOS
  // Arrange
  const tree2 = new TreeNode()

  // Act
  tree2.touchNode("2").setTail("hi")
  tree2.touchNode("3").setTail(3)
  // Assert
  assert.strictEqual(tree2.getNode("2").getTail(), "hi")
  assert.strictEqual(tree2.getNode("2").getTail(), "hi")
  assert.strictEqual(tree2.getNode("3").getTail(), "3")

  // TEST SPACEPATH SCENARIOS
  // Arrange
  const tree3 = new TreeNode("style\n")
  // Act
  tree3.touchNode("style color").setTail("red")
  tree3.touchNode("style width").setTail("100")

  // Assert
  assert.strictEqual(tree3.getNode("style color").getTail(), "red")
  assert.strictEqual(tree3.getNode("style width").getTail(), "100")

  // TEST ORDERING
  // Arrange
  const tree4 = new TreeNode("hello world")
  // Act
  tree4.touchNode("hi").setTail("mom")
  // Assert
  assert.strictEqual(tree4.getHeads().join(" "), "hello hi", "order correct")

  // Act
  tree4.insert("yo pal", undefined, 0)
  // Assert
  assert.strictEqual(tree4.getHeads().join(" "), "yo hello hi", "order correct")

  // Act
  tree4.insert("hola pal", undefined, 2)
  // Assert
  assert.strictEqual(tree4.getHeads().join(" "), "yo hello hola hi", "order correct")

  // Arrange
  const tree5 = new TreeNode()
  // Act
  tree5.touchNode("hi").setTail("hello world")
  tree5.touchNode("yo").setChildren(new TreeNode("hello world"))
  // Assert
  assert.notEqual(tree5.getNode("hi").getTail(), tree5.getNode("yo").getTail())

  // Arrange
  const tree6 = new TreeNode()

  // Act
  tree6.touchNode("meta x").setTail(123)
  tree6.touchNode("meta y").setTail(1235)
  tree6.touchNode("meta c").setTail(435)
  tree6.touchNode("meta x").setTail(1235123)

  // Assert
  assert.strictEqual(tree6.getNode("meta c").getTail(), "435")

  // Arrange
  const tree7 = new TreeNode("name John\nage\nfavoriteColors\n blue\n  blue1 1\n  blue2 2\n green\n red 1\n")

  // Act
  tree7.touchNode("favoriteColors blue").setTail("purple").toString()

  // Assert
  assert.strictEqual(tree7.getNode("favoriteColors blue").getTail(), "purple")

  // Act
  tree7.touchNode(" blanks").setTail("test")
  tree7.touchNode(" \nboom").setTail("test2")

  // Assert
  assert.strictEqual(tree7.getNode(" blanks").getTail(), "test", "Expected blank paths to be settable")
  assert.strictEqual(tree7.getNode(" boom").getTail(), "test2", "Expected newlines in path to be sanitized")

  // Arrange/Act
  const boom = new TreeNode("")
  boom.touchNode("description").setTail("some text with a \nnewline")

  // Assert
  assert.strictEqual(new TreeNode(boom.toString()).length, 1)

  // Test Blanks
  // Arrange
  const blank = new TreeNode()
  blank.touchNode("").setTail("")

  // Assert
  assert.strictEqual(blank.length, 1, "Expected blanks to work")
  assert.strictEqual(blank.toString(), " ", "Expected blanks to work")
}

testTree.setFromArray = assert => {
  // Arrange/Act
  const boom = new TreeNode([{ description: "some text with a \nnewline" }])
  const output = boom.toString()

  // Assert
  assert.strictEqual(new TreeNode(output).length, 1)
}

testTree.setFromText = assert => {
  // Arrange
  const str = `john doe
 age 50`
  const tree = new TreeNode(str)
  const node = tree.getNode("john")

  // Act
  node.setFromText(str)

  // Assert
  assert.strictEqual(node.toString(), str)

  // Act
  node.setFromText("john")

  // Assert
  assert.strictEqual(node.toString(), "john")
}

testTree.shift = assert => {
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
  assert.strictEqual(tree.length, 3, "length ok")
  assert.strictEqual(
    tree.shift().toString(),
    `john
 age 5`,
    "expected correct string returned"
  )
  assert.strictEqual(tree.length, 2)
  assert.strictEqual(empty.shift(), null)

  // Arrange
  const one = new TreeNode("first\n nested")

  // Act
  one.getNode("first").shift()

  // Assert
  assert.strictEqual(one.getNode("first").length, 0)
  assert.strictEqual(one.toString(), "first")
}

testTree.sort = assert => {
  // Arrange
  const tree = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10")
  // Assert
  assert.strictEqual(tree.getHeads().join(" "), "john susy bob")
  // Act
  tree.sort((a, b) => {
    return b.getHead() < a.getHead()
  })
  // Assert
  assert.strictEqual(tree.getHeads().join(" "), "bob john susy")
}

testTree.sortBy = assert => {
  // Arrange
  const tree = new TreeNode("john\n age 5\nsusy\n age 6\nbob\n age 10\nsam\n age 21\nbrian\n age 6")
  // Assert
  assert.strictEqual(tree.getHeads().join(" "), "john susy bob sam brian")

  // Act
  tree.sortBy("age")

  // Assert
  assert.strictEqual(tree.getHeads().join(" "), "bob sam john susy brian")

  // Sort by multiple properties
  // Arrange
  const tree2 = new TreeNode(testStrings.sortByMultiple)

  // Act
  tree2.sortBy(["name", "date"])

  // Assert
  assert.strictEqual(tree2.getColumn("key").join(""), "cab")

  // Act
  tree2.sortBy(["name", "key"])

  // Assert
  assert.strictEqual(tree2.getColumn("key").join(""), "acb")
}

testTree.syntax = assert => {
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

    _parseNode(node) {
      return new TestLanguage(node.childrenToString(), node.getLine())
    }
  }

  // Act
  const b = new TestLanguage(test2)

  // Assert
  assert.strictEqual(b.getNode("person=country").getTail(), "USA")
  assert.strictEqual(a.toString(undefined, b), test2, "syntax conversion works")

  // Assert
  assert.strictEqual(a.toString(undefined, b), b.toString())

  // Assert
  assert.strictEqual(b.toString(undefined, a), test)
}

testTree.toCsv = assert => {
  // Arrange
  const a = new TreeNode(testStrings.delimited)
  // Act/Assert
  assert.strictEqual(a.toCsv(), testStrings.csv, "Expected correct csv")

  // Arrange
  const b = new TreeNode([{ lines: "1\n2\n3" }])
  // Act/assert
  assert.strictEqual(b.toCsv(), `lines\n"1\n2\n3"`)
}

testTree.toFixedWidthTable = assert => {
  // Arrange
  const a = TreeNode.fromCsv("name,score,color\n" + testStrings.csvNoHeaders)
  // Act/Assert
  assert.strictEqual(a.toFixedWidthTable(), testStrings.toFixedWidthTable, "Expected correct spacing")

  // Arrange
  const b = TreeNode.fromCsv("name\njoe\nfrankenstein")
  // Act/Assert
  assert.strictEqual(b.toFixedWidthTable(1), "n\nj\nf", "Expected max width to be enforced")
}

testTree.toJavascript = assert => {
  // Arrange
  const multiline = new TreeNode("name John\nname John")
  // Assert
  assert.strictEqual(
    multiline.toJavascript(),
    `new TreeNode(\`name John
name John\`)`
  )
}

testTree.toObject = assert => {
  // Arrange
  const a = new TreeNode("hello world")
  const b = new TreeNode("foo bar")

  // Assert
  assert.ok(typeof a.toObject() === "object")
  assert.strictEqual(a.toObject()["hello"], "world")

  // Act
  a.touchNode("b").setChildren(b)
  // Assert
  assert.strictEqual(a.toObject()["b"]["foo"], "bar")

  // Arrange
  const objectWithTreesAndValues = `div
 input checked
  type checkbox`

  // Act
  const obj = new TreeNode(objectWithTreesAndValues).toObject()

  // Assert
  assert.strictEqual(typeof obj.div.input, "string")
}

testTree.toSsv = assert => {
  // Arrange
  const a = new TreeNode(testStrings.delimited)
  // Assert
  assert.strictEqual(a.toSsv(), testStrings.ssv)
  const b = new TreeNode([{ name: "john", age: 12 }])
  assert.ok(b.toSsv())
}

testTree.toString = assert => {
  // Arrange
  const tree = new TreeNode("hello world")
  // Assert
  assert.strictEqual(tree.toString(), "hello world", "Expected correct string.")
  // Act
  tree.touchNode("foo").setTail("bar")
  // Assert
  assert.strictEqual(tree.toString(), "hello world\nfoo bar")

  // Arrange
  const tree2 = new TreeNode("z-index 0")
  // Act
  tree2["z-index"] = 0
  // Assert
  assert.strictEqual(tree2.toString(), "z-index 0")

  // Test empty values
  // Arrange
  const tree3 = new TreeNode()

  // Act
  tree3.touchNode("empty").setTail("")
  // Assert
  assert.strictEqual(tree3.toString(), "empty ")

  // Arrange
  const a = new TreeNode("john\n age 5")
  // Assert
  assert.strictEqual(a.toString(), "john\n age 5")

  // Arrange
  const r = new TreeNode("joe\njane\njim")
  // Act/Assert
  assert.ok(r.toString())

  // Act
  a.touchNode("multiline").setTailWithChildren("hello\nworld")
  // Assert
  assert.strictEqual(a.toString(), "john\n age 5\nmultiline hello\n world")

  // Act
  a.touchNode("other").setTail("foobar")
  // Assert
  assert.strictEqual(a.toString(), "john\n age 5\nmultiline hello\n world\nother foobar")

  // Arrange
  const b = new TreeNode("a\n text \n  this is a multline string\n  and more")
  // Assert
  assert.strictEqual(b.toString(), "a\n text \n  this is a multline string\n  and more")

  // Test setting an instance as a value in another instance
  // Act
  a.touchNode("even_more").setChildren(b)
  // Assert
  assert.strictEqual(
    a.toString(),
    "john\n age 5\nmultiline hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more"
  )

  // Arrange
  const testCases = ["", "\n", "\n\n", "\n \n ", "   \n   \n", "foo\nbar\n\n", "\n\n foo \nbar\n"]

  // Act/Assert
  testCases.forEach(someStr => assert.strictEqual(new TreeNode(someStr).toString(), someStr, "Expected identity"))

  // Arrange
  const str = "view\n type bar"
  const treeNode = new TreeNode(str).getNode("view")
  // Act/Assert
  assert.strictEqual(treeNode.toString(), str)
}

testTree.toHtml = assert => {
  // Arrange
  const tree = new TreeNode("hello world")
  // Act
  const str = tree.toHtml()
  // Assert
  assert.ok(str.includes("<span"))

  // Arrange
  const parent = new TreeNode(testStrings.every)

  // Assert
  assert.ok(parent.toHtml().includes("5 0 4 0 0"))
}

testTree.toTsv = assert => {
  // Arrange
  const a = new TreeNode(testStrings.delimited)
  // Assert
  assert.strictEqual(a.toTsv(), testStrings.tsv)
}

testTree.toXml = assert => {
  // Arrange
  const a = new TreeNode(testStrings.toXml)
  // Assert
  assert.strictEqual(a.toXml(), testStrings.toXmlPrettyResult)
}

testTree.windowsReturnChars = assert => {
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
  assert.strictEqual(tree.length, 6)
}

testTree.treeNodes = assert => {
  // Arrange
  const a = new TreeNode("text")
  const node = a.nodeAt(0)

  // Assert
  assert.strictEqual(node.isTerminal(), true)
  assert.strictEqual(node.getHead(), "text")
  assert.strictEqual(node.getTail(), undefined)
  assert.strictEqual(node.length, 0)

  // Act
  node.setTail("hello world")

  // Assert
  assert.strictEqual(node.getTail(), "hello world")
  assert.strictEqual(a.toString(), "text hello world")

  // Act
  node.setChildren("color blue")

  // Assert
  assert.strictEqual(node.isTerminal(), false)
  assert.strictEqual(node.childrenToString(), "color blue")
  assert.strictEqual(a.toString(), "text hello world\n color blue")

  // Act
  node.setHead("foo")

  // Assert
  assert.strictEqual(a.toString(), "foo hello world\n color blue")

  // Act
  node.setChildren("")

  // Assert
  assert.ok(node.toString())
}

module.exports = testTree
