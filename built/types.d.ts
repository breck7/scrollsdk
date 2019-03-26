export declare namespace types {
    interface ParseError {
        kind: string;
        subkind: string;
        level: int;
        context: string;
        message: string;
    }
    interface point {
        x: int;
        y: int;
    }
    type something = string | Object | any;
    type int = number;
    type htmlString = string;
    type xmlString = string;
    type jsonString = string;
    type dataTable = (any[])[];
    type formatString = string;
    type keywordPath = string;
    type pathVector = int[];
    type word = string;
    type triInt = int;
    type sortFn = (nodeA: any, nodeB: any) => triInt;
    type filepath = string;
    type filterFn = (node: any, index: int) => boolean;
    type RunTimeNodeConstructor = Function;
}
export default types;
