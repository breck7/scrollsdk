#! /usr/bin/env node
new (require("./builder.js"))().updateVersion(process.argv[2])

