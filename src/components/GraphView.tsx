import React, { useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

interface GraphViewProps {
  selectedId: number | null;
}

interface PaperNode {
  id: string;
  title: string;
  val: number;
}

interface Link {
  source: string;
  target: string;
}

interface PapersData {
  [key: string]: {
    title: string;
  };
}

interface EdgesData {
  [key: string]: string[]; // list of neighbor ids
}

export default function GraphView({ selectedId }: GraphViewProps) {
  const [papers, setPapers] = useState<PapersData | null>(null);
  const [edges, setEdges] = useState<EdgesData | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: PaperNode[]; links: Link[] }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [papersRes, edgesRes] = await Promise.all([
          fetch("/papers.json"),
          fetch("/citation_edges.json"),
        ]);
        const papersJson = await papersRes.json();
        const edgesJson = await edgesRes.json();

        setPapers(papersJson);
        setEdges(edgesJson);
      } catch (err) {
        console.error("Failed to load graph data", err);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!papers || !edges || !selectedId) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    const nodeId = String(selectedId);

    const mainNode: PaperNode = {
      id: nodeId,
      title: papers[nodeId]?.title || "Unknown",
      val: 10,
    };

    const neighbors = edges[nodeId] || [];

    const nodes: PaperNode[] = [mainNode];
    neighbors.forEach((nid) => {
      nodes.push({
        id: String(nid),
        title: papers[String(nid)]?.title || "Unknown",
        val: 5,
      });
    });

    const links: Link[] = neighbors.map((nid) => ({
      source: nodeId,
      target: String(nid),
    }));

    setGraphData({ nodes, links });
  }, [selectedId, papers, edges]);

  if (!selectedId) return <div>Select a paper to see the graph.</div>;
  if (!papers || !edges) return <div>Loading graph data...</div>;

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={(node) => node.title}
        nodeAutoColorBy="id"
        nodeVal={(node) => node.val}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
      />
    </div>
  );
}
