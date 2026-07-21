"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  jugadores,
  type Jugador,
} from "../datos/jugadores";

import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../datos/canchas";

import {
  obtenerTablaPremios,
  type FilaPremios,
} from "../premios/tablaPremios";

import { config } from "../config/config";

type FechaActual = {
  general: number[];
  viejitos: number[];
  pagosPendientes?: number[];
  pagosCompletados?: number[];
  cancha: number;
};

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function obtenerPremios(
  tabla: FilaPremios[],
  cantidadJugadores: number
) {
  return (
    tabla.find(
      (fila) => fila.jugadores === cantidadJugadores
    )?.premios ?? []
  );
}

function obtenerIconoPuesto(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";

  return `${index + 1}º`;
}

export default function Previa() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);

  const [fechaActual, setFechaActual] =
    useState<FechaActual | null>(null);

  const [listaJugadores, setListaJugadores] = useState<
    Jugador[]
  >([]);

  const [cancha, setCancha] = useState<Cancha | null>(
    null
  );

  const [tablaPremios, setTablaPremios] = useState<
    FilaPremios[]
  >([]);

  const [valorChangueada, setValorChangueada] =
    useState(config.valorChangueada);

  useEffect(() => {
    const fechaGuardada = localStorage.getItem(
      "laChangueadaFechaActual"
    );

    if (!fechaGuardada) {
      setCargando(false);
      return;
    }

    try {
      const fecha: FechaActual =
        JSON.parse(fechaGuardada);

      setFechaActual(fecha);

      const jugadoresGuardados = localStorage.getItem(
        "laChangueadaJugadores"
      );

      const jugadoresDisponibles: Jugador[] =
        jugadoresGuardados
          ? JSON.parse(jugadoresGuardados)
          : jugadores;

      setListaJugadores(jugadoresDisponibles);

      const canchaSeleccionada =
        obtenerCanchasGuardadas().find(
          (canchaGuardada) =>
            canchaGuardada.id === fecha.cancha
        ) ?? null;

      setCancha(canchaSeleccionada);
      setTablaPremios(obtenerTablaPremios());

      const valorGuardado = localStorage.getItem(
        "laChangueadaValor"
      );

      if (valorGuardado) {
        const valorConvertido = Number(valorGuardado);

        if (
          Number.isFinite(valorConvertido) &&
          valorConvertido > 0
        ) {
          setValorChangueada(valorConvertido);
        }
      }
    } catch (error) {
      console.error(
        "No se pudo cargar la fecha actual:",
        error
      );

      setFechaActual(null);
    } finally {
      setCargando(false);
    }
  }, []);

  const jugadoresGeneral = useMemo(() => {
    if (!fechaActual) return [];

    return listaJugadores
      .filter((jugador) =>
        fechaActual.general.includes(jugador.id)
      )
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", {
          sensitivity: "base",
        })
      );
  }, [fechaActual, listaJugadores]);

  const jugadoresViejitos = useMemo(() => {
    if (!fechaActual) return [];

    return listaJugadores
      .filter((jugador) =>
        fechaActual.viejitos.includes(jugador.id)
      )
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", {
          sensitivity: "base",
        })
      );
  }, [fechaActual, listaJugadores]);

  const jugadoresUnicos = useMemo(() => {
    const mapa = new Map<number, Jugador>();

    [...jugadoresGeneral, ...jugadoresViejitos].forEach(
      (jugador) => {
        mapa.set(jugador.id, jugador);
      }
    );

    return Array.from(mapa.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", {
        sensitivity: "base",
      })
    );
  }, [jugadoresGeneral, jugadoresViejitos]);

  const premiosGeneral = useMemo(
    () =>
      obtenerPremios(
        tablaPremios,
        jugadoresGeneral.length
      ),
    [tablaPremios, jugadoresGeneral.length]
  );

  const premiosViejitos = useMemo(
    () =>
      obtenerPremios(
        tablaPremios,
        jugadoresViejitos.length
      ),
    [tablaPremios, jugadoresViejitos.length]
  );

  const pozoGeneral =
    jugadoresGeneral.length * valorChangueada;

  const pozoViejitos =
    jugadoresViejitos.length * valorChangueada;

  function modificarFecha() {
    if (!fechaActual) return;

    localStorage.setItem(
      "laChangueadaNuevaFechaBorrador",
      JSON.stringify({
        canchaId: fechaActual.cancha,
        general: fechaActual.general,
        viejitos: fechaActual.viejitos,
        pagosPendientes:
          fechaActual.pagosPendientes ?? [],
        busqueda: "",
      })
    );

    router.push("/nueva-fecha");
  }

  function continuarAScores() {
    router.push("/scores");
  }

async function compartirPrevia() {
  const fechaDeHoy = new Date().toLocaleDateString(
    "es-AR"
  );

  const historialGuardado = localStorage.getItem(
    "laChangueadaHistorial"
  );

  let esSegundaVuelta = false;

  if (historialGuardado) {
    try {
      const historial: Array<{ fecha?: string }> =
        JSON.parse(historialGuardado);

      esSegundaVuelta = historial.some(
        (fechaGuardada) =>
          fechaGuardada.fecha === fechaDeHoy
      );
    } catch (error) {
      console.error(
        "No se pudo leer el historial:",
        error
      );
    }
  }

  function obtenerIconoPuesto(index: number) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    return `${index + 1}º`;
  }

  function crearTextoPremios(premios: number[]) {
    if (premios.length === 0) {
      return "Sin premios configurados";
    }

    return premios
      .map(
        (premio, index) =>
          `${obtenerIconoPuesto(
            index
          )} ${formatearDinero(premio)}`
      )
      .join("\n");
  }

  const idsGeneral = new Set(
    jugadoresGeneral.map((jugador) => jugador.id)
  );

  const idsViejitos = new Set(
    jugadoresViejitos.map((jugador) => jugador.id)
  );

  const jugadoresSoloGeneral = jugadoresGeneral
    .filter(
      (jugador) => !idsViejitos.has(jugador.id)
    )
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );

  const jugadoresGeneralYViejitos = jugadoresGeneral
    .filter((jugador) =>
      idsViejitos.has(jugador.id)
    )
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );

  const jugadoresSoloViejitos = jugadoresViejitos
    .filter(
      (jugador) => !idsGeneral.has(jugador.id)
    )
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );

  const textoJugadores = [
    ...jugadoresSoloGeneral.map(
      (jugador) => `${jugador.nombre} (G)`
    ),
    ...jugadoresGeneralYViejitos.map(
      (jugador) => `${jugador.nombre} (G y V)`
    ),
    ...jugadoresSoloViejitos.map(
      (jugador) => `${jugador.nombre} (V)`
    ),
  ].join("\n");

  const lineas: string[] = [
    "⚽️ La Changueada 🚩",
    "",
    fechaDeHoy,
  ];

  if (esSegundaVuelta) {
    lineas.push("SEGUNDA VUELTA");
  }

  lineas.push(
    "",
    `⛳ ${cancha?.nombre ?? "Cancha"} Par ${
      cancha?.par ?? "-"
    }`
  );

  if (jugadoresGeneral.length > 0) {
    lineas.push(
      "",
      `💰 Pozo General (${jugadoresGeneral.length})`,
      formatearDinero(pozoGeneral),
      "",
      "🏆 Premios General",
      crearTextoPremios(premiosGeneral)
    );
  }

  if (jugadoresViejitos.length > 0) {
    lineas.push(
      "",
      `💰 Pozo Viejitos (${jugadoresViejitos.length})`,
      formatearDinero(pozoViejitos),
      "",
      "🏆 Premios Viejitos",
      crearTextoPremios(premiosViejitos)
    );
  }

  if (textoJugadores) {
    lineas.push(
      "",
      "👥 Jugadores",
      "",
      textoJugadores
    );
  }

  const texto = lineas.join("\n");

  try {
    if (navigator.share) {
      await navigator.share({
        title: "La Changueada",
        text: texto,
      });

      return;
    }

    await navigator.clipboard.writeText(texto);

    alert(
      "La previa fue copiada. Ya podés pegarla en WhatsApp."
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return;
    }

    console.error(
      "No se pudo compartir la previa:",
      error
    );

    alert("No se pudo compartir la previa.");
  }
}

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <p className="text-xl font-bold">
          Cargando fecha...
        </p>
      </main>
    );
  }

  if (!fechaActual) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <h1 className="mb-8 text-3xl font-bold">
          Previa
        </h1>

        <div className="rounded-xl bg-white p-5 text-green-900">
          <p className="text-xl font-bold">
            No hay una fecha en curso.
          </p>

          <button
            onClick={() => router.push("/nueva-fecha")}
            className="mt-5 w-full rounded-xl bg-green-700 p-4 text-xl font-bold text-white"
          >
            Crear nueva fecha
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <h1 className="mb-8 text-3xl font-bold">
        🚀 Previa
      </h1>

      <div className="mb-4 rounded-xl bg-white p-3 text-green-900">
        <p className="text-xl">
          <span className="font-bold">
            ⛳️{" "}
            {cancha?.nombre ??
              "Cancha no encontrada"}
          </span>

          {cancha && (
            <span className="ml-3">
              Par {cancha.par}
            </span>
          )}
        </p>
      </div>

      <div className="mb-4 rounded-xl bg-white p-3 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          📝 Resumen
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold">
              🙎🏻‍♂️ General
            </span>

            <span>
              {jugadoresGeneral.length} jugadores
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span>💰 Pozo General</span>

            <span className="font-bold">
              {formatearDinero(pozoGeneral)}
            </span>
          </div>

          <div className="border-t border-green-200" />

          <div className="flex items-center justify-between gap-4">
            <span className="font-bold">
              🧓🏻 Viejitos
            </span>

            <span>
              {jugadoresViejitos.length} jugadores
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span>💰 Pozo Viejitos</span>

            <span className="font-bold">
              {formatearDinero(pozoViejitos)}
            </span>
          </div>

          <div className="border-t border-green-200" />

          <div>
            <h3 className="mb-2 text-xl font-bold">
              🏆 Premios General
            </h3>

            {premiosGeneral.length > 0 ? (
              <div>
                {premiosGeneral.map(
                  (premio, index) => (
                    <div
                      key={index}
                      className="flex justify-between border-b border-green-100 py-2 last:border-b-0"
                    >
                      <span>
                        {obtenerIconoPuesto(index)}
                        {index < 3 ? "" : " puesto"}
                      </span>

                      <span className="font-bold">
                        {formatearDinero(premio)}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm">
                No hay premios configurados para{" "}
                {jugadoresGeneral.length} jugadores.
              </p>
            )}
          </div>

          <div className="border-t border-green-200" />

          <div>
            <h3 className="mb-2 text-xl font-bold">
              🏆 Premios Viejitos
            </h3>

            {premiosViejitos.length > 0 ? (
              <div>
                {premiosViejitos.map(
                  (premio, index) => (
                    <div
                      key={index}
                      className="flex justify-between border-b border-green-100 py-2 last:border-b-0"
                    >
                      <span>
                        {obtenerIconoPuesto(index)}
                        {index < 3 ? "" : " puesto"}
                      </span>

                      <span className="font-bold">
                        {formatearDinero(premio)}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm">
                No hay premios configurados para{" "}
                {jugadoresViejitos.length} jugadores.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-white p-3 text-green-900">
        <h2 className="mb-3 text-2xl font-bold">
          👥 Jugadores
        </h2>

        <div>
          {jugadoresUnicos.map((jugador) => {
            const juegaGeneral =
              fechaActual.general.includes(jugador.id);

            const juegaViejitos =
              fechaActual.viejitos.includes(
                jugador.id
              );

            return (
              <div
                key={jugador.id}
                className="border-b border-green-100 py-3 last:border-b-0"
              >
                <p className="font-bold">
                  {jugador.nombre}
                </p>

                <p className="text-sm">
                  {juegaGeneral && juegaViejitos
                    ? "General y Viejitos"
                    : juegaGeneral
                      ? "General"
                      : "Viejitos"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={compartirPrevia}
        className="mb-4 w-full rounded-xl bg-white p-3 text-2xl font-bold text-green-900"
      >
        📤 Compartir previa
      </button>

      <button
        onClick={modificarFecha}
        className="mb-4 w-full rounded-xl bg-green-700 p-3 text-xl font-bold text-white"
      >
        Modificar fecha
      </button>

      <button
        onClick={continuarAScores}
        className="w-full rounded-xl bg-white p-3 text-2xl font-bold text-green-900"
      >
        Cargar scores
      </button>
    </main>
  );
}