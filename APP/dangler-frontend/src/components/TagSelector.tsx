"use client";
import { useEffect, useState } from "react";

interface Tag {
  id: number;
  name: string;
  type: string;
}

interface TagSelectorProps {
  individualId: number;
}

export default function TagSelector({ individualId }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [assignedTags, setAssignedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all tags + assigned tags
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/tags").then((res) => res.json()),
      fetch(`http://localhost:5000/api/tags/individual/${individualId}`).then((res) =>
        res.json()
      ),
    ])
      .then(([all, assigned]) => {
        setAllTags(all);
        setAssignedTags(assigned.map((t: Tag) => t.id));
      })
      .catch((err) => console.error(err));
  }, [individualId]);

  const toggleTag = async (tagId: number) => {
    setLoading(true);
    try {
      if (assignedTags.includes(tagId)) {
        // Remove tag
        await fetch("http://localhost:5000/api/tags/assign", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ individual_id: individualId, tag_id: tagId }),
        });
        setAssignedTags((prev) => prev.filter((id) => id !== tagId));
      } else {
        // Assign tag
        await fetch("http://localhost:5000/api/tags/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ individual_id: individualId, tag_id: tagId }),
        });
        setAssignedTags((prev) => [...prev, tagId]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Manage Tags</h3>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isAssigned = assignedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              disabled={loading}
              className={`px-3 py-1 rounded text-sm ${
                isAssigned
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
