"use client";

import { useEffect, useState } from "react";
import { jugadores, type Jugador } from "../datos/jugadores";

type Resultado = {
  jugador: Jugador;
  score: number;
};

export default function Resultados() {
  const [general, setGeneral] = useState<Resultado[]>([]);
  const [viejitos, setViejitos] = useState<Resultado[]>([]);

  useEffect(() => {
    const fecha = localStorage.getItem("laChangueadaFechaActual");
    const scoresGuardados = localStorage.getItem("laChangueadaScores");
    const jugadoresGuardados = localStorage.getItem("laChangueadaJugadores");

    if (!fecha || !scoresGuardados) return;

    const datos = JSON.parse(fecha);
    const scores = JSON.parse(scoresGuardados);

    const lista: Jugador[] = jugadoresGuardados
      ? JSON.parse(jugadoresGuardados)
      : jugadores;

    const generalOrdenado = lista
      .filter((j) => datos.general.includes(j.id))
      .map((j) => ({
        jugador: j,
        score: Number(scores[j.id] ?? 999),
      }))
      .sort((a, b) => a.score - b.score);

    const viejitosOrdenado = lista
      .filter((j) => datos.viejitos.includes(j.id))
      .map((j) => ({
        jugador: j,
        score: Number(scores[j.id] ?? 999),
      }))
      .sort((a, b) => a.score - b.score);

    setGeneral(generalOrdenado);
    setViejitos(viejitosOrdenado);
  }, []);

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">

      <h1 className="text-4xl font-bold mb-8">
        Resultados
      </h1>

      <div className="bg-white text-green-900 rounded-xl p-5 mb-8">

        <h2 className="text-2xl font-bold mb-4">
          General
        </h2>

        {general.map((r, index) => (
          <div
            key={r.jugador.id}
            className="flex justify-between border-b py-3"
          >
            <span>
              {index + 1}. {r.jugador.nombre}
            </span>

            <strong>{r.score}</strong>
          </div>
        ))}

      </div>

      <div className="bg-white text-green-900 rounded-xl p-5">

        <h2 className="text-2xl font-bold mb-4">
          Viejitos
        </h2>

        {viejitos.map((r, index) => (
          <div
            key={r.jugador.id}
            className="flex justify-between border-b py-3"
          >
            <span>
              {index + 1}. {r.jugador.nombre}
            </span>

            <strong>{r.score}</strong>
          </div>
        ))}

      </div>

      <a
        href="/scores"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Volver
      </a>

    </main>
  );
}