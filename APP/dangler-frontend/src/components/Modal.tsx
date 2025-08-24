"use client";
import { ReactNode } from "react";

export default function Modal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full">
        <button onClick={onClose} className="text-red-500 float-right">X</button>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
