"use client";
import { useParams } from "next/navigation";
import EventForm from "@/components/EventForm";

export default function NewEventPage() {
  const params = useParams();
  const individualId = Number(params.id);

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (res.ok) {
        alert("Event created!");
      } else {
        alert(`Failed: ${responseData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Add New Event</h1>
      <EventForm individualId={individualId} onSubmit={handleSubmit} />
    </div>
  );
}
