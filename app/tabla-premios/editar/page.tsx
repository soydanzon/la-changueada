"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  guardarTablaPremios,
  obtenerTablaPremios,
  tablaPremiosOriginal,
  type FilaPremios,
} from "../../premios/tablaPremios";
import { createClient } from "../../lib/supabase/client";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

function totalFila(fila: FilaPremios) {
  return fila.premios.reduce(
    (total, premio) =>
      total + premio,
    0
  );
}

function obtenerCantidadPremios(
  tabla: FilaPremios[]
) {
  return Math.max(
    5,
    ...tabla.map(
      (fila) =>
        fila.premios.length
    )
  );
}

export default function TablaPremios() {
  const [tabla, setTabla] =
    useState<FilaPremios[]>([]);

  const [
    cantidadPremios,
    setCantidadPremios,
  ] = useState(5);

  const [mensaje, setMensaje] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  useEffect(() => {
    async function cargarTabla() {
      const tablaLocal =
        obtenerTablaPremios();

      const supabase =
        createClient();

      const { data, error } =
        await supabase
          .from("configuracion")
          .select("valor")
          .eq(
            "clave",
            "tablaPremiosGeneral"
          )
          .maybeSingle();

      if (
        !error &&
        data &&
        Array.isArray(data.valor)
      ) {
        const tablaSupabase =
          data.valor as unknown as FilaPremios[];

        setTabla(tablaSupabase);

        setCantidadPremios(
          obtenerCantidadPremios(
            tablaSupabase
          )
        );

        guardarTablaPremios(
          tablaSupabase
        );

        setCargando(false);
        return;
      }

      if (error) {
        console.error(
          "No se pudo cargar la tabla:",
          error
        );
      }

      setTabla(tablaLocal);

      setCantidadPremios(
        obtenerCantidadPremios(
          tablaLocal
        )
      );

      setCargando(false);
    }

    cargarTabla();
  }, []);

  function cambiarJugadores(
    indiceFila: number,
    valor: number
  ) {
    setTabla((actual) =>
      actual.map(
        (fila, indice) =>
          indice === indiceFila
            ? {
                ...fila,
                jugadores: valor,
              }
            : fila
      )
    );

    setMensaje("");
  }

  function cambiarPremio(
    indiceFila: number,
    indicePremio: number,
    valor: number
  ) {
    setTabla((actual) =>
      actual.map(
        (fila, indice) => {
          if (
            indice !== indiceFila
          ) {
            return fila;
          }

          const premios =
            Array.from(
              {
                length:
                  cantidadPremios,
              },
              (_, posicion) =>
                fila.premios[
                  posicion
                ] ?? 0
            );

          premios[
            indicePremio
          ] = valor;

          return {
            ...fila,
            premios,
          };
        }
      )
    );

    setMensaje("");
  }

  function agregarFila() {
    const mayorCantidad =
      tabla.length > 0
        ? Math.max(
            ...tabla.map(
              (fila) =>
                fila.jugadores
            )
          )
        : 5;

    setTabla((actual) => [
      ...actual,
      {
        jugadores:
          mayorCantidad + 1,

        premios:
          Array(
            cantidadPremios
          ).fill(0),
      },
    ]);

    setMensaje("");
  }

  function eliminarFila(
    indiceFila: number
  ) {
    if (
      !confirm(
        "¿Eliminar esta fila de premios?"
      )
    ) {
      return;
    }

    setTabla((actual) =>
      actual.filter(
        (_, indice) =>
          indice !== indiceFila
      )
    );

    setMensaje("");
  }

  function agregarPremio() {
    setCantidadPremios(
      (actual) => actual + 1
    );

    setTabla((actual) =>
      actual.map((fila) => ({
        ...fila,
        premios: [
          ...fila.premios,
          0,
        ],
      }))
    );

    setMensaje("");
  }

  function quitarPremio() {
    if (
      cantidadPremios <= 1
    ) {
      return;
    }

    if (
      !confirm(
        "¿Eliminar el último puesto de todas las filas?"
      )
    ) {
      return;
    }

    setCantidadPremios(
      (actual) => actual - 1
    );

    setTabla((actual) =>
      actual.map((fila) => ({
        ...fila,

        premios:
          fila.premios.slice(
            0,
            cantidadPremios - 1
          ),
      }))
    );

    setMensaje("");
  }

  async function guardar() {
    const cantidades =
      tabla.map(
        (fila) =>
          fila.jugadores
      );

    const cantidadesUnicas =
      new Set(cantidades);

    if (
      cantidadesUnicas.size !==
      cantidades.length
    ) {
      setMensaje(
        "⚠️ Hay cantidades de jugadores repetidas."
      );

      return;
    }

    const valorGuardado =
      localStorage.getItem(
        "laChangueadaValor"
      );

    const valorChangueada =
      valorGuardado
        ? Number(valorGuardado)
        : 10000;

    const filaConTotalIncorrecto =
      tabla.find(
        (fila) =>
          totalFila(fila) !==
          fila.jugadores *
            valorChangueada
      );

    if (
      filaConTotalIncorrecto
    ) {
      setMensaje(
        `⚠️ La fila de ${filaConTotalIncorrecto.jugadores} jugadores debe sumar $${(
          filaConTotalIncorrecto.jugadores *
          valorChangueada
        ).toLocaleString(
          "es-AR"
        )}.`
      );

      return;
    }

    const tablaOrdenada = [
      ...tabla,
    ]
      .map((fila) => ({
        jugadores:
          Number(
            fila.jugadores
          ),

        premios:
          fila.premios.map(
            (premio) =>
              Number(premio)
          ),
      }))
      .sort(
        (a, b) =>
          a.jugadores -
          b.jugadores
      );

    setGuardando(true);
    setMensaje("");

    const supabase =
      createClient();

    const { error } =
      await supabase
        .from("configuracion")
        .upsert({
          clave:
            "tablaPremiosGeneral",

          valor:
            tablaOrdenada,

          actualizado_en:
            new Date().toISOString(),
        });

    if (error) {
      console.error(
        "No se pudo guardar la tabla:",
        error
      );

      setMensaje(
        "⚠️ No se pudo guardar la tabla en Supabase."
      );

      setGuardando(false);
      return;
    }

    guardarTablaPremios(
      tablaOrdenada
    );

    setTabla(tablaOrdenada);

    setMensaje(
      "✅ Tabla de premios guardada"
    );

    setGuardando(false);
  }

  async function restaurar() {
    if (
      !confirm(
        "¿Restaurar la tabla de premios original?"
      )
    ) {
      return;
    }

    setGuardando(true);
    setMensaje("");

    const supabase =
      createClient();

    const { error } =
      await supabase
        .from("configuracion")
        .upsert({
          clave:
            "tablaPremiosGeneral",

          valor:
            tablaPremiosOriginal,

          actualizado_en:
            new Date().toISOString(),
        });

    if (error) {
      console.error(
        "No se pudo restaurar la tabla:",
        error
      );

      setMensaje(
        "⚠️ No se pudo restaurar la tabla."
      );

      setGuardando(false);
      return;
    }

    guardarTablaPremios(
      tablaPremiosOriginal
    );

    setTabla(
      tablaPremiosOriginal
    );

    setCantidadPremios(
      obtenerCantidadPremios(
        tablaPremiosOriginal
      )
    );

    setMensaje(
      "✅ Tabla original restaurada"
    );

    setGuardando(false);
  }

  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              🏆
            </span>

            <h1 className="text-3xl font-black">
              Tabla de Premios
            </h1>
          </div>

          <p className="mt-2 font-bold text-green-200">
            La Changueada
          </p>
        </div>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {cargando ? (
        <div className="rounded-3xl bg-white p-5 text-center font-bold text-green-900">
          Cargando tabla...
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={
                agregarFila
              }
              disabled={
                guardando
              }
              className="rounded-xl bg-white px-4 py-3 font-bold text-green-950 disabled:bg-gray-300"
            >
              ➕ Agregar fila
            </button>

            <button
              type="button"
              onClick={
                agregarPremio
              }
              disabled={
                guardando
              }
              className="rounded-xl bg-white px-4 py-3 font-bold text-green-950 disabled:bg-gray-300"
            >
              ➕ Agregar puesto
            </button>

            <button
              type="button"
              onClick={
                quitarPremio
              }
              disabled={
                guardando
              }
              className="rounded-xl bg-white px-4 py-3 font-bold text-green-950 disabled:bg-gray-300"
            >
              ➖ Quitar puesto
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl bg-white p-4 text-green-900 shadow-2xl">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-2 py-3">
                    Jug.
                  </th>

                  {Array.from(
                    {
                      length:
                        cantidadPremios,
                    },
                    (_, indice) => (
                      <th
                        key={
                          indice
                        }
                        className="px-2 py-3"
                      >
                        {indice +
                          1}
                        °
                      </th>
                    )
                  )}

                  <th className="px-2 py-3">
                    Total
                  </th>

                  <th className="px-2 py-3">
                    Borrar
                  </th>
                </tr>
              </thead>

              <tbody>
                {tabla.map(
                  (
                    fila,
                    indiceFila
                  ) => (
                    <tr
                      key={`${fila.jugadores}-${indiceFila}`}
                      className={`border-b ${
                        indiceFila %
                          2 ===
                        0
                          ? "bg-green-50"
                          : "bg-white"
                      }`}
                    >
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="1"
                          value={
                            fila.jugadores
                          }
                          disabled={
                            guardando
                          }
                          onChange={(
                            evento
                          ) =>
                            cambiarJugadores(
                              indiceFila,
                              Number(
                                evento
                                  .target
                                  .value
                              )
                            )
                          }
                          className="w-20 rounded-lg border bg-white p-2 text-center font-bold text-black disabled:bg-gray-200"
                        />
                      </td>

                      {Array.from(
                        {
                          length:
                            cantidadPremios,
                        },
                        (
                          _,
                          indicePremio
                        ) => (
                          <td
                            key={
                              indicePremio
                            }
                            className="px-2 py-2"
                          >
                            <input
                              type="number"
                              min="0"
                              step="5000"
                              value={
                                fila
                                  .premios[
                                  indicePremio
                                ] ??
                                0
                              }
                              disabled={
                                guardando
                              }
                              onChange={(
                                evento
                              ) =>
                                cambiarPremio(
                                  indiceFila,
                                  indicePremio,
                                  Number(
                                    evento
                                      .target
                                      .value
                                  )
                                )
                              }
                              className="w-28 rounded-lg border bg-white p-2 text-right font-bold text-black disabled:bg-gray-200"
                            />
                          </td>
                        )
                      )}

                      <td className="whitespace-nowrap px-2 py-2 font-bold">
                        $
                        {totalFila(
                          fila
                        ).toLocaleString(
                          "es-AR"
                        )}
                      </td>

                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          disabled={
                            guardando
                          }
                          onClick={() =>
                            eliminarFila(
                              indiceFila
                            )
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-white disabled:bg-gray-400"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={guardar}
            disabled={
              guardando
            }
            className="mt-6 w-full rounded-xl bg-blue-600 p-4 text-xl font-black text-white disabled:bg-gray-300"
          >
            {guardando
              ? "☁️ Guardando..."
              : "💾 Guardar tabla"}
          </button>

          <button
            type="button"
            onClick={
              restaurar
            }
            disabled={
              guardando
            }
            className="mt-3 w-full rounded-xl bg-red-600 p-4 font-bold text-white disabled:bg-gray-400"
          >
            Restaurar tabla original
          </button>
        </>
      )}

      {mensaje && (
        <p className="mt-4 text-xl font-bold">
          {mensaje}
        </p>
      )}
    </main>
  );
}