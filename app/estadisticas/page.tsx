"use client";

import { useEffect, useState } from "react";
import {
  calcularEstadisticas,
  type EstadisticaJugador,
  type FechaGuardada,
} from "../utils/estadisticas";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

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
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">
          📊 Estadísticas
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar jugador..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-6 w-full rounded-lg bg-white p-4 text-xl text-black"
      />

      <div className="space-y-4">
        {estadisticasFiltradas.map((jugador) => (
          <div
            key={jugador.nombre}
            className="rounded-xl bg-white p-5 text-green-900"
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
    </main>
  );
}