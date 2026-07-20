"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  calcularHandicap,
  type FechaGuardada,
  type HandicapJugador,
} from "../../utils/estadisticas";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

function formatearNumero(valor: number) {
  return Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(1);
}

function formatearHandicap(valor: number) {
  if (valor === 0) return "E";

  const numero = formatearNumero(valor);

  return valor > 0 ? `+${numero}` : numero;
}

export default function DetalleHandicap() {
  const params = useParams();
  const nombre = decodeURIComponent(params.nombre as string);

  const [jugador, setJugador] =
    useState<HandicapJugador | null>(null);

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const historial: FechaGuardada[] = JSON.parse(datos);

    const encontrado = calcularHandicap(historial).find(
      (item) => item.nombre === nombre
    );

    if (encontrado) {
      setJugador(encontrado);
    }
  }, [nombre]);

  if (!jugador) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            {nombre}
          </h1>

          <p className="text-3xl font-black">
            {formatearHandicap(jugador.handicap)}
          </p>
        </div>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="space-y-2">
        {[...jugador.fechas].reverse().map((fecha, index) => (
          <div
            key={`${fecha.fecha}-${fecha.cancha}-${index}`}
            className={`rounded-xl border px-4 py-2 ${
              fecha.cuenta
                ? "bg-green-100 text-green-950"
                : "bg-white text-green-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="font-medium">
                  {fecha.fecha}
                </span>

                <span>
                  🚩 {fecha.cancha}
                </span>

                <span className="font-bold">
                  {fecha.golpes} ({formatearHandicap(fecha.score)})
                </span>
              </div>

              <span className="text-2xl">
                {fecha.cuenta ? "✅" : "❌"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}