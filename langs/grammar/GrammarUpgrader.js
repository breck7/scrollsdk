#! /usr/local/bin/node --use_strict

const Upgrader = require("../../index.js").Upgrader

class GrammarUpgrader extends Upgrader {
  getUpgradeFromMap() {
    return {
      "1.1.0": {
        "1.2.0": code => "123"
      }
    }
  }
}

/*NODE_JS_ONLY*/ if (!module.parent)
  new GrammarUpgrader().upgradeManyPreview("*/*.grammar", "1.1.0", "1.2.0").forEach(item => console.log(item.path, item.content))
module.exports = GrammarUpgrader
