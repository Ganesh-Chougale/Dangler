"use client";
import { useState, useEffect } from "react";

export default function TagSelector({ individualId }: { individualId: number }) {
  const [tags, setTags] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/individual/${individualId}`)
      .then(res => res.json())
      .then(setTags);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`)
      .then(res => res.json())
      .then(setAllTags);
  }, [individualId]);

  const attachTag = async (tagId: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/individual/${individualId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId })
    });
    setTags([...tags, allTags.find(t => t.id === tagId)]);
  };

  const createTag = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag, type: "other" })
    });
    setNewTag("");
  };

  return (
    <div>
      <h3>Tags</h3>
      <ul>
        {tags.map(tag => (
          <li key={tag.id} className="inline-block bg-gray-200 px-2 py-1 m-1 rounded">
            {tag.name}
          </li>
        ))}
      </ul>

      <div>
        <select onChange={e => attachTag(Number(e.target.value))}>
          <option>Add existing tag</option>
          {allTags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>

      <div>
        <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="New tag" />
        <button onClick={createTag}>Add</button>
      </div>
    </div>
  );
}
