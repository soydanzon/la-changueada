"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  calcularEstadisticas,
  calcularEstadisticasPorCancha,
  type EstadisticaCancha,
  type EstadisticaJugador,
  type FechaGuardada,
  type Resultado,
} from "../../utils/estadisticas";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";
import { createClient } from "../../lib/supabase/client";

type FechaSupabase = {
  id: number;
  fecha: string;
  formato: string;
  cancha_id: number | null;
  cancha_nombre: string | null;
  par: number | null;
};

type ResultadoSupabase = {
  fecha_id: number;
  jugador_nombre: string;
  categoria: string;
  score: number;
  puesto: number;
  premio: number;
};

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function formatearNumero(valor?: number) {
  if (
    valor === undefined ||
    Number.isNaN(valor)
  ) {
    return "-";
  }

  return Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(1);
}

function formatearRespectoPar(valor: number) {
  if (valor === 0) {
    return "Par";
  }

  const numero = formatearNumero(valor);

  return valor > 0
    ? `+${numero}`
    : numero;
}

export default function PerfilJugador() {
  const params = useParams();

  const nombre = decodeURIComponent(
    params.nombre as string
  );

  const [resumen, setResumen] =
    useState<EstadisticaJugador | null>(
      null
    );

  const [
    estadisticasCancha,
    setEstadisticasCancha,
  ] = useState<EstadisticaCancha[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    async function cargarPerfil() {
      const supabase = createClient();

      try {
        const [
          resultadoFechas,
          resultadoResultados,
        ] = await Promise.all([
          supabase
            .from("fechas")
            .select(
              "id, fecha, formato, cancha_id, cancha_nombre, par"
            )
            .order("id", {
              ascending: true,
            }),

          supabase
            .from("resultados")
            .select(
              "fecha_id, jugador_nombre, categoria, score, puesto, premio"
            )
            .order("fecha_id", {
              ascending: true,
            })
            .order("puesto", {
              ascending: true,
            }),
        ]);

        if (resultadoFechas.error) {
          throw resultadoFechas.error;
        }

        if (resultadoResultados.error) {
          throw resultadoResultados.error;
        }

        const fechasSupabase =
          (resultadoFechas.data ??
            []) as FechaSupabase[];

        const resultadosSupabase =
          (resultadoResultados.data ??
            []) as ResultadoSupabase[];

        const historial: FechaGuardada[] =
          fechasSupabase.map(
            (fechaSupabase) => {
              const resultadosFecha =
                resultadosSupabase.filter(
                  (resultado) =>
                    Number(
                      resultado.fecha_id
                    ) ===
                    Number(
                      fechaSupabase.id
                    )
                );

              function convertirResultados(
                categoria: string
              ): Resultado[] {
                return resultadosFecha
                  .filter(
                    (resultado) =>
                      resultado.categoria ===
                      categoria
                  )
                  .map((resultado) => ({
                    jugador: {
                      nombre:
                        resultado.jugador_nombre,
                    },

                    score: Number(
                      resultado.score
                    ),

                    puesto: Number(
                      resultado.puesto
                    ),

                    premio: Number(
                      resultado.premio
                    ),
                  }));
              }

              const formato:
                | "edad"
                | "categorias" =
                fechaSupabase.formato ===
                "categorias"
                  ? "categorias"
                  : "edad";

              const general =
                formato === "edad"
                  ? convertirResultados(
                      "general"
                    )
                  : [];

              const viejitos =
                formato === "edad"
                  ? convertirResultados(
                      "viejitos"
                    )
                  : [];

              const categoriaA =
                formato === "categorias"
                  ? convertirResultados(
                      "categoriaA"
                    )
                  : [];

              const categoriaB =
                formato === "categorias"
                  ? convertirResultados(
                      "categoriaB"
                    )
                  : [];

              return {
                id: Number(
                  fechaSupabase.id
                ),

                fecha:
                  fechaSupabase.fecha,

                formato,

                cancha:
                  fechaSupabase.cancha_id !==
                    null &&
                  fechaSupabase.cancha_nombre &&
                  fechaSupabase.par !== null
                    ? {
                        id: Number(
                          fechaSupabase.cancha_id
                        ),

                        nombre:
                          fechaSupabase.cancha_nombre,

                        par: Number(
                          fechaSupabase.par
                        ),
                      }
                    : null,

                general,
                viejitos,
                categoriaA,
                categoriaB,
              };
            }
          );

        const estadisticas =
          calcularEstadisticas(historial);

        const jugador = estadisticas.find(
          (estadistica) =>
            estadistica.nombre === nombre
        );

        if (!jugador) {
          setMensaje(
            "⚠️ No se encontró este jugador."
          );

          return;
        }

        setResumen(jugador);

        setEstadisticasCancha(
          calcularEstadisticasPorCancha(
            historial,
            nombre
          )
        );
      } catch (error) {
        console.error(
          "No se pudo cargar el perfil:",
          error
        );

        setResumen(null);
        setEstadisticasCancha([]);

        setMensaje(
          "⚠️ No se pudo cargar el perfil desde Supabase."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarPerfil();
  }, [nombre]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <div className="rounded-xl bg-white p-5 text-center font-bold text-green-900">
          Cargando estadísticas...
        </div>
      </main>
    );
  }

  if (!resumen) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <div className="rounded-xl bg-white p-5 text-center font-bold text-green-900">
          {mensaje ||
            "⚠️ No se encontró este jugador."}
        </div>
      </main>
    );
  }

  const mostrarVictoriaGeneral =
    resumen.victoriasGeneral > 0;

  const mostrarVictoriaViejitos =
    resumen.victoriasViejitos > 0;

  const mostrarVictoriaCategoriaA =
    resumen.victoriasCategoriaA > 0;

  const mostrarVictoriaCategoriaB =
    resumen.victoriasCategoriaB > 0;

  const mostrarPodioGeneral =
    resumen.podiosGeneral > 0;

  const mostrarPodioViejitos =
    resumen.podiosViejitos > 0;

  const mostrarPodioCategoriaA =
    resumen.podiosCategoriaA > 0;

  const mostrarPodioCategoriaB =
    resumen.podiosCategoriaB > 0;

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="min-w-0 truncate pr-3 text-3xl font-bold">
          📊 {nombre}
        </h1>

        <div className="flex shrink-0 gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 text-green-900">
        <p className="text-lg font-bold">
          ⚽ Changueadas jugadas:{" "}
          {resumen.jugadas}
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>🏆 Victorias</span>
            <span>{resumen.victorias}</span>
          </div>

          <div className="mt-2 space-y-1 font-normal">
            {mostrarVictoriaGeneral && (
              <div className="flex items-center justify-between">
                <span>🙎🏻‍♂️ General</span>
                <span>
                  {resumen.victoriasGeneral}
                </span>
              </div>
            )}

            {mostrarVictoriaViejitos && (
              <div className="flex items-center justify-between">
                <span>🧓🏻 Viejitos</span>
                <span>
                  {resumen.victoriasViejitos}
                </span>
              </div>
            )}

            {mostrarVictoriaCategoriaA && (
              <div className="flex items-center justify-between">
                <span>🅰️ Categoría A</span>
                <span>
                  {
                    resumen.victoriasCategoriaA
                  }
                </span>
              </div>
            )}

            {mostrarVictoriaCategoriaB && (
              <div className="flex items-center justify-between">
                <span>🅱️ Categoría B</span>
                <span>
                  {
                    resumen.victoriasCategoriaB
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>🥇🥈🥉 Podios</span>
            <span>{resumen.podios}</span>
          </div>

          <div className="mt-2 space-y-1 font-normal">
            {mostrarPodioGeneral && (
              <div className="flex items-center justify-between">
                <span>🙎🏻‍♂️ General</span>
                <span>
                  {resumen.podiosGeneral}
                </span>
              </div>
            )}

            {mostrarPodioViejitos && (
              <div className="flex items-center justify-between">
                <span>🧓🏻 Viejitos</span>
                <span>
                  {resumen.podiosViejitos}
                </span>
              </div>
            )}

            {mostrarPodioCategoriaA && (
              <div className="flex items-center justify-between">
                <span>🅰️ Categoría A</span>
                <span>
                  {
                    resumen.podiosCategoriaA
                  }
                </span>
              </div>
            )}

            {mostrarPodioCategoriaB && (
              <div className="flex items-center justify-between">
                <span>🅱️ Categoría B</span>
                <span>
                  {
                    resumen.podiosCategoriaB
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-lg font-bold">
            📊 Promedio:{" "}
            {formatearRespectoPar(
              resumen.promedio
            )}{" "}
            <span className="text-base font-normal">
              (
              {formatearNumero(
                resumen.promedioGolpes
              )}{" "}
              golpes)
            </span>
          </p>

          <p className="text-lg font-bold">
            ⭐ Mejor vuelta:{" "}
            {formatearRespectoPar(
              resumen.mejorScore
            )}{" "}
            <span className="text-base font-normal">
              (
              {resumen.mejorScoreGolpes}{" "}
              golpes)
            </span>
          </p>

          <p className="text-lg font-bold">
            💸 Aportado:{" "}
            {formatearPesos(
              resumen.aportado
            )}
          </p>

          <p className="text-lg font-bold">
            💰 Ganado:{" "}
            {formatearPesos(resumen.ganado)}
          </p>

          <p className="text-lg font-bold">
            📈 Balance:{" "}
            {formatearPesos(
              resumen.balance
            )}
          </p>
        </div>

        <a
          href={`/estadisticas/${encodeURIComponent(
            nombre
          )}/compartir`}
          className="mt-7 block w-full rounded-xl bg-green-900 p-4 text-center font-bold text-white"
        >
          📤 Compartir perfil
        </a>
      </div>

      {estadisticasCancha.length > 0 && (
        <div className="mt-6 rounded-xl bg-white p-5 text-green-900">
          <h2 className="mb-5 text-2xl font-bold">
            📌 Estadísticas por cancha
          </h2>

          <div className="space-y-6">
            {estadisticasCancha.map(
              (cancha, index) => (
                <div key={cancha.canchaId}>
                  <h3 className="text-xl font-bold">
                    ⛳ {cancha.cancha}
                  </h3>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        ⚽ Changueadas jugadas
                      </span>

                      <span className="font-bold">
                        {cancha.jugadas}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        🏆 Victorias
                      </span>

                      <span className="font-bold">
                        {cancha.victorias}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        🥇🥈🥉 Podios
                      </span>

                      <span className="font-bold">
                        {cancha.podios}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="font-bold">
                        📊 Promedio
                      </span>

                      <span className="text-right font-bold">
                        {formatearRespectoPar(
                          cancha.promedioRespectoPar
                        )}{" "}
                        <span className="font-normal">
                          (
                          {formatearNumero(
                            cancha.promedioGolpes
                          )}{" "}
                          golpes)
                        </span>
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="font-bold">
                        ⭐ Mejor vuelta
                      </span>

                      <span className="text-right font-bold">
                        {formatearRespectoPar(
                          cancha.mejorVuelta
                        )}{" "}
                        <span className="font-normal">
                          (
                          {
                            cancha.mejorVueltaGolpes
                          }{" "}
                          golpes)
                        </span>
                      </span>
                    </div>
                  </div>

                  {index <
                    estadisticasCancha.length -
                      1 && (
                    <div className="mt-6 border-b border-green-900/20" />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </main>
  );
}