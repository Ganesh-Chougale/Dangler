"use client";
import { useState } from "react";

interface IndividualFormProps {
  initialData?: {
    name?: string;
    category?: string;
    sub_category?: string;
    description?: string;
    birth_date_bc?: boolean;
    birth_day?: number | null;
    birth_month?: number | null;
    birth_year?: number | null;
    death_date_bc?: boolean;
    death_day?: number | null;
    death_month?: number | null;
    death_year?: number | null;
    profile_image?: string;
  };
  onSubmit: (data: FormData) => void;
}

export default function IndividualForm({ initialData, onSubmit }: IndividualFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "real",
    sub_category: initialData?.sub_category || "",
    description: initialData?.description || "",
    birth_date_bc: initialData?.birth_date_bc || false,
    birth_day: initialData?.birth_day || null,
    birth_month: initialData?.birth_month || null,
    birth_year: initialData?.birth_year || null,
    death_date_bc: initialData?.death_date_bc || false,
    death_day: initialData?.death_day || null,
    death_month: initialData?.death_month || null,
    death_year: initialData?.death_year || null,
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue = value ? parseInt(value, 10) : null;
      setForm({ ...form, [name]: numValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleADBCChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value === 'bc',
    });
  };

  // Helper function to format date
  const formatDate = (year: number | null, month: number | null, day: number | null, isBC: boolean) => {
    if (!year) return null;
    const yearValue = isBC ? -year : year;
    const formattedYear = String(Math.abs(yearValue)).padStart(4, '0');
    const formattedMonth = month ? String(month).padStart(2, '0') : '00';
    const formattedDay = day ? String(day).padStart(2, '0') : '00';
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reusable validation function
    const validateDate = (year: number | null, month: number | null, day: number | null, fieldName: string) => {
      if (!year) {
        alert(`${fieldName} Year is a required field.`);
        return false;
      }
      if (month && (month < 1 || month > 12)) {
        alert(`${fieldName} Month must be between 1 and 12.`);
        return false;
      }
      if (day) {
        if (day < 1 || day > 31) {
          alert(`${fieldName} Day must be a valid number (1-31).`);
          return false;
        }
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month === 2) {
          const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
          if (isLeap && day > 29) {
            alert(`${fieldName} February in a leap year only has 29 days.`);
            return false;
          } else if (!isLeap && day > 28) {
            alert(`${fieldName} February only has 28 days.`);
            return false;
          }
        } else if (month && day > daysInMonth[month - 1]) {
          alert(`${fieldName} Day is not valid for the selected month.`);
          return false;
        }
      }
      return true;
    };

    if (form.birth_year && !validateDate(form.birth_year, form.birth_month, form.birth_day, 'Birth Date')) {
      return;
    }
    if (form.death_year && !validateDate(form.death_year, form.death_month, form.death_day, 'Death Date')) {
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("sub_category", form.sub_category);
    formData.append("description", form.description);

    // Format and append birth date
    const formattedBirthDate = formatDate(form.birth_year, form.birth_month, form.birth_day, form.birth_date_bc);
    if (formattedBirthDate) formData.append("birth_date", formattedBirthDate);

    // Format and append death date
    const formattedDeathDate = formatDate(form.death_year, form.death_month, form.death_day, form.death_date_bc);
    if (formattedDeathDate) formData.append("death_date", formattedDeathDate);

    if (profileImage) formData.append("profile_image", profileImage);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="real">Real</option>
        <option value="fictional">Fictional</option>
        <option value="mythological">Mythological</option>
        <option value="obscure">Obscure</option>
      </select>
      <input
        type="text"
        name="sub_category"
        placeholder="Sub Category (e.g., movie)"
        value={form.sub_category}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <div className="border p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Birth Date</h3>
        <div className="flex space-x-2 items-center mb-2">
          <label className="text-sm font-semibold">Date Type:</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="birth_date_ad_bc"
                value="ad"
                checked={!form.birth_date_bc}
                onChange={() => handleADBCChange("birth_date_bc", "ad")}
              /> AD/CE
            </label>
            <label>
              <input
                type="radio"
                name="birth_date_ad_bc"
                value="bc"
                checked={form.birth_date_bc}
                onChange={() => handleADBCChange("birth_date_bc", "bc")}
              /> BC/BCE
            </label>
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            name="birth_day"
            placeholder="Day (optional)"
            value={form.birth_day === null ? '' : form.birth_day}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
          <input
            type="number"
            name="birth_month"
            placeholder="Month (optional)"
            value={form.birth_month === null ? '' : form.birth_month}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
          <input
            type="number"
            name="birth_year"
            placeholder="Year (optional)"
            value={form.birth_year === null ? '' : form.birth_year}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
        </div>
      </div>
      <div className="border p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Death Date</h3>
        <div className="flex space-x-2 items-center mb-2">
          <label className="text-sm font-semibold">Date Type:</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="death_date_ad_bc"
                value="ad"
                checked={!form.death_date_bc}
                onChange={() => handleADBCChange("death_date_bc", "ad")}
              /> AD/CE
            </label>
            <label>
              <input
                type="radio"
                name="death_date_ad_bc"
                value="bc"
                checked={form.death_date_bc}
                onChange={() => handleADBCChange("death_date_bc", "bc")}
              /> BC/BCE
            </label>
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            name="death_day"
            placeholder="Day (optional)"
            value={form.death_day === null ? '' : form.death_day}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
          <input
            type="number"
            name="death_month"
            placeholder="Month (optional)"
            value={form.death_month === null ? '' : form.death_month}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
          <input
            type="number"
            name="death_year"
            placeholder="Year (optional)"
            value={form.death_year === null ? '' : form.death_year}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
        className="border p-2 w-full"
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  );
}