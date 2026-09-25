"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  calcularHandicap,
  type FechaGuardada,
  type HandicapJugador,
  type Resultado,
} from "../utils/estadisticas";
import { createClient } from "../lib/supabase/client";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

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

function formatearNumero(
  valor: number
) {
  return Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(1);
}

function formatearHandicap(
  valor: number
) {
  return formatearNumero(valor);
}

export default function Handicap() {
  const [handicaps, setHandicaps] =
    useState<HandicapJugador[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    async function cargarHandicaps() {
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

        if (
          resultadoResultados.error
        ) {
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
                  .map(
                    (resultado) => ({
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
                    })
                  );
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
                formato ===
                "categorias"
                  ? convertirResultados(
                      "categoriaA"
                    )
                  : [];

              const categoriaB =
                formato ===
                "categorias"
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

        const handicapsCalculados =
          calcularHandicap(historial);

        handicapsCalculados.sort(
          (a, b) =>
            a.handicap -
            b.handicap
        );

        setHandicaps(
          handicapsCalculados
        );
      } catch (error) {
        console.error(
          "No se pudieron cargar los handicaps:",
          error
        );

        setHandicaps([]);

        setMensaje(
          "⚠️ No se pudieron cargar los handicaps desde Supabase."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarHandicaps();
  }, []);

  const handicapsFiltrados =
    handicaps.filter((jugador) =>
      jugador.nombre
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )
    );

  async function compartirListado() {
    const fecha =
      new Date().toLocaleDateString(
        "es-AR"
      );

    const lineas = [
      "⚽️ La Changueada 🚩",
      "",
      "🧢 Listado de Handicap",
      `Actualizado al ${fecha}`,
      "",
      `${"👤 Jugador".padEnd(
        24
      )}${"Hcp".padStart(5)}`,
      "",
    ];

    handicaps.forEach(
      (jugador, index) => {
        const nombreCompleto = `${
          index + 1
        }. ${jugador.nombre}`;

        const nombre =
          nombreCompleto.length > 22
            ? `${nombreCompleto.slice(
                0,
                21
              )}…`
            : nombreCompleto;

        const handicap =
          formatearHandicap(
            jugador.handicap
          );

        lineas.push(
          `${nombre.padEnd(
            24
          )}${handicap.padStart(5)}`
        );
      }
    );

    const texto =
      lineas.join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            "Listado de Handicap",
          text: texto,
        });

        return;
      }

      await navigator.clipboard.writeText(
        texto
      );

      alert(
        "El listado fue copiado. Ya podés pegarlo en WhatsApp."
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "No se pudo compartir el listado:",
        error
      );

      alert(
        "No se pudo compartir el listado."
      );
    }
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          🧢 Proyecto HCP
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
          Cargando handicaps...
        </div>
      ) : handicaps.length === 0 ? (
        <div className="rounded-xl bg-white p-5 text-green-900">
          No hay handicaps disponibles.
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={compartirListado}
            className="mb-4 w-full rounded-xl bg-blue-600 p-3 text-xl font-bold text-white"
          >
            📤 Compartir listado
          </button>

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

          {handicapsFiltrados.length ===
          0 ? (
            <div className="rounded-xl bg-white p-5 text-green-900">
              No se encontraron jugadores.
            </div>
          ) : (
            <div className="space-y-3">
              {handicapsFiltrados.map(
                (
                  jugador,
                  index
                ) => (
                  <a
                    key={jugador.nombre}
                    href={`/handicap/${encodeURIComponent(
                      jugador.nombre
                    )}`}
                    className="flex items-center justify-between rounded-xl bg-white p-3 text-green-900"
                  >
                    <span className="text-xl font-bold">
                      {index + 1}.{" "}
                      {
                        jugador.nombre
                      }
                    </span>

                    <strong className="text-2xl">
                      {formatearHandicap(
                        jugador.handicap
                      )}
                    </strong>
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