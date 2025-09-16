"use client";
import { useEffect, useState } from "react";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

interface Tag {
  id: number;
  name: string;
  type: string;
}

interface Individual {
  id: number;
  name: string;
  category: string;
  description: string;
  profile_image?: string | null;
}

export default function SearchPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [includeTags, setIncludeTags] = useState<number[]>([]);
  const [excludeTags, setExcludeTags] = useState<number[]>([]);
  const [scope, setScope] = useState<"individuals" | "events">("individuals");
  const [results, setResults] = useState<Individual[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`)
      .then(res => res.json())
      .then(setTags)
      .catch(console.error);
  }, []);

  const toggleTag = (id: number, include = true) => {
    const arr = include ? includeTags : excludeTags;
    if (arr.includes(id)) {
      include ? setIncludeTags(arr.filter(t => t !== id)) : setExcludeTags(arr.filter(t => t !== id));
    } else {
      include ? setIncludeTags([...arr, id]) : setExcludeTags([...arr, id]);
    }
  };

  const runSearch = async () => {
    setSearching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ include: includeTags, exclude: excludeTags, scope }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Search {scope.charAt(0).toUpperCase() + scope.slice(1)}</h1>

      {/* Scope selector */}
      <div className="mb-4 flex items-center space-x-4">
        <button
          className={`px-4 py-2 rounded ${scope === "individuals" ? "bg-blue-600 text-white" : "bg-white border"}`}
          onClick={() => setScope("individuals")}
        >
          Individuals
        </button>
        <button
          className={`px-4 py-2 rounded ${scope === "events" ? "bg-blue-600 text-white" : "bg-white border"}`}
          onClick={() => setScope("events")}
        >
          Events
        </button>
      </div>

      {/* Include / Exclude Tags */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Include Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id, true)}
                className={`px-3 py-1 rounded-full border ${
                  includeTags.includes(tag.id) ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Exclude Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id, false)}
                className={`px-3 py-1 rounded-full border ${
                  excludeTags.includes(tag.id) ? "bg-red-500 text-white" : "bg-white"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={runSearch}
        className="mb-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {searching ? "Searching..." : "Run Search"}
      </button>

      {/* Results */}
      {results.length === 0 ? (
        <p className="text-gray-500">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(res => (
            <div key={res.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              {res.profile_image && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${res.profile_image}`}
                  alt={res.name}
                  className="w-16 h-16 rounded-full object-cover mb-2"
                />
              )}
              <h2 className="font-semibold text-lg">{res.name}</h2>
              <p className="text-gray-600 line-clamp-2">{res.description}</p>
              <span className="text-sm text-gray-400">{res.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
