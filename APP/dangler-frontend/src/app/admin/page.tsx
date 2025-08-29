"use client";
import { useAuth } from "../../context/AuthContext";

export default function AdminPage() {
  const { user, token } = useAuth();

  if (!user) return <p>Please login first.</p>;
  if (user.role !== "admin") return <p>🚫 Access Denied: Admins only.</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user.name} (Role: {user.role})</p>
      {/* Example: call protected API */}
      <button
        onClick={async () => {
          const res = await fetch("http://localhost:5000/api/tagModeration/pending", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          console.log(data);
          alert("Check console for pending reports!");
        }}
        className="mt-4 bg-red-600 text-white p-2"
      >
        Load Pending Reports
      </button>
    </div>
  );
}
