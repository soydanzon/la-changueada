"use client";

import { useEffect, useState } from "react";
import {
  calcularEstadisticas,
  type EstadisticaJugador,
  type FechaGuardada,
  type Resultado,
} from "../utils/estadisticas";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";
import { createClient } from "../lib/supabase/client";

type EstadisticaConPresencias =
  EstadisticaJugador & {
    presencias: number;
  };

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

export default function Estadisticas() {
  const [estadisticas, setEstadisticas] =
    useState<EstadisticaConPresencias[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    async function cargarEstadisticas() {
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

        const presenciasPorJugador =
          new Map<string, number>();

        historial.forEach((fecha) => {
          const jugadoresDeLaFecha =
            new Set<string>();

          if (
            fecha.formato ===
            "categorias"
          ) {
            const categoriaA =
              fecha.categoriaA ?? [];

            const categoriaB =
              fecha.categoriaB ?? [];

            categoriaA.forEach(
              (resultado) => {
                jugadoresDeLaFecha.add(
                  resultado.jugador.nombre
                );
              }
            );

            categoriaB.forEach(
              (resultado) => {
                jugadoresDeLaFecha.add(
                  resultado.jugador.nombre
                );
              }
            );
          } else {
            fecha.general.forEach(
              (resultado) => {
                jugadoresDeLaFecha.add(
                  resultado.jugador.nombre
                );
              }
            );

            fecha.viejitos.forEach(
              (resultado) => {
                jugadoresDeLaFecha.add(
                  resultado.jugador.nombre
                );
              }
            );
          }

          jugadoresDeLaFecha.forEach(
            (nombre) => {
              presenciasPorJugador.set(
                nombre,
                (presenciasPorJugador.get(
                  nombre
                ) ?? 0) + 1
              );
            }
          );
        });

        const datosFinales =
          calcularEstadisticas(historial)
            .map((jugador) => ({
              ...jugador,

              presencias:
                presenciasPorJugador.get(
                  jugador.nombre
                ) ?? 0,
            }))
            .sort(
              (a, b) =>
                b.balance - a.balance
            );

        setEstadisticas(datosFinales);
      } catch (error) {
        console.error(
          "No se pudieron cargar las estadísticas:",
          error
        );

        setEstadisticas([]);

        setMensaje(
          "⚠️ No se pudieron cargar las estadísticas desde Supabase."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarEstadisticas();
  }, []);

  const estadisticasFiltradas =
    estadisticas.filter((jugador) =>
      jugador.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          📊 Estadísticas
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {mensaje && (
        <p className="mb-6 rounded-xl bg-white p-4 text-center font-bold text-green-900">
          {mensaje}
        </p>
      )}

      {cargando ? (
        <div className="rounded-xl bg-white p-5 text-center font-bold text-green-900">
          Cargando estadísticas...
        </div>
      ) : estadisticas.length === 0 ? (
        <div className="rounded-xl bg-white p-5 text-green-900">
          No hay resultados guardados.
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={busqueda}
            onChange={(evento) =>
              setBusqueda(
                evento.target.value
              )
            }
            className="mb-6 w-full rounded-lg bg-white p-4 text-xl text-black"
          />

          {estadisticasFiltradas.length ===
          0 ? (
            <div className="rounded-xl bg-white p-5 text-green-900">
              No se encontraron jugadores.
            </div>
          ) : (
            <div className="space-y-4">
              {estadisticasFiltradas.map(
                (jugador) => (
                  <a
                    key={jugador.nombre}
                    href={`/estadisticas/${encodeURIComponent(
                      jugador.nombre
                    )}`}
                    className="block rounded-xl bg-white px-5 py-3 text-green-900"
                  >
                    <h2 className="text-2xl font-bold">
                      {jugador.nombre}
                    </h2>

                    <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-lg font-normal">
                      <div className="flex items-center gap-2">
                        <span>🏆</span>

                        <span>
                          {
                            jugador.victorias
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>🙋🏻‍♂️</span>

                        <span>
                          {
                            jugador.presencias
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>🥇🥈🥉</span>

                        <span>
                          {jugador.podios}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>📈</span>

                        <span>
                          {formatearPesos(
                            jugador.balance
                          )}
                        </span>
                      </div>
                    </div>
                  </a>
                )
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}