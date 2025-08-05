import React from "react";
import PaperExplorer from "./pages/PaperExplorer";

function CitationFooter() {
  const today = new Date().toLocaleDateString();

  return (
    <footer className="text-xs text-gray-600 p-4 border-t mt-8 max-w-4xl mx-auto text-center">
      <p>
        Data sourced from{" "}
        <a
          href="https://openalex.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600"
        >
          OpenAlex
        </a>{" "}
        Artificial Intelligence dataset, last updated 5 August 2025.
      </p>
      <p>
        Built by{" "}
        <a
          href="https://www.linkedin.com/in/arafkhan03/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600"
        >
          araf
        </a>
        .
      </p>
      <p>
        Uses{" "}
        <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
          React
        </a>
        ,{" "}
        <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
          Tailwind CSS
        </a>
        ,{" "}
        <a
          href="https://github.com/vasturiano/react-force-graph"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600"
        >
          react-force-graph
        </a>
        , and the free React + Tailwind admin dashboard template.
      </p>
      <p className="mt-2 italic">
        This app complies with OpenAlex&apos;s data use and attribution guidelines.
      </p>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <PaperExplorer />
      <CitationFooter />
    </>
  );
}
