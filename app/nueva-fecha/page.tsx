"use client";

import { useState } from "react";
import { jugadores } from "../datos/jugadores";
import { config } from "../config/config";

export default function NuevaFecha() {
  const [general, setGeneral] = useState<number[]>([]);
  const [viejitos, setViejitos] = useState<number[]>([]);

  function cambiarGeneral(id: number) {
    if (general.includes(id)) {
      setGeneral(general.filter((j) => j !== id));
    } else {
      setGeneral([...general, id]);
    }
  }

  function cambiarViejitos(id: number) {
    if (viejitos.includes(id)) {
      setViejitos(viejitos.filter((j) => j !== id));
    } else {
      setViejitos([...viejitos, id]);
    }
  }

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">
        Nueva Fecha
      </h1>

      <div className="space-y-4">

        {jugadores.map((jugador) => (
          <div
            key={jugador.id}
            className="bg-white rounded-xl p-4 text-green-900"
          >

            <div className="font-bold text-xl mb-3">
              {jugador.nombre}
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() => cambiarGeneral(jugador.id)}
                className={`flex-1 h-12 rounded-lg font-bold ${
                  general.includes(jugador.id)
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                General
              </button>

              <button
                onClick={() => cambiarViejitos(jugador.id)}
                className={`flex-1 h-12 rounded-lg font-bold ${
                  viejitos.includes(jugador.id)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Viejitos
              </button>

            </div>

          </div>
        ))}

      </div>

      <div className="mt-8 bg-white rounded-xl p-5 text-green-900">

        <p className="text-xl">
          General: {general.length} jugadores
        </p>

        <p className="mb-4">
          Pozo: $
          {(general.length * config.valorChangueada).toLocaleString("es-AR")}
        </p>

        <p className="text-xl">
          Viejitos: {viejitos.length} jugadores
        </p>

        <p>
          Pozo: $
          {(viejitos.length * config.valorChangueada).toLocaleString("es-AR")}
        </p>

      </div>
    </main>
  );
}