"use client";

import { useState } from "react";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";
import { createClient } from "../lib/supabase/client";

type Respaldo = {
  app: "La Changueada";
  version: number;
  fechaExportacion: string;
  origen: "supabase";
  datos: Record<string, string>;
};

type JugadorSupabase = {
  id: number;
  nombre: string;
  frecuente: boolean | null;
  activo: boolean | null;
};

type CanchaSupabase = {
  id: number;
  nombre: string;
  par: number;
  activa: boolean | null;
};

type FechaSupabase = {
  id: number;
  fecha: string;
  formato: string;
  cancha_id: number | null;
  cancha_nombre: string | null;
  par: number | null;
  pagos_pendientes: number[] | null;
  pagos_completados: number[] | null;
};

type ResultadoSupabase = {
  id: number;
  fecha_id: number;
  jugador_id: number;
  jugador_nombre: string;
  categoria: string;
  score: number;
  puesto: number;
  premio: number;
};

type ResultadoBackup = {
  jugador: {
    id: number;
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
};

type FechaBackup = {
  id: number;
  fecha: string;
  formato: "edad" | "categorias";
  cancha: {
    id: number;
    nombre: string;
    par: number;
  } | null;
  pagosPendientes: number[];
  pagosCompletados: number[];
  general?: ResultadoBackup[];
  viejitos?: ResultadoBackup[];
  categoriaA?: ResultadoBackup[];
  categoriaB?: ResultadoBackup[];
};

const CLAVES_CONFIGURACION_LOCAL = [
  "laChangueadaValor",
  "laChangueadaTablaPremios",
  "laChangueadaTablaPremiosCategorias55_45",
];

export default function RespaldoPage() {
  const [mensaje, setMensaje] =
    useState("");

  const [exportando, setExportando] =
    useState(false);

  async function exportarDatos() {
    if (exportando) {
      return;
    }

    setExportando(true);
    setMensaje(
      "⏳ Preparando respaldo desde Supabase..."
    );

    try {
      const supabase = createClient();

      const [
        respuestaJugadores,
        respuestaCanchas,
        respuestaFechas,
      ] = await Promise.all([
        supabase
          .from("jugadores")
          .select(
            "id, nombre, frecuente, activo"
          )
          .order("nombre"),

        supabase
          .from("canchas")
          .select(
            "id, nombre, par, activa"
          )
          .order("nombre"),

        supabase
          .from("fechas")
          .select(
            "id, fecha, formato, cancha_id, cancha_nombre, par, pagos_pendientes, pagos_completados"
          )
          .order("id", {
            ascending: false,
          }),
      ]);

      if (respuestaJugadores.error) {
        throw respuestaJugadores.error;
      }

      if (respuestaCanchas.error) {
        throw respuestaCanchas.error;
      }

      if (respuestaFechas.error) {
        throw respuestaFechas.error;
      }

      const jugadoresSupabase =
        (respuestaJugadores.data ??
          []) as JugadorSupabase[];

      const canchasSupabase =
        (respuestaCanchas.data ??
          []) as CanchaSupabase[];

      const fechasSupabase =
        (respuestaFechas.data ??
          []) as FechaSupabase[];

      const resultadosSupabase:
        ResultadoSupabase[] = [];

      const cantidadPorPagina = 1000;
      let desde = 0;

      while (true) {
        const { data, error } =
          await supabase
            .from("resultados")
            .select(
              "id, fecha_id, jugador_id, jugador_nombre, categoria, score, puesto, premio"
            )
            .order("id", {
              ascending: true,
            })
            .range(
              desde,
              desde +
                cantidadPorPagina -
                1
            );

        if (error) {
          throw error;
        }

        const pagina =
          (data ??
            []) as ResultadoSupabase[];

        resultadosSupabase.push(
          ...pagina
        );

        if (
          pagina.length <
          cantidadPorPagina
        ) {
          break;
        }

        desde += cantidadPorPagina;
      }

      const resultadosPorFecha =
        new Map<
          number,
          ResultadoSupabase[]
        >();

      resultadosSupabase.forEach(
        (resultado) => {
          const fechaId = Number(
            resultado.fecha_id
          );

          const lista =
            resultadosPorFecha.get(
              fechaId
            ) ?? [];

          lista.push(resultado);

          resultadosPorFecha.set(
            fechaId,
            lista
          );
        }
      );

      function convertirResultados(
        fechaId: number,
        categoria: string
      ): ResultadoBackup[] {
        return (
          resultadosPorFecha.get(
            fechaId
          ) ?? []
        )
          .filter(
            (resultado) =>
              resultado.categoria ===
              categoria
          )
          .sort(
            (a, b) =>
              Number(a.puesto) -
              Number(b.puesto)
          )
          .map((resultado) => ({
            jugador: {
              id: Number(
                resultado.jugador_id
              ),
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

      const historial: FechaBackup[] =
        fechasSupabase.map(
          (fechaSupabase) => {
            const idFecha = Number(
              fechaSupabase.id
            );

            const formato:
              | "edad"
              | "categorias" =
              fechaSupabase.formato ===
              "categorias"
                ? "categorias"
                : "edad";

            const cancha =
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
                : null;

            if (
              formato === "categorias"
            ) {
              const categoriaA =
                convertirResultados(
                  idFecha,
                  "categoriaA"
                );

              const categoriaB =
                convertirResultados(
                  idFecha,
                  "categoriaB"
                );

              return {
                id: idFecha,
                fecha:
                  fechaSupabase.fecha,
                formato,
                cancha,
                pagosPendientes:
                  fechaSupabase.pagos_pendientes ??
                  [],
                pagosCompletados:
                  fechaSupabase.pagos_completados ??
                  [],
                categoriaA,
                categoriaB,

                /*
                  Se conservan estas copias
                  para compatibilidad con
                  respaldos anteriores.
                */
                general: categoriaA,
                viejitos: categoriaB,
              };
            }

            return {
              id: idFecha,
              fecha:
                fechaSupabase.fecha,
              formato,
              cancha,
              pagosPendientes:
                fechaSupabase.pagos_pendientes ??
                [],
              pagosCompletados:
                fechaSupabase.pagos_completados ??
                [],
              general:
                convertirResultados(
                  idFecha,
                  "general"
                ),
              viejitos:
                convertirResultados(
                  idFecha,
                  "viejitos"
                ),
            };
          }
        );

      const jugadores =
        jugadoresSupabase.map(
          (jugador) => ({
            id: Number(jugador.id),
            nombre: jugador.nombre,
            frecuente:
              jugador.frecuente ??
              false,
            activo:
              jugador.activo ?? true,
          })
        );

      const canchas =
        canchasSupabase.map(
          (cancha) => ({
            id: Number(cancha.id),
            nombre: cancha.nombre,
            par: Number(cancha.par),
            activa:
              cancha.activa ?? true,
          })
        );

      const datos: Record<
        string,
        string
      > = {
        laChangueadaJugadores:
          JSON.stringify(jugadores),

        laChangueadaHistorial:
          JSON.stringify(historial),

        laChangueadaCanchas:
          JSON.stringify(canchas),
      };

      CLAVES_CONFIGURACION_LOCAL.forEach(
        (clave) => {
          const valor =
            localStorage.getItem(clave);

          if (valor !== null) {
            datos[clave] = valor;
          }
        }
      );

      const respaldo: Respaldo = {
        app: "La Changueada",
        version: 2,
        fechaExportacion:
          new Date().toISOString(),
        origen: "supabase",
        datos,
      };

      const archivo = new Blob(
        [
          JSON.stringify(
            respaldo,
            null,
            2
          ),
        ],
        {
          type: "application/json",
        }
      );

      const enlace =
        document.createElement("a");

      const fechaArchivo =
        new Date()
          .toLocaleDateString(
            "es-AR"
          )
          .replaceAll("/", "-");

      const direccion =
        URL.createObjectURL(
          archivo
        );

      enlace.href = direccion;

      enlace.download =
        `la-changueada-respaldo-${fechaArchivo}.json`;

      document.body.appendChild(
        enlace
      );

      enlace.click();
      enlace.remove();

      URL.revokeObjectURL(
        direccion
      );

      setMensaje(
        `✅ Respaldo exportado desde Supabase: ` +
          `${jugadores.length} jugadores, ` +
          `${canchas.length} canchas, ` +
          `${historial.length} fechas y ` +
          `${resultadosSupabase.length} resultados.`
      );
    } catch (error) {
      console.error(
        "No se pudo exportar el respaldo:",
        error
      );

      setMensaje(
        "⚠️ No se pudo preparar el respaldo desde Supabase."
      );
    } finally {
      setExportando(false);
    }
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          💾 Respaldo
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 text-green-900">
        <h2 className="text-2xl font-bold">
          Exportar datos
        </h2>

        <p className="mt-2">
          Descarga una copia completa de
          los jugadores, canchas, fechas y
          resultados guardados en
          Supabase. También incluye el
          valor de la Changueada y las
          tablas de premios de este
          dispositivo.
        </p>

        <button
          type="button"
          onClick={exportarDatos}
          disabled={exportando}
          className="mt-5 w-full rounded-xl bg-green-700 p-4 font-bold text-white disabled:bg-gray-400"
        >
          {exportando
            ? "☁️ Preparando respaldo..."
            : "📤 Exportar respaldo"}
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 text-green-900">
        <h2 className="text-2xl font-bold">
          Restaurar datos
        </h2>

        <p className="mt-2">
          Por seguridad, la restauración
          del historial de Supabase se
          realiza desde la administración.
          Importar un archivo solamente en
          este dispositivo ya no
          restauraría los datos de la nube.
        </p>
      </div>

      {mensaje && (
        <p className="mt-6 rounded-xl bg-white p-4 text-center font-bold text-green-900">
          {mensaje}
        </p>
      )}
    </main>
  );
}