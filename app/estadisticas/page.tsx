"use client";

import { useEffect, useState } from "react";
import {
  calcularEstadisticas,
  type EstadisticaJugador,
  type FechaGuardada,
} from "../utils/estadisticas";

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function Estadisticas() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaJugador[]>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const historial: FechaGuardada[] = JSON.parse(datos);

    setEstadisticas(
      calcularEstadisticas(historial).sort((a, b) => b.balance - a.balance)
    );
  }, []);

  const estadisticasFiltradas = estadisticas.filter((jugador) =>
    jugador.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Estadísticas
      </h1>

      <input
        type="text"
        placeholder="Buscar jugador..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-6 w-full rounded-lg p-4 text-black text-xl"
      />

      <div className="space-y-4">
        {estadisticasFiltradas.map((jugador) => (
          <div
            key={jugador.nombre}
            className="bg-white text-green-900 rounded-xl p-5"
          >
            <a
              href={`/estadisticas/${encodeURIComponent(jugador.nombre)}`}
              className="text-2xl font-bold underline"
            >
              {jugador.nombre}
            </a>

            <p className="mt-2">
              Jugadas: {jugador.jugadas}
            </p>

            <p>
              Aportado: {formatearPesos(jugador.aportado)}
            </p>

            <p>
              Ganado: {formatearPesos(jugador.ganado)}
            </p>

            <p className="font-bold">
              Balance: {formatearPesos(jugador.balance)}
            </p>

            <p>
              Victorias: {jugador.victorias}
            </p>

            <p>
              Podios: {jugador.podios}
            </p>
          </div>
        ))}
      </div>

      <a
        href="/"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Menú principal
      </a>
    </main>
  );
}