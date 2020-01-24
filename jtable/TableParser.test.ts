#!/usr/bin/env ts-node

import { TableParser } from "./TableParser"

const { jtree } = require("../index.js")

import { treeNotationTypes } from "../products/treeNotationTypes"

const testTree: treeNotationTypes.testTree = {}

testTree.windowsLineEndings = equal => {
  // Arrange
  const str = "A,B\n1,3"
  const str2 = "A,B\n\r1,3"
  // Act
  const result = new TableParser().parseTableInputsFromString(str, <any>"csv")
  const result2 = new TableParser().parseTableInputsFromString(str2, <any>"csv")

  // Assert
  equal((<any>result.rows[0])["A"], "1")
  equal((<any>result.rows[0])["B"], "3")
  equal((<any>result2.rows[0])["A"], "1")
  equal((<any>result2.rows[0])["B"], "3")
}

testTree.all = equal => {
  // Arrange
  const parser = new TableParser()

  // Act/Assert
  const results = parser.parseTableInputsFromString("")

  // Assert
  equal(results.rows.length, 0)
  // csv

  // Arrange
  const parser2 = new TableParser()

  // Act
  const tests = `name,age
breck,33
mairi,25

[{"name": "breck", "age" : 33}, {"name" : "mairi", "age": 25}]

name age
breck 33
mairi 25

name\tage
breck\t32
mairi\t25

<row>
 <name>bob</name></row>
<row>
 <name>bob</name></row>
`.split("\n\n")

  // Act/Assert
  tests.forEach(test => {
    const rows = parser2.parseTableInputsFromString(test)
    const results2 = parser2.guessProbabilitiesForAllTableParsers(test)
    equal(rows.rows.length, 2)
  })
  // regressionFromTopCommandOutput

  // Arrange
  const input = `Processes: 334 total, 2 running, 332 sleeping, 1539 threads 
2017/04/16 10:49:44
Load Avg: 1.98, 1.67, 1.54 
CPU usage: 11.66% user, 28.33% sys, 60.0% idle 
SharedLibs: 151M resident, 35M data, 23M linkedit.
MemRegions: 61998 total, 3938M resident, 95M private, 1019M shared.
PhysMem: 8134M used (1758M wired), 55M unused.
VM: 912G vsize, 627M framework vsize, 2321910(0) swapins, 2678272(0) swapouts.
Networks: packets: 5750663/6840M in, 2839820/590M out.
Disks: 882267/25G read, 920361/29G written.

PID    COMMAND          %CPU TIME     #TH   #WQ #PORTS MEM    PURG   CMPRS  PGRP  PPID  STATE    BOOSTS      %CPU_ME %CPU_OTHRS UID FAULTS   COW     MSGSENT    MSGRECV    SYSBSD    SYSMACH    CSW        PAGEINS IDLEW    POWER USER             #MREGS RPRVT VPRVT VSIZE KPRVT KSHRD`

  const parser3 = new TableParser()

  // Act
  const results3 = parser3.guessProbabilitiesForAllTableParsers(input)
  const parsed = parser3.parseTableInputsFromString(input)

  // Assert
  equal(parser3.guessTableParserId(input), "text")
  equal(parsed.rows.length, 1)

  // Arrange
  const parsers = parser3.getAllParsers()
  // Act
  parsers.forEach(parser => {
    const sample = parser.getExample()
    const parsed = parser._parseTableInputsFromString(sample)
    equal(parsed.rows.length > 0, true, `${parser.getParserId()}`)
  })
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
