import types from "../types";
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
declare const textMateScopeToCodeMirrorStyle: (scopeSegments: string[], styleTree?: types.stringMap) => CmToken;
export default textMateScopeToCodeMirrorStyle;
