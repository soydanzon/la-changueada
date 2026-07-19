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

type TipoRanking =
  | "presencias"
  | "victorias"
  | "podios"
  | "ganado"
  | "balance"
  | "promedio"
  | "mejorScore";

type RankingSeleccionado = {
  titulo: string;
  jugadores: EstadisticaConPresencias[];
  tipo: TipoRanking;
};

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function mostrarValor(
  jugador: EstadisticaConPresencias,
  tipo: TipoRanking
) {
  if (tipo === "presencias") {
    return jugador.presencias;
  }

  if (tipo === "victorias") {
    return jugador.victorias;
  }

  if (tipo === "podios") {
    return jugador.podios;
  }

  if (tipo === "ganado") {
    return formatearPesos(jugador.ganado);
  }

  if (tipo === "balance") {
    return formatearPesos(jugador.balance);
  }

  if (tipo === "promedio") {
    return jugador.promedio.toFixed(1);
  }

  return jugador.mejorScore;
}

function RankingBloque({
  titulo,
  jugadores,
  tipo,
  alAbrir,
}: {
  titulo: string;
  jugadores: EstadisticaConPresencias[];
  tipo: TipoRanking;
  alAbrir: () => void;
}) {
  return (
    <div className="rounded-xl bg-white p-5 text-green-900">
      <button
        type="button"
        onClick={alAbrir}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <h2 className="text-2xl font-bold">
          {titulo}
        </h2>

        <span className="shrink-0 text-lg font-bold">
          Ver todos ›
        </span>
      </button>

      {jugadores.slice(0, 5).map((jugador, index) => (
        <div
          key={jugador.nombre}
          className="flex justify-between gap-4 border-b py-2"
        >
          <span className="min-w-0 truncate">
            {index + 1}. {jugador.nombre}
          </span>

          <strong className="shrink-0">
            {mostrarValor(jugador, tipo)}
          </strong>
        </div>
      ))}
    </div>
  );
}

function ModalRanking({
  ranking,
  alCerrar,
}: {
  ranking: RankingSeleccionado;
  alCerrar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={alCerrar}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white text-green-900 shadow-2xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <h2 className="text-2xl font-bold">
            {ranking.titulo}
          </h2>

          <button
            type="button"
            onClick={alCerrar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-700"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-5">
          {ranking.jugadores.map((jugador, index) => (
            <div
              key={jugador.nombre}
              className="flex items-center justify-between gap-4 border-b py-3"
            >
              <span className="min-w-0">
                <strong className="mr-2">
                  {index + 1}.
                </strong>

                {jugador.nombre}
              </span>

              <strong className="shrink-0">
                {mostrarValor(jugador, ranking.tipo)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Ranking() {
  const [estadisticas, setEstadisticas] = useState<
    EstadisticaConPresencias[]
  >([]);

  const [rankingSeleccionado, setRankingSeleccionado] =
    useState<RankingSeleccionado | null>(null);

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

  useEffect(() => {
    document.body.style.overflow = rankingSeleccionado
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [rankingSeleccionado]);

  const porPresencias = [...estadisticas].sort(
    (a, b) =>
      b.presencias - a.presencias ||
      a.nombre.localeCompare(b.nombre)
  );

  const porVictorias = [...estadisticas].sort(
    (a, b) =>
      b.victorias - a.victorias ||
      a.nombre.localeCompare(b.nombre)
  );

  const porPodios = [...estadisticas].sort(
    (a, b) =>
      b.podios - a.podios ||
      a.nombre.localeCompare(b.nombre)
  );

  const porPromedio = [...estadisticas].sort(
    (a, b) =>
      a.promedio - b.promedio ||
      a.nombre.localeCompare(b.nombre)
  );

  const porMejorScore = [...estadisticas].sort(
    (a, b) =>
      a.mejorScore - b.mejorScore ||
      a.nombre.localeCompare(b.nombre)
  );

  const porGanado = [...estadisticas].sort(
    (a, b) =>
      b.ganado - a.ganado ||
      a.nombre.localeCompare(b.nombre)
  );

  const porBalance = [...estadisticas].sort(
    (a, b) =>
      b.balance - a.balance ||
      a.nombre.localeCompare(b.nombre)
  );

  function abrirRanking(
    titulo: string,
    jugadores: EstadisticaConPresencias[],
    tipo: TipoRanking
  ) {
    setRankingSeleccionado({
      titulo,
      jugadores,
      tipo,
    });
  }

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
          alAbrir={() =>
            abrirRanking(
              "🙋🏻‍♂️ Más presencias",
              porPresencias,
              "presencias"
            )
          }
        />

        <RankingBloque
          titulo="🏆 Más victorias"
          jugadores={porVictorias}
          tipo="victorias"
          alAbrir={() =>
            abrirRanking(
              "🏆 Más victorias",
              porVictorias,
              "victorias"
            )
          }
        />

        <RankingBloque
          titulo="🥇🥈🥉 Más podios"
          jugadores={porPodios}
          tipo="podios"
          alAbrir={() =>
            abrirRanking(
              "🥇🥈🥉 Más podios",
              porPodios,
              "podios"
            )
          }
        />

        <RankingBloque
          titulo="🎯 Mejor promedio"
          jugadores={porPromedio}
          tipo="promedio"
          alAbrir={() =>
            abrirRanking(
              "🎯 Mejor promedio",
              porPromedio,
              "promedio"
            )
          }
        />

        <RankingBloque
          titulo="⭐ Mejor score"
          jugadores={porMejorScore}
          tipo="mejorScore"
          alAbrir={() =>
            abrirRanking(
              "⭐ Mejor score",
              porMejorScore,
              "mejorScore"
            )
          }
        />

        <RankingBloque
          titulo="💰 Más dinero ganado"
          jugadores={porGanado}
          tipo="ganado"
          alAbrir={() =>
            abrirRanking(
              "💰 Más dinero ganado",
              porGanado,
              "ganado"
            )
          }
        />

        <RankingBloque
          titulo="📈 Mejor balance"
          jugadores={porBalance}
          tipo="balance"
          alAbrir={() =>
            abrirRanking(
              "📈 Mejor balance",
              porBalance,
              "balance"
            )
          }
        />
      </div>

      {rankingSeleccionado && (
        <ModalRanking
          ranking={rankingSeleccionado}
          alCerrar={() => setRankingSeleccionado(null)}
        />
      )}
    </main>
  );
}