#!/usr/bin/env node

/*
This file contains a simple set of perf tests that can be run manually to keep fusion perf in check.
*/

// rm perf.cpuprofile; rm perf.heapprofile; node --cpu-prof --cpu-prof-name=perf.cpuprofile --heap-prof --heap-prof-name=perf.heapprofile perf.js

const fs = require("fs")
const path = require("path")
const { Utils } = require("../products/Utils.js")
const { Timer } = Utils
const { Particle } = require("../products/Particle.js")
const { Fusion } = require("../products/Fusion.js")
const { ScrollFile } = require("scroll-cli")

class PerfTest {
  constructor(folderPath) {
    this.folderPath = folderPath
    this.timer = new Timer()
    this.files = []
    this.simpleStrings = []
    this.particles = []
    this.fusedFiles = []
    this.scrollFiles = []
  }

  gatherFiles() {
    this.files = fs
      .readdirSync(this.folderPath)
      .filter(file => file.endsWith(".scroll"))
      .map(file => path.join(this.folderPath, file))
    console.log(`Found ${this.files.length} .scroll files`)
    this.tick("Finding files")
    return this
  }

  readToStrings() {
    this.simpleStrings = this.files.map(file => fs.readFileSync(file, "utf8"))
    this.tick("Reading files to strings")
    return this
  }

  parseToParticles() {
    this.particles = this.simpleStrings.map(str => new Particle(str))
    this.tick("Parsing to Particles")
    return this
  }

  async fuseFiles() {
    const fusion = new Fusion()
    this.fusedFiles = await Promise.all(this.files.map(file => fusion.fuseFile(file)))
    this.tick("Fusing files")
    return this
  }

  parseAsScroll() {
    this.scrollFiles = this.simpleStrings.map(str => new ScrollFile(str))
    this.tick("Parsing as Scroll")
    return this
  }

  tick(message) {
    this.printMemoryUsage()
    console.log("")
    this.timer.tick(message)
    console.log("----------")
  }

  printMemoryUsage() {
    const used = process.memoryUsage()
    console.log("\nMemory Usage:")
    for (let key in used) {
      console.log(`${key}: ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`)
    }
  }

  async runAll() {
    this.tick("Starting performance tests...\n")
    this.gatherFiles().readToStrings().parseToParticles()
    await this.fuseFiles()
    this.parseAsScroll()
  }
}

// Run the tests
const dir = "/Users/breck/pldb.io/concepts"
const perfTest = new PerfTest(dir)
perfTest.runAll().catch(console.error)
