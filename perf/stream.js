#! /usr/bin/env node

const { Particle } = require("../products/Particle.js")
const { Readable } = require("stream")
const path = require("path")
const { Utils } = require("../products/Utils.js")
const { Timer } = Utils

const randomStrings = Particle.fromDisk(path.join(__dirname, "..", "readme.scroll")).map(block => block.toString() + "\n")
const getRandomBlock = () => randomStrings[Math.floor(Math.random() * randomStrings.length)]

const timer = new Timer()

function createRandomStream(blockCount = 10000000) {
  let blocksGenerated = 0

  return new Readable({
    encoding: "utf8",
    read(size) {
      if (blocksGenerated >= blockCount) {
        this.push(null) // End the stream
        return
      }

      // Generate a random block
      this.push(getRandomBlock())
      blocksGenerated++

      // Push multiple lines per read for efficiency
      const maxBlocksPerChunk = 1000
      for (let i = 0; i < maxBlocksPerChunk && blocksGenerated < blockCount; i++) {
        this.push(getRandomBlock())
        blocksGenerated++
      }
    }
  })
}

const main = async () => {
  timer.tick("start")
  // Arrange
  const particle = new Particle()
  const stream = createRandomStream(1e6)

  // Act
  await particle.appendFromStream(stream)

  timer.tick("loaded")

  // Assert
  console.log(`Parsed ${particle.length} blocks and ${particle.numberOfLines} lines`)
  timer.tick("finish")

  const str = particle.toString()
  timer.tick("toString")

  console.log(`${str.length} bytes`)

  const newPart = new Particle(str)
  timer.tick("from str")
}

main()
