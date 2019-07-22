#! /usr/bin/env node

const path = require("path")
const stamp = require("./stamp.js")

const getAbsPath = input => (input.startsWith("/") ? input : path.resolve(pwd + "/" + input))

const providedPath = process.argv[2]
const output = process.argv[3]
const pwd = process.env.PWD
const providedPathWithoutEndingSlash = providedPath && providedPath.replace(/\/$/, "")
const absPath = providedPath ? getAbsPath(providedPathWithoutEndingSlash) : pwd
console.log(stamp.dirToStamp(absPath, output))

