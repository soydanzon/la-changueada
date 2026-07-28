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

  async function compartirListado() {
  const fecha = new Date().toLocaleDateString("es-AR");

  const lineas = [
    "⚽️ La Changueada 🚩",
    "",
    "Listado de Handicap",
    `Actualizado al ${fecha}`,
    "",
    "```",
    `${"Jugador".padEnd(28)}${"Hcp.".padStart(5)}`,
    "",
  ];

  handicaps.forEach((jugador, index) => {
    const nombreCompleto = `${index + 1}. ${jugador.nombre}`;

    const nombre =
      nombreCompleto.length > 24
        ? `${nombreCompleto.slice(0, 23)}…`
        : nombreCompleto;

    const handicap = formatearHandicap(
      jugador.handicap
    );

    lineas.push(
      `${nombre.padEnd(28)}${handicap.padStart(5)}`
    );
  });

  lineas.push("```");

  const texto = lineas.join("\n");

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Listado de Handicap",
        text: texto,
      });

      return;
    }

    await navigator.clipboard.writeText(texto);

    alert(
      "El listado fue copiado. Ya podés pegarlo en WhatsApp."
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return;
    }

    console.error(
      "No se pudo compartir el listado:",
      error
    );

    alert("No se pudo compartir el listado.");
  }
}

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

<button
  type="button"
  onClick={compartirListado}
  className="mb-4 w-full rounded-xl bg-blue-600 p-3 text-xl font-bold text-white"
>
  📤 Compartir listado
</button>

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