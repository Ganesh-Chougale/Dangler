"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.token) {
      login(data.user, data.token);
      setMsg("Login successful 🎉");
    } else {
      setMsg(data.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
        <input
          className="p-2 border"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          className="p-2 border"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="bg-green-600 text-white p-2">Login</button>
      </form>
      {msg && <p className="mt-2">{msg}</p>}
    </div>
  );
}
