"use client";

import { useEffect, useState } from "react";
import {
  jugadores,
  type Jugador,
} from "../datos/jugadores";
import { obtenerCanchasGuardadas } from "../datos/canchas";
import { obtenerTablaPremios } from "../premios/tablaPremios";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

type Resultado = {
  jugador: Jugador;
  score: number;
  puesto: number;
  premio: number;
};

type ResultadoBase = {
  jugador: Jugador;
  score: number;
};

type CanchaFecha = {
  id: number;
  nombre: string;
  par: number;
};

type FechaActual = {
  general: number[];
  viejitos: number[];
  pagosPendientes?: number[];
  pagosCompletados?: number[];
  cancha: number;
};

function calcularPremios(
  resultados: ResultadoBase[]
): Resultado[] {
  const tablaPremios = obtenerTablaPremios();

  const fila = tablaPremios.find(
    (filaPremios) =>
      filaPremios.jugadores === resultados.length
  );

  const premios = fila ? fila.premios : [];

  const finales: Resultado[] = [];
  let i = 0;

  while (i < resultados.length) {
    const scoreActual = resultados[i].score;

    const empatados = resultados.filter(
      (resultado) =>
        resultado.score === scoreActual
    );

    const inicio = i;
    const cantidad = empatados.length;

    const premiosInvolucrados = premios.slice(
      inicio,
      inicio + cantidad
    );

    const totalPremios =
      premiosInvolucrados.reduce(
        (suma, premio) => suma + premio,
        0
      );

    const premioBase = Math.floor(
      totalPremios / cantidad
    );

    const resto =
      totalPremios - premioBase * cantidad;

    empatados.forEach((resultado, index) => {
      finales.push({
        ...resultado,
        puesto: inicio + 1,
        premio:
          premioBase + (index === 0 ? resto : 0),
      });
    });

    i += cantidad;
  }

  return finales;
}

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function Resultados() {
  const [general, setGeneral] = useState<Resultado[]>([]);
  const [viejitos, setViejitos] = useState<Resultado[]>([]);

  const [listaJugadores, setListaJugadores] = useState<
    Jugador[]
  >([]);

  const [pagosPendientesOriginales, setPagosPendientesOriginales] =
    useState<number[]>([]);

  const [pagosCompletados, setPagosCompletados] =
    useState<number[]>([]);

  const [canchaFecha, setCanchaFecha] =
    useState<CanchaFecha | null>(null);

  const [fechaGuardada, setFechaGuardada] =
    useState(false);

  useEffect(() => {
    const yaGuardada = localStorage.getItem(
      "laChangueadaFechaYaGuardada"
    );

    if (yaGuardada === "true") {
      setFechaGuardada(true);
    }

    const fecha = localStorage.getItem(
      "laChangueadaFechaActual"
    );

    const scoresGuardados = localStorage.getItem(
      "laChangueadaScores"
    );

    const jugadoresGuardados = localStorage.getItem(
      "laChangueadaJugadores"
    );

    if (!fecha || !scoresGuardados) return;

    const datos: FechaActual = JSON.parse(fecha);
    const scores = JSON.parse(scoresGuardados);

    const canchaEncontrada =
      obtenerCanchasGuardadas().find(
        (cancha) => cancha.id === datos.cancha
      );

    if (canchaEncontrada) {
      setCanchaFecha({
        id: canchaEncontrada.id,
        nombre: canchaEncontrada.nombre,
        par: canchaEncontrada.par,
      });
    }

    const lista: Jugador[] = jugadoresGuardados
      ? JSON.parse(jugadoresGuardados)
      : jugadores;

    setListaJugadores(lista);

    setPagosPendientesOriginales(
      datos.pagosPendientes ?? []
    );

    setPagosCompletados(
      datos.pagosCompletados ?? []
    );

    const generalOrdenado = lista
      .filter((jugador) =>
        datos.general.includes(jugador.id)
      )
      .map((jugador) => ({
        jugador,
        score: Number(
          scores[jugador.id] ?? 999
        ),
      }))
      .sort((a, b) => a.score - b.score);

    const viejitosOrdenado = lista
      .filter((jugador) =>
        datos.viejitos.includes(jugador.id)
      )
      .map((jugador) => ({
        jugador,
        score: Number(
          scores[jugador.id] ?? 999
        ),
      }))
      .sort((a, b) => a.score - b.score);

    setGeneral(
      calcularPremios(generalOrdenado)
    );

    setViejitos(
      calcularPremios(viejitosOrdenado)
    );
  }, []);

  function cambiarEstadoPago(jugadorId: number) {
    const nuevosPagosCompletados =
      pagosCompletados.includes(jugadorId)
        ? pagosCompletados.filter(
            (id) => id !== jugadorId
          )
        : [...pagosCompletados, jugadorId];

    setPagosCompletados(nuevosPagosCompletados);

    const fechaGuardadaActual = localStorage.getItem(
      "laChangueadaFechaActual"
    );

    if (!fechaGuardadaActual) return;

    const datosFecha: FechaActual = JSON.parse(
      fechaGuardadaActual
    );

    localStorage.setItem(
      "laChangueadaFechaActual",
      JSON.stringify({
        ...datosFecha,
        pagosCompletados: nuevosPagosCompletados,
      })
    );
  }

  function guardarFecha() {
    if (fechaGuardada) return;

    const historialGuardado =
      localStorage.getItem(
        "laChangueadaHistorial"
      );

    const historial = historialGuardado
      ? JSON.parse(historialGuardado)
      : [];

    const nuevaFecha = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString(
        "es-AR"
      ),
      cancha: canchaFecha,
      general,
      viejitos,
      pagosPendientes:
        pagosPendientesOriginales,
      pagosCompletados,
    };

    localStorage.setItem(
      "laChangueadaHistorial",
      JSON.stringify([
        nuevaFecha,
        ...historial,
      ])
    );

    localStorage.setItem(
      "laChangueadaFechaYaGuardada",
      "true"
    );

    setFechaGuardada(true);
  }

  const jugadoresConPagoMarcado =
    pagosPendientesOriginales
      .map((jugadorId) =>
        listaJugadores.find(
          (jugador) => jugador.id === jugadorId
        )
      )
      .filter(
        (jugador): jugador is Jugador =>
          jugador !== undefined
      )
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", {
          sensitivity: "base",
        })
      );

  const cantidadPagosPendientes =
    pagosPendientesOriginales.filter(
      (jugadorId) =>
        !pagosCompletados.includes(jugadorId)
    ).length;

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Resultados
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {canchaFecha && (
        <div className="mb-8 rounded-xl bg-white p-5 text-green-900">
          <p className="text-xl">
  <span className="font-bold">
    ⛳ {canchaFecha.nombre}
  </span>

  &nbsp;&nbsp;&nbsp;

  <span className="font-normal">
    Par {canchaFecha.par}
  </span>
</p>
        </div>
      )}

      <div className="mb-8 rounded-xl bg-white p-5 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          General
        </h2>

        {general.map((resultado) => (
          <div
            key={resultado.jugador.id}
            className="flex items-center justify-between border-b gap-4 py-3"
          >
            <span>
              {resultado.puesto}.{" "}
              {resultado.jugador.nombre} -{" "}
              {resultado.score}
            </span>

            <strong>
              {resultado.premio > 0
                ? formatearPesos(
                    resultado.premio
                  )
                : "-"}
            </strong>
          </div>
        ))}
      </div>

      {viejitos.length > 0 && (
  <div className="rounded-xl bg-white p-5 text-green-900">
    <h2 className="mb-4 text-2xl font-bold">
      Viejitos
    </h2>

    {viejitos.map((resultado) => (
      <div
        key={resultado.jugador.id}
        className="flex items-center justify-between border-b gap-4 py-3"
      >
        <span>
          {resultado.puesto}.{" "}
          {resultado.jugador.nombre} -{" "}
          {resultado.score}
        </span>

        <strong>
          {resultado.premio > 0
            ? formatearPesos(
                resultado.premio
              )
            : "-"}
        </strong>
      </div>
    ))}
  </div>
)}

      {jugadoresConPagoMarcado.length > 0 && (
        <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
          <h2 className="mb-3 text-3xl font-bold">
            📌 Pagos pendientes (
            {cantidadPagosPendientes})
          </h2>

          {jugadoresConPagoMarcado.map(
            (jugador) => {
              const pagoCompletado =
                pagosCompletados.includes(
                  jugador.id
                );

              return (
                <div
                  key={jugador.id}
                  className="flex items-center justify-between gap-4 py-2 last:border-b-0"
                >
                  <span>
                    {jugador.nombre}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      cambiarEstadoPago(jugador.id)
                    }
                    aria-label={
                      pagoCompletado
                        ? `Marcar nuevamente como pendiente a ${jugador.nombre}`
                        : `Marcar como pagado a ${jugador.nombre}`
                    }
                    className={`h-4 w-4 shrink-0 rounded-full ${
                      pagoCompletado
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  />
                </div>
              );
            }
          )}
        </div>
      )}

      {!fechaGuardada ? (
        <button
          onClick={guardarFecha}
          className="mt-8 w-full rounded-xl bg-white p-5 text-2xl font-bold text-green-900"
        >
          Guardar fecha
        </button>
      ) : (
        <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
          <p className="text-center text-xl font-bold">
            ✅ Fecha guardada correctamente
          </p>

          <a
            href="/historial"
            className="mt-5 block w-full rounded-xl bg-green-700 p-4 text-center font-bold text-white"
          >
            📜 Ver historial
          </a>

          <a
            href="/nueva-fecha"
            className="mt-3 block w-full rounded-xl bg-green-900 p-4 text-center font-bold text-white"
          >
            ➕ Nueva fecha
          </a>
        </div>
      )}
    </main>
  );
}