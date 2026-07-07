"use client";

import { useEffect, useState } from "react";

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

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function totalPremios(resultados: ResultadoGuardado[]) {
  return resultados.reduce((total, r) => total + r.premio, 0);
}

function premiados(resultados: ResultadoGuardado[]) {
  return resultados.filter((r) => r.premio > 0);
}

function verPlaca(id: number) {
  localStorage.setItem("laChangueadaFechaParaCompartir", String(id));
  window.location.href = "/compartir";
}

function verDetalle(id: number) {
  window.location.href = `/historial/${id}`;
}

export default function Historial() {
  const [historial, setHistorial] = useState<FechaGuardada[]>([]);

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (datos) {
      setHistorial(JSON.parse(datos));
    }
  }, []);

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Historial
      </h1>

      {historial.length === 0 ? (
        <div className="bg-white text-green-900 rounded-xl p-5">
          No hay fechas guardadas.
        </div>
      ) : (
        historial.map((fecha) => (
          <div
            key={fecha.id}
            className="bg-white text-green-900 rounded-xl p-5 mb-6"
          >
            <h2 className="text-2xl font-bold">
              {fecha.fecha}
            </h2>

            <p className="text-sm text-gray-600">
              {new Date(fecha.id).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <hr className="my-3" />

            <p className="font-bold text-lg">General</p>
            <p>Jugadores: {fecha.general.length}</p>

            <div className="mt-2 space-y-1">
              {premiados(fecha.general).map((r) => (
                <div
                  key={`${fecha.id}-general-${r.jugador.nombre}-${r.puesto}`}
                  className="flex justify-between gap-4"
                >
                  <span>
                    {r.puesto}. {r.jugador.nombre} - {r.score}
                  </span>

                  <strong>{formatearPesos(r.premio)}</strong>
                </div>
              ))}
            </div>

            <p className="mt-3 font-bold">
              Total: {formatearPesos(totalPremios(fecha.general))}
            </p>

            <hr className="my-3" />

            <p className="font-bold text-lg">Viejitos</p>
            <p>Jugadores: {fecha.viejitos.length}</p>

            <div className="mt-2 space-y-1">
              {premiados(fecha.viejitos).map((r) => (
                <div
                  key={`${fecha.id}-viejitos-${r.jugador.nombre}-${r.puesto}`}
                  className="flex justify-between gap-4"
                >
                  <span>
                    {r.puesto}. {r.jugador.nombre} - {r.score}
                  </span>

                  <strong>{formatearPesos(r.premio)}</strong>
                </div>
              ))}
            </div>

            <p className="mt-3 font-bold">
              Total: {formatearPesos(totalPremios(fecha.viejitos))}
            </p>

            <button
              onClick={() => verDetalle(fecha.id)}
              className="mt-5 w-full bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
            >
              👁 Ver resultados completos
            </button>

            <button
              onClick={() => verPlaca(fecha.id)}
              className="mt-3 w-full bg-blue-600 text-white px-5 py-3 rounded-xl font-bold"
            >
              📤 Ver placa
            </button>
          </div>
        ))
      )}

      <a
        href="/"
        className="inline-block mt-4 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Menú principal
      </a>
    </main>
  );
}