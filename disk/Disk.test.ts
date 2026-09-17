#!/usr/bin/env ts-node

import { particlesTypes } from "../products/particlesTypes"
const { Disk } = require("../products/Disk.node.js")
const { TestRacer } = require("../products/TestRacer.js")

const testParticles: particlesTypes.testParticles = {}

testParticles.exists = equal => {
  // Arrange/Act/Assert
  equal(Disk.exists(__filename), true)
}

testParticles.http = async equal => {
  const fs = require("fs")
  const path = require("path")
  const { WillowBrowser } = require("../products/ParticleComponentFramework.node.js")
  const folder = fs.mkdtempSync(path.join(require("os").tmpdir(), "scrollsdk-http-"))
  const server = require("http").createServer(async (req: any, res: any) => {
    if (req.url === "/redirect") {
      res.writeHead(302, { Location: "/text" }).end()
      return
    }
    if (req.url === "/missing") {
      res.writeHead(404).end("missing")
      return
    }
    if (req.url === "/text") {
      res.writeHead(200, { "Content-Type": "text/plain" }).end("hello")
      return
    }
    let body = ""
    for await (const chunk of req) body += chunk
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" })
    res.end(req.url === "/false" ? "false" : JSON.stringify({ url: req.url, body, header: req.headers["x-test"] }))
  })
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    equal((await Disk.getUrl(base + "/redirect")).text, "hello", "follows redirects")
    equal(await Disk.downloadJson(base + "/false"), false, "preserves falsy JSON")
    await Disk.downloadPlain(base + "/text", path.join(folder, "text"))
    equal(Disk.read(path.join(folder, "text")), "hello", "downloads text")
    await Disk.downloadJson(base + "/json", path.join(folder, "json"))
    equal(Disk.readJson(path.join(folder, "json")).url, "/json", "downloads JSON")
    let status = 0
    try {
      await Disk.getUrl(base + "/missing")
    } catch (error) {
      status = (error as any).status
    }
    equal(status, 404, "rejects HTTP errors")
    const browser = new WillowBrowser(base + "/index.html")
    browser.toggleOfflineMode()
    browser._headers = { "X-Test": "present" }
    const get = await browser.httpGetUrl("/json?existing=yes", { q: "a b", tag: ["one", "two"] })
    equal(get.body.url, "/json?existing=yes&q=a+b&tag=one&tag=two", "encodes query parameters")
    equal(get.body.header, "present", "sends headers")
    const post = await browser.httpPostUrl("/json", { hello: "world" })
    equal(post.body.body, '{"hello":"world"}', "posts JSON")
    browser.toggleOfflineMode()
    equal((await browser.httpGetUrl("/missing", {})).text, "", "offline mode skips requests")
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()))
    fs.rmSync(folder, { recursive: true, force: true })
  }
}

testParticles.compileWithoutDependencies = equal => {
  const { ParsersCompiler } = require("../products/ParsersCompiler.js")
  const fs = require("fs")
  const path = require("path")
  const folder = fs.mkdtempSync(path.join(require("os").tmpdir(), "scrollsdk-compile-"))
  try {
    Disk.write(path.join(folder, "a.parsers"), "testParser\n root")
    const combined = ParsersCompiler.combineFiles([path.join(folder, "*.parsers"), path.join(folder, "missing*")])
    equal(combined.toString(), "testParser\n root", "native file globbing")
    const output = ParsersCompiler.compileParsersForNodeJs(path.join(folder, "a.parsers"), folder)
    equal(typeof require(output), "function", "compiles without requesting formatting")
  } finally {
    fs.rmSync(folder, { recursive: true, force: true })
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
