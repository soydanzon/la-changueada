"use client";

import {
  useRef,
  useState,
} from "react";

type Jugador = {
  id: number;
  nombre: string;
  frecuente?: boolean;
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

export default function MigracionPage() {
  const inputArchivo =
    useRef<HTMLInputElement>(null);

  const [archivoNombre, setArchivoNombre] =
    useState("");

  const [resumen, setResumen] =
    useState<Resumen | null>(null);

  const [mensaje, setMensaje] =
    useState("");

  function contarResultados(
    fechas: Fecha[]
  ) {
    return fechas.reduce(
      (total, fecha) => {
        if (
          fecha.formato ===
          "categorias"
        ) {
          return (
            total +
            (fecha.categoriaA?.length ??
              0) +
            (fecha.categoriaB?.length ??
              0)
          );
        }

        return (
          total +
          (fecha.general?.length ??
            0) +
          (fecha.viejitos?.length ??
            0)
        );
      },
      0
    );
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
        !respaldo.datos
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

      setResumen({
        jugadores:
          jugadores.length,

        canchas:
          canchas.length,

        fechas:
          fechas.length,

        resultados:
          contarResultados(fechas),
      });

      setMensaje(
        "✅ Respaldo leído correctamente."
      );
    } catch {
      setArchivoNombre("");
      setResumen(null);

      setMensaje(
        "⚠️ No se pudo leer el respaldo."
      );
    } finally {
      evento.target.value = "";
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
          contenido. Todavía no se subirá
          nada a la nube.
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
          className="mt-5 w-full rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
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

          <div className="mt-5 rounded-xl bg-yellow-100 p-4 text-yellow-900">
            Todavía no se subió ningún
            dato a Supabase.
          </div>
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