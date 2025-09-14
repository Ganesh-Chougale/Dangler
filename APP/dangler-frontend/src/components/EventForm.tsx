"use client";
import { useState } from "react";

interface EventFormProps {
  initialData?: {
    title?: string;
    description?: string;
    event_date_bc?: boolean;
    event_day?: number | null;
    event_month?: number | null;
    event_year?: number | null;
    individual_id?: number;
  };
  individualId: number;
  onSubmit: (data: any) => void;
}

export default function EventForm({ initialData, individualId, onSubmit }: EventFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    event_date_bc: initialData?.event_date_bc || false,
    event_day: initialData?.event_day || null,
    event_month: initialData?.event_month || null,
    event_year: initialData?.event_year || null,
    individual_id: initialData?.individual_id || individualId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue = value ? parseInt(value, 10) : null;
      setForm({ ...form, [name]: numValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleADBCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      event_date_bc: e.target.value === 'bc',
    });
  };

  // Helper function to format date
  const formatDate = (year: number | null, month: number | null, day: number | null) => {
    if (!year) return null;
    const formattedYear = Math.abs(year);
    const formattedMonth = month ? String(month).padStart(2, '0') : '00';
    const formattedDay = day ? String(day).padStart(2, '0') : '00';
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { event_year, event_month, event_day } = form;

    if (!event_year) {
      alert("Year is a required field.");
      return;
    }
    if (event_month && (event_month < 1 || event_month > 12)) {
      alert("Month must be between 1 and 12.");
      return;
    }
    if (event_day) {
      if (event_day < 1 || event_day > 31) {
        alert("Day must be a valid number (1-31).");
        return;
      }
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (event_month === 2) {
        const isLeap = (event_year % 4 === 0 && event_year % 100 !== 0) || (event_year % 400 === 0);
        if (isLeap && event_day > 29) {
          alert("February in a leap year only has 29 days.");
          return;
        } else if (!isLeap && event_day > 28) {
          alert("February only has 28 days.");
          return;
        }
      } else if (event_month && event_day > daysInMonth[event_month - 1]) {
        alert("Day is not valid for the selected month.");
        return;
      }
    }

    // Format the date into a single string for backend
    const formattedDate = formatDate(form.event_year, form.event_month, form.event_day);
    
    // Prepare data for submission, including BC flag and formatted date string
    onSubmit({
      ...form,
      event_date: formattedDate,
    });
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
      <div className="flex space-x-2 items-center">
        <label className="text-sm font-semibold">Date Type:</label>
        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              name="ad_bc"
              value="ad"
              checked={!form.event_date_bc}
              onChange={handleADBCChange}
            /> AD/CE
          </label>
          <label>
            <input
              type="radio"
              name="ad_bc"
              value="bc"
              checked={form.event_date_bc}
              onChange={handleADBCChange}
            /> BC/BCE
          </label>
        </div>
      </div>
      <div className="flex space-x-2">
        <input
          type="number"
          name="event_day"
          placeholder="Day (optional)"
          value={form.event_day === null ? '' : form.event_day}
          onChange={handleChange}
          className="border p-2 w-1/3"
        />
        <input
          type="number"
          name="event_month"
          placeholder="Month (optional)"
          value={form.event_month === null ? '' : form.event_month}
          onChange={handleChange}
          className="border p-2 w-1/3"
        />
        <input
          type="number"
          name="event_year"
          placeholder="Year"
          value={form.event_year === null ? '' : form.event_year}
          onChange={handleChange}
          className="border p-2 w-1/3"
          required
        />
      </div>
      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Save Event
      </button>
    </form>
  );
}