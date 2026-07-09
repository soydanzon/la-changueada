"use client";

import { useEffect, useState } from "react";
import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../datos/canchas";

export default function Canchas() {
  const [canchas, setCanchas] = useState<Cancha[]>([]);

  useEffect(() => {
    setCanchas(obtenerCanchasGuardadas());
  }, []);

  return (
    <main className="min-h-screen bg-green-950 text-white p-6">
      <h1 className="text-4xl font-black mb-8">
        🚩 Canchas
      </h1>

      <div className="space-y-4">
        {canchas
          .filter((cancha) => cancha.activa)
          .map((cancha) => (
            <div
              key={cancha.id}
              className="bg-white text-green-950 rounded-2xl p-5"
            >
              <h2 className="text-2xl font-black">
                {cancha.nombre}
              </h2>

              <p className="mt-2 text-lg">
                E {cancha.par}
              </p>
            </div>
          ))}
      </div>

      <a
        href="/canchas/nueva"
        className="block mt-8 w-full bg-white text-green-950 rounded-2xl p-4 text-center font-black"
      >
        ➕ Agregar cancha
      </a>

      <a
        href="/configuracion"
        className="block mt-6 bg-white text-green-950 rounded-2xl p-4 text-center font-black"
      >
        ← Volver
      </a>
    </main>
  );
}