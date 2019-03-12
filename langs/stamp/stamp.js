#! /usr/bin/env node --use_strict

const fs = require("fs")
const path = require("path")
const StampProgram = require("./index.js")

const getAbsPath = input => (input.startsWith("/") ? input : path.resolve(pwd + "/" + input))

const providedPath = process.argv[2]
const output = process.argv[3]
const pwd = process.env.PWD
const providedPathWithoutEndingSlash = providedPath && providedPath.replace(/\/$/, "")
const absPath = providedPath ? getAbsPath(providedPathWithoutEndingSlash) : pwd
console.log(StampProgram.dirToStamp(absPath, output))

