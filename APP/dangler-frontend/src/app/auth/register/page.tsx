"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
        <input className="p-2 border" placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="p-2 border" placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="p-2 border" placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="bg-blue-600 text-white p-2">Register</button>
      </form>
      {msg && <p className="mt-2">{msg}</p>}
    </div>
  );
}
