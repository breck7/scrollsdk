import jTreeTypes from "../jTreeTypes"

// Adapted from https://github.com/NeekSandhu/codemirror-textmate/blob/master/src/tmToCm.ts
enum CmToken {
  Atom = "atom",
  Attribute = "attribute",
  Bracket = "bracket",
  Builtin = "builtin",
  Comment = "comment",
  Def = "def",
  Error = "error",
  Header = "header",
  HR = "hr",
  Keyword = "keyword",
  Link = "link",
  Meta = "meta",
  Number = "number",
  Operator = "operator",
  Property = "property",
  Qualifier = "qualifier",
  Quote = "quote",
  String = "string",
  String2 = "string-2",
  Tag = "tag",
  Type = "type",
  Variable = "variable",
  Variable2 = "variable-2",
  Variable3 = "variable-3"
}

const tmToCm = {
  comment: {
    $: CmToken.Comment
  },

  constant: {
    // TODO: Revision
    $: CmToken.Def,
    character: {
      escape: {
        $: CmToken.String2
      }
    },
    language: {
      $: CmToken.Atom
    },
    numeric: {
      $: CmToken.Number
    },
    other: {
      email: {
        link: {
          $: CmToken.Link
        }
      },
      symbol: {
        // TODO: Revision
        $: CmToken.Def
      }
    }
  },

  entity: {
    name: {
      class: {
        $: CmToken.Def
      },
      function: {
        $: CmToken.Def
      },
      tag: {
        $: CmToken.Tag
      },
      type: {
        $: CmToken.Type,
        class: {
          $: CmToken.Variable
        }
      }
    },
    other: {
      "attribute-name": {
        $: CmToken.Attribute
      },
      "inherited-class": {
        // TODO: Revision
        $: CmToken.Def
      }
    },
    support: {
      function: {
        // TODO: Revision
        $: CmToken.Def
      }
    }
  },

  invalid: {
    $: CmToken.Error,
    illegal: { $: CmToken.Error },
    deprecated: {
      $: CmToken.Error
    }
  },

  keyword: {
    $: CmToken.Keyword,
    operator: {
      $: CmToken.Operator
    },
    other: {
      "special-method": CmToken.Def
    }
  },
  punctuation: {
    $: CmToken.Operator,
    definition: {
      comment: {
        $: CmToken.Comment
      },
      tag: {
        $: CmToken.Bracket
      }
      // 'template-expression': {
      //     $: CodeMirrorToken.Operator,
      // },
    }
    // terminator: {
    //     $: CodeMirrorToken.Operator,
    // },
  },

  storage: {
    $: CmToken.Keyword
  },

  string: {
    $: CmToken.String,
    regexp: {
      $: CmToken.String2
    }
  },

  support: {
    class: {
      $: CmToken.Def
    },
    constant: {
      $: CmToken.Variable2
    },
    function: {
      $: CmToken.Def
    },
    type: {
      $: CmToken.Type
    },
    variable: {
      $: CmToken.Variable2,
      property: {
        $: CmToken.Property
      }
    }
  },

  variable: {
    $: CmToken.Def,
    language: {
      // TODO: Revision
      $: CmToken.Variable3
    },
    other: {
      object: {
        $: CmToken.Variable,
        property: {
          $: CmToken.Property
        }
      },
      property: {
        $: CmToken.Property
      }
    },
    parameter: {
      $: CmToken.Def
    }
  }
}

const textMateScopeToCodeMirrorStyle = (scopeSegments: string[], styleTree: jTreeTypes.stringMap = tmToCm): CmToken => {
  const matchingBranch = styleTree[scopeSegments.shift()]
  return matchingBranch ? textMateScopeToCodeMirrorStyle(scopeSegments, matchingBranch) || matchingBranch.$ || null : null
}

export default textMateScopeToCodeMirrorStyle
