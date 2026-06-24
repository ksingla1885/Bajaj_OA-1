import React, { useState, useEffect } from 'react';
import { 
  Network, 
  GitCommit, 
  AlertOctagon, 
  Copy, 
  Check, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  HelpCircle, 
  Info, 
  ArrowRight,
  Sparkles,
  Layers,
  Settings,
  TreeDeciduous,
  Activity,
  AlertTriangle
} from 'lucide-react';

// Custom JSON Viewer to prettify responses
const JsonInspector = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs text-slate-300">
      <div className="absolute right-3 top-3 flex gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 hover:bg-slate-700 transition"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto max-h-60 pr-12">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

// Recursive Tree Node Component
const TreeNode = ({ nodeName, childrenObj, isLast = false, isRoot = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const childKeys = Object.keys(childrenObj || {});
  const hasChildren = childKeys.length > 0;

  return (
    <div className="relative flex flex-col items-start pl-4 mt-2">
      {/* Horizontal connector line for children (except root) */}
      {!isRoot && (
        <div className="absolute left-0 top-3.5 w-4 h-px bg-slate-700" />
      )}

      {/* Vertical connector line if children are present and not collapsed */}
      {hasChildren && !isCollapsed && (
        <div className="absolute left-4 top-7 bottom-0 w-px bg-slate-700" />
      )}

      <div className="flex items-center gap-2 z-10">
        {/* Toggle Button */}
        {hasChildren ? (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 text-indigo-400" />
            ) : (
              <ChevronDown className="h-3 w-3 text-indigo-400" />
            )}
          </button>
        ) : (
          <div className="h-2 w-2 rounded-full bg-slate-600 ml-1.5 mr-1.5" />
        )}

        {/* Node Badge */}
        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border shadow-sm transition-all duration-200 ${
          isRoot 
            ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-200 border-indigo-500/40 shadow-indigo-500/5' 
            : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
        }`}>
          <GitCommit className={`h-3.5 w-3.5 ${isRoot ? 'text-indigo-400' : 'text-slate-400'}`} />
          {nodeName}
          {hasChildren && (
            <span className="text-[10px] text-slate-500 font-normal px-1 bg-slate-900/50 rounded">
              {childKeys.length}
            </span>
          )}
        </div>
      </div>

      {/* Children Nodes */}
      {hasChildren && !isCollapsed && (
        <div className="pl-4 flex flex-col border-l border-slate-800/80 ml-2.5">
          {childKeys.map((key, idx) => (
            <TreeNode 
              key={key} 
              nodeName={key} 
              childrenObj={childrenObj[key]} 
              isLast={idx === childKeys.length - 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main App Component
export default function App() {
  const [inputText, setInputText] = useState('A->B\nA->C\nB->D\nB->E');
  const [apiUrl, setApiUrl] = useState('http://localhost:4000/bfhl');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Presets mapping
  const presets = {
    standardTree: {
      name: 'Standard Tree',
      edges: 'A->B\nA->C\nB->D\nB->E'
    },
    pureCycle: {
      name: 'Pure Cycle',
      edges: 'X->Y\nY->Z\nZ->X'
    },
    multiParent: {
      name: 'Multi-Parent & Dupes',
      edges: 'A->B\nA->B\nB->D\nC->D\nX->Y'
    },
    complexMixed: {
      name: 'Complex Mixed',
      edges: 'A->B\nA->C\nB->D\nX->Y\nY->Z\nZ->X\nhello\n1->2'
    }
  };

  const handleApplyPreset = (presetKey) => {
    setInputText(presets[presetKey].edges);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Parse inputs (split by lines/commas, filter empty lines)
    const rawLines = inputText.split(/[\n,]+/).map(line => line.trim()).filter(Boolean);
    
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: rawLines }),
      });

      if (!res.ok) {
        throw new Error('API Request Failed');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError('API Request Failed');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first load to show something cool
  useEffect(() => {
    handleSubmit();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Network className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              SysteNode
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5">
            Graph Tree & Cycle Analyzer
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            Validate edges, build parent chains, map hierarchies.
          </p>
        </div>

        {/* API Settings Cog */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition"
          >
            <Settings className={`h-4 w-4 text-slate-400 ${showSettings ? 'rotate-45' : ''} transition-transform duration-200`} />
            Endpoint Settings
          </button>
          
          {showSettings && (
            <div className="absolute right-0 mt-2 w-72 glass-panel p-4 rounded-xl shadow-2xl z-50 animate-slide-up">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Backend API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:4000/bfhl"
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Provide the full URL to the <code>/bfhl</code> POST endpoint. Default is local port 4000.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form and Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Graph Edges Input
            </h2>

            {/* Presets */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(presets).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    className="px-2.5 py-1.5 text-xs text-left text-slate-300 bg-slate-900/50 hover:bg-indigo-950/20 hover:text-indigo-300 border border-slate-800/80 hover:border-indigo-500/30 rounded-lg transition"
                  >
                    {presets[key].name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Edges List (Format: X-&gt;Y)
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="A->B&#10;A->C&#10;B->D"
                  rows="6"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder-slate-700"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Enter one edge per line. Valid format is <code>X-&gt;Y</code> (single uppercase letters, no self loops).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Analyze Graph
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Help Guide */}
          <div className="glass-panel p-6 rounded-2xl text-slate-400 text-sm">
            <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-slate-400" />
              Graph Rules Applied
            </h3>
            <ul className="space-y-2 text-xs leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span><strong>Syntax:</strong> Accepts only <code>X-&gt;Y</code> where X and Y are uppercase letters A-Z. Self loops are marked as invalid.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span><strong>Deduplication:</strong> The first instance of an edge is used; subsequent identical edges are recorded as duplicates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span><strong>First Parent Wins:</strong> Nodes can only have a single parent. Any additional parent edge (e.g. <code>C-&gt;D</code> after <code>B-&gt;D</code>) is silently discarded.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span><strong>Cycle Detection:</strong> Connected components with no roots are marked as cycles. The root is chosen lexicographically.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Analyzer Results */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 text-sm flex items-center gap-3 animate-fade-in">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <span className="font-semibold">API Request Failed</span>. Could not connect to the backend server. Please verify the backend is running and correct URL is set in Endpoint Settings.
              </div>
            </div>
          )}

          {!response && !error && !loading && (
            <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center text-slate-500 border-dashed min-h-[300px]">
              <Network className="h-10 w-10 text-slate-700 mb-3 animate-pulse-subtle" />
              <p className="text-sm">Submit graph data to view analyzed tree structures, cycles, and logs.</p>
            </div>
          )}

          {loading && (
            <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-12 w-12 rounded-full border-4 border-indigo-500/20" />
                <div className="h-12 w-12 rounded-full border-4 border-t-indigo-500 border-r-indigo-500 animate-spin" />
              </div>
              <p className="text-sm text-slate-400 mt-4 font-medium">Crunching graph topology...</p>
            </div>
          )}

          {response && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* User Metadata / Credentials Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">User:</span>
                  <code className="px-2 py-0.5 bg-slate-850 rounded text-slate-200 border border-slate-800">{response.user_id}</code>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">Roll:</span>
                  <code className="px-2 py-0.5 bg-slate-850 rounded text-slate-200 border border-slate-800">{response.college_roll_number}</code>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">Email:</span>
                  <a href={`mailto:${response.email_id}`} className="hover:text-indigo-400 transition">{response.email_id}</a>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel-hover glass-panel p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
                    <TreeDeciduous className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Trees</div>
                    <div className="text-2xl font-bold text-emerald-400">{response.summary.total_trees}</div>
                  </div>
                </div>

                <div className="glass-panel-hover glass-panel p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cycles</div>
                    <div className="text-2xl font-bold text-rose-400">{response.summary.total_cycles}</div>
                  </div>
                </div>

                <div className="glass-panel-hover glass-panel p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Largest Root</div>
                    <div className="text-xl font-bold text-indigo-300 truncate max-w-[140px]">
                      {response.summary.largest_tree_root || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hierarchies visualizer */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-indigo-400" />
                  Forest Components & Hierarchies ({response.hierarchies.length})
                </h3>

                {response.hierarchies.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No hierarchies processed.</p>
                ) : (
                  <div className="space-y-4">
                    {response.hierarchies.map((hier, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
                        {/* Component Header */}
                        <div className="flex items-center justify-between border-b border-slate-800/50 pb-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              hier.has_cycle 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            }`}>
                              {hier.has_cycle ? 'Cycle' : 'Tree'}
                            </span>
                            <span className="text-sm font-semibold text-slate-300">
                              Root: {hier.root}
                            </span>
                          </div>
                          {!hier.has_cycle && (
                            <span className="text-xs text-slate-500 font-medium">
                              Depth: <strong className="text-slate-300">{hier.depth}</strong>
                            </span>
                          )}
                        </div>

                        {/* Component Body */}
                        {hier.has_cycle ? (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-950/10 border border-rose-500/10 text-rose-300 text-xs">
                            <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0 animate-pulse" />
                            <span>
                              This component forms a closed loop/cycle. Lexicographically smallest member designated as Root <strong>{hier.root}</strong>.
                            </span>
                          </div>
                        ) : (
                          <div className="pl-2 pr-4 py-2 bg-slate-950/20 border border-slate-900/50 rounded-lg overflow-x-auto">
                            {/* Render recursive Tree View */}
                            <TreeNode 
                              nodeName={hier.root} 
                              childrenObj={hier.tree[hier.root]} 
                              isRoot={true} 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edge Cases: Invalid and Duplicates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invalid Entries */}
                <div className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    Invalid Entries ({response.invalid_entries.length})
                  </h4>
                  {response.invalid_entries.length === 0 ? (
                    <p className="text-slate-500 text-xs">No invalid entries detected.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {response.invalid_entries.map((val, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs rounded bg-rose-950/30 text-rose-300 border border-rose-500/10">
                          {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duplicate Edges */}
                <div className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Duplicate Edges ({response.duplicate_edges.length})
                  </h4>
                  {response.duplicate_edges.length === 0 ? (
                    <p className="text-slate-500 text-xs">No duplicate edges found.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {response.duplicate_edges.map((val, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs rounded bg-amber-950/30 text-amber-300 border border-amber-500/10">
                          {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Accordion: Raw JSON Response */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-slate-900/20 hover:bg-slate-900/40 transition text-sm font-semibold text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="h-4.5 w-4.5 text-slate-400" />
                    Raw JSON API Response
                  </span>
                  {showRawJson ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {showRawJson && (
                  <div className="p-6 border-t border-slate-800/80 bg-slate-950/35">
                    <JsonInspector data={response} />
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
