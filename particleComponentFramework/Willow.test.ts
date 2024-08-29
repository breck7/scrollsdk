#!/usr/bin/env ts-node

import { WillowBrowser } from "./ParticleComponentFramework"

const { TestRacer } = require("../products/TestRacer.js")

const testParticles: any = {}

testParticles.all = (equal: any) => {
  // Arrange
  const willow2 = new WillowBrowser("http://localhost:8000/index.html")

  // Act
  willow2.setWindowTitle("willow2")
  // Assert
  equal(willow2.getWindowTitle(), "willow2", "set title works")

  // Act
  const bodyStumpParticle = willow2.getBodyStumpParticle()
  bodyStumpParticle.addClassToStumpParticle("someClass")
  // Assert
  equal(bodyStumpParticle.get("class"), "someClass")
  equal(bodyStumpParticle.stumpParticleHasClass("someClass"), true)

  // Act
  bodyStumpParticle.removeClassFromStumpParticle("someClass")
  // Assert
  equal(bodyStumpParticle.stumpParticleHasClass("someClass"), false)

  // Act
  bodyStumpParticle.insertChildParticle(`h6 Hello world
 class header`)
  const html = willow2.getPageHtml()

  // Assert
  equal(html.includes(`Hello world</h6>`), true, "hello world included")
  equal(bodyStumpParticle.findStumpParticlesByChild("class header").length, 1, "found stumpParticles")
  equal(bodyStumpParticle.findStumpParticleByFirstWord("h6").getLine(), "h6 Hello world")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)
export { testParticles }
