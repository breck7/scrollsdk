#! /usr/local/bin/node
require("fs").writeFileSync(__dirname + "/index.html", new (require("./ChexTreeComponent.js"))().compile(), "utf8")
