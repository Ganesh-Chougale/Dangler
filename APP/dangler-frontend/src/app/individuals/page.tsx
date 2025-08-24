"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Individual {
  id: number;
  name: string;
  category: string;
  description: string;
  birth_date: string;
  death_date?: string | null;
}

export default function IndividualsPage() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/individuals")
      .then(res => res.json())
      .then(data => setIndividuals(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Individuals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {individuals.map(ind => (
          <Link key={ind.id} href={`/individuals/${ind.id}`} className="p-4 border rounded shadow hover:shadow-lg transition">
            <h2 className="font-semibold text-xl">{ind.name}</h2>
            <p className="text-gray-600">{ind.category}</p>
            <p className="text-gray-700 mt-2">{ind.description}</p>
            <p className="text-gray-500 text-sm mt-1">
              {ind.birth_date?.slice(0,10)} - {ind.death_date ? ind.death_date.slice(0,10) : "Present"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
