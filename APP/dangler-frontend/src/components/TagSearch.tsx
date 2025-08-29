"use client";
import { useState, useEffect } from "react";

export default function TagSearch() {
  const [allTags, setAllTags] = useState<any[]>([]);
  const [include, setInclude] = useState<number[]>([]);
  const [exclude, setExclude] = useState<number[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`)
      .then(res => res.json())
      .then(setAllTags);
  }, []);

  const search = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ include, exclude, scope: "individuals" })
    });
    setResults(await res.json());
  };

  return (
    <div>
      <h3>Tag Search</h3>

      <div>
        <h4>Include Tags</h4>
        <select onChange={e => setInclude([...include, Number(e.target.value)])}>
          <option value="">Select tag</option>
          {allTags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h4>Exclude Tags</h4>
        <select onChange={e => setExclude([...exclude, Number(e.target.value)])}>
          <option value="">Select tag</option>
          {allTags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>

      <button onClick={search}>Search</button>

      <ul>
        {results.map(r => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
}
