"use client";
import { useEffect, useState } from "react";

export default function TagModerationPanel() {
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tag-moderation/pending`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(setPending);
  }, []);

  const review = async (id: number, status: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tag-moderation/review/${id}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ status })
    });
    setPending(pending.filter(p => p.id !== id));
  };

  return (
    <div>
      <h3>Pending Tag Reports</h3>
      <ul>
        {pending.map(p => (
          <li key={p.id}>
            {p.name} — reported
            <button onClick={() => review(p.id, "approved")}>Approve</button>
            <button onClick={() => review(p.id, "rejected")}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
