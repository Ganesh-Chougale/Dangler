"use client";
import { useState } from "react";

interface EventFormProps {
  initialData?: any;
  individualId: number;
  onSubmit: (data: FormData) => void;
}

export default function EventForm({ initialData, individualId, onSubmit }: EventFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    event_date_bc: initialData?.event_date_bc || false,
    event_day: initialData?.event_day || "",
    event_month: initialData?.event_month || "",
    event_year: initialData?.event_year || "",
    media: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "media") setForm({ ...form, media: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleADBCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, event_date_bc: e.target.value === "bc" });
  };

  // Validate date
  const validateDate = (year: number, month?: number, day?: number) => {
    if (!year) return false;
    if (month && (month < 1 || month > 12)) return false;
    if (day) {
      if (day < 1 || day > 31) return false;
      const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
      if (month) {
        if (month === 2) {
          const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
          if (!isLeap && day > 28) return false;
          if (isLeap && day > 29) return false;
        } else if (day > daysInMonth[month-1]) return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(String(form.event_year));
    const month = form.event_month ? parseInt(String(form.event_month)) : undefined;
    const day = form.event_day ? parseInt(String(form.event_day)) : undefined;

    if (!form.title || !year) return alert("Title and Year are required");
    if (!validateDate(year, month, day)) return alert("Invalid date");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("year", String(year));
    fd.append("month", String(month || 1));
    fd.append("day", String(day || 1));
    fd.append("era", form.event_date_bc ? "BCE" : "CE");
    fd.append("individual_id", String(individualId));
    if (form.media) fd.append("media", form.media);

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input type="text" name="title" placeholder="Event Title" value={form.title} onChange={handleChange} className="border p-2 w-full" required />
      <textarea name="description" placeholder="Event Description" value={form.description} onChange={handleChange} className="border p-2 w-full" />
      
      <div className="flex space-x-2 items-center">
        <label className="text-sm font-semibold">Date Type:</label>
        <div className="flex space-x-4">
          <label>
            <input type="radio" name="ad_bc" value="ad" checked={!form.event_date_bc} onChange={handleADBCChange} /> AD/CE
          </label>
          <label>
            <input type="radio" name="ad_bc" value="bc" checked={form.event_date_bc} onChange={handleADBCChange} /> BC/BCE
          </label>
        </div>
      </div>

      <div className="flex space-x-2">
        <input type="number" name="event_day" placeholder="Day (optional)" value={form.event_day} onChange={handleChange} className="border p-2 w-1/3" />
        <input type="number" name="event_month" placeholder="Month (optional)" value={form.event_month} onChange={handleChange} className="border p-2 w-1/3" />
        <input type="number" name="event_year" placeholder="Year" value={form.event_year} onChange={handleChange} className="border p-2 w-1/3" required />
      </div>

      <div>
        <label>Media (image/video): </label>
        <input type="file" name="media" onChange={handleChange} accept="image/*,video/mp4" />
      </div>

      <button className="bg-green-600 text-white px-4 py-2 rounded">Save Event</button>
    </form>
  );
}
