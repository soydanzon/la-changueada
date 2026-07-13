"use client";

import { useEffect, useState } from "react";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

type ResultadoGuardado = {
  jugador: {
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
};

type FechaGuardada = {
  id: number;
  fecha: string;
  general: ResultadoGuardado[];
  viejitos: ResultadoGuardado[];
};

type GrupoHistorial = {
  titulo: string;
  fechas: FechaGuardada[];
};

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function totalPremios(resultados: ResultadoGuardado[]) {
  return resultados.reduce(
    (total, resultado) => total + resultado.premio,
    0
  );
}

function premiados(resultados: ResultadoGuardado[]) {
  return resultados.filter((resultado) => resultado.premio > 0);
}

function verPlaca(id: number) {
  localStorage.setItem(
    "laChangueadaFechaParaCompartir",
    String(id)
  );

  window.location.href = "/compartir";
}

function verDetalle(id: number) {
  window.location.href = `/historial/${id}`;
}

function agruparPorMes(
  historial: FechaGuardada[]
): GrupoHistorial[] {
  const grupos = new Map<string, FechaGuardada[]>();

  [...historial]
    .sort((a, b) => b.id - a.id)
    .forEach((fecha) => {
      const fechaReal = new Date(fecha.id);

      const titulo = fechaReal
        .toLocaleDateString("es-AR", {
          month: "long",
          year: "numeric",
        })
        .replace(/^./, (letra) => letra.toUpperCase());

      const fechasDelMes = grupos.get(titulo) || [];

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
  const [historial, setHistorial] = useState<FechaGuardada[]>([]);
  const [mesesAbiertos, setMesesAbiertos] = useState<string[]>([]);

  useEffect(() => {
    const datos = localStorage.getItem(
      "laChangueadaHistorial"
    );

    if (!datos) return;

    const fechas: FechaGuardada[] = JSON.parse(datos);

    setHistorial(fechas);

    const grupos = agruparPorMes(fechas);

    if (grupos.length > 0) {
      setMesesAbiertos([grupos[0].titulo]);
    }
  }, []);

  function cambiarMes(titulo: string) {
    setMesesAbiertos((actuales) =>
      actuales.includes(titulo)
        ? actuales.filter((mes) => mes !== titulo)
        : [...actuales, titulo]
    );
  }

  const grupos = agruparPorMes(historial);

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          📜 Historial
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {historial.length === 0 ? (
        <div className="rounded-xl bg-white p-5 text-green-900">
          No hay fechas guardadas.
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => {
            const abierto = mesesAbiertos.includes(grupo.titulo);

            return (
              <section key={grupo.titulo}>
                <button
                  onClick={() => cambiarMes(grupo.titulo)}
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
                    {grupo.fechas.map((fecha) => (
                      <div
                        key={fecha.id}
                        className="mb-6 rounded-xl bg-white p-5 text-green-900"
                      >
                        <h2 className="text-2xl font-bold">
                          {fecha.fecha}
                        </h2>

                        <p className="text-sm text-gray-600">
                          {new Date(
                            fecha.id
                          ).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        <hr className="my-3" />

                        <p className="text-lg font-bold">
                          General
                        </p>

                        <p>
                          Jugadores: {fecha.general.length}
                        </p>

                        <div className="mt-2 space-y-1">
                          {premiados(fecha.general).map(
                            (resultado) => (
                              <div
                                key={`${fecha.id}-general-${resultado.jugador.nombre}-${resultado.puesto}`}
                                className="flex justify-between gap-4"
                              >
                                <span>
                                  {resultado.puesto}.{" "}
                                  {resultado.jugador.nombre} -{" "}
                                  {resultado.score}
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

                        <p className="mt-3 font-bold">
                          Total:{" "}
                          {formatearPesos(
                            totalPremios(fecha.general)
                          )}
                        </p>

                        <hr className="my-3" />

                        <p className="text-lg font-bold">
                          Viejitos
                        </p>

                        <p>
                          Jugadores: {fecha.viejitos.length}
                        </p>

                        <div className="mt-2 space-y-1">
                          {premiados(fecha.viejitos).map(
                            (resultado) => (
                              <div
                                key={`${fecha.id}-viejitos-${resultado.jugador.nombre}-${resultado.puesto}`}
                                className="flex justify-between gap-4"
                              >
                                <span>
                                  {resultado.puesto}.{" "}
                                  {resultado.jugador.nombre} -{" "}
                                  {resultado.score}
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

                        <p className="mt-3 font-bold">
                          Total:{" "}
                          {formatearPesos(
                            totalPremios(fecha.viejitos)
                          )}
                        </p>

                        <button
                          onClick={() => verDetalle(fecha.id)}
                          className="mt-5 w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white"
                        >
                          👁 Ver resultados completos
                        </button>

                        <button
                          onClick={() => verPlaca(fecha.id)}
                          className="mt-3 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
                        >
                          📤 Ver placa
                        </button>
                      </div>
                    ))}
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