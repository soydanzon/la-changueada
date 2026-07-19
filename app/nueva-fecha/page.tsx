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
import {
  obtenerTablaPremios,
  type FilaPremios,
} from "../premios/tablaPremios";

type FechaHistorial = {
  cancha?: {
    id?: number;
    nombre?: string;
  } | null;
};

type BorradorNuevaFecha = {
  canchaId?: number;
  general?: number[];
  viejitos?: number[];
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

  const [pagosPendientes, setPagosPendientes] = useState<
    number[]
  >([]);

  const [tablaPremios, setTablaPremios] =
    useState<FilaPremios[]>([]);

  const [tablaPremiosCargada, setTablaPremiosCargada] =
    useState(false);

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
      const borrador: BorradorNuevaFecha =
        JSON.parse(borradorGuardado);

      setCanchaId(borrador.canchaId ?? 0);
      setGeneral(borrador.general ?? []);
      setViejitos(borrador.viejitos ?? []);
      setPagosPendientes(
        borrador.pagosPendientes ?? []
      );
      setBusqueda(borrador.busqueda ?? "");

      localStorage.removeItem(
        "laChangueadaNuevaFechaBorrador"
      );
    }
  }, []);

  function cargarTablaPremios() {
    setTablaPremios(obtenerTablaPremios());
    setTablaPremiosCargada(true);
  }

  function cambiarGeneral(id: number) {
    setGeneral((actual) =>
      actual.includes(id)
        ? actual.filter(
            (jugadorId) => jugadorId !== id
          )
        : [...actual, id]
    );

    cargarTablaPremios();
  }

  function cambiarViejitos(id: number) {
    setViejitos((actual) =>
      actual.includes(id)
        ? actual.filter(
            (jugadorId) => jugadorId !== id
          )
        : [...actual, id]
    );

    cargarTablaPremios();
  }

  function cambiarPagoPendiente(id: number) {
    const jugadorAnotado =
      general.includes(id) || viejitos.includes(id);

    if (!jugadorAnotado) return;

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
      "laChangueadaNuevaFechaBorrador",
      JSON.stringify({
        canchaId,
        general,
        viejitos,
        pagosPendientes,
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

    const jugadoresAnotados = new Set([
      ...general,
      ...viejitos,
    ]);

    const pendientesAnotados =
      pagosPendientes.filter((jugadorId) =>
        jugadoresAnotados.has(jugadorId)
      );

    localStorage.setItem(
      "laChangueadaFechaActual",
      JSON.stringify({
        general,
        viejitos,
        pagosPendientes: pendientesAnotados,
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

  const jugadoresAnotados = new Set([
    ...general,
    ...viejitos,
  ]);

  const cantidadPagosPendientes =
    pagosPendientes.filter((jugadorId) =>
      jugadoresAnotados.has(jugadorId)
    ).length;

  const premiosGeneral =
    tablaPremios.find(
      (fila) => fila.jugadores === general.length
    )?.premios ?? [];

  const premiosViejitos =
    tablaPremios.find(
      (fila) => fila.jugadores === viejitos.length
    )?.premios ?? [];

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
    🚩 {cancha.nombre}
  </span>

  &nbsp;&nbsp;&nbsp;

  <span className="font-normal">
    Par {cancha.par}
  </span>
</p>

            <p className="mt-2 font-bold">
              👥 Jugadores: {totalJugadores}
            </p>

            <div className="mt-4 flex justify-between gap-4">
              <span>
                General: <strong>{general.length}</strong>
              </span>

              <span className="text-right">
                $
                {(
                  general.length * valorChangueada
                ).toLocaleString("es-AR")}
              </span>
            </div>

            <div className="mt-2 flex justify-between gap-4">
              <span>
                Viejitos:{" "}
                <strong>{viejitos.length}</strong>
              </span>

              <span className="text-right">
                $
                {(
                  viejitos.length * valorChangueada
                ).toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <div className="mt-5 border-t border-gray-200 pt-5">
            <h2 className="text-xl font-black">
              🏆 Reparto de premios
            </h2>

            <div className="mt-4">
              <p className="font-bold">
                General — {general.length} jugadores
              </p>

              {premiosGeneral.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {premiosGeneral.map(
                    (premio, indice) => (
                      <p key={`general-${indice}`}>
                        {indice + 1}.º —{" "}
                        <strong>
                          $
                          {premio.toLocaleString(
                            "es-AR"
                          )}
                        </strong>
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-2 text-gray-500">
                  {tablaPremiosCargada
                    ? "Sin reparto configurado"
                    : "Cargando premios..."}
                </p>
              )}
            </div>

            <div className="mt-5">
              <p className="font-bold">
                Viejitos — {viejitos.length} jugadores
              </p>

              {premiosViejitos.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {premiosViejitos.map(
                    (premio, indice) => (
                      <p key={`viejitos-${indice}`}>
                        {indice + 1}.º —{" "}
                        <strong>
                          $
                          {premio.toLocaleString(
                            "es-AR"
                          )}
                        </strong>
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-2 text-gray-500">
                  {tablaPremiosCargada
                    ? "Sin reparto configurado"
                    : "Cargando premios..."}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={continuar}
            className="mt-6 w-full rounded-xl bg-green-600 p-4 text-2xl font-bold text-white"
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
            general.includes(jugador.id) ||
            viejitos.includes(jugador.id);

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
                  aria-label={
                    pagoPendiente
                      ? `Quitar pago pendiente de ${jugador.nombre}`
                      : `Marcar pago pendiente de ${jugador.nombre}`
                  }
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
          );
        })}
      </div>
    </main>
  );
}