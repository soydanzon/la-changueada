"use client";

import { useEffect, useState } from "react";
import {
  calcularEstadisticas,
  type EstadisticaJugador,
  type FechaGuardada,
} from "../utils/estadisticas";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

type EstadisticaConPresencias = EstadisticaJugador & {
  presencias: number;
};

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function RankingBloque({
  titulo,
  jugadores,
  tipo,
}: {
  titulo: string;
  jugadores: EstadisticaConPresencias[];
  tipo:
    | "presencias"
    | "victorias"
    | "podios"
    | "ganado"
    | "balance"
    | "promedio"
    | "mejorScore";
}) {
  return (
    <div className="rounded-xl bg-white p-5 text-green-900">
      <h2 className="text-2xl font-bold">
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
            {tipo === "presencias" && jugador.presencias}
            {tipo === "victorias" && jugador.victorias}
            {tipo === "podios" && jugador.podios}
            {tipo === "ganado" &&
              formatearPesos(jugador.ganado)}
            {tipo === "balance" &&
              formatearPesos(jugador.balance)}
            {tipo === "promedio" &&
              jugador.promedio.toFixed(1)}
            {tipo === "mejorScore" &&
              jugador.mejorScore}
          </strong>
        </div>
      ))}
    </div>
  );
}

export default function Ranking() {
  const [estadisticas, setEstadisticas] = useState<
    EstadisticaConPresencias[]
  >([]);

  useEffect(() => {
    const datos = localStorage.getItem(
      "laChangueadaHistorial"
    );

    if (!datos) return;

    const historial: FechaGuardada[] = JSON.parse(datos);

    const presenciasPorJugador = new Map<string, number>();

    historial.forEach((fecha) => {
      const jugadoresDeLaFecha = new Set<string>();

      fecha.general.forEach((resultado) => {
        jugadoresDeLaFecha.add(resultado.jugador.nombre);
      });

      fecha.viejitos.forEach((resultado) => {
        jugadoresDeLaFecha.add(resultado.jugador.nombre);
      });

      jugadoresDeLaFecha.forEach((nombre) => {
        presenciasPorJugador.set(
          nombre,
          (presenciasPorJugador.get(nombre) ?? 0) + 1
        );
      });
    });

    const estadisticasCalculadas =
      calcularEstadisticas(historial).map((jugador) => ({
        ...jugador,
        presencias:
          presenciasPorJugador.get(jugador.nombre) ?? 0,
      }));

    setEstadisticas(estadisticasCalculadas);
  }, []);

  const porPresencias = [...estadisticas].sort(
    (a, b) =>
      b.presencias - a.presencias ||
      a.nombre.localeCompare(b.nombre)
  );

  const porVictorias = [...estadisticas].sort(
    (a, b) => b.victorias - a.victorias
  );

  const porPodios = [...estadisticas].sort(
    (a, b) => b.podios - a.podios
  );

  const porPromedio = [...estadisticas].sort(
    (a, b) => a.promedio - b.promedio
  );

  const porMejorScore = [...estadisticas].sort(
    (a, b) => a.mejorScore - b.mejorScore
  );

  const porGanado = [...estadisticas].sort(
    (a, b) => b.ganado - a.ganado
  );

  const porBalance = [...estadisticas].sort(
    (a, b) => b.balance - a.balance
  );

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          🎖️ Ranking
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="space-y-4">
        <RankingBloque
          titulo="🙋🏻‍♂️ Más presencias"
          jugadores={porPresencias}
          tipo="presencias"
        />

        <RankingBloque
          titulo="🏆 Más victorias"
          jugadores={porVictorias}
          tipo="victorias"
        />

        <RankingBloque
          titulo="🥇🥈🥉 Más podios"
          jugadores={porPodios}
          tipo="podios"
        />

        <RankingBloque
          titulo="🎯 Mejor promedio"
          jugadores={porPromedio}
          tipo="promedio"
        />

        <RankingBloque
          titulo="⭐ Mejor score"
          jugadores={porMejorScore}
          tipo="mejorScore"
        />

        <RankingBloque
          titulo="💰 Más dinero ganado"
          jugadores={porGanado}
          tipo="ganado"
        />

        <RankingBloque
          titulo="📈 Mejor balance"
          jugadores={porBalance}
          tipo="balance"
        />
      </div>
    </main>
  );
}