"use client";

import {
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  calcularHandicap,
  type FechaGuardada,
  type HandicapJugador,
  type Resultado,
} from "../../utils/estadisticas";
import { createClient } from "../../lib/supabase/client";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

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
  if (valor === 0) {
    return "0";
  }

  const numero =
    formatearNumero(valor);

  return valor > 0
    ? `+${numero}`
    : numero;
}

function formatearScore(
  valor: number
) {
  if (valor === 0) {
    return "Par";
  }

  const numero =
    formatearNumero(valor);

  return valor > 0
    ? `+${numero}`
    : numero;
}

async function compartirHandicap(
  jugador: HandicapJugador,
  nombre: string,
  mejoresTarjetas: number,
  ultimasTarjetas: number
) {
  const lineas: string[] = [
    "⚽️ La Changueada 🚩",
    "",
    `👤 ${nombre}`,
    `🧢 Handicap: ${formatearHandicap(
      jugador.handicap
    )}`,
    "",
    `Mejores ${mejoresTarjetas} de las últimas ${ultimasTarjetas} tarjetas`,
    "",
  ];

  [...jugador.fechas]
    .reverse()
    .forEach((fecha) => {
      const scoreTexto = fecha.lp
        ? "LP"
        : fecha.score === 0
          ? "Par"
          : formatearHandicap(
              fecha.score
            );

      lineas.push(
        `${fecha.fecha.padEnd(
          12
        )} ${String(
          scoreTexto
        ).padStart(4)} ${
          fecha.cuenta
            ? "✅"
            : "❌"
        }`
      );
    });

  const texto =
    "```" +
    lineas.join("\n") +
    "\n```";

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Handicap",
        text: texto,
      });

      return;
    }

    await navigator.clipboard.writeText(
      texto
    );

    alert(
      "El handicap fue copiado. Ya podés pegarlo en WhatsApp."
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return;
    }

    console.error(
      "No se pudo compartir el handicap:",
      error
    );

    alert(
      "No se pudo compartir el handicap."
    );
  }
}

export default function DetalleHandicap() {
  const params = useParams();

  const nombre = decodeURIComponent(
    params.nombre as string
  );

  const [jugador, setJugador] =
    useState<HandicapJugador | null>(
      null
    );

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    async function cargarHandicap() {
      const supabase =
        createClient();

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

        if (
          resultadoFechas.error
        ) {
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

        const encontrado =
          calcularHandicap(
            historial
          ).find(
            (item) =>
              item.nombre === nombre
          );

        if (!encontrado) {
          setMensaje(
            "No se encontró el handicap del jugador."
          );
          return;
        }

        setJugador(encontrado);
      } catch (error) {
        console.error(
          "No se pudo cargar el handicap:",
          error
        );

        setMensaje(
          "⚠️ No se pudo cargar el handicap desde Supabase."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarHandicap();
  }, [nombre]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <div className="rounded-xl bg-white p-5 text-center font-bold text-green-900">
          Cargando handicap...
        </div>
      </main>
    );
  }

  if (!jugador) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <div className="mb-6 flex justify-end gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>

        <div className="rounded-xl bg-white p-5 text-green-900">
          {mensaje ||
            "No se encontró el handicap."}
        </div>
      </main>
    );
  }

  const ultimasTarjetas =
    Math.min(
      jugador.fechas.length,
      16
    );

  const mejoresTarjetas =
    Math.min(
      Math.ceil(
        ultimasTarjetas / 2
      ),
      8
    );

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            🧢 {nombre}
          </h1>

          <p className="text-3xl font-black">
            {formatearHandicap(
              jugador.handicap
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <p className="mb-4 text-lg text-green-200">
        Mejores {mejoresTarjetas} de las
        últimas {ultimasTarjetas} tarjetas
      </p>

      <div className="space-y-2">
        {[...jugador.fechas]
          .reverse()
          .map(
            (fecha, index) => (
              <div
                key={`${fecha.fecha}-${fecha.cancha}-${index}`}
                className={`rounded-xl border px-4 py-2 ${
                  fecha.cuenta
                    ? "bg-green-100 text-green-950"
                    : "bg-white text-green-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center gap-4">
                    <span className="w-24 shrink-0 font-medium">
                      {fecha.fecha}
                    </span>

                    <span className="ml-auto font-bold">
                      {fecha.lp
                        ? "LP"
                        : `${
                            fecha.golpes
                          } (${formatearScore(
                            fecha.score
                          )})`}
                    </span>
                  </div>

                  <span className="ml-4 text-2xl">
                    {fecha.cuenta
                      ? "✅"
                      : "❌"}
                  </span>
                </div>
              </div>
            )
          )}
      </div>

      {jugador.fechasAnteriores.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-gray-200">
            Tarjetas anteriores
          </h2>

          <div className="space-y-2">
            {[...jugador.fechasAnteriores]
              .reverse()
              .map((fecha, index) => (
                <div
                  key={`anterior-${fecha.fecha}-${fecha.cancha}-${index}`}
                  className={`rounded-xl border border-gray-500 px-4 py-2 ${
                    fecha.cuenta
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-400 text-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-4">
                      <span className="w-24 shrink-0 font-medium">
                        {fecha.fecha}
                      </span>

                      <span className="ml-auto font-bold">
                        {fecha.lp
                          ? "LP"
                          : `${fecha.golpes} (${formatearScore(
                              fecha.score
                            )})`}
                      </span>
                    </div>

                    <span className="ml-4 text-2xl font-bold text-gray-600">
                      {fecha.cuenta ? "✓" : "×"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
      
      <button
        type="button"
        onClick={() =>
          compartirHandicap(
            jugador,
            nombre,
            mejoresTarjetas,
            ultimasTarjetas
          )
        }
        className="mt-6 w-full rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
      >
        📤 Compartir handicap
      </button>
    </main>
  );
}