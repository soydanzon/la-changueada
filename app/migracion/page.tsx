"use client";

import {
  useRef,
  useState,
} from "react";

import { createClient } from "../lib/supabase/client";

type Jugador = {
  id: number;
  nombre: string;
  frecuente?: boolean;
  activo?: boolean;
};

type Cancha = {
  id: number;
  nombre: string;
  par: number;
  activa?: boolean;
};

type Resultado = {
  jugador: {
    id: number;
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
};

type Fecha = {
  id: number;
  fecha: string;
  formato?: "edad" | "categorias";

  cancha?: {
    id: number;
    nombre: string;
    par: number;
  } | null;

  pagosPendientes?: number[];
  pagosCompletados?: number[];

  general?: Resultado[];
  viejitos?: Resultado[];

  categoriaA?: Resultado[];
  categoriaB?: Resultado[];
};

type Respaldo = {
  app: "La Changueada";
  version: number;
  fechaExportacion: string;
  datos: Record<string, string>;
};

type Resumen = {
  jugadores: number;
  canchas: number;
  fechas: number;
  resultados: number;
};

type DatosMigracion = {
  jugadores: Array<{
    id: number;
    nombre: string;
    frecuente: boolean;
    activo: boolean;
  }>;

  canchas: Array<{
    id: number;
    nombre: string;
    par: number;
    activa: boolean;
  }>;

  fechas: Array<{
    id: number;
    fecha: string;
    formato: "edad" | "categorias";
    cancha_id: number | null;
    cancha_nombre: string | null;
    par: number | null;
    pagos_pendientes: number[];
    pagos_completados: number[];
  }>;

  resultados: Array<{
    id: number;
    fecha_id: number;
    jugador_id: number;
    jugador_nombre: string;
    categoria: string;
    score: number;
    puesto: number;
    premio: number;
  }>;
};

export default function MigracionPage() {
  const inputArchivo =
    useRef<HTMLInputElement>(null);

  const [archivoNombre, setArchivoNombre] =
    useState("");

  const [resumen, setResumen] =
    useState<Resumen | null>(null);

  const [
    datosMigracion,
    setDatosMigracion,
  ] =
    useState<DatosMigracion | null>(
      null
    );

  const [mensaje, setMensaje] =
    useState("");

  const [migrando, setMigrando] =
    useState(false);

  const [
    migracionCompleta,
    setMigracionCompleta,
  ] =
    useState(false);

  function prepararResultados(
    fechas: Fecha[]
  ) {
    return fechas.flatMap((fecha) => {
      let indice = 0;

      const listas =
        fecha.formato === "categorias"
          ? [
              {
                categoria: "categoriaA",
                resultados:
                  fecha.categoriaA ?? [],
              },
              {
                categoria: "categoriaB",
                resultados:
                  fecha.categoriaB ?? [],
              },
            ]
          : [
              {
                categoria: "general",
                resultados:
                  fecha.general ?? [],
              },
              {
                categoria: "viejitos",
                resultados:
                  fecha.viejitos ?? [],
              },
            ];

      return listas.flatMap(
        ({
          categoria,
          resultados,
        }) =>
          resultados.map(
            (resultado) => {
              indice += 1;

              return {
                id:
                  fecha.id * 1000 +
                  indice,

                fecha_id: fecha.id,

                jugador_id:
                  resultado.jugador.id,

                jugador_nombre:
                  resultado.jugador
                    .nombre,

                categoria,

                score:
                  resultado.score,

                puesto:
                  resultado.puesto,

                premio:
                  resultado.premio,
              };
            }
          )
      );
    });
  }

  async function leerArchivo(
    evento: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivo =
      evento.target.files?.[0];

    if (!archivo) {
      return;
    }

    setMensaje("");
    setResumen(null);
    setDatosMigracion(null);
    setMigracionCompleta(false);

    setArchivoNombre(
      archivo.name
    );

    try {
      const texto =
        await archivo.text();

      const respaldo: Respaldo =
        JSON.parse(texto);

      if (
        respaldo.app !==
          "La Changueada" ||
        !respaldo.datos ||
        typeof respaldo.datos !==
          "object"
      ) {
        throw new Error(
          "Respaldo inválido"
        );
      }

      const jugadores: Jugador[] =
        respaldo.datos
          .laChangueadaJugadores
          ? JSON.parse(
              respaldo.datos
                .laChangueadaJugadores
            )
          : [];

      const canchas: Cancha[] =
        respaldo.datos
          .laChangueadaCanchas
          ? JSON.parse(
              respaldo.datos
                .laChangueadaCanchas
            )
          : [];

      const fechas: Fecha[] =
        respaldo.datos
          .laChangueadaHistorial
          ? JSON.parse(
              respaldo.datos
                .laChangueadaHistorial
            )
          : [];

      if (
        !Array.isArray(jugadores) ||
        !Array.isArray(canchas) ||
        !Array.isArray(fechas)
      ) {
        throw new Error(
          "Contenido inválido"
        );
      }

      const jugadoresPreparados =
        jugadores.map((jugador) => ({
          id: jugador.id,
          nombre: jugador.nombre,
          frecuente:
            jugador.frecuente ??
            false,
          activo:
            jugador.activo ?? true,
        }));

      const canchasPreparadas =
        canchas.map((cancha) => ({
          id: cancha.id,
          nombre: cancha.nombre,
          par: cancha.par,
          activa:
            cancha.activa ?? true,
        }));

      const fechasPreparadas =
        fechas.map((fecha) => ({
          id: fecha.id,
          fecha: fecha.fecha,

          formato:
            fecha.formato ??
            "edad",

          cancha_id:
            fecha.cancha?.id ??
            null,

          cancha_nombre:
            fecha.cancha?.nombre ??
            null,

          par:
            fecha.cancha?.par ??
            null,

          pagos_pendientes:
            fecha.pagosPendientes ??
            [],

          pagos_completados:
            fecha.pagosCompletados ??
            [],
        }));

      const resultadosPreparados =
        prepararResultados(fechas);

      const datos: DatosMigracion = {
        jugadores:
          jugadoresPreparados,

        canchas:
          canchasPreparadas,

        fechas:
          fechasPreparadas,

        resultados:
          resultadosPreparados,
      };

      setDatosMigracion(datos);

      setResumen({
        jugadores:
          jugadoresPreparados.length,

        canchas:
          canchasPreparadas.length,

        fechas:
          fechasPreparadas.length,

        resultados:
          resultadosPreparados.length,
      });

      setMensaje(
        "✅ Respaldo leído correctamente."
      );
    } catch (error) {
      console.error(
        "No se pudo preparar el respaldo:",
        error
      );

      setArchivoNombre("");
      setResumen(null);
      setDatosMigracion(null);

      setMensaje(
        "⚠️ No se pudo leer el respaldo."
      );
    } finally {
      evento.target.value = "";
    }
  }

  async function migrarDatos() {
    if (
      !datosMigracion ||
      !resumen ||
      migrando ||
      migracionCompleta
    ) {
      return;
    }

    const confirmar =
      window.confirm(
        `Se subirán a Supabase:\n\n` +
          `${resumen.jugadores} jugadores\n` +
          `${resumen.canchas} canchas\n` +
          `${resumen.fechas} fechas\n` +
          `${resumen.resultados} resultados\n\n` +
          `¿Querés comenzar la migración?`
      );

    if (!confirmar) {
      return;
    }

    setMigrando(true);

    setMensaje(
      "⏳ Subiendo datos a Supabase..."
    );

    try {
      const supabase =
        createClient();

      const { data, error } =
        await supabase.rpc(
          "migrar_datos_iniciales",
          {
            p_jugadores:
              datosMigracion.jugadores,

            p_canchas:
              datosMigracion.canchas,

            p_fechas:
              datosMigracion.fechas,

            p_resultados:
              datosMigracion.resultados,
          }
        );

      if (error) {
        throw new Error(
          error.message
        );
      }

      const resultado =
        data as Resumen;

      setResumen(resultado);
      setMigracionCompleta(true);

      setMensaje(
        `✅ Migración completa: ` +
          `${resultado.jugadores} jugadores, ` +
          `${resultado.canchas} canchas, ` +
          `${resultado.fechas} fechas y ` +
          `${resultado.resultados} resultados.`
      );
    } catch (error) {
      console.error(
        "No se pudo migrar:",
        error
      );

      const detalle =
        error instanceof Error
          ? error.message
          : "Error desconocido";

      setMensaje(
        `⚠️ No se pudo completar la migración: ${detalle}`
      );
    } finally {
      setMigrando(false);
    }
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <h1 className="mb-6 text-3xl font-bold">
        ☁️ Migración a Supabase
      </h1>

      <div className="rounded-xl bg-white p-5 text-green-900">
        <h2 className="text-2xl font-bold">
          Seleccionar respaldo
        </h2>

        <p className="mt-2">
          Primero vamos a revisar el
          contenido antes de subirlo.
        </p>

        <input
          ref={inputArchivo}
          type="file"
          accept=".json,application/json"
          onChange={leerArchivo}
          className="hidden"
        />

        <button
          type="button"
          onClick={() =>
            inputArchivo.current?.click()
          }
          disabled={migrando}
          className="mt-5 w-full rounded-xl bg-blue-600 p-4 text-xl font-bold text-white disabled:bg-gray-400"
        >
          📂 Elegir respaldo
        </button>
      </div>

      {archivoNombre && (
        <div className="mt-6 rounded-xl bg-white p-5 text-green-900">
          <p className="font-bold">
            Archivo
          </p>

          <p className="mt-1 break-words">
            {archivoNombre}
          </p>
        </div>
      )}

      {resumen && (
        <div className="mt-6 rounded-xl bg-white p-5 text-green-900">
          <h2 className="mb-4 text-2xl font-bold">
            📊 Contenido detectado
          </h2>

          <div className="space-y-3 text-xl">
            <div className="flex justify-between">
              <span>Jugadores</span>

              <strong>
                {resumen.jugadores}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>Canchas</span>

              <strong>
                {resumen.canchas}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>Fechas</span>

              <strong>
                {resumen.fechas}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>Resultados</span>

              <strong>
                {resumen.resultados}
              </strong>
            </div>
          </div>

          {!migracionCompleta ? (
            <>
              <div className="mt-5 rounded-xl bg-yellow-100 p-4 text-yellow-900">
                Revisá las cantidades antes
                de comenzar. La migración
                solo funcionará si las
                tablas están vacías.
              </div>

              <button
                type="button"
                onClick={migrarDatos}
                disabled={migrando}
                className="mt-5 w-full rounded-xl bg-green-700 p-4 text-xl font-bold text-white disabled:bg-gray-400"
              >
                {migrando
                  ? "Migrando..."
                  : "☁️ Subir datos a Supabase"}
              </button>
            </>
          ) : (
            <div className="mt-5 rounded-xl bg-green-100 p-4 font-bold text-green-900">
              ✅ Los datos fueron subidos
              correctamente.
            </div>
          )}
        </div>
      )}

      {mensaje && (
        <p className="mt-6 rounded-xl bg-white p-4 text-center font-bold text-green-900">
          {mensaje}
        </p>
      )}
    </main>
  );
}