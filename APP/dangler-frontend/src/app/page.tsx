"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [serverTime, setServerTime] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/test-db")
      .then((res) => res.json())
      .then((data) => setServerTime(JSON.stringify(data)))
      .catch((err) => setServerTime("Error: " + err.message));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">Hello Dangler 👋</h1>
      <p className="mt-2 text-gray-700">Frontend is working with Tailwind ✅</p>

      <div className="mt-4 p-4 bg-white shadow rounded">
        <p className="font-mono text-sm">Backend says:</p>
        <pre className="text-green-600">{serverTime}</pre>
      </div>
    </main>
  );
}
