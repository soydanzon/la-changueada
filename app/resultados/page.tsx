"use client";

import { useEffect, useState } from "react";
import { jugadores, type Jugador } from "../datos/jugadores";
import { obtenerCanchasGuardadas } from "../datos/canchas";
import { tablaPremios } from "../premios/tablaPremios";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

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

type CanchaFecha = {
  id: number;
  nombre: string;
  par: number;
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
    const totalPremios = premiosInvolucrados.reduce(
      (suma, premio) => suma + premio,
      0
    );

    const premioBase = Math.floor(totalPremios / cantidad);
    const resto = totalPremios - premioBase * cantidad;

    empatados.forEach((resultado, index) => {
      finales.push({
        ...resultado,
        puesto: inicio + 1,
        premio: premioBase + (index === 0 ? resto : 0),
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
  const [canchaFecha, setCanchaFecha] = useState<CanchaFecha | null>(null);
  const [fechaGuardada, setFechaGuardada] = useState(false);

  useEffect(() => {
    
    const yaGuardada = localStorage.getItem("laChangueadaFechaYaGuardada");

if (yaGuardada === "true") {
  setFechaGuardada(true);
}
    
    const fecha = localStorage.getItem("laChangueadaFechaActual");
    const scoresGuardados = localStorage.getItem("laChangueadaScores");
    const jugadoresGuardados = localStorage.getItem(
      "laChangueadaJugadores"
    );

    if (!fecha || !scoresGuardados) return;

    const datos = JSON.parse(fecha);
    const scores = JSON.parse(scoresGuardados);

    const canchaEncontrada = obtenerCanchasGuardadas().find(
      (cancha) => cancha.id === datos.cancha
    );

    if (canchaEncontrada) {
      setCanchaFecha({
        id: canchaEncontrada.id,
        nombre: canchaEncontrada.nombre,
        par: canchaEncontrada.par,
      });
    }

    const lista: Jugador[] = jugadoresGuardados
      ? JSON.parse(jugadoresGuardados)
      : jugadores;

    const generalOrdenado = lista
      .filter((jugador) => datos.general.includes(jugador.id))
      .map((jugador) => ({
        jugador,
        score: Number(scores[jugador.id] ?? 999),
      }))
      .sort((a, b) => a.score - b.score);

    const viejitosOrdenado = lista
      .filter((jugador) => datos.viejitos.includes(jugador.id))
      .map((jugador) => ({
        jugador,
        score: Number(scores[jugador.id] ?? 999),
      }))
      .sort((a, b) => a.score - b.score);

    setGeneral(calcularPremios(generalOrdenado));
    setViejitos(calcularPremios(viejitosOrdenado));
  }, []);

  function guardarFecha() {
    if (fechaGuardada) return;

    const historialGuardado = localStorage.getItem(
      "laChangueadaHistorial"
    );

    const historial = historialGuardado
      ? JSON.parse(historialGuardado)
      : [];

    const nuevaFecha = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString("es-AR"),
      cancha: canchaFecha,
      general,
      viejitos,
    };

    localStorage.setItem(
      "laChangueadaHistorial",
      JSON.stringify([nuevaFecha, ...historial])
    );

    localStorage.setItem("laChangueadaFechaYaGuardada", "true");
    setFechaGuardada(true);
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Resultados
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {canchaFecha && (
        <div className="mb-8 rounded-xl bg-white p-5 text-green-900">
          <p className="text-xl font-bold">
            🚩 {canchaFecha.nombre}
          </p>

          <p>
            E {canchaFecha.par}
          </p>
        </div>
      )}

      <div className="mb-8 rounded-xl bg-white p-5 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          General
        </h2>

        {general.map((resultado) => (
          <div
            key={resultado.jugador.id}
            className="flex items-center justify-between gap-4 border-b py-3"
          >
            <span>
              {resultado.puesto}. {resultado.jugador.nombre} -{" "}
              {resultado.score}
            </span>

            <strong>
              {resultado.premio > 0
                ? formatearPesos(resultado.premio)
                : "-"}
            </strong>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-5 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          Viejitos
        </h2>

        {viejitos.map((resultado) => (
          <div
            key={resultado.jugador.id}
            className="flex items-center justify-between gap-4 border-b py-3"
          >
            <span>
              {resultado.puesto}. {resultado.jugador.nombre} -{" "}
              {resultado.score}
            </span>

            <strong>
              {resultado.premio > 0
                ? formatearPesos(resultado.premio)
                : "-"}
            </strong>
          </div>
        ))}
      </div>

      {!fechaGuardada ? (
        <button
          onClick={guardarFecha}
          className="mt-8 w-full rounded-xl bg-white p-5 text-2xl font-bold text-green-900"
        >
          Guardar fecha
        </button>
      ) : (
        <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
          <p className="text-center text-xl font-bold">
            ✅ Fecha guardada correctamente
          </p>

          <a
            href="/historial"
            className="mt-5 block w-full rounded-xl bg-green-700 p-4 text-center font-bold text-white"
          >
            📜 Ver historial
          </a>

          <a
            href="/nueva-fecha"
            className="mt-3 block w-full rounded-xl bg-green-900 p-4 text-center font-bold text-white"
          >
            ➕ Nueva fecha
          </a>
        </div>
      )}
    </main>
  );
}