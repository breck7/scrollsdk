declare abstract class AbstractNode {
    protected _getNow(): number;
    toDisk(path: string, format?: string): this;
}
export default AbstractNode;
