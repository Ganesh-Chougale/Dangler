"use client";
import IndividualForm from "@/components/IndividualForm";

export default function NewIndividualPage() {
  const handleSubmit = async (data: any) => {
    try {
      // Convert empty death_date to null
      const payload = {
        ...data,
        death_date: data.death_date || null
      };

      const res = await fetch("http://localhost:5000/api/individuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      
      if (res.ok) {
        alert("Individual created!");
      } else {
        alert(`Failed to create individual: ${responseData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error creating individual:", err);
      alert("Failed to connect to the server. Please try again later.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Add New Individual</h1>
      <IndividualForm onSubmit={handleSubmit} />
    </div>
  );
}
