"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { config } from "../config/config";
import { jugadores, type Jugador } from "../datos/jugadores";
import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../datos/canchas";

type FechaHistorial = {
  cancha?: {
    id?: number;
    nombre?: string;
  } | null;
};

function ordenarCanchasPorUso(canchas: Cancha[]) {
  const datos = localStorage.getItem("laChangueadaHistorial");

  if (!datos) return canchas;

  const historial: FechaHistorial[] = JSON.parse(datos);

  function usos(cancha: Cancha) {
    return historial.filter(
      (fecha) =>
        fecha.cancha?.id === cancha.id ||
        fecha.cancha?.nombre === cancha.nombre
    ).length;
  }

  return [...canchas].sort((a, b) => {
    const usosA = usos(a);
    const usosB = usos(b);

    if (usosB !== usosA) return usosB - usosA;

    return a.nombre.localeCompare(b.nombre);
  });
}

export default function NuevaFecha() {
  const router = useRouter();

  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [canchaId, setCanchaId] = useState(0);

  const cancha =
    canchas.find((c) => c.id === canchaId) ?? canchas[0];

  const [listaJugadores, setListaJugadores] = useState<Jugador[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [general, setGeneral] = useState<number[]>([]);
  const [viejitos, setViejitos] = useState<number[]>([]);

  useEffect(() => {
    localStorage.removeItem("laChangueadaScores");

    const canchasGuardadas = obtenerCanchasGuardadas().filter(
      (c) => c.activa
    );

    const canchasOrdenadas = ordenarCanchasPorUso(canchasGuardadas);

    setCanchas(canchasOrdenadas);
    setCanchaId(canchasOrdenadas[0]?.id ?? 0);

    const guardados = localStorage.getItem("laChangueadaJugadores");

    if (guardados) {
      setListaJugadores(JSON.parse(guardados));
    } else {
      setListaJugadores(jugadores);
    }
  }, []);

  function cambiarGeneral(id: number) {
    setGeneral((actual) =>
      actual.includes(id)
        ? actual.filter((j) => j !== id)
        : [...actual, id]
    );
  }

  function cambiarViejitos(id: number) {
    setViejitos((actual) =>
      actual.includes(id)
        ? actual.filter((j) => j !== id)
        : [...actual, id]
    );
  }

  function continuar() {
    if (!cancha) return;

    localStorage.setItem(
      "laChangueadaFechaActual",
      JSON.stringify({
        general,
        viejitos,
        cancha: cancha.id,
      })
    );

    router.push("/scores");
  }

  const jugadoresFiltrados = listaJugadores
    .filter((jugador) =>
      jugador.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      if (a.frecuente && !b.frecuente) return -1;
      if (!a.frecuente && b.frecuente) return 1;
      return a.nombre.localeCompare(b.nombre);
    });

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">
        Nueva Fecha
      </h1>

      <a
        href="/"
        className="inline-block mb-6 bg-white text-green-900 px-4 py-2 rounded-lg font-bold"
      >
        ← Menú principal
      </a>

      {cancha && (
        <div className="mb-6 bg-white text-green-900 rounded-2xl p-5">
          <p className="font-bold text-xl">
            📅 {new Date().toLocaleDateString("es-AR")}
          </p>

          <label className="block mt-4 font-bold">
            🚩 Cancha
          </label>

          <select
            value={canchaId}
            onChange={(e) => setCanchaId(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border p-3 text-black"
          >
            {canchas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <p className="mt-4 font-bold">
            E {cancha.par}
          </p>
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar jugador..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-6 w-full rounded-lg p-4 text-black text-xl"
      />

      <div className="space-y-4">
        {jugadoresFiltrados.map((jugador) => (
          <div
            key={jugador.id}
            className="bg-white rounded-xl p-4 text-green-900"
          >
            <div className="font-bold text-xl mb-3">
              {jugador.frecuente ? "⭐ " : ""}
              {jugador.nombre}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => cambiarGeneral(jugador.id)}
                className={`flex-1 h-12 rounded-lg font-bold ${
                  general.includes(jugador.id)
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                General
              </button>

              <button
                onClick={() => cambiarViejitos(jugador.id)}
                className={`flex-1 h-12 rounded-lg font-bold ${
                  viejitos.includes(jugador.id)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Viejitos
              </button>
            </div>
          </div>
        ))}
      </div>

      {cancha && (
        <div className="mt-8 bg-white rounded-xl p-5 text-green-900 space-y-2">
          <p className="font-bold text-lg">
            🚩 {cancha.nombre} &nbsp;&nbsp; E {cancha.par}
          </p>

          <hr />

          <p>
            ⚽ General: <strong>{general.length}</strong>
          </p>

          <p>
            💰 ${(general.length * config.valorChangueada).toLocaleString("es-AR")}
          </p>

          <hr />

          <p>
            ⚽ Viejitos: <strong>{viejitos.length}</strong>
          </p>

          <p>
            💰 ${(viejitos.length * config.valorChangueada).toLocaleString("es-AR")}
          </p>
        </div>
      )}

      <button
        onClick={continuar}
        className="mt-8 w-full bg-white text-green-900 rounded-xl p-5 text-2xl font-bold"
      >
        Continuar →
      </button>
    </main>
  );
}