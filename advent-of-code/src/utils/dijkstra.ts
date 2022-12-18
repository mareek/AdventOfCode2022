import _ from "lodash";

class path<TNode extends node> {
    readonly origin: TNode;
    readonly destination: TNode;
    readonly steps: TNode[];
    readonly length: number;
    constructor(origin: TNode, destination: TNode, steps: TNode[]) {
        this.origin = origin;
        this.destination = destination;
        this.steps = steps;
        this.length = steps.length + 1;
    }
}

class link {
    readonly originId: string;
    readonly destinationId: string;
    readonly distance: number;

    constructor(originId: string, destinationId: string, distance: number) {
        this.originId = originId;
        this.destinationId = destinationId;
        this.distance = distance;
    }
}

interface node {
    id: string,
    links: link[]
}

function buildShortestPaths<TNode extends node>(nodes: { [id: string]: TNode; }, origin: TNode, destinationId: string | undefined = undefined): path<TNode>[] {
    // Init
    const distances: { [id: string]: number; } = {};
    const previousNodes: { [id: string]: TNode; } = {};
    const remaining: { [id: string]: TNode; } = {};
    let remainingNodeCount = 0;
    for (const id in nodes) {
        const node = nodes[id];
        remaining[id] = node;
        distances[id] = id === origin.id ? 0 : Number.MAX_SAFE_INTEGER;
        remainingNodeCount += 1;
    }

    while (remainingNodeCount > 0) {
        const closestNode = findClosestNode();
        if (!closestNode)
            break;

        updateDistances(closestNode);
        if (closestNode.id === destinationId)
            break;

        delete remaining[closestNode.id];
        remainingNodeCount -= 1;
    }

    if (destinationId) {
        return [buildPath(destinationId)];
    }

    const result: path<TNode>[] = [];
    for (const id in distances) {
        if (id !== origin.id && distances[id] < Number.MAX_SAFE_INTEGER) {
            result.push(buildPath(id));
        }
    }

    return result;

    function findClosestNode(): TNode | undefined {
        let shortestsDistance = Number.MAX_SAFE_INTEGER;
        let result: TNode | undefined;
        for (const id in remaining) {
            const node = remaining[id];
            const distance = distances[id];
            if (distance < shortestsDistance) {
                result = node;
                shortestsDistance = distance;
            }
        }

        return result;
    }

    function updateDistances(node: TNode) {
        const nodeDistance = distances[node.id];
        for (const link of node.links) {
            const newDistance = nodeDistance + link.distance;
            const previousDistance = distances[link.destinationId];
            if (newDistance < previousDistance) {
                distances[link.destinationId] = newDistance;
                previousNodes[link.destinationId] = node;
            }
        }
    }

    function buildPath(destinationId: string): path<TNode> {
        const distance = distances[destinationId];
        const steps: TNode[] = [];
        let node = previousNodes[destinationId];
        while (node.id !== origin.id) {
            steps.push(node);
            node = previousNodes[node.id];
        }

        return new path(origin, nodes[destinationId], _.reverse(steps));
    }
}

export { buildShortestPaths, link, type node, type path }