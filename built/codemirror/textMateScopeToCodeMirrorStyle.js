"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Adapted from https://github.com/NeekSandhu/codemirror-textmate/blob/master/src/tmToCm.ts
var CmToken;
(function (CmToken) {
    CmToken["Atom"] = "atom";
    CmToken["Attribute"] = "attribute";
    CmToken["Bracket"] = "bracket";
    CmToken["Builtin"] = "builtin";
    CmToken["Comment"] = "comment";
    CmToken["Def"] = "def";
    CmToken["Error"] = "error";
    CmToken["Header"] = "header";
    CmToken["HR"] = "hr";
    CmToken["Keyword"] = "keyword";
    CmToken["Link"] = "link";
    CmToken["Meta"] = "meta";
    CmToken["Number"] = "number";
    CmToken["Operator"] = "operator";
    CmToken["Property"] = "property";
    CmToken["Qualifier"] = "qualifier";
    CmToken["Quote"] = "quote";
    CmToken["String"] = "string";
    CmToken["String2"] = "string-2";
    CmToken["Tag"] = "tag";
    CmToken["Type"] = "type";
    CmToken["Variable"] = "variable";
    CmToken["Variable2"] = "variable-2";
    CmToken["Variable3"] = "variable-3";
})(CmToken || (CmToken = {}));
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
};
const textMateScopeToCodeMirrorStyle = (scopeSegments, styleTree = tmToCm) => {
    const matchingBranch = styleTree[scopeSegments.shift()];
    return matchingBranch ? textMateScopeToCodeMirrorStyle(scopeSegments, matchingBranch) || matchingBranch.$ || null : null;
};
exports.default = textMateScopeToCodeMirrorStyle;
