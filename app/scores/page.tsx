"use client";

import { useEffect, useState } from "react";

export default function Scores() {
  const [general, setGeneral] = useState<number[]>([]);
  const [viejitos, setViejitos] = useState<number[]>([]);

  useEffect(() => {
    const fecha = localStorage.getItem("laChangueadaFechaActual");

    if (fecha) {
      const datos = JSON.parse(fecha);
      setGeneral(datos.general);
      setViejitos(datos.viejitos);
    }
  }, []);

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">

      <h1 className="text-4xl font-bold mb-8">
        Cargar Scores
      </h1>

      <div className="bg-white text-green-900 rounded-xl p-5 mb-6">
        <p className="text-2xl font-bold">
          General
        </p>

        <p className="mt-2">
          Jugadores: {general.length}
        </p>
      </div>

      <div className="bg-white text-green-900 rounded-xl p-5">
        <p className="text-2xl font-bold">
          Viejitos
        </p>

        <p className="mt-2">
          Jugadores: {viejitos.length}
        </p>
      </div>

      <a
        href="/nueva-fecha"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Volver
      </a>

    </main>
  );
}