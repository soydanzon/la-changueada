"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { config } from "../config/config";

import {
  jugadores,
  type Jugador,
} from "../datos/jugadores";

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

type BorradorNuevaFechaCategorias = {
  canchaId?: number;
  jugadores?: number[];
  pagosPendientes?: number[];
  busqueda?: string;
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

export default function NuevaFechaCategorias() {
  const router = useRouter();

  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [canchaId, setCanchaId] = useState(0);

  const [valorChangueada, setValorChangueada] =
    useState(config.valorChangueada);

  const [listaJugadores, setListaJugadores] = useState<
    Jugador[]
  >([]);

  const [busqueda, setBusqueda] = useState("");

  const [jugadoresSeleccionados, setJugadoresSeleccionados] =
    useState<number[]>([]);

  const [pagosPendientes, setPagosPendientes] = useState<
    number[]
  >([]);

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
      "laChangueadaNuevaFechaCategoriasBorrador"
    );

    if (borradorGuardado) {
      const borrador: BorradorNuevaFechaCategorias =
        JSON.parse(borradorGuardado);

      setCanchaId(borrador.canchaId ?? 0);

      setJugadoresSeleccionados(
        borrador.jugadores ?? []
      );

      setPagosPendientes(
        borrador.pagosPendientes ?? []
      );

      setBusqueda(borrador.busqueda ?? "");

      localStorage.removeItem(
        "laChangueadaNuevaFechaCategoriasBorrador"
      );
    }
  }, []);

  function cambiarJugador(id: number) {
    setJugadoresSeleccionados((actual) => {
      if (actual.includes(id)) {
        setPagosPendientes((pendientes) =>
          pendientes.filter(
            (jugadorId) => jugadorId !== id
          )
        );

        return actual.filter(
          (jugadorId) => jugadorId !== id
        );
      }

      return [...actual, id];
    });
  }

  function cambiarPagoPendiente(id: number) {
    if (!jugadoresSeleccionados.includes(id)) return;

    setPagosPendientes((actual) =>
      actual.includes(id)
        ? actual.filter(
            (jugadorId) => jugadorId !== id
          )
        : [...actual, id]
    );
  }

  function agregarJugadorDesdeFecha() {
    localStorage.setItem(
      "laChangueadaNuevaFechaCategoriasBorrador",
      JSON.stringify({
        canchaId,
        jugadores: jugadoresSeleccionados,
        pagosPendientes,
        busqueda,
      })
    );

    localStorage.setItem(
      "laChangueadaOrigenNuevoJugador",
      "nueva-fecha/categorias"
    );

    router.push("/jugadores/nuevo");
  }

  function continuar() {
    if (!cancha || jugadoresSeleccionados.length === 0) {
      return;
    }

    const pendientesAnotados =
      pagosPendientes.filter((jugadorId) =>
        jugadoresSeleccionados.includes(jugadorId)
      );

    localStorage.setItem(
      "laChangueadaFechaActual",
      JSON.stringify({
        formato: "categorias",
        jugadores: jugadoresSeleccionados,
        categoriaA: [],
        categoriaB: [],
        pagosPendientes: pendientesAnotados,
        cancha: cancha.id,
      })
    );

    router.push("/previa/categorias");
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

  const cantidadPagosPendientes =
    pagosPendientes.filter((jugadorId) =>
      jugadoresSeleccionados.includes(jugadorId)
    ).length;

  const pozoTotal =
    jugadoresSeleccionados.length * valorChangueada;

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
        <div className="mb-6 rounded-2xl bg-white p-5 text-green-900">
          <p className="text-xl font-bold">
            🅰️🅱️ Por categorías
          </p>

          <p className="mt-3 text-xl font-bold">
            📅{" "}
            {new Date().toLocaleDateString("es-AR")}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <label className="whitespace-nowrap font-bold">
              Cancha
            </label>

            <select
              value={canchaId}
              onChange={(evento) =>
                setCanchaId(
                  Number(evento.target.value)
                )
              }
              className="flex-1 rounded-lg border px-3 py-2 text-black"
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

          <div className="mt-5 border-t border-gray-200 pt-5">
            <p className="text-xl">
              <span className="font-bold">
                ⛳ {cancha.nombre}
              </span>

              &nbsp;&nbsp;&nbsp;

              <span>Par {cancha.par}</span>
            </p>

            <div className="mt-4 flex justify-between gap-4 text-xl">
              <span className="font-bold">
                👥 Jugadores
              </span>

              <span className="font-bold">
                {jugadoresSeleccionados.length}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4 text-xl">
              <span>💰 Pozo total</span>

              <span className="font-bold">
                ${pozoTotal.toLocaleString("es-AR")}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Las categorías A y B se arman en la
              siguiente pantalla.
            </p>
          </div>

          <button
            onClick={continuar}
            disabled={jugadoresSeleccionados.length === 0}
            className={`mt-6 w-full rounded-xl p-4 text-2xl font-bold text-white ${
              jugadoresSeleccionados.length > 0
                ? "bg-green-600"
                : "cursor-not-allowed bg-gray-400"
            }`}
          >
            Continuar →
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar jugador..."
        value={busqueda}
        onChange={(evento) =>
          setBusqueda(evento.target.value)
        }
        className="w-full rounded-lg bg-white p-4 text-xl text-black"
      />

      <button
        onClick={agregarJugadorDesdeFecha}
        className="mb-6 mt-4 w-full rounded-xl bg-green-600 p-4 text-xl font-bold text-white"
      >
        ➕ Agregar jugador
      </button>

      {cantidadPagosPendientes > 0 && (
        <div className="mb-4 rounded-xl bg-white px-4 py-3 font-bold text-red-700">
          📌 {cantidadPagosPendientes}{" "}
          {cantidadPagosPendientes === 1
            ? "pago pendiente"
            : "pagos pendientes"}
        </div>
      )}

      <div className="space-y-3">
        {jugadoresFiltrados.map((jugador) => {
          const jugadorAnotado =
            jugadoresSeleccionados.includes(jugador.id);

          const pagoPendiente =
            pagosPendientes.includes(jugador.id);

          return (
            <div
              key={jugador.id}
              className="rounded-xl bg-white p-4 text-green-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-lg font-bold">
                  {jugador.frecuente ? "⭐ " : ""}
                  {jugador.nombre}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    cambiarPagoPendiente(jugador.id)
                  }
                  disabled={!jugadorAnotado}
                  title={
                    jugadorAnotado
                      ? "Pago pendiente"
                      : "Primero anotá al jugador"
                  }
                  className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                    pagoPendiente
                      ? "border-red-600 bg-red-600"
                      : jugadorAnotado
                        ? "border-gray-400 bg-transparent"
                        : "cursor-not-allowed border-gray-200 bg-gray-100"
                  }`}
                />
              </div>

              <button
                onClick={() =>
                  cambiarJugador(jugador.id)
                }
                className={`mt-3 h-12 w-full rounded-full px-4 text-base font-bold ${
                  jugadorAnotado
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {jugadorAnotado
                  ? "✓ Juega"
                  : "Juega"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}