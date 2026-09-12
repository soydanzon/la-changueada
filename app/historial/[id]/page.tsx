"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";
import { createClient } from "../../lib/supabase/client";
import { obtenerTablaPremios } from "../../premios/tablaPremios";

type Resultado = {
  jugador: {
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
};

type CanchaFecha = {
  id: number;
  nombre: string;
  par: number;
};

type FechaGuardada = {
  id: number;
  fecha: string;
  formato?: "edad" | "categorias";
  cancha?: CanchaFecha | null;

  general?: Resultado[];
  viejitos?: Resultado[];

  categoriaA?: Resultado[];
  categoriaB?: Resultado[];
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
  jugador_nombre: string;
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

  return `${puesto}.`;
}

function formatearScore(
  score: number,
  par?: number
) {
  if (typeof par !== "number") {
    return String(score);
  }

  const relativo = score - par;

  if (relativo === 0) {
    return `${score} (P)`;
  }

  if (relativo > 0) {
    return `${score} (+${relativo})`;
  }

  return `${score} (${relativo})`;
}

function obtenerResultadosFecha(
  fecha: FechaGuardada
) {
  if (fecha.formato === "categorias") {
    return {
      tituloUno: "🅰️ Categoría A",
      tituloDos: "🅱️ Categoría B",
      resultadosUno:
        fecha.categoriaA ?? [],
      resultadosDos:
        fecha.categoriaB ?? [],
    };
  }

  return {
    tituloUno: "🙎🏻‍♂️ General",
    tituloDos: "🧓🏻 Viejitos",
    resultadosUno: fecha.general ?? [],
    resultadosDos: fecha.viejitos ?? [],
  };
}

function obtenerResumenPremios(
  cantidadJugadores: number
) {
  const fila = obtenerTablaPremios().find(
    (f) => f.jugadores === cantidadJugadores
  );

  return fila
    ? fila.premios
        .filter((premio) => premio > 0)
        .map((premio) => premio / 1000)
        .join(" - ")
    : "";
}

function TablaResultados({
  resultados,
  par,
}: {
  resultados: Resultado[];
  par?: number;
}) {
  const premiados = resultados.filter(
    (resultado) => resultado.premio > 0
  );

  const noPremiados = resultados.filter(
    (resultado) => resultado.premio <= 0
  );

  return (
    <div>
      {premiados.length > 0 && (
        <div>
          {premiados.map(
            (resultado, index) => (
              <div
                key={index}
                className={
                  index <
                  premiados.length - 1
                    ? "border-b border-green-900/20 py-2.5"
                    : "py-2.5"
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="w-8 shrink-0 text-center text-xl font-bold">
                      {medalla(
                        resultado.puesto
                      )}
                    </span>

                    <span className="min-w-0 break-words font-bold">
                      {
                        resultado.jugador
                          .nombre
                      }
                    </span>
                  </div>

                  <span className="shrink-0 text-right font-bold">
                    {resultado.score === 120
                      ? "LP"
                      : formatearScore(
                          resultado.score,
                          par
                        )}
                  </span>
                </div>

                <p className="mt-1 pl-11 font-bold text-green-700">
                  {formatearPesos(
                    resultado.premio
                  )}
                </p>
              </div>
            )
          )}
        </div>
      )}

      {premiados.length > 0 &&
        noPremiados.length > 0 && (
          <div className="my-1 border-t border-green-900/30" />
        )}

      {noPremiados.length > 0 && (
        <div>
          {noPremiados.map(
            (resultado, index) => (
              <div
                key={index}
                className={`flex items-start justify-between gap-4 py-2 ${
                  index <
                  noPremiados.length - 1
                    ? "border-b border-green-900/15"
                    : ""
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="w-8 shrink-0 text-center font-bold">
                    {medalla(
                      resultado.puesto
                    )}
                  </span>

                  <span className="min-w-0 break-words font-semibold">
                    {
                      resultado.jugador
                        .nombre
                    }
                  </span>
                </div>

                <span className="shrink-0 text-right font-semibold">
                  {resultado.score === 120
                    ? "LP"
                    : formatearScore(
                        resultado.score,
                        par
                      )}
                </span>
              </div>
            )
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <div>
          {resultados.length} jugadores
        </div>

        <div>
          Premios:{" "}
          {obtenerResumenPremios(
            resultados.length
          )}
        </div>
      </div>
    </div>
  );
}

export default function DetalleFecha() {
  const params = useParams();
  const router = useRouter();

  const [fecha, setFecha] =
    useState<FechaGuardada | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  const [esAdmin, setEsAdmin] =
    useState(false);

  const [esSegundaVuelta, setEsSegundaVuelta] =
    useState(false);

  useEffect(() => {
    async function cargarFecha() {
      const supabase = createClient();
      const idFecha = Number(params.id);

      if (!Number.isFinite(idFecha)) {
        setMensaje(
          "⚠️ La fecha solicitada no es válida."
        );
        setCargando(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const { data: perfil } =
            await supabase
              .from("perfiles")
              .select("rol")
              .eq("id", session.user.id)
              .maybeSingle();

          setEsAdmin(
            perfil?.rol === "admin"
          );
        }

        const [
          resultadoFecha,
          resultadoResultados,
        ] = await Promise.all([
          supabase
            .from("fechas")
            .select(
              "id, fecha, formato, cancha_id, cancha_nombre, par"
            )
            .eq("id", idFecha)
            .maybeSingle(),

          supabase
            .from("resultados")
            .select(
              "jugador_nombre, categoria, score, puesto, premio"
            )
            .eq("fecha_id", idFecha)
            .order("puesto", {
              ascending: true,
            }),
        ]);

        if (resultadoFecha.error) {
          throw resultadoFecha.error;
        }

        if (resultadoResultados.error) {
          throw resultadoResultados.error;
        }

        if (!resultadoFecha.data) {
          setMensaje(
            "⚠️ No se encontró esta fecha."
          );
          return;
        }

        const fechaSupabase =
          resultadoFecha.data as FechaSupabase;

        const resultadosSupabase =
          (resultadoResultados.data ??
            []) as ResultadoSupabase[];

        function convertirResultados(
          categoria: string
        ): Resultado[] {
          return resultadosSupabase
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

        const formato =
          fechaSupabase.formato ===
          "categorias"
            ? "categorias"
            : "edad";

        const fechaConvertida:
          FechaGuardada = {
          id: Number(fechaSupabase.id),
          fecha: fechaSupabase.fecha,
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
        };

        if (formato === "categorias") {
          fechaConvertida.categoriaA =
            convertirResultados(
              "categoriaA"
            );

          fechaConvertida.categoriaB =
            convertirResultados(
              "categoriaB"
            );
        } else {
          fechaConvertida.general =
            convertirResultados("general");

          fechaConvertida.viejitos =
            convertirResultados(
              "viejitos"
            );
        }

        setFecha(fechaConvertida);

        const { data: fechasMismoDia } =
          await supabase
            .from("fechas")
            .select("id")
            .eq(
              "fecha",
              fechaSupabase.fecha
            )
            .order("id", {
              ascending: true,
            });

        const posicion =
          (fechasMismoDia ?? []).findIndex(
            (item: { id:number }) =>
              Number(item.id) === idFecha
          );

        setEsSegundaVuelta(posicion > 0);
      } catch (error) {
        console.error(
          "No se pudo cargar la fecha:",
          error
        );

        setMensaje(
          "⚠️ No se pudo cargar la fecha desde Supabase."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarFecha();
  }, [params.id]);

  function editarFecha() {
    if (!fecha || !esAdmin) {
      return;
    }

    router.push(
      `/historial/${fecha.id}/editar`
    );
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <div className="rounded-xl bg-white p-5 text-center font-bold text-green-900">
          Cargando fecha...
        </div>
      </main>
    );
  }

  if (!fecha) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <div className="rounded-xl bg-white p-5 text-center font-bold text-green-900">
          {mensaje ||
            "⚠️ No se encontró esta fecha."}
        </div>
      </main>
    );
  }

  const {
    tituloUno,
    tituloDos,
    resultadosUno,
    resultadosDos,
  } = obtenerResultadosFecha(fecha);

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between gap-4 bg-green-900 px-6 py-4">
        <div>
          <h1 className="text-3xl font-bold">
            {fecha.fecha}
          </h1>

          {esSegundaVuelta && (
            <p className="mt-1 font-bold text-green-200">
              Segunda vuelta
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {fecha.cancha && (
        <div className="rounded-xl bg-white p-5 text-green-900">
          <p className="text-xl">
            <span className="font-bold">
              ⛳ {fecha.cancha.nombre}
            </span>

            <span className="ml-5 font-normal">
              Par {fecha.cancha.par}
            </span>
          </p>
        </div>
      )}

      {resultadosUno.length > 0 && (
        <section className="mt-6 rounded-xl bg-white p-5 text-green-900">
          <h2 className="mb-2 text-2xl font-bold">
            {tituloUno}
          </h2>

          <TablaResultados
            resultados={resultadosUno}
            par={fecha.cancha?.par}
          />
        </section>
      )}

      {resultadosDos.length > 0 && (
        <section className="mt-6 rounded-xl bg-white p-5 text-green-900">
          <h2 className="mb-2 text-2xl font-bold">
            {tituloDos}
          </h2>

          <TablaResultados
            resultados={resultadosDos}
            par={fecha.cancha?.par}
          />
        </section>
      )}

      {esAdmin && (
        <button
          type="button"
          onClick={editarFecha}
          className="mt-6 w-full rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
        >
          ✏️ Editar fecha
        </button>
      )}
    </main>
  );
}