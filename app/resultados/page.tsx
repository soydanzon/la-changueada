"use client";

import { useEffect, useState } from "react";
import { jugadores, type Jugador } from "../datos/jugadores";
import { tablaPremios } from "../premios/tablaPremios";

type Resultado = {
  jugador: Jugador;
  score: number;
  puesto: number;
  premio: number;
};

type ResultadoBase = {
  jugador: Jugador;
  score: number;
};

function calcularPremios(resultados: ResultadoBase[]): Resultado[] {
  const fila = tablaPremios.find((f) => f.jugadores === resultados.length);
  const premios = fila ? fila.premios : [];

  const finales: Resultado[] = [];
  let i = 0;

  while (i < resultados.length) {
    const scoreActual = resultados[i].score;
    const empatados = resultados.filter((r) => r.score === scoreActual);

    const inicio = i;
    const cantidad = empatados.length;

    const premiosInvolucrados = premios.slice(inicio, inicio + cantidad);
    const totalPremios = premiosInvolucrados.reduce((suma, p) => suma + p, 0);
    const premioPorJugador =
      cantidad > 0 ? Math.round(totalPremios / cantidad) : 0;

    empatados.forEach((resultado) => {
      finales.push({
        ...resultado,
        puesto: inicio + 1,
        premio: premioPorJugador,
      });
    });

    i += cantidad;
  }

  return finales;
}

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function Resultados() {
  const [general, setGeneral] = useState<Resultado[]>([]);
  const [viejitos, setViejitos] = useState<Resultado[]>([]);
  const [mensaje, setMensaje] = useState("");

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

    setGeneral(calcularPremios(generalOrdenado));
    setViejitos(calcularPremios(viejitosOrdenado));
  }, []);

  function guardarFecha() {
    const historialGuardado = localStorage.getItem("laChangueadaHistorial");
    const historial = historialGuardado ? JSON.parse(historialGuardado) : [];

    const nuevaFecha = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString("es-AR"),
      general,
      viejitos,
    };

    localStorage.setItem(
      "laChangueadaHistorial",
      JSON.stringify([nuevaFecha, ...historial])
    );

    setMensaje("✅ Fecha guardada");
  }

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Resultados
      </h1>

      <div className="bg-white text-green-900 rounded-xl p-5 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          General
        </h2>

        {general.map((r) => (
          <div
            key={r.jugador.id}
            className="flex justify-between items-center border-b py-3 gap-4"
          >
            <span>
              {r.puesto}. {r.jugador.nombre} - {r.score}
            </span>

            <strong>
              {r.premio > 0 ? formatearPesos(r.premio) : "-"}
            </strong>
          </div>
        ))}
      </div>

      <div className="bg-white text-green-900 rounded-xl p-5">
        <h2 className="text-2xl font-bold mb-4">
          Viejitos
        </h2>

        {viejitos.map((r) => (
          <div
            key={r.jugador.id}
            className="flex justify-between items-center border-b py-3 gap-4"
          >
            <span>
              {r.puesto}. {r.jugador.nombre} - {r.score}
            </span>

            <strong>
              {r.premio > 0 ? formatearPesos(r.premio) : "-"}
            </strong>
          </div>
        ))}
      </div>

      <button
        onClick={guardarFecha}
        className="mt-8 w-full bg-white text-green-900 rounded-xl p-5 text-2xl font-bold"
      >
        Guardar fecha
      </button>

      <p className="mt-4 text-xl">
        {mensaje}
      </p>

      <a
        href="/scores"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Volver
      </a>
    </main>
  );
}