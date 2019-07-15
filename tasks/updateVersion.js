#! /usr/local/bin/node --use_strict
new (require("./builder.js"))().updateVersion(process.argv[2])

