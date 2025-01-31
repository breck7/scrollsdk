#!/usr/bin/env ts-node

import { particlesTypes } from "../products/particlesTypes"

const testParticles: particlesTypes.testParticles = {}
const { Particle, ExtendibleParticle } = require("../products/Particle.js")
const { Utils } = require("../products/Utils.js")
const { TestRacer } = require("../products/TestRacer.js")

const testStrings: particlesTypes.stringMap = {}
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

testObjects.json2particles = [
  { id: 755, settings: "123" },
  { id: 756, settings: "456" }
]
testStrings.json2particles = `docs
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

testStrings.fromXmlParticles = `html
 class main
 subparticles
  head
  body
   style color: red;
   subparticles
    div
     class main
     subparticles
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

testStrings.ssvFixedColumnComment1 = "This is some comment with particles"
testStrings.ssvFixedColumnComment2 = "Each row should be capped to 2 columns"
testStrings.ssvFixedColumns = `id comment
123 ${testStrings.ssvFixedColumnComment1}
456 ${testStrings.ssvFixedColumnComment2}
`

testStrings.ssvMissingColumns = `state abbreviation population
california ca 35000000
texas tx
washington wa 6000000`

testStrings.renameParticlesBy = `
0
 name John Doe
 email johndoe@email.com
1
 name Mary Jane
 email maryjane@email.com
`

testStrings.newLines = `
particle
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

testParticles.constructorTests = equal => {
  // Assert
  equal(!!Particle, true, "Particle class should exist")
  equal(new Particle() instanceof Particle, true, "Particle should return a particle")

  // Arrange/Act
  const particle = new Particle("hello world")

  // Assert
  equal(particle.length, 1, "types array should have 1 property")
  equal(particle.indexOf("hello"), 0, "types array should be correct")
  equal(particle.getParticle("hello").content, "world", "Properties should be accessible")
  equal(typeof particle.getParticle("hello").content, "string", "Leafs should be strings")

  // Act
  particle.touchParticle("foo").setContent("bar")

  // Assert
  equal(particle.getParticle("foo").content, "bar", "Particles should be modifiable")

  // Arrange
  const particle2 = new Particle("foobar\n one 1")

  // Assert
  equal(particle2.getParticle("foobar").content, undefined, "Value should be empty")
  equal(particle2.getParticle("foobar").getParticle("one").content, "1", "Value should be 1")

  equal(typeof particle2.getParticle("foobar"), "object", "Particles should be objects")
  equal(particle2.getParticle("foobar") instanceof Particle, true, "Nested particles should be particles")

  // Arrange
  const particle3 = new Particle("list\nsingle value")

  // Assert
  equal(particle3.length, 2, "Particle should have 2 names")
  equal(particle3.getParticle("list").length, 0, "A name without a trailing particle should be length 0")

  // Arrange
  const particle4 = new Particle("body")

  // Assert
  equal(particle4.getParticle("body").length, 0, "A name without a trailing particle should be a particle")

  // Arrange
  const particle5 = new Particle({
    foobar: "hello"
  })

  // Assert
  equal(particle5.getParticle("foobar").content, "hello", "Particles can be created from object literals")

  // Arrange
  const particle6 = new Particle({
    foobar: new Particle("hello world")
  })

  // Assert
  equal(particle6.getParticle("foobar hello").content, "world", "Particles can be created from objects mixed with particles")

  // Arrange
  const particle7 = new Particle({
    foobar: {
      hello: {
        world: "success"
      }
    }
  })

  // Assert
  equal(particle7.getParticle("foobar hello world").content, "success", "Particles can be created from deep objects")
}

testParticles.multlineConstructorTests = equal => {
  // Arrange
  const particleString = `user
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
  const particle8 = new Particle(particleString)

  // Assert
  equal(particle8.topDownArray.length, 20)
  equal(particle8.numberOfLines, 20)
  equal(particle8.numberOfAtoms, 30)
  equal(particle8.getParticle("domains test.test.com pages home settings data title").content, "Hello, World", "Multiline creation should be okay.")

  // Arrange
  const emptyArray = { post: { kind: {}, age: 100 } }
  const expectedStr = `post
 kind
 age 100`
  // Act
  const particle10 = new Particle(emptyArray)
  // Assert
  equal(particle10.asString, expectedStr)

  // Arrange
  const particle = new Particle(" ").particleAt(0)

  // Act/Assert
  equal(particle.cue, "")
  equal(particle.content, "")

  // Arrange
  const spaceChar = " "
  let s = `
${spaceChar}
${spaceChar}
${spaceChar}`
  // Act/Assert
  equal(new Particle(s).particleAt(0).length, 3)

  // Arrange
  s = `
${spaceChar}${spaceChar}
${spaceChar}`
  // Act/Assert
  equal(new Particle(s).particleAt(0).length, 2)
}

testParticles.ambiguityFixWhenAssignmentAndEdgeCharsMatch = equal => {
  // Arrange
  let test = `
 :
 :`
  // Act/Assert
  class TestParticles extends Particle {
    get atomBreakSymbol() {
      return ":"
    }
  }
  const iHateTypeScriptSometimes = <any>TestParticles

  equal(new iHateTypeScriptSometimes(test).particleAt(0).length, 2)

  const rootParticle = new iHateTypeScriptSometimes()
  const particle = rootParticle.appendLineAndSubparticles("", new iHateTypeScriptSometimes())
  particle.appendLine("")
  particle.appendLine("")
  const newParticle = new iHateTypeScriptSometimes(rootParticle.asString)
  equal(newParticle.particleAt(0).length, 2)
}

testParticles.duplicateReferences = equal => {
  // Arrange
  let b = ["abc"]
  let a = {
    one: b,
    two: b
  }

  // Act/Assert
  equal(new Particle(a).get("two 0"), "abc")

  // Arrange
  let boo = { foo: "bar" }
  let abc = {
    one: boo,
    two: boo
  }

  // Act/Assert
  equal(new Particle(abc).get("two foo"), "bar")
}

testParticles.append = equal => {
  // Arrange
  const particle = new Particle("hello world")

  // Act
  particle.appendLine("foo bar")
  particle.touchParticle("foo2").setContent("bar")

  // Assert
  equal(particle.getParticle("foo").content, "bar")

  // Act
  particle.appendLine("foo two")

  // Assert
  equal(particle.length, 4)
}

testParticles.deleteBlanks = equal => {
  // AAA
  equal(new Particle("hello world\n\n\nhelmet\nthe").deleteBlanks().length, 3)
}

testParticles.getParticlesByRegex = equal => {
  // AAA
  equal(new Particle("hello world\nhelmet\nthe").getParticlesByRegex(/^he/).length, 2)
}

testParticles.getAtom = equal => {
  // Arrange
  const particle = new Particle("a b c")
  const aParticle = particle.getParticle("a")

  // Act/Assert
  equal(aParticle.getAtom(1), "b")
  equal(aParticle.getAtom(-1), "c")
}

testParticles.getOneOf = equal => {
  // Arrange
  const particle = new Particle(`tint blue\nColor red`)

  // Act/Assert
  equal(particle.getOneOf(["Color", "tint"]), "red")
  equal(particle.getOneOf(["tint", "Color"]), "blue")
  equal(particle.getOneOf(["height"]), "")
}

testParticles.pick = equal => {
  // Arrange
  const particle = new Particle(`tint blue\nColor red`)

  // Act/Assert
  equal(particle.pick(["Color", "tint"]).asString, `tint blue\nColor red`)
  equal(particle.getOneOf(["height"]).toString(), "")
}

testParticles.setProperties = equal => {
  // Arrange
  const particle = new Particle(``)
  particle.setProperties({ foo: "bar", one: "2" })

  // Act/Assert
  equal(particle.get("one"), "2")
}

testParticles.setPropertyIfMissing = equal => {
  // Arrange
  const particle = new Particle(``)
  particle.setProperties({ foo: "bar", one: "2" })
  particle.setPropertyIfMissing("one", "3")
  particle.setPropertyIfMissing("two", "a")

  // Act/Assert
  equal(particle.get("one"), "2")
  equal(particle.get("two"), "a")
}

testParticles.setAtoms = equal => {
  // Arrange
  const particle = new Particle("a b c")
  const aParticle = particle.getParticle("a")

  // Act/Assert
  equal(aParticle.appendAtom("d").asString, "a b c d")
  equal(aParticle.setAtoms(["f", "g"]).asString, "f g")
  equal(aParticle.setAtomsFrom(1, ["h", "i"]).asString, "f h i")
  equal(aParticle.deleteAtomAt(2).asString, "f h")
}

testParticles.at = equal => {
  // Arrange
  const value = new Particle("hello world\nhow are you\nhola friend")

  // Assert
  equal(value.particleAt(0).content, "world")
  equal(value.particleAt(1).content, "are you")
  equal(value.particleAt(2).content, "friend")
  equal(value.particleAt(3), undefined)
  equal(value.particleAt(-1).content, "friend")
}

testParticles.getAtomBoundaryCharIndices = equal => {
  // Arrange
  const particle = new Particle(`
a
web 25 zzzz OK
 notes No notes`)

  // Act
  const boundaries = particle.getAllAtomBoundaryCoordinates()

  // Assert
  equal(boundaries.length, 9)
}

testParticles.toDelimited = equal => {
  const test = `name|example
python|"Hello world"`
  const particle = Particle.fromDelimited(test, "|", "'")

  // Act/Assert
  equal(particle.toDelimited("|", undefined, false), test)
}

testParticles.fill = equal => {
  Object.keys(testStrings).forEach(key => {
    // Arrange
    const particle = new Particle(testStrings[key])
    const filledParticle = particle.clone().fill("x")
    // Act/Assert
    equal(particle.length, filledParticle.length)
    equal(particle.numberOfLines, filledParticle.numberOfLines)
    equal(particle.numberOfAtoms, filledParticle.numberOfAtoms)
  })
}

testParticles.getAtomProperties = equal => {
  // Arrange
  const particle = new Particle(`
a
web 25 zzzz OK
 notes No notes`)

  // Act/Assert
  const props = particle.particleAtLine(3).getAtomProperties(2)
  equal(props.startCharIndex, 10)
  equal(props.endCharIndex, 15)
}

testParticles.getAtomIndexAtCharacterIndex = equal => {
  // Arrange
  const particle = new Particle(`
a
web 25 zzzz OK
 notes No notes`)
  const tests = `0
00
000011122222333
 000000111222222`

  // Act/Assert
  const lineParticles = particle.topDownArray
  tests.split("\n").forEach((testLine, lineIndex) => {
    const particle = lineParticles[lineIndex]
    testLine.split("").forEach((char, charIndex) => {
      if (char !== " ") equal(particle.getAtomIndexAtCharacterIndex(charIndex), parseInt(char), `Character is '${char}'`)
    })
  })

  // Arrange
  const nested = new Particle(`a
 b
  c
   d`)

  // Act/Assert
  equal(nested.getParticle("a b").getAtomIndexAtCharacterIndex(0), -1)
}

testParticles.clone = equal => {
  // Arrange/Act
  const a = new Particle("hello world")
  const b = a.clone()

  // Assert
  equal(b.getParticle("hello").content, "world")
  equal(a.asString, b.asString, "string unchanged")

  // Act
  b.touchParticle("hello").setContent("mom")

  // Assert
  equal(a.getParticle("hello").content, "world")

  // Arrange
  const c = a

  // Assert
  equal(c.getParticle("hello").content, "world")

  // Act
  c.touchParticle("hello").setContent("foo")

  // Assert
  equal(a.getParticle("hello").content, "foo")

  // Arrange
  const d = c

  // Assert
  equal(d.getParticle("hello").content, "foo", "foo should be value")

  // Act
  d.touchParticle("hello").setContent("hiya")

  // Assert
  equal(a.getParticle("hello").content, "hiya", "original unchanged")

  // Act
  a.touchParticle("test").setContent("boom")

  // Assert
  equal(d.getParticle("test").content, "boom")

  // Act
  a.touchParticle("foobar").setSubparticles(new Particle("123 456"))

  // Assert
  equal(c.getParticle("foobar 123").content, "456", "expected 456")

  // Arrange
  const e = a

  // Assert
  equal(e.getParticle("foobar 123").content, "456")

  // Arrange
  const f: any = a.clone()

  // Assert
  equal(f.getParticle("foobar 123").content, "456")

  // Act
  f.hi = "test"

  // Assert
  equal((<any>a).hi, undefined)
}

testParticles.concat = equal => {
  // Arrange
  const a = new Particle("hello world")
  const b = new Particle("hi mom")

  // Act
  const newParticles = a.concat(b)

  // Assert
  equal(a.getParticle("hi").content, "mom")
  equal(newParticles.length, 1)
}

testParticles.getParticlesByGlobPath = equal => {
  // Arrange/Act/Assert
  equal(new Particle(testStrings.webpage).getParticlesByGlobPath("* div").length, 5)
  equal(new Particle(testStrings.webpage).getParticlesByGlobPath("*").length, new Particle(testStrings.webpage).length)
  equal(new Particle(testStrings.webpage).getParticlesByGlobPath("body div class").length, 2)
}

testParticles.particlesThatStartWith = equal => {
  equal(new Particle(testStrings.webpage).particlesThatStartWith("body")[0].particlesThatStartWith("div").length, 5)
}

testParticles.getParticleByColumns = equal => {
  // Arrange
  const test = new Particle(testStrings.sortByMultiple)

  // Act
  const particle = test.getParticleByColumns("name", "Success")

  // Assert
  equal(particle.parent.get("key"), "b")
}

testParticles.delete = equal => {
  // Arrange
  const particle = new Particle()
  particle.touchParticle("name").setContent("Breck")

  // Assert
  equal(particle.getParticle("name").content, "Breck", "name is set")
  equal(particle.length, 1, "length okay")
  equal(particle.getFirstParticle().content, "Breck")

  // Act
  particle.delete("name")

  // Assert
  equal(particle.getParticle("name"), undefined, "name is gone")
  equal(particle.length, 0, "length okay")

  // Act
  particle.touchParticle("name").setContent("Breck")
  particle.touchParticle("age").setContent("100")
  particle.touchParticle("table").setContent("true")
  particle.delete("age")

  // Assert
  equal(particle.getParticle("age"), undefined, "age is gone")
  equal(particle.length, 2, "expected 2 elements remaining")

  // Test deep delete
  // Arrange
  const particle2 = new Particle()
  particle2.touchParticle("earth north_america united_states california san_francisco").setContent("mission")

  // Assert
  equal(particle2.getParticle("earth north_america united_states california") instanceof Particle, true, "particle exists")
  equal(particle2.getParticle("earth north_america united_states california san_francisco").content, "mission", "neighborhood is set")
  equal(particle2.getParticle("earth north_america united_states california").length, 1, "length okay")
  equal(particle2.length, 1, "length okay")

  // Act
  const deleteResult = particle2.delete("earth north_america united_states california san_francisco")

  // Assert
  equal(deleteResult instanceof Particle, true, "returns particle")
  equal(particle2.getParticle("earth north_america united_states california san_francisco"), undefined, "neighborhood is gone")

  // Test deleting a non-existant property
  // Arrange
  const particle3 = new Particle("property meta\n")

  // Act
  particle3.delete("content")

  // Assert
  equal(particle3.getParticle("property").content, "meta", "delete a non existing entry works")

  // Delete a property that has multiple matches
  // Arrange
  const particle4 = new Particle("time 123\ntime 456")

  // Assert
  equal(particle4.length, 2)

  // Act
  particle4.delete("time")

  // Assert
  equal(particle4.length, 0)

  // Arrange
  const blankTest = `presidents
 class President
other`
  const particle6 = new Particle(blankTest)

  // Act
  particle6.forEach((particle: particlesTypes.particle) => {
    if (!particle.cue.startsWith("p")) return true
    particle.setContent("President")
    particle.delete("class")
  })

  // Assert
  equal(
    particle6.asString,
    `presidents President
other`
  )
}

testParticles.deleteRegression = equal => {
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
    const board = new Particle(str)
    const dataParticles = board.findParticles("data")
    dataParticles.forEach((particle: particlesTypes.particle) => {
      const rows = particle.findParticles("row")
      if (!rows.length) return
      const mapped = rows.map((row: particlesTypes.particle) => row.toObject())
      const csv = new Particle(mapped).asCsv
      particle.touchParticle("format").setContent("csv")
      particle.touchParticle("content").setContentWithSubparticles(csv)
      particle.delete("row")
    })
    return board.asString
  }
  const result = new Particle(migrateFn(test)).getParticle("data")

  // Assert
  equal(result.findParticles("row").length, 0)
}

testParticles.destroy = equal => {
  const template = `hey ho
hi
 hello world
yo hey`
  // Arrange
  const particle = new Particle(template)

  // Act
  particle.particleAt(1).destroy()

  // Assert
  equal(particle.asString, "hey ho\nyo hey")
}

testParticles.duplicateProperties = equal => {
  // Arrange
  const particle = new Particle("time 123\ntime 456")

  // Assert
  equal(particle.length, 2)
  equal(particle.asString, "time 123\ntime 456")
}

testParticles.duplicate = equal => {
  // Arrange
  const particle = new Particle(testStrings.fromXmlParticles)
  const lineCount = particle.asString.split(/\n/).length
  const particle2 = particle.getParticle("html")

  // Act
  particle2.duplicate()

  // Assert
  equal(particle.asString.split(/\n/).length, lineCount * 2)
}

testParticles.forEach = equal => {
  // Arrange
  const value = new Particle("hello world\nhi mom")
  var count = 0
  var result = ""

  // Act
  value.forEach(function (particle: particlesTypes.particle) {
    const property = particle.cue
    const v = particle.content
    result += property.toUpperCase()
    result += v.toUpperCase()
    result += value.length
  })

  // Assert
  equal(value.length, 2, "test chaining")
  equal(result, "HELLOWORLD2HIMOM2")

  // Test that returning false breaks out of each
  // Arrange
  const value2 = new Particle("hello world\nhi mom")

  // Act
  value2
    .filter((particle: particlesTypes.particle) => particle.cue !== "hello")
    .forEach((particle: particlesTypes.particle) => {
      const property = particle.cue
      const value = particle.content
      count++
    })
  // Assert
  equal(count, 1)

  // Arrange
  const particle = new Particle("hello world\nhi world")
  var inc = 0

  // Act
  particle.forEach((particle: particlesTypes.particle, index: number) => {
    inc = inc + index
  })

  // Assert
  equal(inc, 1, "index worked")
}

testParticles.every = equal => {
  // Arrange/Act/Assert
  equal(
    new Particle(`a 2\nb 2\nc 2`).every((particle: particlesTypes.particle) => particle.getAtom(1) === "2"),
    true
  )
}

testParticles.extend = equal => {
  // Arrange
  const sourceStr = `name Jane
color blue`
  const destinationStr = `username jane`
  const source = new Particle(sourceStr)
  const destination = new Particle(destinationStr)
  // Act
  destination.extend(source)
  // Assert
  equal(destination.asString, [destinationStr, sourceStr].join("\n"))

  // Test deep
  const original = { person: "Abe", age: "24", items: { car: "blue" } }
  const extension = { person: "Joe", weight: 100, items: { car: "red", foo: "bar" } }

  // Act
  const particle = new Particle(original).extend(extension)
  const result = particle.toObject()

  // Assert
  equal(result.person, "Joe")
  equal(result.age, "24")
  equal(result.weight, "100")
  equal(result.items.car, "red", "expected deep to work")
  equal(result.items.foo, "bar")
  equal(particle.getParticle("items").length, 2)

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
  const extended = new Particle(test).extend(web)

  // Assert
  equal(extended.getParticle(">foo >bar >bam class").content, "boom")
}

testParticles.first = equal => {
  // Arrange
  const value = new Particle("hello world\nhi mom")

  // Assert
  equal(value.particleAt(0).content, "world")

  // Arrange
  const value2 = new Particle("hello world\nhi mom")

  // Assert
  equal(value2.particleAt(0).asString, "hello world")
}

testParticles.firstProperty = equal => {
  // Arrange
  const value = new Particle("hello world\nhi mom")

  // Assert
  equal(value.particleAt(0).cue, "hello")
}

testParticles.hasDuplicates = equal => {
  // Arrange/Act/Assert
  equal(new Particle(testStrings.sortByMultiple).hasDuplicateCues(), true)
  equal(new Particle().hasDuplicateCues(), false, "empty")
  equal(new Particle("a\na").hasDuplicateCues(), true)
  equal(new Particle("a\n a\n b").particleAt(0).hasDuplicateCues(), false)
  equal(new Particle("a\n b\n b").particleAt(0).hasDuplicateCues(), true)
}

testParticles.toYaml = equal => {
  // Arrange/Act/Assert
  equal(new Particle(testStrings.lime).asYaml, testStrings.limeToYaml)
}

testParticles.asGridJson = equal => {
  // Arrange/Act/Assert
  const tests = Object.keys(testStrings).forEach(key => {
    const program = testStrings[key]
    const serialized = new Particle(program).asGridJson
    equal(Particle.fromGridJson(serialized).asString, program)
  })
}

testParticles.toJson = equal => {
  // Arrange/Act/Assert
  const tests = Object.keys(testStrings).forEach(key => {
    const program = testStrings[key]
    const serialized = new Particle(program).asJson
    equal(Particle.fromJson(serialized).asString, program)
  })
}

testParticles.firstValue = equal => {
  // Arrange
  const value = new Particle("hello world\nhi mom")

  // Assert
  equal(value.particleAt(0).content, "world")
}

testParticles.toggleLine = equal => {
  // Arrange
  const particle = new Particle("chart").particleAt(0)
  equal(particle.has("hidden"), false)

  // Act
  particle.toggleLine("hidden")

  // Assert
  equal(particle.hasLine("hidden"), true)
  equal(particle.has("hidden"), true)

  // Act
  particle.toggleLine("hidden")

  // Assert
  equal(particle.hasLine("hidden"), false)
  equal(particle.has("hidden"), false)
}

testParticles.pasteText = equal => {
  // Arrange
  const particle = new Particle(`a
 b`)
  // Act
  particle.getParticle("a b").pasteText(`foo
 bar`)
  // Assert
  equal(
    particle.asString,
    `a
 foo
  bar`
  )
}

testParticles.templateToString = equal => {
  // Arrange
  const templateString = new Particle(`html
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

testParticles.patch = equal => {
  // Arrange
  const one = new Particle(`name Git
appeared 2012`)
  const two = new Particle(`name Git
creators Linus Torvalds
appeared 2005`)

  // Act
  const three = one.patch(two)

  // Assert
  equal(three.get("appeared"), "2005")
  equal(three.get("creators"), "Linus Torvalds")
}

testParticles.evalTemplateString = equal => {
  // Arrange
  const templateString = "Hi {firstName} {lastName}! I hope you are enjoying the weather in {address city}!"
  const person = new Particle("firstName Tom\nlastName B\naddress\n city Boston")

  // Act
  const result = person.evalTemplateString(templateString)

  // Assert
  equal(result, "Hi Tom B! I hope you are enjoying the weather in Boston!")
}

testParticles.fromCsv = equal => {
  // Arrange/Act
  const particle = Particle.fromCsv(testStrings.csv)
  const withQuotes = Particle.fromCsv('"Date","Age"\n"123","345"')

  // Assert
  equal(particle.asString, testStrings.delimited)
  equal(particle.length, 2, "expected 2 rows")
  equal(particle.asCsv, testStrings.csv, "Expected toCsv to output same data as fromCsv")

  // Arrange
  const particle2 = Particle.fromCsv("Age,Birth Place,Country\n12,Brockton,USA")

  // Assert
  equal(particle2.length, 1)
  equal(particle2.particleAt(0).getParticle("Country").content, "USA")

  // Arrange
  const particle3 = Particle.fromCsv("")

  // Assert
  equal(particle3.asString, "", "Expected empty string to be handled correctly")

  // Assert
  equal(withQuotes.getParticle("0 Date").content, "123", "Expected quotes to be handled properly")

  // Arrange
  const particle4 = Particle.fromCsv('height\n"32,323"')

  // Assert
  equal(particle4.getParticle("0 height").content, "32,323")

  // Test quote escaping
  // Arrange
  const csvWithQuotes = 'name,favoriteChar\nbob,"""."'

  // Act
  const particle5 = Particle.fromCsv(csvWithQuotes)

  // Assert
  equal(particle5.asString, '0\n name bob\n favoriteChar ".', "Four double quotes should return one double quote")

  // Test \r characters
  // Arrange
  const csv = "name,age\r\njoe,21\r\nbill,32\r\n"

  // Act
  const testCase = Particle.fromCsv(csv.replace(/\r/g, ""))

  // Assert
  equal(testCase.getParticle("1 age").content, "32", "Expected return chars to be removed")

  // Act
  testCase.getParticle("1").delete("name")

  // Assert
  equal(testCase.getParticle("0").subparticlesToString(), "name joe\nage 21", "property change should not affect other objects")
  equal(testCase.getParticle("1 name"), undefined, "property should be gone")
}

testParticles.fromCsvNoHeaders = equal => {
  // Arrange
  const a = Particle.fromDelimitedNoHeaders(testStrings.csvNoHeaders, ",", '"')

  // Assert
  equal(a.length, 3)
  equal(a.getParticle("1 2").content, "blue")
}

testParticles.fromDelimited = equal => {
  // Arrange
  const a = Particle.fromDelimited(testStrings.fromDelimited, "^", "~")

  // Assert
  equal(a.length, 2)
  equal(a.getParticle("0 weight").content, "2.2")
  equal(a.getParticle("1 foodName").content, "Banana")

  // Arrange
  const b = Particle.fromDelimited(
    `name,score

joe,23`,
    ",",
    '"'
  )

  // Assert
}

testParticles.fromDelimitedWindowsLineEndings = equal => {
  // Arrange
  const str = "A,B\n1,3"
  const str2 = "A,B\n\r1,3"
  // Act
  const result = Particle.fromCsv(str)
  const result2 = Particle.fromCsv(str2)

  // Assert
  equal(result.get("0 B"), "3")
  equal(result2.get("0 B"), "3")
}

testParticles.siblingsWithClone = equal => {
  // Arrange
  const test = new Particle(`a
b
c`)

  // Act
  const clone = test.clone()

  // Assert
  equal(test.lastParticle().getOlderSiblings().length, 2)
  equal(clone.lastParticle().getOlderSiblings().length, 2)
}

testParticles.siblings = equal => {
  // Arrange
  const test = new Particle(`a
b
c`)

  // Act
  const a = test.getParticle("a")
  const b = test.getParticle("b")
  const c = test.getParticle("c")

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
    test.asString,
    `a-1
 foo
a
a2
 foo
b
c`
  )
}

testParticles.expandLastFromTopMatter = equal => {
  // Arrange
  const test = new Particle(`titleComponent
 class title
articleComponent hi
 h1 title
html
 titleComponent
 articleComponent`)
  // Act
  const expanded = test.expandLastFromTopMatter().asString

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

testParticles.replaceParticle = equal => {
  // Arrange
  const test = new Particle(`a
b`)
  const a = test.getParticle("a")

  // Act
  a.replaceParticle((str: any) => str.replace("a", "z"))

  // Assert
  equal(
    test.asString,
    `z
b`
  )
}

testParticles.fromSsv = equal => {
  // Arrange/Act
  const a = Particle.fromSsv(testStrings.ssv)

  // Assert
  equal(a.asString, testStrings.delimited)
  equal(a.asSsv, testStrings.ssv, "toSsv ok")

  // Arrange/Act
  const fixedCol = Particle.fromSsv(testStrings.ssvFixedColumns)

  // Assert
  equal(fixedCol.particleAt(0).getParticle("comment").content, testStrings.ssvFixedColumnComment1)
  equal(fixedCol.particleAt(1).getParticle("comment").content, testStrings.ssvFixedColumnComment2)
  equal(fixedCol.particleAt(1).length, 2)

  // Arrange/Act
  const missingCols = Particle.fromSsv(testStrings.ssvMissingColumns)

  // Assert
  equal(missingCols.particleAt(0).length, 3)
  equal(missingCols.particleAt(1).length, 3)
  equal(missingCols.particleAt(2).length, 3)
}

testParticles.fromTsv = equal => {
  // Arrange/Act
  const a = Particle.fromTsv(testStrings.tsv)

  // Assert
  equal(a.asString, testStrings.delimited, "From TSV worked")
  equal(a.asTsv, testStrings.tsv, "ToTsv Worked")

  // Test simple path
  // Act
  const b = Particle.fromTsv("color\tage\theight\nred\t2\t23")

  // Assert
  equal(b.getParticle("0 age").content, "2")
  equal(b.getParticle("0 height").content, "23")
}

testParticles.lengthen = equal => {
  // AAA
  equal(new Particle().lengthen(3).asString, "\n\n")
}

testParticles.getLine = equal => {
  // Arrange
  const particle = new Particle("hello world")
  const particle2 = particle.getParticle("hello")
  const mtime = particle2.getLineModifiedTime() || 0

  // Assert
  equal(particle2.getLine(), "hello world")
  equal(particle.has("hello"), true)

  // Act
  particle2.setLine("hi earth")

  // Assert
  equal(particle.asString, "hi earth")
  equal(particle2.getLineModifiedTime() > mtime, true)
  equal(particle.has("hello"), false)
}

testParticles.getIndentation = equal => {
  // Arrange
  const particle = new Particle(testStrings.webpageTrimmed)

  // Act/assert
  equal(particle.getParticle("body").indentation, "")
  equal(particle.getParticle("body div").indentation, " ")
  equal(particle.getParticle("body div content").indentation, "  ")

  equal(testStrings.webpageTrimmed, particle.topDownArray.map((line: particlesTypes.particle) => line.indentation + line.getLine()).join("\n"))
}

testParticles.content = equal => {
  // Arrange
  const particle = new Particle("hello world")

  // Assert
  equal(particle.getParticle("hello").content, "world")
  equal(particle.get("hello"), "world")

  // Act
  // Test get with ints
  particle.touchParticle("2").setContent("hi")

  // Assert
  equal(particle.getParticle("2").content, "hi", "Expected int strings to work.")

  // Assert
  // Test get with invalid values
  equal(new Particle().getParticle("some"), undefined, "expected undefined")
  equal(new Particle().getParticle("some long path"), undefined)
  equal(particle.getParticle(""), undefined)

  // Test get with duplicate properties
  // Arrange
  const particle2 = new Particle("height 45px\nheight 50px\nwidth 56px")

  // Assert
  equal(particle2.length, 3)

  // Act/Assert
  // When getting a duplicate property last item should win
  equal(particle2.getParticle("height").content, "50px", "Expected to get last value in instance with duplicate property.")

  // todo: remove ability of get to take non-strings
  // Arrange
  const particleWithNumbers = new Particle("1 bob\n0 brenda")

  // Act/Assert
  equal(particleWithNumbers.getParticle("0").content, "brenda")
  equal(particleWithNumbers.getParticle("1").content, "bob")
}

testParticles.getInheritanceParticles = equal => {
  // Arrange
  const classes = `abstractParser
abstractModalParser abstractParser
helpModal abstractModalParser
abstractButton abstractParser
helpButton abstractButton`

  // Act
  const inheritanceParticles = new Particle(classes).getInheritanceParticles()

  // Assert
  equal(
    inheritanceParticles.asString,
    `abstractParser
 abstractModalParser
  helpModal
 abstractButton
  helpButton`
  )
}

testParticles.getLines = equal => {
  // Arrange
  const value = new Particle("hello\n world")

  // Assert
  equal(value.getLines().join("").indexOf(" "), -1)
}

testParticles.getParticles = equal => {
  // Arrange
  const value = new Particle("hello world\nhello world")
  const deep = new Particle(`language
 line
  score 2
 line
  score 12`)

  // Assert
  equal(value.findParticles("hello").length, 2)

  // Act
  const result = value
    .findParticles("hello")
    .map((particle: particlesTypes.particle) => particle.content)
    .join("")

  // Assert
  equal(result, "worldworld")
  equal(deep.findParticles("language line score").length, 2)
  equal(
    deep
      .findParticles("language line score")
      .map((particle: particlesTypes.particle) => particle.content)
      .join(""),
    "212"
  )
}

testParticles.getContentsArray = equal => {
  // Arrange
  const html = new Particle("h1 hello world\nh1 hello world")

  // Assert
  equal(html.getContentsArray().join("\n"), "hello world\nhello world")
}

testParticles.multiply = equal => {
  class MathParticle extends Particle {
    get atomBreakSymbol() {
      return " "
    }

    get particleBreakSymbol() {
      return "o"
    }

    get edgeSymbol() {
      return "-"
    }
  }

  const iHateTypeScriptSometimes = <any>MathParticle

  // Arrange
  const two = new iHateTypeScriptSometimes(`o`)
  const three = new iHateTypeScriptSometimes(`oo`)

  // Act/Assert
  const result = iHateTypeScriptSometimes.multiply(two, three)

  equal(result.asString, "o-o-o-oo-o-o-", "multipling empty structures (in this case 1D primes) works as expected")

  // Non blanks
  const four = new Particle(
    `o
 o
 o
o
 o
 o`
  )
  const five = new Particle(
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

  equal(Particle.multiply(five, four).asString, twenty, "multiplying visible particles works as expected")
}

testParticles.getExpectingABranchButHittingALeaf = equal => {
  // Arrange
  const value = new Particle("posts leaf")

  // Assert
  equal(value.getParticle("posts branch"), undefined)
}

testParticles.getParticlesByPrefixes = equal => {
  // Arrange
  const test = `id foobar
 link
 link blue
  color orange
 link black
  color green`
  const particle = new Particle(test)

  // Act
  const particles = particle.getParticlesByLinePrefixes(["id foobar", "link blue", "color"])
  const particles2 = particle.getParticlesByLinePrefixes(["id foobar", "link bl"])
  const particles3 = particle.getParticlesByLinePrefixes(["id foobar", "ink"])

  // Assert
  equal(particles[0].getLine(), "color orange")
  equal(particles2.length, 2)
  equal(particles3.length, 0)
}

testParticles.getIndex = equal => {
  // Arrange
  const particle = new Particle("r1\n name bob\nr2\n name joe")
  const subparticle0 = particle.getParticle("r1")
  const subparticle1 = particle.getParticle("r2")

  // Act/Assert
  equal(subparticle0.index, 0, "Has correct index")
  equal(subparticle1.index, 1, "Has correct index")
}

testParticles.simpleParticleLanguage = equal => {
  // Arrange
  class MathProgramParser extends Particle {
    // Look! You created a top down parser!
    createParserPool() {
      return new Particle.ParserPool(undefined, { "+": AdditionParticleParser, "-": SubstractionParticleParser })
    }

    execute() {
      return this.map((subparticle: any) => subparticle.execute())
    }
  }

  class SubstractionParticleParser extends Particle {}

  class AdditionParticleParser extends Particle {
    // Look! You created an interpreter!
    execute() {
      return [this.getNumbers().reduce((prev: number, current: number) => prev + current, 0)]
    }

    // Look! You created a declarative file format!
    getNumbers() {
      return this.getAtomsFrom(1).map((atom: string) => parseFloat(atom))
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
  const iHateTypeScriptSometimes = <any>MathProgramParser
  const program = new iHateTypeScriptSometimes(source)
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
  equal(program.getSubparticlesByParser(AdditionParticleParser).length, 3)
  equal(program.getSubparticlesByParser(SubstractionParticleParser).length, 0)

  // Act
  program.particleAt(0).replaceParticle((str: any) => str.replace("+", "-"))

  // Assert
  equal(program.getSubparticlesByParser(AdditionParticleParser).length, 2)
  equal(program.getSubparticlesByParser(SubstractionParticleParser).length, 1)
  equal(program.getParticleByParser(SubstractionParticleParser) instanceof SubstractionParticleParser, true)
}

testParticles.getCuePath = equal => {
  // Arrange
  const particle = new Particle(testStrings.every)
  const parent = particle.getParticle("domains test.test.com pages home settings")
  const subparticle = particle.getParticle("domains test.test.com pages home settings data")
  const simple = new Particle("foo bar")

  // Assert
  equal(subparticle.getCuePath(), "domains test.test.com pages home settings data")
  equal(subparticle.parent, parent)
  equal(subparticle.root, particle)
  equal(subparticle.getStack().length, 6)
  equal(simple.getParticle("foo").getStack().length, 1)
  equal(subparticle.getCuePathRelativeTo(parent), "data")
}

testParticles.getPathVector = equal => {
  // Arrange
  const particle = new Particle(testStrings.every)
  const indexPath = [5, 0, 4, 0, 0]
  const namePath = "domains test.test.com pages home settings"
  const parent = particle.getParticle(namePath)
  const subparticle = particle.getParticle("domains test.test.com pages home settings data")

  // Assert
  equal(parent.getPathVector().join(" "), indexPath.join(" "))
  equal(subparticle.getPathVector().join(" "), "5 0 4 0 0 0")
  equal(particle.particleAt(parent.getPathVector()), parent)
  equal(particle.particleAt(subparticle.getPathVector()), subparticle)

  // Act
  const newNamePath = particle.pathVectorToCuePath([5, 0, 4, 0, 0])

  // Assert
  equal(newNamePath.join(" "), namePath)
}

testParticles.getSlice = equal => {
  // Arrange
  const particle = new Particle(`a
b
c
d`)
  // Act/Assert
  equal(particle.getSlice(3, 4).asString, "d")
}

testParticles.has = equal => {
  // Arrange
  const particle = new Particle(`hello world
nested
foo 
deep
 test
  2`)

  // Assert
  equal(particle.has("hello"), true)
  equal(particle.has("world"), false)
  equal(particle.has("foo"), true)
  equal(particle.has("nested"), true)
  equal(particle.has("deep test 2"), true)
  equal(particle.has("deep test"), true)
  equal(particle.has("deep"), true)
  equal(particle.has("deep test 3"), false)
  equal(particle.has("deep t 2"), false)
}

testParticles.hasParticle = equal => {
  // Arrange
  const particle = new Particle(testStrings.every)
  equal(particle.hasParticle(`admin false`), true)
  equal(
    particle.hasParticle(`stage
 name home
 domain test.test.com`),
    true
  )
  equal(particle.hasParticle(`name Plato`), false)
  equal(particle.hasParticle(`domain test.test.com`), false)
}

testParticles.getStackString = equal => {
  const particle = new Particle(
    `Thing
 color
  blue
  green`
  )
  // Act/assert
  equal(
    particle.getParticle("Thing color green").getStackString(),
    `Thing
 color
  green`
  )
}

testParticles.getGraph = equal => {
  // Arrange
  const particle = new Particle(
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
  equal(particle.getParticle("Monkey").getAncestorParticlesByInheritanceViaExtendsCue("extends").length, 4)
  equal(particle.getParticle("Thing").getAncestorParticlesByInheritanceViaExtendsCue("extends").length, 1)
  equal(particle.getParticle("Animal").getAncestorParticlesByInheritanceViaExtendsCue("extends").length, 2)
}

testParticles.getGraphConventional = equal => {
  // Arrange
  const particle = new Particle(
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
  equal(particle.getParticle("Monkey").getAncestorParticlesByInheritanceViaColumnIndices(0, 1).length, 4)
  equal(particle.getParticle("Thing").getAncestorParticlesByInheritanceViaColumnIndices(0, 1).length, 1)
  equal(particle.getParticle("Animal").getAncestorParticlesByInheritanceViaColumnIndices(0, 1).length, 2)
}

testParticles.getGraphLoop = equal => {
  // Arrange
  const particle = new Particle(
    `Thing Animal
 color
Animal Thing
 dna`
  )

  // Act/Assert
  try {
    particle.getParticle("Animal").getAncestorParticlesByInheritanceViaColumnIndices(0, 1)
    equal(true, false, "Expected an error")
  } catch (err) {
    equal(true, true)
  }
}

testParticles.macroExpand = equal => {
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
  const expanded = new Particle(test).macroExpand("macro", "use")

  // Assert
  equal(
    expanded.asString,
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

testParticles.split = equal => {
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
  const test2 = test.split("\n").slice(1).join("\n") // Same without leading #file
  const particle = new Particle(test)
  const particle2 = new Particle(test2)

  // Act
  const splitParticles = particle.split(`#file`)
  const splitParticles2 = particle2.split(`#file`)

  // Assert
  equal(splitParticles.length, 3)
  equal(splitParticles2.length, 3)
  equal(new Particle(`abc\n#find`).split(`#fi`).length, 1, "should not split on partial matches")
  equal(new Particle(`abc\n#find\n`).split(`#find`).length, 2, "should split on end of line")
  equal(splitParticles[1].particleAt(1).getAtom(1), "hi")

  // Act/Assert
  equal(splitParticles.join("\n"), test)
  equal(splitParticles2.join("\n"), test2)

  // Arrange/Act/Assert
  Object.keys(testStrings).forEach(key => {
    const particle = new Particle(testStrings[key])
    const splitOn = particle.getCues()[0] || "foo"
    equal(particle.split(splitOn).join("\n"), particle.asString, `split join failed for ${key}`)
  })
}

testParticles.shifts = equal => {
  // Arrange
  const str = `reddit
table
chart`
  const particle = new Particle(str)

  // Act/Assert
  // Test Noops:
  equal(particle.shiftLeft() && particle.shiftRight() && particle.particleAt(0).shiftLeft() && true, true)

  equal(particle.length, 3)
  equal(particle.particleAt(1).shiftRight().parent.getLine(), "reddit")
  equal(particle.length, 2)

  // Act/Assert
  equal(particle.particleAtLine(1).shiftLeft().parent.asString, str)
  equal(particle.length, 3)

  // Arrange
  const str2 = `reddit
 table
 chart
 pie`
  const particle2 = new Particle(str2)

  // Act
  particle2.particleAtLine(2).shiftRight()
  particle2.particleAtLine(3).shiftRight()
  equal(particle2.particleAtLine(1).length, 2)

  // Arrange/Act/Assert
  equal(
    new Particle(`file foo.js
a = 2
b = 3
c = 4`)
      .particleAtLine(0)
      .shiftYoungerSibsRight().root.asString,
    `file foo.js
 a = 2
 b = 3
 c = 4`
  )

  // Arrange
  const particle9 = new Particle(`#file /foo/test-combined2.delete.js
foobar
 test
foo`)
  // Assert
  equal(particle9.particleAt(0).getYoungerSiblings().length, 2, "2 younger sibs")

  // Act
  particle9.particleAt(0).shiftYoungerSibsRight()
  // Assert
  const expected = `foobar
 test
foo`
  equal(particle9.particleAt(0).subparticlesToString(), expected)
}

testParticles.expandSubparticles = equal => {
  // Arrange
  const particle = new Particle(
    `Thing
 color
 ab
Animal Thing
 dna
 ab overridden`
  )
  // Act/Assert
  equal(
    particle._expandSubparticles(0, 1).asString,
    `Thing
 color
 ab
Animal Thing
 color
 ab overridden
 dna`
  )

  // Arrange
  const particle2 = new Particle(
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
    particle2._expandSubparticles(0, 1).asString,
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

  const badMap = new Particle(`foo
bar foo
car non-existant`)
  try {
    badMap._expandSubparticles(0, 1)
    equal(true, false, "expanding with missing id should throw")
  } catch (err) {
    equal(err.toString().includes("non-existant"), true, "expanding with missing id throws")
  }
}

testParticles.expandedShouldAppendNonMaps = equal => {
  // todo: we need to work on extend so its more straightforward
  // Arrange
  const particle = new Particle(
    `constructors
 example
 example foobar`
  )
  // Act/Assert
  equal(particle._expandSubparticles(0, 1).asString, particle.asString, "should have thrown")
}

testParticles.getCustomIndex = equal => {
  // todo: we need to work on extend so its more straightforward
  // Arrange
  const particle = new Particle(
    `coke
 id 123
 related 456
pepsi
 type soda
 id 456`
  )
  // Act/Assert
  equal(particle.getCustomIndex("id")["456"][0].get("type"), "soda", "custom indexes work")
  // AA
  equal(particle.toFlatObject()["pepsi.type"], "soda", "to flat object works")
}

testParticles.htmlDsl = equal => {
  // Arrange
  const html = new Particle("h1 hello world\nh1 hello world")
  var page = ""

  // Act
  html.forEach((particle: particlesTypes.particle) => {
    const property = particle.cue
    const value = particle.content
    page += "<" + property + ">" + value + "</" + property + ">"
  })

  // Assert
  equal(page, "<h1>hello world</h1><h1>hello world</h1>")
}

testParticles.indexOf = equal => {
  // Arrange
  const particle = new Particle("hello world")

  // Assert
  equal(particle.indexOf("hello"), 0)
  equal(particle.indexOf("hello2"), -1)

  // Act
  particle.touchParticle("color").setContent("")

  // Assert
  equal(particle.indexOf("color"), 1)

  // Act
  particle.appendLine("hello world")

  // Assert
  equal(particle.indexOf("hello"), 0)
  equal(particle.indexOfLast("hello"), 2)
}

testParticles.appendUniqueLine = equal => {
  // Arrange
  const particle = new Particle(`city Brockton`)
  // Act
  particle.appendUniqueLine("city Brockton")
  particle.appendUniqueLine("country United States")

  // Assert
  equal(particle.length, 2)
  equal(particle.get("country"), "United States")
}

testParticles.insert = equal => {
  // Arrange
  const particle = new Particle("hello world")

  // Act
  particle.insertLine("hi mom", 0)

  // Assert
  equal(particle.indexOf("hi"), 0, "Expected hi at position 0")

  // Insert using an index longer than the current object
  // Act
  particle.insertLine("test dad", 10)

  // Assert
  equal(particle.particleAt(2).content, "dad", "Expected insert at int greater than length to append")
  equal(particle.length, 3)

  // Insert using a negative index
  // Act
  particle.insertLine("test2 sister", -1)

  // Assert
  equal(particle.particleAt(2).content, "sister")
  equal(particle.particleAt(3).content, "dad")
}

testParticles.insertLinesAfter = equal => {
  // Arrange
  const particle = new Particle("hello world")

  // Act
  particle.getParticle("hello").insertLinesAfter(`config
 score 2`)

  // Assert
  equal(particle.get("config score"), "2", "Expected 2")
}

testParticles.last = equal => {
  // Arrange
  const value = new Particle("hello world\nhi mom")
  // Assert
  equal(value.particleAt(-1).content, "mom")

  // Arrange
  const value2 = new Particle("hello world\nhi mom")
  // Assert
  equal(value2.particleAt(-1).asString, "hi mom")
}

testParticles.lastProperty = equal => {
  // Arrange
  const value = new Particle("hello world\nhi mom")
  // Assert
  equal(value.particleAt(-1).cue, "hi")
}

testParticles.lastValue = equal => {
  // Arrange
  const value = new Particle("hello world\nhi mom")
  // Assert
  equal(value.particleAt(-1).content, "mom")
}

testParticles.createFromArray = equal => {
  // Arrange
  const a = new Particle([1, 2, 3])
  // Assert
  equal(a.asString, "0 1\n1 2\n2 3")

  // Arrange
  const b = new Particle({
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
  equal(b.asString, "data\n 0\n  charge 1\n 1\n  charge 2")
}

testParticles.createFromObject = equal => {
  // Arrange
  const particle = new Particle(testObjects.tsv)
  const date = new Date()
  const time = date.getTime()
  const particleWithDate = new Particle({ name: "John", date: date })

  // Assert
  equal(particle.getParticle("lowestScore").content, "-10")
  equal(particleWithDate.getParticle("date").content, time.toString())

  // Test against object with circular references
  // Arrange
  const a: any = { foo: "1" }
  const b = { bar: "2", ref: a }

  // Act
  // Create circular reference
  a.c = b
  const particle2 = new Particle(a)

  // Assert
  equal(particle2.getParticle("c bar").content, "2", "expected 2")
  equal(particle2.getParticle("c ref"), undefined)

  // Arrange
  const particle3 = new Particle()
  particle3.touchParticle("docs").setSubparticles(testObjects.json2particles)

  // Assert
  equal(particle3.asString, testStrings.json2particles, "expected json2particles")

  // Arrange
  const test4 = new Particle({ score: undefined })

  // Assert
  equal(test4.asString, "score", "expected blank")
}

testParticles.createFromParticle = equal => {
  // Arrange
  const a = new Particle("foo\n bar bam")
  const b = new Particle(a)

  // Assert
  equal(a.getParticle("foo bar").content, "bam")
  equal(b.getParticle("foo bar").content, "bam")

  // Act
  a.touchParticle("foo bar").setContent("wham")

  // Assert
  equal(a.getParticle("foo bar").content, "wham")
  equal(b.getParticle("foo bar").content, "bam")
}

testParticles.createFromString = equal => {
  // Arrange/Act
  const startsWithSpace = new Particle(" name john")

  // Assert
  equal(startsWithSpace.length, 1, "Expected 1 particle")

  // Arrange
  const a = new Particle("text \n this is a string\n and more")

  // Assert
  equal(a.getParticle("text").contentWithSubparticles, "\nthis is a string\nand more", "Basic")

  // Arrange
  const b = new Particle("a\n text \n  this is a string\n  and more")

  // Assert
  equal(b.getParticle("a text").contentWithSubparticles, "\nthis is a string\nand more")
  equal(b.asString, "a\n text \n  this is a string\n  and more")

  // Arrange
  const string = `first_name John
last_name Doe
subparticles
 1
  first_name Joe
  last_name Doe
  subparticles
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
  const c = new Particle(string)

  // Assert
  equal(c.getParticle("subparticles 1 subparticles 1 age").content, "12")
  equal(c.asString.length, string.length)
  equal(c.asString, string)

  // Arrange
  const d = new Particle("\n\na b\n")

  // Assert
  equal(d.asString, "\n\na b\n", "Expected extra newlines at start of string to be preserved")

  // Arrange
  const e = new Particle("a b\n\nb c\n")
  // Assert
  equal(e.asString, "a b\n\nb c\n", "Expected extra newlines in middle of string to be preserved")

  // Arrange
  const f = new Particle("a b\n\n\n")
  // Assert
  equal(f.asString, "a b\n\n\n", "Expected extra newlines at end of string to be preserved")

  // Arrange
  const g = new Particle("hi\n     somewhat invalid")
  // Assert
  equal(g.getParticle("hi ").content, "   somewhat invalid")

  const testCase = new Particle(testStrings.newLines)
  equal(testCase.asString.split("\n").length, 11, "All blank lines are preserved")
}

testParticles.protoRegression = equal => {
  // Arrange
  const a = `__proto__`
  const particle = new Particle(a)
  equal(particle.asString, a, "proto regression fixed")

  // Arrange
  const b = `constructor`
  const particle2 = new Particle(b)
  equal(particle2.asString, b, "constructor regression fixed")
}

testParticles.createFromStringExtraParticles = equal => {
  // Arrange
  const d = new Particle("one\ntwo\n  three\n    four\nfive six")
  // Assert
  equal(d.length, 3)
}

testParticles.copyTo = equal => {
  // Arrange
  const value = new Particle(
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
  const particle0 = value.getSubparticles()[0]

  // Act
  const particle = value.getSubparticles()[1].copyTo(particle0, particle0.length)
  value.getSubparticles()[1].destroy()

  // Assert
  equal(value.asString, expected)

  // Act
  particle.copyTo(particle0, 0)

  // Assert
  particle.destroy()
  equal(value.asString, expected2)
}

testParticles.braid = equal => {
  // Arrange
  const particle = new Particle(`score 1`)
  const particle2 = new Particle(`keyword number`)

  // Act/Assert
  equal(
    particle.toBraid([particle2]).asString,
    `score 1
keyword number`
  )
  equal(particle.toSideBySide([particle2]).asString, `score 1 keyword number`)
  equal(
    particle.toSideBySide([
      `foo

bar`
    ]).asString,
    `score 1 foo
        
        bar`
  )
}

testParticles.copyToRegression = equal => {
  // Arrange
  const particle = new Particle(
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

  const migrateParticle = (particle: particlesTypes.particle) => {
    if (!particle.cue.startsWith(">")) return true
    if (particle.length) {
      const cla = particle.getParticle("class").content
      if (cla) particle.setContent(cla)
      const css = particle.getParticle("css")
      if (css) {
        const particles = css.getSubparticles()
        const toMove: any = []
        particles.forEach((propParticle: particlesTypes.particle) => {
          const name = propParticle.cue.replace(":", " ")
          propParticle.setCue("@" + name)
          toMove.push(propParticle)
        })
        toMove.reverse()
        toMove.forEach((prop: particlesTypes.particle) => prop.copyTo(particle, 0))
      }
      particle.delete("class")
      particle.delete("css")
      particle.forEach(migrateParticle)
    }
  }

  // Act
  particle.forEach(migrateParticle)

  // Assert
  equal(particle.asString, expected)
}

testParticles.insertAtom = equal => {
  // Arrange
  const a = new Particle("? result chekThis 1 2").getParticle("?")
  // Act
  a.insertAtom(2, "checkThis")
  // Assert
  equal(a.getLine(), "? result checkThis chekThis 1 2")
}

testParticles.setAtom = equal => {
  // Arrange
  const a = new Particle("? result chekThis 1 2").getParticle("?")
  // Act
  a.setAtom(2, "checkThis")
  // Assert
  equal(a.getLine(), "? result checkThis 1 2")
}

testParticles.particleLanguageDependingOnParent = equal => {
  // Arrange
  class ReverseEtnParticle extends Particle {
    createParserPool() {
      return new Particle.ParserPool(Particle, {})
    }
  }

  class TestLanguage extends Particle {
    createParserPool() {
      return new Particle.ParserPool(ReverseEtnParticle, {})
    }
  }

  // Act
  // This tests against a regression, it should not throw.
  const iHateTypeScriptSometimes = <any>TestLanguage
  const program = new iHateTypeScriptSometimes(`foo
 bar`)
  // Assert.
  equal(program.length, 1)
}

testParticles.multiline = equal => {
  // Arrange
  const a = new Particle("my multiline\n string")
  // Assert
  equal(a.getParticle("my").contentWithSubparticles, "multiline\nstring")

  // Arrange
  const a2 = new Particle("my \n \n multiline\n string")
  // Assert
  equal(a2.getParticle("my").contentWithSubparticles, "\n\nmultiline\nstring")

  // Arrange
  const b = new Particle("brave new\n world")
  // Assert
  equal(b.getParticle("brave").contentWithSubparticles, "new\nworld", "ml value correct")
  equal(b.asString, "brave new\n world", "multiline does not begin with nl")

  // Arrange
  const c = new Particle("brave \n new\n world")
  // Assert
  equal(c.getParticle("brave").contentWithSubparticles, "\nnew\nworld", "ml begin with nl value correct")
  equal(c.asString, "brave \n new\n world", "multiline begins with nl")

  // Arrange
  const d = new Particle("brave \n \n new\n world")
  // Assert
  equal(d.getParticle("brave").contentWithSubparticles, "\n\nnew\nworld", "ml begin with 2 nl value correct")
  equal(d.asString, "brave \n \n new\n world", "multiline begins with 2 nl")

  // Arrange
  const e = new Particle("brave new\n world\n ")
  // Assert
  equal(e.getParticle("brave").contentWithSubparticles, "new\nworld\n", "ml value end with nl correct")
  equal(e.asString, "brave new\n world\n ", "multiline ends with a nl")

  // Arrange
  const f = new Particle("brave new\n world\n \n ")
  // Assert
  equal(f.getParticle("brave").contentWithSubparticles, "new\nworld\n\n", "ml value end with 2 nl correct")
  equal(f.asString, "brave new\n world\n \n ", "multiline ends with 2 nl")

  // Arrange
  const g = new Particle()
  g.touchParticle("brave").setContentWithSubparticles("\nnew\nworld\n\n")
  // Assert
  equal(g.getParticle("brave").contentWithSubparticles, "\nnew\nworld\n\n", "set ml works")
  equal(g.asString, "brave \n new\n world\n \n ", "set ml works")

  // Arrange/Act
  const twoParticles = new Particle("title Untitled\n")
  const k = new Particle()
  k.touchParticle("time").setContent("123")
  k.touchParticle("settings").setContentWithSubparticles(twoParticles.asString)
  k.touchParticle("day").setContent("1")

  // Assert
  equal(twoParticles.length, 2)
  equal(k.getParticle("settings").length, 1, "Expected subparticle to have 1 empty particle")
  equal(k.getParticle("settings").contentWithSubparticles, twoParticles.asString, "Expected setContentWithSubparticles and getText to work with newlines")
  equal(k.asString, `time 123\nsettings title Untitled\n \nday 1`)

  // Arrange
  const someText = new Particle("a")
  const someParticle = someText.getParticle("a")

  // Act
  someParticle.setContentWithSubparticles("const b = 1;\nconst c = 2;")

  // Assert
  equal(someText.asString, "a const b = 1;\n const c = 2;")
}

testParticles.order = equal => {
  // Arrange
  const a = new Particle("john\n age 5\nsusy\n age 6\nbob\n age 10")
  const types = a.getCues().join(" ")

  // Assert
  equal(types, "john susy bob", "order is preserved")
}

testParticles.parseParticle = equal => {
  // Arrange
  class LeafParticle extends Particle {}
  class SubclassParticle extends Particle {
    createParserPool() {
      return new Particle.ParserPool(SubclassParticle, {}, [{ regex: /^leaf/, parser: LeafParticle }])
    }
  }
  class TestLanguageParticle extends Particle {
    createParserPool() {
      return new Particle.ParserPool(TestLanguageParticle, {}, [
        { regex: /^particle/, parser: Particle },
        { regex: /^sub/, parser: SubclassParticle }
      ])
    }
  }

  // Act
  const iHateTypeScriptSometimes = <any>TestLanguageParticle
  const particle = new iHateTypeScriptSometimes(
    `foo bar
 foo bar
  particle bar
sub
 leaf`
  )

  // Assert
  equal(particle.getParticle("foo foo particle") instanceof Particle, true)
  equal(particle.getParticle("foo foo") instanceof TestLanguageParticle, true)
  equal(particle.getParticle("sub leaf") instanceof LeafParticle, true)
}

testParticles.prependLine = equal => {
  // Arrange
  const a = new Particle("hello world")
  // Assert
  equal(a.asString, "hello world")

  // Act
  const result = a.prependLine("foo bar")
  // Assert
  equal(a.asString, "foo bar\nhello world")
  equal(result instanceof Particle, true)
}

testParticles.getLocations = equal => {
  // Arrange/Act
  const a = new Particle(
    `hello
 world
ohayo
 good
  morning
  sunshine`
  )
  const b = a.getParticle("ohayo good sunshine")

  // Assert
  equal(a.getIndentLevel(), 0, "a indent level")
  equal(a.lineNumber, 0)
  equal(b.getIndentLevel(), 3, "b indent level")
  equal(b.lineNumber, 6)

  // Arrange
  const reg = new Particle(
    `a
 b
  c
d
 e`
  )

  // Act/Assert
  const result = reg.topDownArray.map((particle: particlesTypes.particle) => particle.lineNumber).join(" ")
  equal(result, "1 2 3 4 5")
  equal(reg.getParticle("a").lineNumber, 1)
}

testParticles.pushContentAndSubparticles = equal => {
  // Arrange
  const a = new Particle()

  // Act
  const result = a.pushContentAndSubparticles("hello world")

  // Assert
  equal(a.getParticle("0").content, "hello world")
  equal(result instanceof Particle, true)

  // Act
  a.pushContentAndSubparticles(undefined, new Particle())

  // Assert
  equal(a.getParticle("1") instanceof Particle, true, "1 is instance of Particle")
}

testParticles.remap = equal => {
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

  const map = new Particle(
    `d date
p price
c cost
v value
q quantity`
  )

  const expandMapObj = map.clone().toObject()
  const contractMap = map.clone().invert().toObject()

  // Act
  const remapped = new Particle(test)
  remapped.forEach((particle: particlesTypes.particle) => particle.remap(expandMapObj))

  const expected = remapped.clone()
  expected.forEach((particle: particlesTypes.particle) => particle.remap(contractMap))

  // Assert
  equal(test, expected.asString)
}

testParticles.rename = equal => {
  // Arrange
  const a = new Particle("john\n age 5\nsusy\n age 6\ncandy bar\nx 123\ny 45\n")
  const originalLength = a.length
  const originalString = a.asString
  const index = a.indexOf("john")

  // Assert
  equal(index, 0, "index okay")

  // Act
  equal(a.rename("john", "breck") instanceof Particle, true, "returns itself for chaining")
  a.rename("candy", "ice")

  // Assert
  const index2 = a.indexOf("breck")
  equal(index2, 0, "index okay")
  equal(a.getParticle("breck age").content, "5", "value okay")

  // Act
  a.rename("breck", "john")
  a.rename("ice", "candy")

  // Assert
  equal(a.length, originalLength, "Length unchanged")
  equal(a.asString, originalString, "String unchanged")

  // Arrange
  const b = new Particle(testStrings.renameTest)
  const originalString2 = b.asString

  // Act
  b.rename("dimensions", "columns")

  // Assert
  equal(b.asString, originalString2)

  // Arrange
  const c = new Particle("a\na\n")

  // Act
  c.rename("a", "b")
  c.rename("a", "b")

  // Assert
  equal(c.asString, "b\nb\n")
  equal(c.has("a"), false)
}

testParticles.renameAll = equal => {
  // Arrange
  const a = new Particle("hello world\nhello world")

  // Act
  a.renameAll("hello", "hey")

  // Assert
  equal(a.asString, "hey world\nhey world")
  equal(a.has("hello"), false)

  // Arrange
  const b = new Particle(`foo.particle
 age 23
foo.particle2
 age 24`)

  // Act
  b.getParticle("foo.particle2").renameAll("age", "bage")

  // Assert
  equal(b.get("foo.particle2 bage"), "24")
}

testParticles.reorder = equal => {
  // Arrange
  const a = new Particle("hello world")

  // Act
  a.touchParticle("hi").setContent("mom")

  // Assert
  equal(a.getCues().join(" "), "hello hi", "order correct")

  // Act
  a.insertLine("yo pal", 0)

  // Assert
  equal(a.getCues().join(" "), "yo hello hi", "order correct")

  // Act
  const result = a.insertLine("hola pal", 2)
  equal(result instanceof Particle, true)

  // Assert
  equal(a.getCues().join(" "), "yo hello hola hi", "order correct")
}

testParticles.next = equal => {
  // Arrange
  const a = new Particle(
    `john
 age 5
susy
 age 6
 score 100
bob
 age 10`
  )
  const b = a.getParticle("john")
  const c = a.getParticle("susy age")

  // Assert
  equal(a.next.asString, a.asString)
  equal(a.previous.asString, a.asString)
  equal(b.previous.cue, "bob")
  equal(b.previous.next.cue, "john")
  equal(b.next.cue, "susy")
  equal(c.next.cue, "score")
  equal(c.previous.cue, "score")
}

testParticles.reverse = equal => {
  // Arrange
  const particle = new Particle("hi mom\nhey sis\nhey dad")

  // Assert
  equal(particle.getParticle("hey").content, "dad")

  // Act
  particle.reverse()

  // Assert
  equal(particle.asString, "hey dad\nhey sis\nhi mom")
  equal(particle.getParticle("hey").content, "sis")

  // Test reverse when using internal types

  // Arrange
  const particle2 = Particle.fromCsv("name,age\nbill,20\nmike,40\ntim,30")

  // Act
  particle2.particleAt(0).reverse()

  // Assert
  equal(particle2.particleAt(0).particleAt(0).cue, "age", "Expected reversed properties")
  equal(particle2.particleAt(1).particleAt(0).cue, "name", "Expected unchanged properties")
}

testParticles.set = equal => {
  // Arrange
  const particle = new Particle("hello world")

  // Assert
  equal(particle.getParticle("hello").content, "world")
  equal(particle.touchParticle("hello").setContent("mom") instanceof Particle, true, "set should return instance so we can chain it")
  equal(particle.getParticle("hello").content, "mom")

  // Act
  particle.touchParticle("boom").setContent("")
  // Assert
  equal(particle.getParticle("boom").content, "", "empty string")

  // Act
  particle.touchParticle("head style color").setContent("blue")
  // Assert
  equal(particle.getParticle("head style color").content, "blue", "set should have worked")

  // Test dupes
  // Arrange
  particle.appendLine("hello bob")

  // Act
  particle.touchParticle("hello").setContent("tim")

  // Assert
  equal(particle.getParticle("hello").content, "tim", "Expected set to change last occurrence of property.")

  // TEST INT SCENARIOS
  // Arrange
  const particle2 = new Particle()

  // Act
  particle2.touchParticle("2").setContent("hi")
  particle2.touchParticle("3").setContent("3")
  // Assert
  equal(particle2.getParticle("2").content, "hi")
  equal(particle2.getParticle("2").content, "hi")
  equal(particle2.getParticle("3").content, "3")

  // TEST SPACEPATH SCENARIOS
  // Arrange
  const particle3 = new Particle("style\n")
  // Act
  particle3.touchParticle("style color").setContent("red")
  particle3.touchParticle("style width").setContent("100")

  // Assert
  equal(particle3.getParticle("style color").content, "red")
  equal(particle3.getParticle("style width").content, "100")

  // TEST ORDERING
  // Arrange
  const particle4 = new Particle("hello world")
  // Act
  particle4.touchParticle("hi").setContent("mom")
  // Assert
  equal(particle4.getCues().join(" "), "hello hi", "order correct")

  // Act
  particle4.insertLine("yo pal", 0)
  // Assert
  equal(particle4.getCues().join(" "), "yo hello hi", "order correct")

  // Act
  particle4.insertLine("hola pal", 2)
  // Assert
  equal(particle4.getCues().join(" "), "yo hello hola hi", "order correct")

  // Arrange
  const particle5 = new Particle()
  // Act
  particle5.touchParticle("hi").setContent("hello world")
  particle5.touchParticle("yo").setSubparticles(new Particle("hello world"))
  // Assert
  equal(particle5.getParticle("hi").content === particle5.getParticle("yo").content, false)

  // Arrange
  const particle6 = new Particle()

  // Act
  particle6.touchParticle("meta x").setContent("123")
  particle6.touchParticle("meta y").setContent("1235")
  particle6.touchParticle("meta c").setContent("435")
  particle6.touchParticle("meta x").setContent("1235123")

  // Assert
  equal(particle6.getParticle("meta c").content, "435")

  // Arrange
  const particle7 = new Particle("name John\nage\nfavoriteColors\n blue\n  blue1 1\n  blue2 2\n green\n red 1\n")

  // Act
  particle7.touchParticle("favoriteColors blue").setContent("purple").asString

  // Assert
  equal(particle7.getParticle("favoriteColors blue").content, "purple")

  // Act
  particle7.touchParticle(" blanks").setContent("test")
  particle7.touchParticle(" \nboom").setContent("test2")

  // Assert
  equal(particle7.getParticle(" blanks").content, "test", "Expected blank paths to be settable")
  equal(particle7.getParticle(" boom").content, "test2", "Expected newlines in path to be sanitized")

  // Arrange/Act
  const boom = new Particle("")
  boom.touchParticle("description").setContent("some text with a \nnewline")

  // Assert
  equal(new Particle(boom.asString).length, 1)

  // Test Blanks
  // Arrange
  const blank = new Particle()
  blank.touchParticle("").setContent("")

  // Assert
  equal(blank.length, 1, "Expected blanks to work")
  equal(blank.asString, " ", "Expected blanks to work")
}

testParticles.setFromArray = equal => {
  // Arrange/Act
  const boom = new Particle([{ description: "some text with a \nnewline" }])
  const output = boom.asString

  // Assert
  equal(new Particle(output).length, 1)
}

testParticles.set = equal => {
  // Arrange
  const particle = new Particle(`title Foo`)

  // Act
  particle.set("body div h1", "Hello world")

  // Assert
  equal(
    particle.asString,
    `title Foo
body
 div
  h1 Hello world`
  )
}

testParticles.setFromText = equal => {
  // Arrange
  const str = `john doe
 age 50`
  const particle = new Particle(str)
  const particle2 = particle.getParticle("john")

  // Act
  particle.setFromText(str)

  // Assert
  equal(particle.asString, str)

  // Act
  particle2.setFromText("john")

  // Assert
  equal(particle2.asString, "john")
}

testParticles.shift = equal => {
  // Arrange
  const particle = new Particle(
    `john
 age 5
susy
 age 6
bob
 age 10`
  )

  const empty = new Particle()

  // Act/Assert
  equal(particle.length, 3, "length ok")
  equal(
    particle.shift().asString,
    `john
 age 5`,
    "expected correct string returned"
  )
  equal(particle.length, 2)
  equal(empty.shift(), null)

  // Arrange
  const one = new Particle("first\n nested")

  // Act
  one.getParticle("first").shift()

  // Assert
  equal(one.getParticle("first").length, 0)
  equal(one.asString, "first")
}

testParticles.sort = equal => {
  // Arrange
  const particle = new Particle("john\n age 5\nsusy\n age 6\nbob\n age 10")
  // Assert
  equal(particle.getCues().join(" "), "john susy bob")
  // Act
  particle.sort((a: particlesTypes.particle, b: particlesTypes.particle) => (b.cue < a.cue ? 1 : b.cue === a.cue ? 0 : -1))
  // Assert
  equal(particle.getCues().join(" "), "bob john susy")
}

testParticles.sortBy = equal => {
  // Arrange
  const particle = new Particle("john\n age 5\nsusy\n age 6\nbob\n age 10\nsam\n age 21\nbrian\n age 6")
  // Assert
  equal(particle.getCues().join(" "), "john susy bob sam brian")

  // Act
  particle.sortBy(["age"])

  // Assert
  equal(particle.getCues().join(" "), "bob sam john susy brian")

  // Sort by multiple properties
  // Arrange
  const particle2 = new Particle(testStrings.sortByMultiple)

  // Act
  particle2.sortBy(["name", "date"])

  // Assert
  equal(particle2.getColumn("key").join(""), "cab")

  // Act
  particle2.sortBy(["name", "key"])

  // Assert
  equal(particle2.getColumn("key").join(""), "acb")
}

testParticles.cueSort = equal => {
  // Arrange
  const particle = new Particle(`body
footer
div
header
div`)
  // Act
  particle.cueSort("header body div footer".split(" "))
  // Assert
  equal(
    particle.asString,
    `header
body
div
div
footer`
  )
}

testParticles.syntax = equal => {
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
  const a = new Particle(test)
  const test2 = `person;=name=Breck;=country=USA;=books;==one=SICP;==two=Pragmatic;=num=12;=multiline=this=is=a=string;==over=multiple=lines.;=====and=this=one=has=extra=indents;=num=12;`

  class TestLanguage extends Particle {
    get atomBreakSymbol() {
      return "="
    }

    get particleBreakSymbol() {
      return ";"
    }

    get edgeSymbol() {
      return "="
    }
  }

  // Act
  const iHateTypeScriptSometimes = <any>TestLanguage
  const b = new iHateTypeScriptSometimes(test2)

  // Assert
  equal(b.getParticle("person=country").content, "USA")
  equal(a.toString(undefined, b), test2, "syntax conversion works")

  // Assert
  equal(a.toString(undefined, b), b.asString)

  // Assert
  equal(b.toString(undefined, a), test)
}

testParticles.toCsv = equal => {
  // Arrange
  const a = new Particle(testStrings.delimited)
  // Act/Assert
  equal(a.asCsv, testStrings.csv, "Expected correct csv")

  // Arrange
  const b = new Particle([{ lines: "1\n2\n3" }])
  // Act/equal
  equal(b.asCsv, `lines\n"1\n2\n3"`)
}

testParticles.getOneHot = equal => {
  // Arrange
  const a = Particle.fromCsv(Particle.iris)
  // Act
  const col = a.getOneHot("species").getColumn("species_setosa")

  // Assert
  equal(col.length, 10)
  equal(col[0], "0")
  equal(col[9], "1")
}

testParticles.deleteColumn = equal => {
  // Arrange
  const a = Particle.fromCsv(Particle.iris)
  // Assert
  equal(a.getColumnNames().length, 5)

  // Act
  a.deleteColumn("species")

  // Assert
  equal(a.getColumnNames().length, 4)
}

testParticles.toTable = equal => {
  // Arrange
  const a = Particle.fromCsv("name,score,color\n" + testStrings.csvNoHeaders)
  // Act/Assert
  equal(a.asTable, testStrings.toTableLeft, "Expected correct spacing")
  equal(a.toFormattedTable(100, true), testStrings.toTable, "Expected correct spacing")

  // Arrange
  const b = Particle.fromCsv("name\njoe\nfrankenstein")
  // Act/Assert
  equal(b.toFormattedTable(1, false), "n...\nj...\nf...", "Expected max width to be enforced")
}

testParticles.nest = equal => {
  // Arrange/Act
  const testStr2 = `html
 head
  body
   h3${Particle.nest("", 3)}
   h1${Particle.nest("h2 2", 3)}`
  const test = new Particle(testStr2)

  // Assert
  equal(test.getParticle("html head body").length, 3)
  equal(test.getParticle("html head body h2").content, "2")

  equal(new Particle(`${Particle.nest("foo bar", 0)}`).getParticle("foo").content, "bar")
  equal(new Particle(`${Particle.nest("foo bar", 1)}`).getParticle(" foo").content, "bar")
  equal(new Particle(`${Particle.nest("foo bar", 2)}`).particleAt([0, 0]).content, "foo bar")
}

testParticles.hashes = equal => {
  // Arrange/Act/Assert
  equal(typeof new Particle("hi").murmurHash, "string")
}

testParticles.toDataTable = equal => {
  // Arrange
  const data = [
    ["name", "age", "score"],
    ["coke", 29, 86],
    ["pepsi", 48, 16],
    ["soda", 32, 43]
  ]

  // Act
  const particle = Particle.fromDataTable(data)

  // Assert
  equal(particle.getParticle("2 age").content, "32")

  // Act
  const dt = particle.toDataTable()

  // Assert
  equal(dt[2][2], 16)
  equal(dt[0][1], "age")
  equal(dt[3][0], "soda")
}

testParticles.toObject = equal => {
  // Arrange
  const a = new Particle("hello world")
  const b = new Particle("foo bar")

  // Assert
  equal(typeof a.toObject(), "object")
  equal(a.toObject()["hello"], "world")

  // Act
  a.touchParticle("b").setSubparticles(b)
  // Assert
  equal(a.toObject()["b"]["foo"], "bar")

  // Arrange
  const objectWithParticlesAndValues = `div
 input checked
  type checkbox`

  // Act
  const obj = new Particle(objectWithParticlesAndValues).toObject()

  // Assert
  equal(typeof obj.div.input, "string")
}

testParticles.toSsv = equal => {
  // Arrange
  const a = new Particle(testStrings.delimited)
  // Assert
  equal(a.asSsv, testStrings.ssv)
  const b = new Particle([{ name: "john", age: 12 }])
  equal(!!b.asSsv, true)
}

testParticles.toMarkdownTable = equal => {
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
  const particle = new Particle(test)

  // Act
  const simple = particle.asMarkdownTable
  const table = particle.toMarkdownTableAdvanced(["title", "date", "location", "website"], (value: any, row: any, col: any) => (row ? value : Utils.ucfirst(value)))

  // Assert
  equal(table, expected, "markdown ok")
  equal(simple, simpleExpected, "markdown simple ok")
}

testParticles.setContentWithSubparticlesRegression = equal => {
  // Arrange
  const particle = new Particle("hello world")
  const hello = particle.getParticle("hello")
  // Act
  hello.setContentWithSubparticles(
    `brave
 new world`
  )
  hello.setContentWithSubparticles(`earth`)
  // Assert
  equal(particle.asString, "hello earth")
}

testParticles.sections = equal => {
  // Arrange
  const particle = new Particle(`push
End of post

push
footer.scroll
// done`)
  // Act
  particle
    .getParticles("push")
    .map((particle: any) => particle.section)
    .map((section: any) => section.forEach((particle: any) => particle.destroy()))
  // Assert
  equal(particle.asString, "push\n\npush")
}

testParticles.toStringMethod = equal => {
  // Arrange
  const particle = new Particle("hello world")
  // Assert
  equal(particle.asString, "hello world", "Expected correct string.")
  equal(particle.toStringWithLineNumbers(), "1 hello world")
  // Act
  particle.touchParticle("foo").setContent("bar")
  // Assert
  equal(particle.asString, "hello world\nfoo bar")

  // Arrange
  const particle2: any = new Particle("z-index 0")
  // Act
  particle2["z-index"] = 0
  // Assert
  equal(particle2.asString, "z-index 0")

  // Test empty values
  // Arrange
  const particle3 = new Particle()

  // Act
  particle3.touchParticle("empty").setContent("")
  // Assert
  equal(particle3.asString, "empty ")

  // Arrange
  const a = new Particle("john\n age 5")
  // Assert
  equal(a.asString, "john\n age 5")

  // Arrange
  const r = new Particle("joe\njane\njim")
  // Act/Assert
  equal(!!r.asString, true)

  // Act
  a.touchParticle("multiline").setContentWithSubparticles("hello\nworld")
  // Assert
  equal(a.asString, "john\n age 5\nmultiline hello\n world")

  // Act
  a.touchParticle("other").setContent("foobar")
  // Assert
  equal(a.asString, "john\n age 5\nmultiline hello\n world\nother foobar")

  // Arrange
  const b = new Particle("a\n text \n  this is a multline string\n  and more")
  // Assert
  equal(b.asString, "a\n text \n  this is a multline string\n  and more")

  // Test setting an instance as a value in another instance
  // Act
  a.touchParticle("even_more").setSubparticles(b)
  // Assert
  equal(a.asString, "john\n age 5\nmultiline hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more")

  // Arrange
  const testCases = ["", "\n", "\n\n", "\n \n ", "   \n   \n", "foo\nbar\n\n", "\n\n foo \nbar\n"]

  // Act/Assert
  testCases.forEach(someStr => equal(new Particle(someStr).asString, someStr, "Expected identity"))

  // Arrange
  const str = "view\n type bar"
  const particleView = new Particle(str).getParticle("view")
  // Act/Assert
  equal(particleView.asString, str)
}

testParticles.asHtml = equal => {
  // Arrange
  const particle = new Particle("hello world")
  // Act
  const str = particle.asHtml
  // Assert
  equal(str.includes("<span"), true)

  // Arrange
  const parent = new Particle(testStrings.every)

  // Assert
  equal(parent.asHtml.includes("5 0 4 0 0"), true)
}

testParticles.toTsv = equal => {
  // Arrange
  const a = new Particle(testStrings.delimited)
  // Assert
  equal(a.asTsv, testStrings.tsv)
}

testParticles.toXml = equal => {
  // Arrange
  const a = new Particle(testStrings.toXml)
  // Assert
  equal(a.asXml, testStrings.toXmlPrettyResult)
}

testParticles.windowsReturnChars = equal => {
  // Arrange
  const particle = new Particle(
    `one
\r
\rtwo
\r
\r
\rthree`
  )

  // Assert
  equal(particle.length, 6)
}

testParticles.traverse = equal => {
  // Arrange
  const traversal = new Particle(
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
  const preOrder = traversal.topDownArray.map((particle: particlesTypes.particle) => particle.getLine()).join(" ")
  const postOrder = traversal
    .getSubparticlesFirstArray()
    .map((particle: particlesTypes.particle) => particle.getLine())
    .join(" ")
  const breadthfirst = traversal
    .getParentFirstArray()
    .map((particle: particlesTypes.particle) => particle.getLine())
    .join(" ")

  // Assert
  equal(preOrder, "0 01 02 020 021 1 10 11 110 12 2", "expected topDown visiting to work")
  equal(postOrder, "01 020 021 02 0 10 110 11 12 1 2", "expected postOrder visiting to work")
  equal(breadthfirst, "0 1 2 01 02 10 11 12 020 021 110", "expected breadthfirst visiting to work")

  // Arrange
  const wikipediaBinaryTree = new Particle(
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
  const wikipreorder = wikipediaBinaryTree.topDownArray.map((particle: particlesTypes.particle) => particle.getLine()).join("")
  const wikibreadthfirst = wikipediaBinaryTree
    .getParentFirstArray()
    .map((particle: particlesTypes.particle) => particle.getLine())
    .join("")
  const wikipostorder = wikipediaBinaryTree
    .getSubparticlesFirstArray()
    .map((particle: particlesTypes.particle) => particle.getLine())
    .join("")

  // Assert
  equal(wikipreorder, "fbadcegih")
  equal(wikibreadthfirst, "fbgadiceh")
  equal(wikipostorder, "acedbhigf")
}

testParticles.toOutline = equal => {
  // AAA
  equal(typeof new Particle(testStrings.every).asOutline, "string")
}

testParticles.fromJsonSubset = equal => {
  // AAA
  equal(Particle.fromJsonSubset(JSON.stringify(testObjects.json2particles)).asString, new Particle(testStrings.json2particles).getParticle("docs").subparticlesToString())
}

testParticles.getFiltered = equal => {
  // AAA
  equal(
    new Particle(`a
a
a
b
 a
b
 a
c`).getFiltered((particle: particlesTypes.particle) => particle.cue === "a").length,
    3
  )
}

testParticles.deleteDuplicates = equal => {
  // AAA
  equal(
    new Particle(`a
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

testParticles.fromShape = equal => {
  // AAA
  equal(
    Particle.fromShape([2, 2]).asString,
    `0
 0
 1
1
 0
 1`
  )
}

testParticles.getFrom = equal => {
  // Arrange
  const particle = new Particle(
    `name
 string title The book of
 string person Jai`
  )
  // Act/Assert
  equal(particle.particleAt(0).getFrom("string person"), "Jai")
}

testParticles.toOutline = equal => {
  // Arrange
  const particle = new Particle(
    `hello
 world`
  )

  // Act/assert
  equal(
    particle.asOutline,
    `└hello
 └world
`
  )
  equal(
    particle.toMappedOutline((particle: particlesTypes.particle) => "o"),
    `└o
 └o
`
  )
}

testParticles.getLineOrSubparticlesModifiedTime = equal => {
  // Arrange
  const a = new Particle(`text
 foo
  bar
some
 other`)
  const mtime = a.getLineOrSubparticlesModifiedTime()
  const fooTime = a.getParticle("text foo").getLineOrSubparticlesModifiedTime()

  // Act
  a.delete("some other")

  // Assert
  const newTime = a.getLineOrSubparticlesModifiedTime()
  equal(newTime > mtime, true, `newtime is greater than mtime ${newTime} ${mtime}`)
  equal(a.getParticle("text foo").getLineOrSubparticlesModifiedTime() === fooTime, true, "times are equal")

  // Act
  a.getParticle("text foo").setContent("wham")

  // Assert
  equal(a.getParticle("text foo").getLineOrSubparticlesModifiedTime() > fooTime, true, "mod subparticle updates")

  // Arrange
  const b = new Particle(`foo`)
  b.appendLine("bar")
  const bTime = b.getLineOrSubparticlesModifiedTime()

  // Act
  b.getParticle("foo").destroy()

  // Assert
  equal(b.getLineOrSubparticlesModifiedTime() > bTime, true, `time increased from ${bTime} to ${b.getLineOrSubparticlesModifiedTime()}`)
}

testParticles.destroyLoop = equal => {
  // Arrange
  const a = new Particle(`a
 d
b
 d
c
 d`)
  // Act
  a.forEach((subparticle: particlesTypes.particle) => {
    subparticle.destroy()
  })

  // Assert
  equal(a.length, 0)
}

testParticles.typeTests = equal => {
  // Arrange
  const a = new Particle("text")
  // Assert
  equal(a.getErrors().length, 0)
  equal(a.lineAtomTypes, "undefinedAtomType") // todo: make this a constant
}

testParticles.setTests = equal => {
  let base = new Particle(`foo bar`).particleAt(0)
  equal(base.getAtomsAsSet().has("bar"), true)
  equal(base.getAtomsAsSet().has("bar2"), false)
  equal(base.appendAtomIfMissing("bar").asString, `foo bar`)
  equal(base.appendAtomIfMissing("bam").getAtomsAsSet().has("bam"), true, "atom should be appended")
}

testParticles.getBiDirectionalMaps = equal => {
  const csv = Particle.fromCsv(Particle.iris)
  const maps = csv.getBiDirectionalMaps("species", "sepal_length")
  equal(maps[0]["versicolor"][0], "5.6")
  equal(maps[1]["5.6"][0], "versicolor")
}

testParticles.delimitedTests = equal => {
  let base = new Particle(`foo.csv`).particleAt(0)
  equal(base.addObjectsAsDelimited([{ name: "Joe", age: 100 }]).asString, `foo.csv\n name,age\n Joe,100`)

  base = new Particle(`foo.csv`).particleAt(0)
  equal(base.setSubparticlesAsDelimited(`person\n name Joe\n age 100`).asString, `foo.csv\n name,age\n Joe,100`)

  let template = `foo.csv\n person\n  name Joe\n  age 100`

  base = new Particle(template).particleAt(0)
  equal(base.convertSubparticlesToDelimited().asString, `foo.csv\n name,age\n Joe,100`, "convert subparticles to delimited works")

  base = new Particle(template).particleAt(0)
  equal(base.convertSubparticlesToDelimited().addUniqueRowsToNestedDelimited(`name,age`, [`Frank,100`]).length, 3)

  base = new Particle(template).particleAt(0)
  equal(base.convertSubparticlesToDelimited().addUniqueRowsToNestedDelimited(`name,age`, [`Joe,100`]).length, 2)
}

testParticles.printLines = equal => {
  // Arrange
  let lastLogMessage = ""
  const orig = console.log
  console.log = (msg: string) => (lastLogMessage += msg + "\n")
  const a = new Particle(`text\n hello`)
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

testParticles.with = equal => {
  // Arrange
  const dummy = new Particle(`0
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

testParticles.extendible = equal => {
  // Arrange
  const a = new ExtendibleParticle(`a
 color red
b
 extends a`)
  // Assert
  equal(
    a._getLineage().asString,
    `a
 b`
  )
}

testParticles.toComparison = equal => {
  equal(new Particle(testStrings.webpage).toComparison(testStrings.webpage).asString.trim().length, 0, "should be equal")
}

testParticles.isBlank = equal => {
  // Arrange
  const a = new Particle("text\n\ntest \ntest2  ")
  // Assert
  equal(a.particleAt(0).isBlankLine(), false)
  equal(a.particleAt(1).isBlankLine(), true)
  equal(a.particleAt(0).isEmpty(), true)
  equal(a.particleAt(0).isEmpty(), true)
  equal(a.isEmpty(), false)
  equal(a.isBlankLine(), false)
  equal(a.getParticle("test").isBlankLine(), false)
  equal(a.getParticle("test").isEmpty(), true)
  equal(a.getParticle("test2").isBlankLine(), false)
  equal(a.getParticle("test2").isEmpty(), false)

  // Act/Assert
  equal(a.deleteSubparticles().length, 0)
}

testParticles.particles = equal => {
  // Arrange
  const a = new Particle("text")
  const particle = a.particleAt(0)
  const originalMtime = particle.getLineModifiedTime()

  // Assert
  equal(originalMtime > 0, true)
  equal(particle.isTerminal(), true)
  equal(particle.cue, "text")
  equal(particle.content, undefined)
  equal(particle.length, 0)

  // Act
  particle.setContent("hello world")

  // Assert
  equal(particle.content, "hello world")
  equal(a.asString, "text hello world")

  // Act
  particle.setSubparticles("color blue")
  particle.setSubparticles("color blue")

  // Assert
  equal(particle.isTerminal(), false)
  equal(particle.subparticlesToString(), "color blue")
  equal(a.asString, "text hello world\n color blue")
  equal(a.has("text"), true)

  // Act
  const mtime = particle.getLineModifiedTime()
  particle.setCue("foo")

  // Assert
  equal(a.asString, "foo hello world\n color blue")
  equal(particle.getLineModifiedTime() > mtime, true)
  equal(a.has("text"), false)
  equal(particle.has("color"), true)

  // Act
  particle.setSubparticles("")

  // Assert
  equal(!!particle.asString, true)
  equal(particle.has("color"), false)
}

testParticles.mTimeNotIncrementingRegressionTest = equal => {
  // Arrange
  const particle = new Particle("text").particleAt(0)
  let lastMTime = particle.getLineModifiedTime()
  const numOfTrials = 100
  // Previously we would get a flakey test about every 10k trials
  for (let i = 0; i < numOfTrials; i++) {
    particle.setContent(i.toString())
    let newMTime = particle.getLineModifiedTime()

    // Assert
    equal(newMTime > lastMTime, true, "mtime should have increased")
    lastMTime = newMTime
  }
}

testParticles.asyncUndoRedo = async equal => {
  // Arrange
  const particle = new Particle("hello world")

  // Assert
  await particle.saveVersion()
  equal(particle.getChangeHistory().length, 1)
  equal(particle.hasUnsavedChanges(), false)

  // Act
  particle.set("hello", "earth")
  equal(particle.hasUnsavedChanges(), true)
  await particle.saveVersion()
  // Assert
  equal(particle.getChangeHistory().length, 2)
  equal(particle.get("hello"), "earth")
  equal(particle.hasUnsavedChanges(), false)
  // Act
  await particle.undo()
  // Assert
  equal(particle.get("hello"), "world")
  equal(particle.hasUnsavedChanges(), true)
  // Act
  await particle.undo()
  // Assert
  equal(particle.get("hello"), "world")
  // Act
  await particle.redo()
  // Assert
  equal(particle.get("hello"), "earth")
  // Act
  await particle.redo()
  // Assert
  equal(particle.get("hello"), "earth")
}

testParticles.asSExpression = equal => {
  // Test basic nodes with just cue and content
  equal(new Particle("foo 1").asSExpression, "((foo 1))", "basic node conversion")

  // Test nodes with single child
  equal(new Particle("foo 1\n bar 2").asSExpression, "((foo 1 (bar 2)))", "node with single child")

  // Test nodes with multiple children
  equal(new Particle("foo\n bar 1\n baz 2").asSExpression, "((foo (bar 1) (baz 2)))", "node with multiple children")

  // Test deep nesting
  equal(new Particle("foo\n bar\n  baz 3").asSExpression, "((foo (bar (baz 3))))", "deeply nested nodes")

  // Test nodes without content
  equal(new Particle("foo\n bar").asSExpression, "((foo (bar)))", "nodes without content")

  // Test complex mixed case
  equal(new Particle("root 1\n first 2\n  inner 3\n  other 4\n second 5").asSExpression, "((root 1 (first 2 (inner 3) (other 4)) (second 5)))", "complex mixed nesting")

  // Test empty particle
  equal(new Particle("").asSExpression, "()", "empty particle")

  // Test node with content containing spaces
  equal(new Particle("title Hello World").asSExpression, "((title Hello World))", "content with spaces")

  // Test realistic example with mixed content types
  const webpage = new Particle(`html
 head
  title My Page
 body
  div
   class main
   content Hello world`)

  equal(webpage.asSExpression, "((html (head (title My Page)) (body (div (class main) (content Hello world)))))", "realistic webpage example")

  // Test a node with blank/empty children
  equal(new Particle("parent\n child1\n child2 \n child3").asSExpression, "((parent (child1) (child2 ) (child3)))", "handling empty/blank child nodes")

  // Test numbers and special characters in content
  equal(new Particle("math\n sum 2+2=4\n pi 3.14159").asSExpression, "((math (sum 2+2=4) (pi 3.14159)))", "handling numbers and special characters")
}

testParticles.trim = equal => {
  // Arrange/Act/Assert
  const particle = new Particle("\n\n\n")
  equal(particle.length, 4)
  equal(particle.trim().length, 0)

  const particle2 = new Particle(testStrings.webpage)
  equal(particle2.length, particle2.trim().length)
}

testParticles.queryMethods = equal => {
  // Arrange
  const particle = <any>Particle.fromCsv(Particle.iris)

  // Act/Assert
  let result = particle.select(["sepal_width", "species"]).where("sepal_width", ">", 3.7)
  equal(result.length, 1)
  equal(result.particleAt(0).get("species"), "virginica")

  // Act/Assert
  equal(particle.select(["sepal_width"]).length, 10)
  equal(particle.where("sepal_width", "<", 3.7).length, 8)
  equal(particle.where("sepal_width", ">=", 3.7).length, 2)
  equal(particle.where("sepal_width", "<=", 3.7).length, 9)
  equal(particle.where("sepal_width", "=", 3.7).length, 1)
  equal(particle.where("sepal_width", "!=", 3.7).length, 9)
  equal(particle.where("species", "=", "setosa").length, 3)
  equal(particle.where("sepal_width", "in", [3.7, 3.8]).length, 2, "in test")
  equal(particle.where("sepal_width", "notIn", [3.7, 3.8]).length, 8, "not in test")
  equal(particle.where("species", "includes", "vers").length, 1)
  equal(particle.where("species", "doesNotInclude", "vers").length, 9, "does not include")
  equal(particle.where("species", "notEmpty").length, 10)
  equal(particle.where("species", "empty").length, 0)
  equal(particle.where("foobar", "empty").limit(10).length, 10)
  equal(particle.where("foobar", "empty").limit(20).length, 10)
  equal(particle.where("foobar", "empty").where("species", "includes", "vers").length, 1, "nesting works")

  equal(
    new Particle(`boston
 wp
  id Boston`).where("wp id", "notEmpty").length,
    1
  )

  equal(particle.where("sepal_width", "!=", 3.7).first(3).select("species").last(1).sortBy("species").particleAt(0).get("species"), "virginica", "last and first work")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
