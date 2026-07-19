"use client";

import { useEffect, useState } from "react";
import {
  calcularEstadisticas,
  type EstadisticaJugador,
  type FechaGuardada,
} from "../utils/estadisticas";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

type EstadisticaConPresencias = EstadisticaJugador & {
  presencias: number;
};

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function Estadisticas() {
  const [estadisticas, setEstadisticas] = useState<
  EstadisticaConPresencias[]
>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
  const datos = localStorage.getItem("laChangueadaHistorial");

  if (!datos) return;

  const historial: FechaGuardada[] = JSON.parse(datos);

  const presenciasPorJugador = new Map<string, number>();

  historial.forEach((fecha) => {
    const jugadores = new Set<string>();

    fecha.general.forEach((r) =>
      jugadores.add(r.jugador.nombre)
    );

    fecha.viejitos.forEach((r) =>
      jugadores.add(r.jugador.nombre)
    );

    jugadores.forEach((nombre) => {
      presenciasPorJugador.set(
        nombre,
        (presenciasPorJugador.get(nombre) ?? 0) + 1
      );
    });
  });

  const datosFinales = calcularEstadisticas(historial)
    .map((jugador) => ({
      ...jugador,
      presencias:
        presenciasPorJugador.get(jugador.nombre) ?? 0,
    }))
    .sort((a, b) => b.balance - a.balance);

  setEstadisticas(datosFinales);
}, []);

  const estadisticasFiltradas = estadisticas.filter((jugador) =>
    jugador.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          📊 Estadísticas
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar jugador..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-6 w-full rounded-lg bg-white p-4 text-xl text-black"
      />

      <div className="space-y-4">
        {estadisticasFiltradas.map((jugador) => (
          <a
  key={jugador.nombre}
  href={`/estadisticas/${encodeURIComponent(jugador.nombre)}`}
  className="block rounded-xl bg-white px-5 py-3 text-green-900"
>
  <h2 className="text-2xl font-bold">
    {jugador.nombre}
  </h2>

  <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-lg font-normal">
    <div className="flex items-center gap-2">
      <span>🏆</span>
      <span>{jugador.victorias}</span>
    </div>

    <div className="flex items-center gap-2">
      <span>🙋🏻‍♂️</span>
      <span>{jugador.presencias}</span>
    </div>

    <div className="flex items-center gap-2">
      <span>🥇🥈🥉</span>
      <span>{jugador.podios}</span>
    </div>

    <div className="flex items-center gap-2">
      <span>📈</span>
      <span>{formatearPesos(jugador.balance)}</span>
    </div>
  </div>
</a>
        ))}
      </div>
    </main>
  );
}