"use client";

import { useState } from "react";
import { jugadores } from "../datos/jugadores";

export default function NuevaFecha() {
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  function cambiarJugador(id: number) {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter((j) => j !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  }

  const pozo = seleccionados.length * 10000;

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">
        Nueva Fecha
      </h1>

      <input
        type="text"
        placeholder="Buscar jugador..."
        className="w-full rounded-lg p-4 text-black text-xl"
      />

      <div className="mt-6 space-y-3">
        {jugadores.map((jugador) => (
          <button
            key={jugador.id}
            onClick={() => cambiarJugador(jugador.id)}
            className="w-full bg-white text-green-900 rounded-lg p-4 text-xl text-left"
          >
            {seleccionados.includes(jugador.id) ? "☑" : "☐"}{" "}
            {jugador.nombre}
          </button>
        ))}
      </div>

      <div className="mt-10 bg-white text-green-900 rounded-xl p-5">
        <p className="text-xl">
          Jugadores: {seleccionados.length}
        </p>

        <p className="text-xl mt-2">
          Pozo: ${pozo.toLocaleString("es-AR")}
        </p>
      </div>
    </main>
  );
}