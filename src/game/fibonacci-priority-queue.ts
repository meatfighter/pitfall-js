export class FibNode<T> {
    public key: T;
    public priority: number;
    public degree: number;
    public parent: FibNode<T> | null;
    public child: FibNode<T> | null;
    public left: FibNode<T>;
    public right: FibNode<T>;
    public mark: boolean;

    constructor(key: T, priority: number) {
        this.key = key;
        this.priority = priority;
        this.degree = 0;
        this.parent = null;
        this.child = null;
        this.left = this;
        this.right = this;
        this.mark = false;
    }
}

export class FibonacciPriorityQueue<T> {
    private min: FibNode<T> | null;
    private nodeCount: number;

    constructor() {
        this.min = null;
        this.nodeCount = 0;
    }

    /**
     * Inserts a new node with the given key and priority.
     * Returns the newly created node.
     */
    public add(key: T, priority: number): FibNode<T> {
        const node = new FibNode<T>(key, priority);

        // Merge this node into the root list
        if (!this.min) {
            this.min = node;
        } else {
            // Insert into the min's right position
            node.left = this.min;
            node.right = this.min.right;
            if (this.min.right) {
                this.min.right.left = node;
            }
            this.min.right = node;

            // Update min if necessary
            if (node.priority < this.min.priority) {
                this.min = node;
            }
        }

        this.nodeCount++;
        return node;
    }

    /**
     * Extracts the node with the smallest priority.
     * Returns the extracted node, or null if empty.
     */
    public extractMin(): FibNode<T> | null {
        const z = this.min;
        if (!z) {
            return null;
        }

        // Move each child of z into the root list
        if (z.child) {
            let child = z.child;
            do {
                const nextChild = child.right;
                // Remove child from its sibling list
                child.left.right = child.right;
                child.right.left = child.left;
                // Add child to the root list
                child.left = this.min!;
                child.right = this.min!.right;
                if (this.min!.right) {
                    this.min!.right.left = child;
                }
                this.min!.right = child;
                child.parent = null;
                child = nextChild;
            } while (child !== z.child);
        }

        // Remove z from the root list
        z.left.right = z.right;
        z.right.left = z.left;

        if (z === z.right) {
            this.min = null;
        } else {
            this.min = z.right;
            this.consolidate();
        }

        this.nodeCount--;
        return z;
    }

    /**
     * Decreases the priority of a given node to newPriority.
     * Assumes newPriority is strictly less than the node's current priority.
     */
    public decreasePriority(node: FibNode<T>, newPriority: number): void {
        if (newPriority > node.priority) {
            throw new Error('New priority must be lower than the current priority.');
        }

        node.priority = newPriority;
        const parent = node.parent;
        if (parent && node.priority < parent.priority) {
            this.cut(node, parent);
            this.cascadingCut(parent);
        }

        // Update min if needed
        if (this.min && node.priority < this.min.priority) {
            this.min = node;
        }
    }

    /**
     * Private method to merge the trees of the heap by degree.
     * Called after extracting the minimum.
     */
    private consolidate() {
        const A: Array<FibNode<T> | null> = [];
        // Upper bound on degrees
        const maxDegree = Math.floor(Math.log2(this.nodeCount)) + 2;
        for (let i = 0; i < maxDegree; i++) {
            A[i] = null;
        }

        // Collect all root nodes in a list
        const roots: FibNode<T>[] = [];
        if (this.min) {
            let node: FibNode<T> = this.min;
            do {
                roots.push(node);
                node = node.right;
            } while (node !== this.min);
        }

        // For each root, merge with same degree
        for (const w of roots) {
            let x = w;
            let d = x.degree;
            while (A[d]) {
                let y = A[d]!;
                if (x.priority > y.priority) {
                    // Swap x and y
                    [x, y] = [y, x];
                }
                this.link(y, x);
                A[d] = null;
                d++;
            }
            A[d] = x;
        }

        // Rebuild the root list
        this.min = null;
        for (const node of A) {
            if (node) {
                if (!this.min) {
                    this.min = node;
                    node.left = node;
                    node.right = node;
                } else {
                    // Insert node into root list
                    node.left = this.min;
                    node.right = this.min.right;
                    if (this.min.right) {
                        this.min.right.left = node;
                    }
                    this.min.right = node;
                    if (node.priority < this.min.priority) {
                        this.min = node;
                    }
                }
            }
        }
    }

    /**
     * Private method to make node y a child of node x.
     */
    private link(y: FibNode<T>, x: FibNode<T>): void {
        // Remove y from the root list
        y.left.right = y.right;
        y.right.left = y.left;
        // Make y a child of x
        y.parent = x;
        if (!x.child) {
            x.child = y;
            y.left = y;
            y.right = y;
        } else {
            y.left = x.child;
            y.right = x.child.right;
            if (x.child.right) {
                x.child.right.left = y;
            }
            x.child.right = y;
        }
        x.degree++;
        y.mark = false;
    }

    /**
     * Private method to cut a node from its parent and move it to the root list.
     */
    private cut(x: FibNode<T>, y: FibNode<T>): void {
        // Remove x from child list of y
        if (x.right === x) {
            y.child = null;
        } else {
            x.left.right = x.right;
            x.right.left = x.left;
            if (y.child === x) {
                y.child = x.right;
            }
        }
        y.degree--;

        // Add x to root list
        x.left = this.min!;
        x.right = this.min!.right;
        if (this.min!.right) {
            this.min!.right.left = x;
        }
        this.min!.right = x;

        x.parent = null;
        x.mark = false;
    }

    /**
     * Private method for recursively cutting marked parents.
     */
    private cascadingCut(y: FibNode<T>): void {
        const z = y.parent;
        if (z) {
            if (!y.mark) {
                y.mark = true;
            } else {
                this.cut(y, z);
                this.cascadingCut(z);
            }
        }
    }

    /**
     * Returns the number of elements in the queue.
     */
    public size(): number {
        return this.nodeCount;
    }

    /**
     * Peeks at the minimum node without removing it.
     */
    public peekMin(): FibNode<T> | null {
        return this.min;
    }
}
