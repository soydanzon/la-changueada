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

function RankingBloque({
  titulo,
  jugadores,
  tipo,
}: {
  titulo: string;
  jugadores: EstadisticaJugador[];
  tipo: "victorias" | "podios" | "ganado" | "balance" | "promedio" | "mejorScore";
}) {
  return (
    <div className="bg-white text-green-900 rounded-xl p-5">
      <h2 className="text-2xl font-bold mb-4">
        {titulo}
      </h2>

      {jugadores.slice(0, 5).map((jugador, index) => (
        <div
          key={jugador.nombre}
          className="flex justify-between border-b py-2"
        >
          <span>
            {index + 1}. {jugador.nombre}
          </span>

          <strong>
            {tipo === "victorias" && jugador.victorias}
            {tipo === "podios" && jugador.podios}
            {tipo === "ganado" && formatearPesos(jugador.ganado)}
            {tipo === "balance" && formatearPesos(jugador.balance)}
            {tipo === "promedio" && jugador.promedio.toFixed(1)}
            {tipo === "mejorScore" && jugador.mejorScore}
          </strong>
        </div>
      ))}
    </div>
  );
}

export default function Ranking() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaJugador[]>([]);

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const historial: FechaGuardada[] = JSON.parse(datos);

    setEstadisticas(calcularEstadisticas(historial));
  }, []);

  const porVictorias = [...estadisticas].sort((a, b) => b.victorias - a.victorias);
  const porPodios = [...estadisticas].sort((a, b) => b.podios - a.podios);
  const porGanado = [...estadisticas].sort((a, b) => b.ganado - a.ganado);
  const porBalance = [...estadisticas].sort((a, b) => b.balance - a.balance);
  const porPromedio = [...estadisticas].sort((a, b) => a.promedio - b.promedio);
  const porMejorScore = [...estadisticas].sort((a, b) => a.mejorScore - b.mejorScore);

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Ranking Histórico
      </h1>

      <div className="space-y-4">
        <RankingBloque titulo="🥇 Más victorias" jugadores={porVictorias} tipo="victorias" />
        <RankingBloque titulo="🏆 Más podios" jugadores={porPodios} tipo="podios" />
        <RankingBloque titulo="💰 Más dinero ganado" jugadores={porGanado} tipo="ganado" />
        <RankingBloque titulo="📈 Mejor balance" jugadores={porBalance} tipo="balance" />
        <RankingBloque titulo="🎯 Mejor promedio" jugadores={porPromedio} tipo="promedio" />
        <RankingBloque titulo="⭐ Mejor score" jugadores={porMejorScore} tipo="mejorScore" />
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