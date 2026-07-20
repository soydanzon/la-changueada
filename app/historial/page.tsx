"use client";

import { useEffect, useState } from "react";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";
import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../datos/canchas";

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
  cancha?: CanchaFecha | null;
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
        new Date(fecha.id).toLocaleDateString("es-AR") ===
        diaActual
    )
    .sort((a, b) => a.id - b.id);

  if (fechasDelMismoDia.length === 1) {
    return "";
  }

  const posicion =
    fechasDelMismoDia.findIndex(
      (fecha) => fecha.id === fechaActual.id
    ) + 1;

  if (posicion === 1) return "Primera vuelta";
  if (posicion === 2) return "Segunda vuelta";
  if (posicion === 3) return "Tercera vuelta";

  return `${posicion}ª vuelta`;
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
const [canchas, setCanchas] = useState<Cancha[]>([]);

  useEffect(() => {
  setCanchas(obtenerCanchasGuardadas());

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

  function obtenerNombreCancha(fecha: FechaGuardada) {
  if (!fecha.cancha) return "";

  const canchaActual = canchas.find(
    (cancha) => cancha.id === fecha.cancha?.id
  );

  return canchaActual?.nombre ?? fecha.cancha.nombre;
}

  function eliminarFecha(fecha: FechaGuardada) {
  const confirmar = window.confirm(
    `¿Eliminar la fecha del ${fecha.fecha}?`
  );

  if (!confirmar) return;

  const nuevoHistorial = historial.filter(
    (item) => item.id !== fecha.id
  );

  localStorage.setItem(
    "laChangueadaHistorial",
    JSON.stringify(nuevoHistorial)
  );

  setHistorial(nuevoHistorial);
}

  const grupos = agruparPorMes(historial);

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
                        <div className="mb-2">
  <div className="flex items-center gap-3 text-xl font-bold">
    <span>{fecha.fecha}</span>

    {fecha.cancha && (
      <span>
        🚩 {obtenerNombreCancha(fecha)}
      </span>
    )}
  </div>

  {nombreVuelta(fecha, historial) && (
    <p className="mt-1 text-xl font-medium text-gray-600">
      {nombreVuelta(fecha, historial)}
    </p>
  )}
</div>
                        <hr className="my-2" />

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

  <strong>
    {resultado.score}
  </strong>

  {fecha.cancha && (
    <>
      {" "}
      <span className="font-normal">
        (
        {resultado.score - fecha.cancha.par === 0
          ? "P"
          : resultado.score - fecha.cancha.par > 0
            ? `+${resultado.score - fecha.cancha.par}`
            : resultado.score - fecha.cancha.par}
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

  <strong>
    {resultado.score}
  </strong>

  {fecha.cancha && (
    <>
      {" "}
      <span className="font-normal">
        (
        {resultado.score - fecha.cancha.par === 0
          ? "P"
          : resultado.score - fecha.cancha.par > 0
            ? `+${resultado.score - fecha.cancha.par}`
            : resultado.score - fecha.cancha.par}
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

                        <p className="mt-3 font-bold">
                          Total:{" "}
                          {formatearPesos(
                            totalPremios(fecha.viejitos)
                          )}
                        </p>

                        <div className="mt-5 flex gap-3">
  <button
    onClick={() => verDetalle(fecha.id)}
    className="flex-1 flex items-center justify-center rounded-xl bg-green-700 py-3 text-xl text-white font-bold"
  >
    📝 Ver
  </button>

  <button
    onClick={() => verPlaca(fecha.id)}
    className="flex-1 flex items-center justify-center rounded-xl bg-blue-600 py-3 text-xl text-white font-bold"
  >
    📤 Placa
  </button>

  <button
    onClick={() => eliminarFecha(fecha)}
    className="flex-1 flex items-center justify-center rounded-xl bg-red-600 py-3 text-xl text-white font-bold"
  >
    🗑️ Eliminar
  </button>
</div>
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