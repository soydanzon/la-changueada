"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { config } from "../config/config";
import { jugadores, type Jugador } from "../datos/jugadores";
import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../datos/canchas";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

type FechaHistorial = {
  cancha?: {
    id?: number;
    nombre?: string;
  } | null;
};

function ordenarCanchasPorUso(canchas: Cancha[]) {
  const datos = localStorage.getItem(
    "laChangueadaHistorial"
  );

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
  const [valorChangueada, setValorChangueada] =
    useState(config.valorChangueada);

  const [listaJugadores, setListaJugadores] = useState<
    Jugador[]
  >([]);
  const [busqueda, setBusqueda] = useState("");
  const [general, setGeneral] = useState<number[]>([]);
  const [viejitos, setViejitos] = useState<number[]>([]);

  const cancha =
    canchas.find((c) => c.id === canchaId) ?? canchas[0];

  useEffect(() => {
    localStorage.removeItem("laChangueadaScores");
    localStorage.removeItem(
      "laChangueadaFechaYaGuardada"
    );

    const valorGuardado = localStorage.getItem(
      "laChangueadaValor"
    );

    if (valorGuardado) {
      setValorChangueada(Number(valorGuardado));
    }

    const canchasGuardadas =
      obtenerCanchasGuardadas().filter(
        (canchaGuardada) => canchaGuardada.activa
      );

    const canchasOrdenadas =
      ordenarCanchasPorUso(canchasGuardadas);

    setCanchas(canchasOrdenadas);
    setCanchaId(canchasOrdenadas[0]?.id ?? 0);

    const guardados = localStorage.getItem(
      "laChangueadaJugadores"
    );

    if (guardados) {
      setListaJugadores(JSON.parse(guardados));
    } else {
      setListaJugadores(jugadores);
    }
    const borradorGuardado = localStorage.getItem(
  "laChangueadaNuevaFechaBorrador"
);

if (borradorGuardado) {
  const borrador = JSON.parse(borradorGuardado);

  setCanchaId(borrador.canchaId ?? 0);
  setGeneral(borrador.general ?? []);
  setViejitos(borrador.viejitos ?? []);
  setBusqueda(borrador.busqueda ?? "");

  localStorage.removeItem(
    "laChangueadaNuevaFechaBorrador"
  );
}
  }, []);

  function cambiarGeneral(id: number) {
    setGeneral((actual) =>
      actual.includes(id)
        ? actual.filter(
            (jugadorId) => jugadorId !== id
          )
        : [...actual, id]
    );
  }

  function cambiarViejitos(id: number) {
    setViejitos((actual) =>
      actual.includes(id)
        ? actual.filter(
            (jugadorId) => jugadorId !== id
          )
        : [...actual, id]
    );
  }
  
  function agregarJugadorDesdeFecha() {
  localStorage.setItem(
    "laChangueadaNuevaFechaBorrador",
    JSON.stringify({
      canchaId,
      general,
      viejitos,
      busqueda,
    })
  );

  localStorage.setItem(
    "laChangueadaOrigenNuevoJugador",
    "nueva-fecha"
  );

  router.push("/jugadores/nuevo");
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
      jugador.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      if (a.frecuente && !b.frecuente) return -1;
      if (!a.frecuente && b.frecuente) return 1;

      return a.nombre.localeCompare(b.nombre);
    });

  const totalJugadores = new Set([
    ...general,
    ...viejitos,
  ]).size;

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          📝 Nueva Fecha
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {cancha && (
        <>
          <div className="mb-6 rounded-2xl bg-white p-5 text-green-900">
            <p className="text-xl font-bold">
              📅{" "}
              {new Date().toLocaleDateString("es-AR")}
            </p>

            <label className="mt-4 block font-bold">
             Cancha
            </label>

            <select
              value={canchaId}
              onChange={(evento) =>
                setCanchaId(
                  Number(evento.target.value)
                )
              }
              className="mt-2 w-full rounded-lg border p-3 text-black"
            >
              {canchas.map((canchaDisponible) => (
                <option
                  key={canchaDisponible.id}
                  value={canchaDisponible.id}
                >
                  {canchaDisponible.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6 space-y-2 rounded-xl bg-white p-5 text-green-900">
            <p className="text-lg font-bold">
              🚩 {cancha.nombre} &nbsp;&nbsp; E{" "}
              {cancha.par}
            </p>

<p className="font-bold">
  👥 Jugadores: {totalJugadores}
</p>

<div className="mt-4 flex justify-between">
  <span>
    ⚽ General: <strong>{general.length}</strong>
  </span>

  <span>
    💰 $
    {(
      general.length * valorChangueada
    ).toLocaleString("es-AR")}
  </span>
</div>

<div className="mt-2 flex justify-between">
  <span>
    ⚽ Viejitos: <strong>{viejitos.length}</strong>
  </span>

  <span>
    💰 $
    {(
      viejitos.length * valorChangueada
    ).toLocaleString("es-AR")}
  </span>
</div>
          </div>

          <button
            onClick={continuar}
            className="mb-6 w-full rounded-xl bg-green-600 p-5 text-2xl font-bold text-white"
          >
            Continuar →
          </button>
        </>
      )}

      <input
        type="text"
        placeholder="Buscar jugador..."
        value={busqueda}
        onChange={(evento) =>
          setBusqueda(evento.target.value)
        }
        className="mb-6 w-full rounded-lg bg-white p-4 text-xl text-black"
      />

      <div className="space-y-3">
        {jugadoresFiltrados.map((jugador) => (
          <div
            key={jugador.id}
            className="rounded-xl bg-white p-4 text-green-900"
          >
            <div className="text-lg font-bold">
              {jugador.frecuente ? "⭐ " : ""}
              {jugador.nombre}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  cambiarGeneral(jugador.id)
                }
                className={`h-12 rounded-full px-4 text-base font-bold ${
                  general.includes(jugador.id)
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                General
              </button>

              <button
                onClick={() =>
                  cambiarViejitos(jugador.id)
                }
                className={`h-12 rounded-full px-4 text-base font-bold ${
                  viejitos.includes(jugador.id)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Viejitos
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
  onClick={agregarJugadorDesdeFecha}
  className="mt-6 mb-6 w-full rounded-xl bg-green-600 p-4 text-xl font-bold text-white"
>
  ➕ Agregar jugador
</button>

    </main>
  );
}