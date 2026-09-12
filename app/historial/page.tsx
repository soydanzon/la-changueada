"use client";

import { useEffect, useState } from "react";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";
import { createClient } from "../lib/supabase/client";
import { obtenerTablaPremios } from "../premios/tablaPremios";

type ResultadoGuardado = {
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

  general?: ResultadoGuardado[];
  viejitos?: ResultadoGuardado[];

  categoriaA?: ResultadoGuardado[];
  categoriaB?: ResultadoGuardado[];
};

type GrupoHistorial = {
  titulo: string;
  fechas: FechaGuardada[];
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

function formatearRespectoPar(valor: number) {
  if (valor === 0) {
    return "P";
  }

  return valor > 0 ? `+${valor}` : String(valor);
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

function medalla(puesto: number) {
  if (puesto === 1) {
    return "🥇";
  }

  if (puesto === 2) {
    return "🥈";
  }

  if (puesto === 3) {
    return "🥉";
  }

  return `${puesto}.`;
}

function premiados(
  resultados: ResultadoGuardado[]
) {
  return resultados.filter(
    (resultado) => resultado.premio > 0
  );
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

function obtenerResultadosFecha(
  fecha: FechaGuardada
) {
  if (fecha.formato === "categorias") {
    return {
      tituloUno: "🅰️ Categoría A",
      tituloDos: "🅱️ Categoría B",

      tituloCompartirUno:
        "🅰️ CATEGORÍA A",

      tituloCompartirDos:
        "🅱️ CATEGORÍA B",

      resultadosUno:
        fecha.categoriaA ?? [],

      resultadosDos:
        fecha.categoriaB ?? [],

      claveUno: "categoria-a",
      claveDos: "categoria-b",
    };
  }

  return {
    tituloUno: "General",
    tituloDos: "Viejitos",

    tituloCompartirUno:
      "🙎🏻‍♂️ GENERAL",

    tituloCompartirDos:
      "🧓🏻 VIEJITOS",

    resultadosUno: fecha.general ?? [],
    resultadosDos: fecha.viejitos ?? [],

    claveUno: "general",
    claveDos: "viejitos",
  };
}

function nombreVuelta(
  fechaActual: FechaGuardada,
  historial: FechaGuardada[]
) {
  const diaActual = new Date(
    fechaActual.id
  ).toLocaleDateString("es-AR");

  const fechasDelMismoDia = historial
    .filter(
      (fecha) =>
        new Date(
          fecha.id
        ).toLocaleDateString("es-AR") ===
        diaActual
    )
    .sort((a, b) => a.id - b.id);

  if (fechasDelMismoDia.length === 1) {
    return "";
  }

  const posicion =
    fechasDelMismoDia.findIndex(
      (fecha) =>
        fecha.id === fechaActual.id
    ) + 1;

  if (posicion === 1) {
    return "Primera vuelta";
  }

  if (posicion === 2) {
    return "Segunda vuelta";
  }

  if (posicion === 3) {
    return "Tercera vuelta";
  }

  return `${posicion}ª vuelta`;
}

function verDetalle(id: number) {
  window.location.href = `/historial/${id}`;
}

function agruparPorMes(
  historial: FechaGuardada[]
): GrupoHistorial[] {
  const grupos = new Map<
    string,
    FechaGuardada[]
  >();

  [...historial]
    .sort((a, b) => b.id - a.id)
    .forEach((fecha) => {
      const fechaReal = new Date(fecha.id);

      const titulo = fechaReal
        .toLocaleDateString("es-AR", {
          month: "long",
          year: "numeric",
        })
        .replace(/^./, (letra) =>
          letra.toUpperCase()
        );

      const fechasDelMes =
        grupos.get(titulo) ?? [];

      fechasDelMes.push(fecha);

      grupos.set(titulo, fechasDelMes);
    });

  return Array.from(grupos.entries()).map(
    ([titulo, fechas]) => ({
      titulo,
      fechas,
    })
  );
}

export default function Historial() {
  const [historial, setHistorial] =
    useState<FechaGuardada[]>([]);

  const [mesesAbiertos, setMesesAbiertos] =
    useState<string[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  const [esAdmin, setEsAdmin] =
    useState(false);

  const [eliminando, setEliminando] =
    useState<number | null>(null);

  useEffect(() => {
    async function cargarHistorial() {
      const supabase = createClient();

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
          resultadoFechas,
          resultadoResultados,
        ] = await Promise.all([
          supabase
            .from("fechas")
            .select(
              "id, fecha, formato, cancha_id, cancha_nombre, par"
            )
            .order("id", {
              ascending: false,
            }),

          supabase
            .from("resultados")
            .select(
              "fecha_id, jugador_nombre, categoria, score, puesto, premio"
            )
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

        const fechasConvertidas =
          fechasSupabase.map((fecha) => {
            const resultadosFecha =
              resultadosSupabase.filter(
                (resultado) =>
                  Number(
                    resultado.fecha_id
                  ) === Number(fecha.id)
              );

            function convertirResultados(
              categoria: string
            ): ResultadoGuardado[] {
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

            const formato =
              fecha.formato === "categorias"
                ? "categorias"
                : "edad";

            const fechaConvertida:
              FechaGuardada = {
              id: Number(fecha.id),
              fecha: fecha.fecha,
              formato,
              cancha:
                fecha.cancha_id !== null &&
                fecha.cancha_nombre &&
                fecha.par !== null
                  ? {
                      id: Number(
                        fecha.cancha_id
                      ),
                      nombre:
                        fecha.cancha_nombre,
                      par: Number(fecha.par),
                    }
                  : null,
            };

            if (
              formato === "categorias"
            ) {
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
                convertirResultados(
                  "general"
                );

              fechaConvertida.viejitos =
                convertirResultados(
                  "viejitos"
                );
            }

            return fechaConvertida;
          });

        setHistorial(fechasConvertidas);

        const grupos = agruparPorMes(
          fechasConvertidas
        );

        if (grupos.length > 0) {
          setMesesAbiertos([
            grupos[0].titulo,
          ]);
        }
      } catch (error) {
        console.error(
          "No se pudo cargar el historial:",
          error
        );

        setMensaje(
          "⚠️ No se pudo cargar el historial desde Supabase."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarHistorial();
  }, []);

  function cambiarMes(titulo: string) {
    setMesesAbiertos((actuales) =>
      actuales.includes(titulo)
        ? actuales.filter(
            (mes) => mes !== titulo
          )
        : [...actuales, titulo]
    );
  }

  function obtenerNombreCancha(
    fecha: FechaGuardada
  ) {
    return fecha.cancha?.nombre ?? "";
  }

  async function compartirResultados(
    fecha: FechaGuardada
  ) {
    const {
      tituloCompartirUno,
      tituloCompartirDos,
      resultadosUno,
      resultadosDos,
    } = obtenerResultadosFecha(fecha);

    const parFecha = fecha.cancha?.par;

    function crearTextoResultados(
      resultados: ResultadoGuardado[]
    ) {
      const conPremio = resultados.filter(
        (r) => r.premio > 0
      );

      const sinPremio = resultados.filter(
        (r) => r.premio === 0
      );

      const lineas: string[] = [];

      conPremio.forEach((resultado) => {
        lineas.push(
          `${medalla(resultado.puesto)} ${resultado.jugador.nombre} - ${formatearScore(
            resultado.score,
            parFecha
          )}`
        );

        lineas.push(
          `   ${formatearPesos(
            resultado.premio
          )}`
        );
      });

      if (
        conPremio.length &&
        sinPremio.length
      ) {
        lineas.push("");
      }

      sinPremio.forEach((resultado) => {
        lineas.push(
          `${medalla(resultado.puesto)} ${resultado.jugador.nombre} - ${formatearScore(
            resultado.score,
            parFecha
          )}`
        );
      });

      lineas.push("");
      lineas.push(
        `${resultados.length} jugadores`
      );
      lineas.push(
        `Premios: ${obtenerResumenPremios(
          resultados.length
        )}`
      );

      return lineas.join("\n");
    }

    const vuelta = nombreVuelta(
      fecha,
      historial
    );

    const lineas: string[] = [
      "⚽️ La Changueada 🚩",
      "",
      fecha.fecha,
    ];

    if (vuelta) {
      lineas.push(vuelta.toUpperCase());
    }

    if (fecha.cancha) {
      lineas.push(
        "",
        `⛳ ${obtenerNombreCancha(
          fecha
        )} Par ${fecha.cancha.par}`
      );
    }

    if (resultadosUno.length > 0) {
      lineas.push(
        "",
        tituloCompartirUno,
        "",
        "🏆 Resultados",
        "",
        crearTextoResultados(
          resultadosUno
        )
      );
    }

    if (resultadosDos.length > 0) {
      lineas.push(
        "",
        tituloCompartirDos,
        "",
        "🏆 Resultados",
        "",
        crearTextoResultados(
          resultadosDos
        )
      );
    }

    const texto = lineas.join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            "Resultados de La Changueada",
          text: texto,
        });

        return;
      }

      await navigator.clipboard.writeText(
        texto
      );

      alert(
        "Los resultados fueron copiados. Ya podés pegarlos en WhatsApp."
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "No se pudieron compartir los resultados:",
        error
      );

      alert(
        "No se pudieron compartir los resultados."
      );
    }
  }

  async function eliminarFecha(
    fecha: FechaGuardada
  ) {
    if (!esAdmin) {
      return;
    }

    const confirmar = window.confirm(
      `¿Eliminar la fecha del ${fecha.fecha}?`
    );

    if (!confirmar) {
      return;
    }

    setEliminando(fecha.id);
    setMensaje("");

    const supabase = createClient();

    try {
      const { error: errorResultados } =
        await supabase
          .from("resultados")
          .delete()
          .eq("fecha_id", fecha.id);

      if (errorResultados) {
        throw errorResultados;
      }

      const { error: errorFecha } =
        await supabase
          .from("fechas")
          .delete()
          .eq("id", fecha.id);

      if (errorFecha) {
        throw errorFecha;
      }

      const nuevoHistorial =
        historial.filter(
          (item) =>
            item.id !== fecha.id
        );

      setHistorial(nuevoHistorial);

      const datosLocales =
        localStorage.getItem(
          "laChangueadaHistorial"
        );

      if (datosLocales) {
        try {
          const historialLocal:
            FechaGuardada[] =
            JSON.parse(datosLocales);

          localStorage.setItem(
            "laChangueadaHistorial",
            JSON.stringify(
              historialLocal.filter(
                (item) =>
                  item.id !== fecha.id
              )
            )
          );
        } catch {
          // La fecha ya fue eliminada
          // correctamente de Supabase.
        }
      }

      setMensaje(
        "✅ Fecha eliminada correctamente."
      );
    } catch (error) {
      console.error(
        "No se pudo eliminar la fecha:",
        error
      );

      setMensaje(
        "⚠️ No se pudo eliminar la fecha."
      );
    } finally {
      setEliminando(null);
    }
  }

  const grupos =
    agruparPorMes(historial);

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          📜 Historial
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
          Cargando historial...
        </div>
      ) : historial.length === 0 ? (
        <div className="rounded-xl bg-white p-5 text-green-900">
          No hay fechas guardadas.
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => {
            const abierto =
              mesesAbiertos.includes(
                grupo.titulo
              );

            return (
              <section key={grupo.titulo}>
                <button
                  type="button"
                  onClick={() =>
                    cambiarMes(grupo.titulo)
                  }
                  className="flex w-full items-center justify-between rounded-xl bg-green-950 p-4 text-left text-white"
                >
                  <span className="text-2xl font-bold">
                    {grupo.titulo}
                  </span>

                  <span className="font-bold">
                    {grupo.fechas.length}{" "}
                    {grupo.fechas.length === 1
                      ? "fecha"
                      : "fechas"}{" "}
                    {abierto ? "▲" : "▼"}
                  </span>
                </button>

                {abierto && (
                  <div className="mt-4">
                    {grupo.fechas.map(
                      (fecha) => {
                        const {
                          tituloUno,
                          tituloDos,
                          resultadosUno,
                          resultadosDos,
                          claveUno,
                          claveDos,
                        } =
                          obtenerResultadosFecha(
                            fecha
                          );

                        return (
                          <div
                            key={fecha.id}
                            className="mb-6 rounded-xl bg-white p-5 text-green-900"
                          >
                            <div className="mb-2">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl">
                                <span className="font-bold">
                                  {fecha.fecha}
                                </span>

                                {fecha.cancha && (
                                  <span className="inline-flex flex-wrap items-center gap-x-3">
                                    <span className="font-bold">
                                      ⛳️{" "}
                                      {obtenerNombreCancha(
                                        fecha
                                      )}
                                    </span>

                                    <span className="font-normal">
                                      Par{" "}
                                      {
                                        fecha.cancha
                                          .par
                                      }
                                    </span>
                                  </span>
                                )}
                              </div>

                              {nombreVuelta(
                                fecha,
                                historial
                              ) && (
                                <p className="mt-1 text-xl font-medium text-gray-600">
                                  {nombreVuelta(
                                    fecha,
                                    historial
                                  )}
                                </p>
                              )}
                            </div>

                            <hr className="my-2" />

                            <p className="text-lg font-bold">
                              {tituloUno}
                            </p>

                            <div className="mt-2 space-y-1">
                              {premiados(
                                resultadosUno
                              ).map(
                                (
                                  resultado,
                                  indice
                                ) => (
                                  <div
                                    key={`${fecha.id}-${claveUno}-${indice}`}
                                    className="flex justify-between gap-4"
                                  >
                                    <span>
                                      {
                                        resultado.puesto
                                      }
                                      .{" "}
                                      {
                                        resultado
                                          .jugador
                                          .nombre
                                      }{" "}
                                      -{" "}
                                      <strong>
                                        {
                                          resultado.score
                                        }
                                      </strong>

                                      {fecha.cancha && (
                                        <>
                                          {" "}
                                          <span className="font-normal">
                                            (
                                            {formatearRespectoPar(
                                              resultado.score -
                                                fecha
                                                  .cancha
                                                  .par
                                            )}
                                            )
                                          </span>
                                        </>
                                      )}
                                    </span>

                                    <strong>
                                      {formatearPesos(
                                        resultado.premio
                                      )}
                                    </strong>
                                  </div>
                                )
                              )}
                            </div>

                            <p className="mt-3 text-sm text-gray-600">
                              {
                                resultadosUno.length
                              }{" "}
                              jugadores
                              <br />
                              Premios:{" "}
                              {obtenerResumenPremios(
                                resultadosUno.length
                              )}
                            </p>

                            {resultadosDos.length >
                              0 && (
                              <>
                                <hr className="my-3" />

                                <p className="text-lg font-bold">
                                  {tituloDos}
                                </p>

                                <div className="mt-2 space-y-1">
                                  {premiados(
                                    resultadosDos
                                  ).map(
                                    (
                                      resultado,
                                      indice
                                    ) => (
                                      <div
                                        key={`${fecha.id}-${claveDos}-${indice}`}
                                        className="flex justify-between gap-4"
                                      >
                                        <span>
                                          {
                                            resultado.puesto
                                          }
                                          .{" "}
                                          {
                                            resultado
                                              .jugador
                                              .nombre
                                          }{" "}
                                          -{" "}
                                          <strong>
                                            {
                                              resultado.score
                                            }
                                          </strong>

                                          {fecha.cancha && (
                                            <>
                                              {" "}
                                              <span className="font-normal">
                                                (
                                                {formatearRespectoPar(
                                                  resultado.score -
                                                    fecha
                                                      .cancha
                                                      .par
                                                )}
                                                )
                                              </span>
                                            </>
                                          )}
                                        </span>

                                        <strong>
                                          {formatearPesos(
                                            resultado.premio
                                          )}
                                        </strong>
                                      </div>
                                    )
                                  )}
                                </div>

                                <p className="mt-3 text-sm text-gray-600">
                                  {
                                    resultadosDos.length
                                  }{" "}
                                  jugadores
                                  <br />
                                  Premios:{" "}
                                  {obtenerResumenPremios(
                                    resultadosDos.length
                                  )}
                                </p>
                              </>
                            )}

                            <div className="mt-5 flex gap-3">
                              <button
  type="button"
  onClick={() =>
    verDetalle(fecha.id)
  }
  className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-green-700 py-3 font-bold text-white"
>
  <span className="text-2xl leading-none">
    👁️
  </span>

  <span className="text-base leading-none">
    Ver fecha
  </span>
</button>

                              <button
                                type="button"
                                onClick={() =>
                                  compartirResultados(
                                    fecha
                                  )
                                }
                                className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-blue-600 py-3 font-bold text-white"
                              >
                                <span className="text-2xl leading-none">
                                  📤
                                </span>

                                <span className="text-base leading-none">
                                  Compartir
                                </span>
                              </button>

                              {esAdmin && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarFecha(
                                      fecha
                                    )
                                  }
                                  disabled={
                                    eliminando ===
                                    fecha.id
                                  }
                                  className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-red-600 py-3 font-bold text-white disabled:bg-gray-400"
                                >
                                  <span className="text-2xl leading-none">
                                    🗑️
                                  </span>

                                  <span className="text-base leading-none">
                                    {eliminando ===
                                    fecha.id
                                      ? "Eliminando..."
                                      : "Eliminar"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}