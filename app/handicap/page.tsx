"use client";

import { useEffect, useState } from "react";
import {
  calcularHandicap,
  type FechaGuardada,
  type HandicapJugador,
} from "../utils/estadisticas";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

function formatearNumero(valor: number) {
  return Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(1);
}

function formatearHandicap(valor: number) {
  return formatearNumero(valor);
}

export default function Handicap() {
  const [handicaps, setHandicaps] = useState<HandicapJugador[]>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const datosHistorial = localStorage.getItem(
      "laChangueadaHistorial"
    );

    if (!datosHistorial) return;

    const historial: FechaGuardada[] =
      JSON.parse(datosHistorial);

    const handicapsCalculados =
      calcularHandicap(historial);

    handicapsCalculados.sort(
      (a, b) => a.handicap - b.handicap
    );

    setHandicaps(handicapsCalculados);
  }, []);

  const handicapsFiltrados = handicaps.filter(
    (jugador) =>
      jugador.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          🧢 Proyecto HCP
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

      {handicapsFiltrados.length === 0 ? (
        <div className="rounded-xl bg-white p-5 text-green-900">
          No hay hándicaps disponibles.
        </div>
      ) : (
        <div className="space-y-3">
          {handicapsFiltrados.map((jugador, index) => (
            <a
              key={jugador.nombre}
              href={`/handicap/${encodeURIComponent(
                jugador.nombre
              )}`}
              className="flex items-center justify-between rounded-xl bg-white p-3 text-green-900"
            >
              <span className="text-xl font-bold">
                {index + 1}. {jugador.nombre}
              </span>

              <strong className="text-2xl">
                {formatearHandicap(jugador.handicap)}
              </strong>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}