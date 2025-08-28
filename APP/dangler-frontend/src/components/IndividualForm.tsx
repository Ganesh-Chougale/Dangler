"use client";
import { useState } from "react";

interface IndividualFormProps {
  initialData?: {
    name?: string;
    category?: string;
    sub_category?: string;
    description?: string;
    birth_date?: string;
    death_date?: string;
    profile_image?: string;
  };
  onSubmit: (data: FormData) => void; // IMPORTANT: use FormData for image upload
}

export default function IndividualForm({ initialData, onSubmit }: IndividualFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "real",
    sub_category: initialData?.sub_category || "",
    description: initialData?.description || "",
    birth_date: initialData?.birth_date || "",
    death_date: initialData?.death_date || "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("sub_category", form.sub_category);
    formData.append("description", form.description);
    formData.append("birth_date", form.birth_date);
    if (form.death_date) formData.append("death_date", form.death_date);
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
      <input
        type="date"
        name="birth_date"
        value={form.birth_date}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        type="date"
        name="death_date"
        value={form.death_date}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      {/* Profile Image Upload */}
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
