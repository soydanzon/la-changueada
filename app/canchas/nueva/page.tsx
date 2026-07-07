"use client";

import { useState } from "react";

export default function NuevaCancha() {
  const [nombre, setNombre] = useState("");
  const [par, setPar] = useState("");

  function guardar() {
    alert("Próximamente se guardará la cancha.");
  }

  return (
    <main className="min-h-screen bg-green-950 text-white p-6">
      <h1 className="text-4xl font-black mb-8">
        🚩 Nueva cancha
      </h1>

      <label className="font-bold">
        Nombre
      </label>

      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="mt-2 mb-6 w-full rounded-xl p-4 text-black text-xl"
        placeholder="Ej. Los Álamos"
      />

      <label className="font-bold">
        E Par
      </label>

      <input
        type="number"
        value={par}
        onChange={(e) => setPar(e.target.value)}
        className="mt-2 w-full rounded-xl p-4 text-black text-xl"
        placeholder="69"
      />

      <button
        onClick={guardar}
        className="mt-8 w-full bg-white text-green-950 rounded-2xl p-4 font-black"
      >
        💾 Guardar
      </button>

      <a
        href="/canchas"
        className="block mt-6 bg-white text-green-950 rounded-2xl p-4 text-center font-black"
      >
        ← Volver
      </a>
    </main>
  );
}