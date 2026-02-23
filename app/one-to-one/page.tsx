"use client";

import { useState, useEffect } from "react";

export default function OneToOnePage() {
  const [professionalId, setProfessionalId] = useState(""); // maintenant on garde l'ID
  const [professionals, setProfessionals] = useState<{ id: string; name: string }[]>([]);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  // Récupérer la liste des professionnels au chargement
  useEffect(() => {
    async function fetchProfessionals() {
      const res = await fetch("/api/professionals"); // créer cette route si nécessaire
      const data = await res.json();
      setProfessionals(data);
    }
    fetchProfessionals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!professionalId) {
      setSuccess("Veuillez choisir un professionnel.");
      return;
    }

    const res = await fetch("/api/one-to-one", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ professionalId, date, message }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      setSuccess(errorData.message || "Erreur lors de la réservation.");
      return;
    }

    const data = await res.json();
    setSuccess(data.message);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-4">Réserver une séance individuelle</h1>
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select
          value={professionalId}
          onChange={(e) => setProfessionalId(e.target.value)}
          className="border p-2 rounded"
          required
        >
          <option value="">Choisissez un professionnel</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <textarea
          placeholder="Message (optionnel)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Envoyer
        </button>
      </form>
    </div>
  );
}
