import React, { useState, useEffect, ChangeEvent } from "react";

interface SearchEntry {
  int_id: number;
  title: string;
}

interface SearchBarProps {
  onSelect: (id: number) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchIndex, setSearchIndex] = useState<SearchEntry[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchEntry[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    async function fetchSearchIndex() {
      try {
        const res = await fetch("/search_index.json");
        const data: SearchEntry[] = await res.json();
        setSearchIndex(data);
      } catch (err) {
        console.error("Failed to load search index", err);
      }
    }
    fetchSearchIndex();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults([]);
      setShowDropdown(false);
      return;
    }

    const filtered = searchIndex.filter((entry) =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered.slice(0, 10)); // Limit results
    setShowDropdown(true);
  }, [searchTerm, searchIndex]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (id: number, title: string) => {
    setSearchTerm(title);
    setShowDropdown(false);
    onSelect(id);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Search papers..."
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => {
          if (filteredResults.length > 0) setShowDropdown(true);
        }}
        onBlur={() => {
          // small delay to allow click before hiding
          setTimeout(() => setShowDropdown(false), 150);
        }}
      />
      {showDropdown && filteredResults.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded max-h-60 overflow-auto shadow-lg">
          {filteredResults.map(({ int_id, title }) => (
            <li
              key={int_id}
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onMouseDown={() => handleSelect(int_id, title)} // onMouseDown so it fires before onBlur
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
