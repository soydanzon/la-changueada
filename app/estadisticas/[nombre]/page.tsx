"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  calcularEstadisticas,
  type EstadisticaJugador,
  type FechaGuardada,
} from "../../utils/estadisticas";

type HistorialJugador = {
  fecha: string;
  categoria: string;
  score: number;
  puesto: number;
  premio: number;
};

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function medalla(puesto: number) {
  if (puesto === 1) return "🥇";
  if (puesto === 2) return "🥈";
  if (puesto === 3) return "🥉";
  return `${puesto}°`;
}

export default function PerfilJugador() {
  const params = useParams();
  const nombre = decodeURIComponent(params.nombre as string);

  const [resumen, setResumen] = useState<EstadisticaJugador | null>(null);
  const [historialJugador, setHistorialJugador] = useState<HistorialJugador[]>([]);

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const fechas: FechaGuardada[] = JSON.parse(datos);

    const estadisticas = calcularEstadisticas(fechas);
    const jugador = estadisticas.find((j) => j.nombre === nombre);

    if (jugador) {
      setResumen(jugador);
    }

    const historial: HistorialJugador[] = [];

    fechas.forEach((fecha) => {
      fecha.general.forEach((resultado) => {
        if (resultado.jugador.nombre !== nombre) return;

        historial.push({
          fecha: fecha.fecha,
          categoria: "General",
          score: resultado.score,
          puesto: resultado.puesto,
          premio: resultado.premio,
        });
      });

      fecha.viejitos.forEach((resultado) => {
        if (resultado.jugador.nombre !== nombre) return;

        historial.push({
          fecha: fecha.fecha,
          categoria: "Viejitos",
          score: resultado.score,
          puesto: resultado.puesto,
          premio: resultado.premio,
        });
      });
    });

    setHistorialJugador(historial);
  }, [nombre]);

  if (!resumen) {
    return (
      <main className="min-h-screen bg-green-900 text-white p-6">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold">
        {nombre}
      </h1>

      <div className="mt-8 bg-white text-green-900 rounded-xl p-5 space-y-2">
        <p>🏌️ Jugadas: {resumen.jugadas}</p>
        <p>🥇 Victorias: {resumen.victorias}</p>
        <p>🏆 Podios: {resumen.podios}</p>
        <p>📊 Promedio: {resumen.promedio.toFixed(1)}</p>
        <p>⭐ Mejor score: {resumen.mejorScore}</p>
        <p>💸 Aportado: {formatearPesos(resumen.aportado)}</p>
        <p>💰 Ganado: {formatearPesos(resumen.ganado)}</p>
        <p className="font-bold text-lg">
          📈 Balance: {formatearPesos(resumen.balance)}
        </p>
      </div>

      <div className="mt-8 bg-white text-green-900 rounded-xl p-5">
        <h2 className="text-2xl font-bold mb-4">
          Historial
        </h2>

        {historialJugador.map((h, index) => (
          <div
            key={index}
            className="mb-4 rounded-xl border p-4"
          >
            <p className="font-bold">
              📅 {h.fecha}
            </p>

            <p>
              🏆 {h.categoria}
            </p>

            <div className="mt-3 flex justify-between items-center">
              <span className="text-xl font-bold">
                {medalla(h.puesto)}
              </span>

              <span>
                ⚽ {h.score}
              </span>

              <span className="font-bold">
                💰 {formatearPesos(h.premio)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/estadisticas"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Volver
      </a>
    </main>
  );
}