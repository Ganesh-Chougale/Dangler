"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      {/* Left side (branding / home link) */}
      <Link href="/" className="text-lg font-bold">
        Dangler
      </Link>

      {/* Right side (links / auth) */}
      <div className="flex gap-4 items-center">
        {!user && (
          <>
            <Link href="/auth/login" className="hover:underline">
              Login
            </Link>
            <Link href="/auth/register" className="hover:underline">
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            <span className="text-sm">
              👋 {user.name} ({user.role})
            </span>
            {/* Admin-only link */}
            {user.role === "admin" && (
              <Link href="/admin" className="hover:underline text-red-400">
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-600 px-2 py-1 rounded text-sm hover:bg-red-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
