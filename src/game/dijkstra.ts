import { FibonacciPriorityQueue, FibNode } from './fibonacci-priority-queue';

/** 
 * An interface to describe edges in the graph. 
 * Each node can point to any number of neighbors, each with a given weight.
 */
export interface Edge<T> {
    node: T;
    weight: number;
}

/**
 * Dijkstra's algorithm that computes:
 * 1) The distance to the seed node for every node in the graph.
 * 2) The immediate neighbor to follow to reach the seed.
 *
 * @param graph A Map whose keys are nodes and whose values are an array of edges.
 * @param seed The seed node from which all distances are calculated.
 * @returns A Map<T, { distance: number; link: T | null }> describing each node's
 *          distance and the neighbor to go to first on route to the seed.
 */
export function dijkstra<T>(graph: Map<T, Edge<T>[]>, seed: T): Map<T, { distance: number; link: T | null }> {

    // Store the best-known distance for each node and the link to the first step back to seed
    const distances = new Map<T, number>();
    const firstStepLink = new Map<T, T | null>();

    // Priority queue to pick the node with the smallest distance
    const pq = new FibonacciPriorityQueue<T>();

    // We need to keep track of the FibNode handles to decrease their priorities later
    const nodeHandles = new Map<T, FibNode<T>>();

    // Initialize all nodes
    for (const node of graph.keys()) {
        distances.set(node, Number.POSITIVE_INFINITY);
        firstStepLink.set(node, null);

        // Add to Fibonacci priority queue with an initially large priority
        const handle = pq.add(node, Number.POSITIVE_INFINITY);
        nodeHandles.set(node, handle);
    }

    // Set the seed node's distance to 0 and update priority
    distances.set(seed, 0);
    pq.decreasePriority(nodeHandles.get(seed)!, 0);

    // Dijkstra's main loop
    while (pq.size() > 0) {
        // Extract node with the smallest distance
        const fibNode = pq.extractMin();
        if (!fibNode) break; // No more nodes

        const currentNode = fibNode.key;
        const currentDistance = distances.get(currentNode)!;

        // Explore each neighbor
        const edges = graph.get(currentNode) || [];
        for (const { node: neighbor, weight } of edges) {
            const alt = currentDistance + weight;
            if (alt < distances.get(neighbor)!) {
                // Found a better route to neighbor
                distances.set(neighbor, alt);
                firstStepLink.set(neighbor, currentNode);
                pq.decreasePriority(nodeHandles.get(neighbor)!, alt);
            }
        }
    }

    // Build the final map with distance and link
    const result = new Map<T, { distance: number; link: T | null }>();
    for (const node of graph.keys()) {
        result.set(node, {
            distance: distances.get(node)!,
            link: firstStepLink.get(node)!,
        });
    }
    return result;
}
