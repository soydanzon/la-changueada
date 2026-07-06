"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jugadores, type Jugador } from "../datos/jugadores";

export default function Scores() {
  const router = useRouter();

  const [general, setGeneral] = useState<Jugador[]>([]);
  const [viejitos, setViejitos] = useState<Jugador[]>([]);
  const [scores, setScores] = useState<Record<number, string>>({});

  useEffect(() => {
    const fecha = localStorage.getItem("laChangueadaFechaActual");

    if (!fecha) return;

    const datos = JSON.parse(fecha);

    const guardados = localStorage.getItem("laChangueadaJugadores");

    const lista: Jugador[] = guardados
      ? JSON.parse(guardados)
      : jugadores;

    setGeneral(lista.filter((j) => datos.general.includes(j.id)));
    setViejitos(lista.filter((j) => datos.viejitos.includes(j.id)));
  }, []);

  function cambiarScore(id: number, valor: string) {
    setScores({
      ...scores,
      [id]: valor,
    });
  }

  function calcularResultados() {
    localStorage.setItem(
      "laChangueadaScores",
      JSON.stringify(scores)
    );

    router.push("/resultados");
  }

  const jugadoresUnicos = [...general, ...viejitos].filter(
    (jugador, index, array) =>
      array.findIndex((j) => j.id === jugador.id) === index
  );

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Cargar Scores
      </h1>

      <div className="bg-white text-green-900 rounded-xl p-5 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Scores
        </h2>

        {jugadoresUnicos.map((jugador) => (
          <div
            key={jugador.id}
            className="flex items-center justify-between gap-4 border-b py-3"
          >
            <span className="font-bold">
              {jugador.nombre}
            </span>

            <input
              type="number"
              value={scores[jugador.id] || ""}
              onChange={(e) => cambiarScore(jugador.id, e.target.value)}
              className="w-24 rounded-lg border p-2 text-black text-xl text-center"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <div className="bg-white text-green-900 rounded-xl p-5 mb-8">
        <h2 className="text-2xl font-bold">
          Resumen
        </h2>

        <p className="mt-3">
          General: {general.length} jugadores
        </p>

        <p>
          Viejitos: {viejitos.length} jugadores
        </p>
      </div>

      <button
        onClick={calcularResultados}
        className="w-full bg-white text-green-900 rounded-xl p-5 text-2xl font-bold"
      >
        Calcular resultados
      </button>

      <a
        href="/nueva-fecha"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Volver
      </a>
    </main>
  );
}