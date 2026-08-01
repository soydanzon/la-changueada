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
  if (valor === 0) return "0";

  const numero = formatearNumero(valor);

  return valor > 0 ? `+${numero}` : numero;
}

function formatearScore(valor: number) {
  if (valor === 0) return "Par";

  const numero = formatearNumero(valor);

  return valor > 0 ? `+${numero}` : numero;
}

async function compartirHandicap(
  jugador: HandicapJugador,
  nombre: string,
  mejoresTarjetas: number,
  ultimasTarjetas: number
) {
  const lineas: string[] = [
    "⚽️ La Changueada 🚩",
    "",
    `👤 ${nombre}`,
    `🧢 Handicap: ${formatearHandicap(jugador.handicap)}`,
    "",
    `Mejores ${mejoresTarjetas} de las últimas ${ultimasTarjetas} tarjetas`,
    "",
  ];

  [...jugador.fechas]
  .reverse()
  .forEach((fecha) => {
    const izquierda =
      `${fecha.fecha}  ${fecha.vuelta ?? ""}`.padEnd(34);

    const derecha =
      `${formatearScore(fecha.score)}`.padStart(5);

    lineas.push(
      `${izquierda}${derecha}  ${fecha.cuenta ? "✅" : "❌"}`
    );
  });

  const texto =
  "```\n" +
  lineas.join("\n") +
  "\n```";

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Hándicap",
        text: texto,
      });

      return;
    }

    await navigator.clipboard.writeText(texto);

    alert(
      "El hándicap fue copiado. Ya podés pegarlo en WhatsApp."
    );
  } catch {}
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

const ultimasTarjetas = Math.min(
  jugador.fechas.length,
  16
);

const mejoresTarjetas = Math.min(
  Math.ceil(ultimasTarjetas / 2),
  8
);

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
           🧢 {nombre}
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

      <p className="mb-4 text-l text-green-200">
  Mejores {mejoresTarjetas} de las últimas {ultimasTarjetas} tarjetas
</p>
      
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
  <div className="flex flex-1 items-center gap-4">
    <span className="w-24 shrink-0 font-medium">
      {fecha.fecha}
    </span>

    <span className="min-w-[120px] text-sm text-gray-600">
      {fecha.vuelta ?? ""}
    </span>

    <span className="ml-auto font-bold">
      {fecha.golpes} ({formatearScore(fecha.score)})
    </span>
  </div>

  <span className="ml-4 text-2xl">
    {fecha.cuenta ? "✅" : "❌"}
  </span>
</div>
          </div>
        ))}
      </div>
    <button
  type="button"
  onClick={() =>
    compartirHandicap(
      jugador,
      nombre,
      mejoresTarjetas,
      ultimasTarjetas
    )
  }
  className="mt-6 w-full rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
>
  📤 Compartir handicap
</button>
    
    </main>
  );
}