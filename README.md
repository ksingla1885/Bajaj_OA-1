# SysteNode | Graph Tree & Cycle Analyzer

A full-stack web application designed to parse a series of directed graph edges (e.g. `A->B`), clean/validate the input, resolve parent-child hierarchies under specific rules, detect cycles, and present a premium, interactive tree-structure diagram.

---

## Technical Stack

- **Backend**: Node.js, Express, CORS
- **Frontend**: React (Vite), Tailwind CSS (v4), Lucide React
- **Deployment**: Vercel (Frontend), Render or Vercel (Backend)

---

## Directory Structure

```
d:/Bajaj
├── backend/
│   ├── index.js          # Core server logic and /bfhl API
│   ├── package.json      # Backend dependencies
│   └── vercel.json       # Vercel Serverless hosting config
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main interactive dashboard UI
│   │   ├── index.css     # Tailwind v4 globals
│   │   └── main.jsx      # Vite React entry point
│   ├── package.json      # Frontend dependencies
│   ├── tailwind.config.js# Tailwind theme & animation configurations
│   ├── postcss.config.js # PostCSS configuration
│   ├── index.html        # HTML layout & SEO metadata
│   └── vercel.json       # Vercel rewrite configuration
└── README.md             # Project documentation (this file)
```

---

## Getting Started Locally

### 1. Start the Backend Server

Navigate to the `backend` folder, install dependencies, and run:

```bash
cd backend
npm install
npm start
```

- The API server runs at **`http://localhost:4000`** by default.
- You can query `POST http://localhost:4000/bfhl` directly.

### 2. Start the Frontend App

Open a new terminal window, navigate to the `frontend` folder, install dependencies, and run the development server:

```bash
cd frontend
npm install
npm run dev
```

- Open the browser at the local address shown in the terminal (typically **`http://localhost:5173`**).
- If your backend is running on a different port, you can change it on-the-fly in the UI by clicking **Endpoint Settings** on the top right.

---

## API Specification

### `POST /bfhl`

Accepts an array of edge strings representing relationships.

#### Input Format
```json
{
  "data": ["A->B", "A->C", "B->D", "B->E"]
}
```

#### Response Format
```json
{
  "user_id": "ketankumar_24062026",
  "email_id": "ketan0546.be23@chitkara.edu.in",
  "college_roll_number": "2310990546",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {},
            "E": {}
          },
          "C": {}
        }
      },
      "depth": 3,
      "has_cycle": false
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## Core Rules Applied by Backend

1. **Format Validation**: Only strings in the `X->Y` pattern where `X` and `Y` are single uppercase English letters (A-Z) are allowed. Self loops like `A->A` are flagged as invalid entries.
2. **Deduplication**: Repeated identical edges are cleaned; the first occurrence is kept, and others are tracked in `duplicate_edges`.
3. **Multi-Parent Discarding**: A node can only have a single parent. Any edge trying to map a new parent to a node that already has a parent is silently discarded.
4. **Weakly Connected Components**: The graph is grouped into connected components.
5. **Cycle Detection**: If a component has no node with indegree `0`, it is flagged as cyclic, and the lexicographically smallest node is selected as the root.

---

## Production Deployment Instructions

### Backend (on Render)

1. Sign in to [Render](https://render.com/).
2. Create a new **Web Service** and link it to your GitHub Repository.
3. In settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Set any custom environment variables (like `PORT`) in the Render console if desired.

### Frontend (on Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and select your GitHub Repository.
3. Configure the Project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite` (Vercel automatically detects this)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.
5. *Note*: In the deployed frontend, click **Endpoint Settings** to set your deployed Render backend API URL.
