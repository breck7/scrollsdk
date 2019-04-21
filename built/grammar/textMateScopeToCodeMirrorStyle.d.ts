declare enum CmToken {
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
declare const textMateScopeToCodeMirrorStyle: (scopeSegments: string[], tree?: {
    comment: {
        $: CmToken;
    };
    constant: {
        $: CmToken;
        character: {
            escape: {
                $: CmToken;
            };
        };
        language: {
            $: CmToken;
        };
        numeric: {
            $: CmToken;
        };
        other: {
            email: {
                link: {
                    $: CmToken;
                };
            };
            symbol: {
                $: CmToken;
            };
        };
    };
    entity: {
        name: {
            class: {
                $: CmToken;
            };
            function: {
                $: CmToken;
            };
            tag: {
                $: CmToken;
            };
            type: {
                $: CmToken;
                class: {
                    $: CmToken;
                };
            };
        };
        other: {
            "attribute-name": {
                $: CmToken;
            };
            "inherited-class": {
                $: CmToken;
            };
        };
        support: {
            function: {
                $: CmToken;
            };
        };
    };
    keyword: {
        $: CmToken;
        operator: {
            $: CmToken;
        };
        other: {
            "special-method": CmToken;
        };
    };
    punctuation: {
        $: CmToken;
        definition: {
            comment: {
                $: CmToken;
            };
            tag: {
                $: CmToken;
            };
        };
    };
    storage: {
        $: CmToken;
    };
    string: {
        $: CmToken;
        regexp: {
            $: CmToken;
        };
    };
    support: {
        class: {
            $: CmToken;
        };
        constant: {
            $: CmToken;
        };
        function: {
            $: CmToken;
        };
        type: {
            $: CmToken;
        };
        variable: {
            $: CmToken;
            property: {
                $: CmToken;
            };
        };
    };
    variable: {
        $: CmToken;
        language: {
            $: CmToken;
        };
        other: {
            object: {
                $: CmToken;
                property: {
                    $: CmToken;
                };
            };
            property: {
                $: CmToken;
            };
        };
        parameter: {
            $: CmToken;
        };
    };
}) => CmToken;
export default textMateScopeToCodeMirrorStyle;
