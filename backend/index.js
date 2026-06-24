const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// POST /bfhl endpoint
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: "Invalid input. 'data' must be an array of strings."
      });
    }

    const invalid_entries = [];
    const duplicate_edges = [];
    const processed_edges = []; // Array of { u, v }
    const seen_raw_edges = new Set();
    const parent_of_node = new Map(); // child -> parent

    // Step 1: Validate inputs and check for duplicates/parent rules
    for (const item of data) {
      if (typeof item !== 'string') {
        invalid_entries.push(String(item));
        continue;
      }

      // Trim whitespace first, then validate
      const trimmed = item.trim();

      // Valid format: X->Y (X, Y are uppercase letters, no self loops)
      const match = trimmed.match(/^([A-Z])->([A-Z])$/);
      if (!match) {
        invalid_entries.push(item);
        continue;
      }

      const u = match[1];
      const v = match[2];

      if (u === v) {
        invalid_entries.push(item);
        continue;
      }

      // Step 2: Handle Duplicates
      const edgeStr = `${u}->${v}`;
      if (seen_raw_edges.has(edgeStr)) {
        if (!duplicate_edges.includes(edgeStr)) {
          duplicate_edges.push(edgeStr);
        }
        continue;
      }
      seen_raw_edges.add(edgeStr);

      // Step 3: Multi-parent Rule (First parent wins)
      if (parent_of_node.has(v)) {
        // Silently discard
        continue;
      }

      // Keep the edge
      parent_of_node.set(v, u);
      processed_edges.push({ u, v });
    }

    // Step 4: Build Graph (adjacency list and parent counts)
    const adjacencyList = {};
    const parentCount = {};
    const all_nodes = new Set();
    const nodes_in_order = [];

    for (const edge of processed_edges) {
      if (!all_nodes.has(edge.u)) {
        all_nodes.add(edge.u);
        nodes_in_order.push(edge.u);
      }
      if (!all_nodes.has(edge.v)) {
        all_nodes.add(edge.v);
        nodes_in_order.push(edge.v);
      }
    }

    for (const node of all_nodes) {
      adjacencyList[node] = [];
      parentCount[node] = 0;
    }

    for (const edge of processed_edges) {
      adjacencyList[edge.u].push(edge.v);
      parentCount[edge.v] = 1; // Since each node can have at most one parent
    }

    // Build undirected representation to find connected components
    const undirectedAdj = {};
    for (const node of all_nodes) {
      undirectedAdj[node] = new Set();
    }
    for (const edge of processed_edges) {
      undirectedAdj[edge.u].add(edge.v);
      undirectedAdj[edge.v].add(edge.u);
    }

    // Find all connected components
    const visited = new Set();
    const components = [];

    for (const node of nodes_in_order) {
      if (!visited.has(node)) {
        const component = [];
        const queue = [node];
        visited.add(node);

        while (queue.length > 0) {
          const curr = queue.shift();
          component.push(curr);

          for (const neighbor of undirectedAdj[curr]) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
        components.push(component);
      }
    }

    // Process each component to determine trees vs cycles
    const hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    const tree_details = []; // To easily track depths for largest tree root

    for (const comp of components) {
      // Find nodes with indegree (parentCount) === 0
      const roots = comp.filter(node => parentCount[node] === 0);

      if (roots.length === 1) {
        // It's a non-cyclic tree
        const root = roots[0];

        // Step 7: Build Nested Tree
        const buildTree = (node) => {
          const treeObj = {};
          const children = adjacencyList[node] || [];
          // Sort children lexicographically for predictable structure
          const sortedChildren = [...children].sort();
          for (const child of sortedChildren) {
            treeObj[child] = buildTree(child);
          }
          return treeObj;
        };

        // Step 8: Calculate Depth (longest root-to-leaf node count)
        const getDepth = (node) => {
          const children = adjacencyList[node] || [];
          if (children.length === 0) return 1;
          const depths = children.map(child => getDepth(child));
          return 1 + Math.max(...depths);
        };

        const depth = getDepth(root);
        const tree = { [root]: buildTree(root) };

        hierarchies.push({
          root,
          tree,
          depth
        });

        tree_details.push({ root, depth });
        total_trees++;
      } else {
        // It's a cyclic component (no node has parentCount === 0)
        // Find lexicographically smallest node in component as root
        const root = [...comp].sort()[0];

        hierarchies.push({
          root,
          tree: {},
          has_cycle: true
        });

        total_cycles++;
      }
    }

    // Step 9: Determine largest tree root
    let largest_tree_root = "";
    if (tree_details.length > 0) {
      // Sort: largest depth first, tie-breaker: lexicographically smaller root
      tree_details.sort((a, b) => {
        if (b.depth !== a.depth) {
          return b.depth - a.depth;
        }
        return a.root.localeCompare(b.root);
      });
      largest_tree_root = tree_details[0].root;
    }

    // Send response
    res.json({
      user_id: "ketankumar_24062026",
      email_id: "ketan0546.be23@chitkara.edu.in",
      college_roll_number: "2310990546",
      hierarchies,
      invalid_entries,
      duplicate_edges,
      summary: {
        total_trees,
        total_cycles,
        largest_tree_root
      }
    });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error occurred."
    });
  }
});

// Root check endpoint
app.get('/', (req, res) => {
  res.send('Graph Analyzer API is running.');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
