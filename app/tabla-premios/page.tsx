"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  obtenerTablaPremios,
  type FilaPremios,
} from "../premios/tablaPremios";
import { createClient } from "../lib/supabase/client";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString(
    "es-AR"
  )}`;
}

export default function TablaPremios() {
  const [tabla, setTabla] =
    useState<FilaPremios[]>([]);

  const [cargando, setCargando] =
    useState(true);

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

      if (error) {
        console.error(
          "No se pudo cargar la tabla:",
          error
        );

        setTabla(tablaLocal);
        setCargando(false);
        return;
      }

      if (
        data &&
        Array.isArray(data.valor)
      ) {
        const tablaSupabase =
          data.valor as unknown as FilaPremios[];

        setTabla(tablaSupabase);

        localStorage.setItem(
          "laChangueadaTablaPremios",
          JSON.stringify(
            tablaSupabase
          )
        );

        setCargando(false);
        return;
      }

      const {
        error: errorInicializacion,
      } = await supabase
        .from("configuracion")
        .upsert({
          clave:
            "tablaPremiosGeneral",

          valor: tablaLocal,

          actualizado_en:
            new Date().toISOString(),
        });

      if (errorInicializacion) {
        console.error(
          "No se pudo inicializar la tabla:",
          errorInicializacion
        );
      }

      setTabla(tablaLocal);
      setCargando(false);
    }

    cargarTabla();
  }, []);

  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              🏆
            </span>

            <h1 className="text-3xl font-black">
              Tabla de Premios
            </h1>
          </div>

          <p className="mt-2 text-green-200">
            Tabla oficial de premios vigente
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
        <div className="overflow-x-auto rounded-3xl bg-white p-4 text-green-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-2 py-3">
                  Jug.
                </th>

                <th className="px-2">
                  🥇
                </th>

                <th className="px-2">
                  🥈
                </th>

                <th className="px-2">
                  🥉
                </th>

                <th className="px-2">
                  4°
                </th>

                <th className="px-2">
                  5°
                </th>
              </tr>
            </thead>

            <tbody>
              {tabla.map(
                (fila, index) => (
                  <tr
                    key={
                      fila.jugadores
                    }
                    className={`border-b ${
                      index % 2 === 0
                        ? "bg-green-50"
                        : "bg-white"
                    }`}
                  >
                    <td className="px-2 py-3 font-black">
                      {
                        fila.jugadores
                      }
                    </td>

                    {[
                      0, 1, 2, 3, 4,
                    ].map(
                      (indice) => (
                        <td
                          key={
                            indice
                          }
                          className="px-2 font-bold"
                        >
                          {fila
                            .premios[
                            indice
                          ]
                            ? formatearPesos(
                                fila
                                  .premios[
                                  indice
                                ]
                              )
                            : "-"}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      <a
        href="/tabla-premios/editar"
        className="mt-6 block w-full rounded-xl bg-white p-4 text-center text-xl font-bold text-green-900"
      >
        ✏️ Editar tabla
      </a>

      <button
        type="button"
        onClick={() => {
          window.location.href =
            "/tabla-premios/compartir";
        }}
        className="mt-3 block w-full rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
      >
        📤 Compartir tabla
      </button>
    </main>
  );
}