"use client";
import { useState } from "react";

interface EventFormProps {
  initialData?: {
    title?: string;
    description?: string;
    event_date?: string;
    media_url?: string;
    individual_id?: number;
  };
  individualId: number; // required to tie event to a person
  onSubmit: (data: any) => void;
}

export default function EventForm({ initialData, individualId, onSubmit }: EventFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    event_date: initialData?.event_date || "",
    media_url: initialData?.media_url || "",
    individual_id: initialData?.individual_id || individualId,
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        type="text"
        name="title"
        placeholder="Event Title"
        value={form.title}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <textarea
        name="description"
        placeholder="Event Description"
        value={form.description}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        type="date"
        name="event_date"
        value={form.event_date}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input
        type="url"
        name="media_url"
        placeholder="Media URL (optional)"
        value={form.media_url}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Save Event
      </button>
    </form>
  );
}
