import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

type GraphNode = {
  id: number;
  label: string;
  color?: string;
  val?: number;
  x?: number;
  y?: number;
};

type GraphLink = {
  source: number;
  target: number;
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

const PaperExplorer: React.FC = () => {
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [papers, setPapers] = useState<{ int_id: number; title: string }[]>([]);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<{ int_id: number; title: string }[]>([]);

  const graphRef = useRef<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load papers for dropdown and search
  useEffect(() => {
    fetch("/search_index.json")
      .then((res) => res.json())
      .then(setPapers);
  }, []);

  // Load citationEdges and papers.json and construct graph
  useEffect(() => {
    if (selectedPaperId === null) return;

    Promise.all([
      fetch("/citation_edges.json").then((res) => res.json()),
      fetch("/papers.json").then((res) => res.json())
    ]).then(([edges, paperData]) => {
      const centerId = selectedPaperId;
      const neighbors: number[] = edges[centerId] || [];

      const nodes: GraphNode[] = [
        {
          id: centerId,
          label: paperData[centerId]?.title || "Selected Paper",
          color: "#1f77b4",
          val: 10
        },
        ...neighbors.map((nid: number) => ({
          id: nid,
          label: paperData[nid]?.title || "Cited Paper",
          color: "#ff7f0e",
          val: 5
        }))
      ];

      const links: GraphLink[] = neighbors.map((targetId) => ({
        source: centerId,
        target: targetId
      }));

      setGraphData({ nodes, links });
    });
  }, [selectedPaperId]);

  // Center the graph when it loads
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(2.5, 1000);
    }
  }, [graphData]);

  // Search filtering logic
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults([]);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = papers
      .filter((p) => p.title && p.title.toLowerCase().includes(lower))
      .slice(0, 10);
    setFilteredResults(filtered);
  }, [searchTerm, papers]);

  // Handle selecting a paper from search results or dropdown
  const selectPaper = (id: number) => {
    setSelectedPaperId(id);
    setSearchTerm("");
    setFilteredResults([]);
  };

  // Close suggestions if clicked outside search box
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setFilteredResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Submit search via button or enter key
  const onSearchSubmit = () => {
    if (filteredResults.length > 0) {
      selectPaper(filteredResults[0].int_id);
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  return (
    <div className="w-full h-full p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 AI Paper Network</h2>

      {/* Search box row */}
      <div className="relative mb-6" ref={searchRef}>
        <input
          type="text"
          className="w-full p-2 border rounded-md pr-10"
          placeholder="Search papers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={onInputKeyDown}
          autoComplete="off"
        />
        <button
          onClick={onSearchSubmit}
          aria-label="Search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </button>

        {/* Helper text */}
        {filteredResults.length > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            Top 10 results shown below — select one to explore.
          </p>
        )}

        {/* Search results dropdown */}
        {filteredResults.length > 0 && (
          <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border rounded-md shadow-md mt-1">
            {filteredResults.map((paper) => (
              <li
                key={paper.int_id}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => selectPaper(paper.int_id)}
              >
                {paper.title || `Untitled (${paper.int_id})`}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Popular papers dropdown row */}
      <div className="mb-6">
        <select
          className="w-full p-2 border rounded-md"
          onChange={(e) => selectPaper(parseInt(e.target.value))}
          value={selectedPaperId ?? ""}
        >
          <option value="" disabled>
            Or select a popular paper...
          </option>
          {papers.slice(0, 10).map((paper) => (
            <option key={paper.int_id} value={paper.int_id}>
              {paper.title.slice(0, 80)}
            </option>
          ))}
        </select>
      </div>

      {/* Graph container centered */}
      {selectedPaperId && (
        <div className="relative w-full h-full rounded-lg shadow bg-white">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={window.innerWidth * 0.5}
            height={window.innerHeight * 0.65}
            nodeLabel={(node) => node.label}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const radius = node.val || 4;
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color || "#888";
              ctx.fill();
            }}
            onNodeHover={(node) => setHoveredNode(node || null)}
            onNodeClick={(node) => setSelectedPaperId(node.id)}
            enableZoomInteraction={false}
            enablePanInteraction={false}
            d3VelocityDecay={0.6}
          />
          {hoveredNode && (
            <div
              className="absolute bg-black text-white text-sm px-3 py-1 rounded shadow"
              style={{ left: 10, top: 10, zIndex: 10 }}
            >
              {hoveredNode.label}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaperExplorer;
