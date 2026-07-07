"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Resultado = {
  jugador: {
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
};

type FechaGuardada = {
  id: number;
  fecha: string;
  general: Resultado[];
  viejitos: Resultado[];
};

type ResumenJugador = {
  jugadas: number;
  aportado: number;
  ganado: number;
  balance: number;
  victorias: number;
  podios: number;
  promedio: number;
  mejorScore: number;
};

type HistorialJugador = {
  fecha: string;
  categoria: string;
  score: number;
  puesto: number;
  premio: number;
};

const VALOR_CHANGUEADA = 10000;

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

  const [resumen, setResumen] = useState<ResumenJugador>({
    jugadas: 0,
    aportado: 0,
    ganado: 0,
    balance: 0,
    victorias: 0,
    podios: 0,
    promedio: 0,
    mejorScore: 0,
  });

  const [historialJugador, setHistorialJugador] = useState<
    HistorialJugador[]
  >([]);

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const fechas: FechaGuardada[] = JSON.parse(datos);

    let jugadas = 0;
    let aportado = 0;
    let ganado = 0;
    let victorias = 0;
    let podios = 0;
    let sumaScores = 0;
    let mejorScore = 999;

    const historial: HistorialJugador[] = [];

    fechas.forEach((fecha) => {
      [...fecha.general, ...fecha.viejitos].forEach((resultado) => {
        if (resultado.jugador.nombre !== nombre) return;

        jugadas++;
        aportado += VALOR_CHANGUEADA;
        ganado += resultado.premio;
        sumaScores += resultado.score;

        if (resultado.score < mejorScore) {
          mejorScore = resultado.score;
        }

        if (resultado.puesto === 1) victorias++;
        if (resultado.puesto <= 3) podios++;

        historial.push({
          fecha: fecha.fecha,
          categoria: fecha.general.includes(resultado)
            ? "General"
            : "Viejitos",
          score: resultado.score,
          puesto: resultado.puesto,
          premio: resultado.premio,
        });
      });
    });

    setResumen({
      jugadas,
      aportado,
      ganado,
      balance: ganado - aportado,
      victorias,
      podios,
      promedio: jugadas ? sumaScores / jugadas : 0,
      mejorScore: jugadas ? mejorScore : 0,
    });

    setHistorialJugador(historial);
  }, [nombre]);

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