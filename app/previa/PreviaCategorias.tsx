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

import {
  calcularHandicap,
  type FechaGuardada,
} from "../utils/estadisticas";

import { config } from "../config/config";

type FechaActual = {
  formato: "categorias";
  jugadores: number[];
  categoriaA: number[];
  categoriaB: number[];
  pagosPendientes?: number[];
  pagosCompletados?: number[];
  cancha: number;
};

type JugadorConHandicap = Jugador & {
  handicap: number | null;
};

type PremioVisible = {
  premio: number;
  puestoOriginal: number;
};

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatearHandicap(valor: number) {
  return Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(1);
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

function obtenerPremiosVisibles(
  premios: number[]
): PremioVisible[] {
  return premios
    .map((premio, index) => ({
      premio,
      puestoOriginal: index,
    }))
    .filter(({ premio }) => premio > 0);
}

function obtenerIconoPuesto(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";

  return `${index + 1}º`;
}

export default function PreviaCategorias() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);

  const [fechaActual, setFechaActual] =
    useState<FechaActual | null>(null);

  const [listaJugadores, setListaJugadores] = useState<
    Jugador[]
  >([]);

  const [cancha, setCancha] =
    useState<Cancha | null>(null);

  const [tablaPremios, setTablaPremios] = useState<
    FilaPremios[]
  >([]);

  const [valorChangueada, setValorChangueada] =
    useState(config.valorChangueada);

  const [categoriaA, setCategoriaA] = useState<
    number[]
  >([]);

  const [categoriaB, setCategoriaB] = useState<
    number[]
  >([]);

  const [handicapsPorNombre, setHandicapsPorNombre] =
    useState<Map<string, number>>(new Map());

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

      if (
        fecha.formato !== "categorias" ||
        !Array.isArray(fecha.jugadores)
      ) {
        setFechaActual(null);
        setCargando(false);
        return;
      }

      const jugadoresGuardados =
        localStorage.getItem(
          "laChangueadaJugadores"
        );

      const jugadoresDisponibles: Jugador[] =
        jugadoresGuardados
          ? JSON.parse(jugadoresGuardados)
          : jugadores;

      const historialGuardado =
        localStorage.getItem(
          "laChangueadaHistorial"
        );

      const historial: FechaGuardada[] =
        historialGuardado
          ? JSON.parse(historialGuardado)
          : [];

      const handicapsCalculados =
        calcularHandicap(historial);

      const mapaHandicaps =
        new Map<string, number>();

      handicapsCalculados.forEach((jugador) => {
        mapaHandicaps.set(
          jugador.nombre,
          jugador.handicap
        );
      });

      setHandicapsPorNombre(mapaHandicaps);
      setListaJugadores(jugadoresDisponibles);
      setFechaActual(fecha);

      const canchaSeleccionada =
        obtenerCanchasGuardadas().find(
          (canchaGuardada) =>
            canchaGuardada.id === fecha.cancha
        ) ?? null;

      setCancha(canchaSeleccionada);
      setTablaPremios(obtenerTablaPremios());

      const valorGuardado =
        localStorage.getItem(
          "laChangueadaValor"
        );

      if (valorGuardado) {
        const valorConvertido =
          Number(valorGuardado);

        if (
          Number.isFinite(valorConvertido) &&
          valorConvertido > 0
        ) {
          setValorChangueada(
            valorConvertido
          );
        }
      }

      const categoriasYaGuardadas =
        fecha.categoriaA.length > 0 ||
        fecha.categoriaB.length > 0;

      if (categoriasYaGuardadas) {
        setCategoriaA(fecha.categoriaA);
        setCategoriaB(fecha.categoriaB);
      } else {
        const jugadoresSeleccionados =
          jugadoresDisponibles
            .filter((jugador) =>
              fecha.jugadores.includes(
                jugador.id
              )
            )
            .map((jugador) => ({
              ...jugador,
              handicap:
                mapaHandicaps.get(
                  jugador.nombre
                ) ?? null,
            }));

        const jugadoresConHandicap =
          jugadoresSeleccionados
            .filter(
              (
                jugador
              ): jugador is Jugador & {
                handicap: number;
              } =>
                jugador.handicap !== null
            )
            .sort((a, b) => {
              if (
                a.handicap !== b.handicap
              ) {
                return (
                  a.handicap - b.handicap
                );
              }

              return a.nombre.localeCompare(
                b.nombre,
                "es",
                {
                  sensitivity: "base",
                }
              );
            });

        const cantidadCategoriaA =
          Math.ceil(
            jugadoresConHandicap.length /
              2
          );

        setCategoriaA(
          jugadoresConHandicap
            .slice(0, cantidadCategoriaA)
            .map((jugador) => jugador.id)
        );

        setCategoriaB(
          jugadoresConHandicap
            .slice(cantidadCategoriaA)
            .map((jugador) => jugador.id)
        );
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

  const jugadoresSeleccionados = useMemo<
    JugadorConHandicap[]
  >(() => {
    if (!fechaActual) {
      return [];
    }

    return listaJugadores
      .filter((jugador) =>
        fechaActual.jugadores.includes(
          jugador.id
        )
      )
      .map((jugador) => ({
        ...jugador,
        handicap:
          handicapsPorNombre.get(
            jugador.nombre
          ) ?? null,
      }));
  }, [
    fechaActual,
    listaJugadores,
    handicapsPorNombre,
  ]);

  const jugadoresA = useMemo(() => {
    return jugadoresSeleccionados
      .filter((jugador) =>
        categoriaA.includes(jugador.id)
      )
      .sort((a, b) => {
        if (
          a.handicap !== null &&
          b.handicap !== null &&
          a.handicap !== b.handicap
        ) {
          return a.handicap - b.handicap;
        }

        return a.nombre.localeCompare(
          b.nombre,
          "es",
          {
            sensitivity: "base",
          }
        );
      });
  }, [jugadoresSeleccionados, categoriaA]);

  const jugadoresB = useMemo(() => {
    return jugadoresSeleccionados
      .filter((jugador) =>
        categoriaB.includes(jugador.id)
      )
      .sort((a, b) => {
        if (
          a.handicap !== null &&
          b.handicap !== null &&
          a.handicap !== b.handicap
        ) {
          return a.handicap - b.handicap;
        }

        return a.nombre.localeCompare(
          b.nombre,
          "es",
          {
            sensitivity: "base",
          }
        );
      });
  }, [jugadoresSeleccionados, categoriaB]);

  const jugadoresSinCategoria =
    useMemo(() => {
      return jugadoresSeleccionados
        .filter(
          (jugador) =>
            !categoriaA.includes(
              jugador.id
            ) &&
            !categoriaB.includes(
              jugador.id
            )
        )
        .sort((a, b) =>
          a.nombre.localeCompare(
            b.nombre,
            "es",
            {
              sensitivity: "base",
            }
          )
        );
    }, [
      jugadoresSeleccionados,
      categoriaA,
      categoriaB,
    ]);

  const premiosA = useMemo(
    () =>
      obtenerPremios(
        tablaPremios,
        jugadoresA.length
      ),
    [tablaPremios, jugadoresA.length]
  );

  const premiosB = useMemo(
    () =>
      obtenerPremios(
        tablaPremios,
        jugadoresB.length
      ),
    [tablaPremios, jugadoresB.length]
  );

  const premiosVisiblesA = useMemo(
    () => obtenerPremiosVisibles(premiosA),
    [premiosA]
  );

  const premiosVisiblesB = useMemo(
    () => obtenerPremiosVisibles(premiosB),
    [premiosB]
  );

  const pozoA =
    jugadoresA.length * valorChangueada;

  const pozoB =
    jugadoresB.length * valorChangueada;

  function asignarCategoria(
    jugadorId: number,
    categoria: "A" | "B"
  ) {
    if (categoria === "A") {
      setCategoriaA((actual) =>
        actual.includes(jugadorId)
          ? actual
          : [...actual, jugadorId]
      );

      setCategoriaB((actual) =>
        actual.filter(
          (id) => id !== jugadorId
        )
      );

      return;
    }

    setCategoriaB((actual) =>
      actual.includes(jugadorId)
        ? actual
        : [...actual, jugadorId]
    );

    setCategoriaA((actual) =>
      actual.filter(
        (id) => id !== jugadorId
      )
    );
  }

  function abrirHandicap(nombre: string) {
    router.push(
      `/handicap/${encodeURIComponent(
        nombre
      )}`
    );
  }

  function modificarFecha() {
    if (!fechaActual) {
      return;
    }

    localStorage.setItem(
      "laChangueadaNuevaFechaCategoriasBorrador",
      JSON.stringify({
        canchaId: fechaActual.cancha,
        jugadores: fechaActual.jugadores,
        pagosPendientes:
          fechaActual.pagosPendientes ?? [],
        busqueda: "",
      })
    );

    router.push(
      "/nueva-fecha/categorias"
    );
  }

  function continuarAScores() {
    if (
      !fechaActual ||
      jugadoresSinCategoria.length > 0 ||
      jugadoresA.length === 0 ||
      jugadoresB.length === 0
    ) {
      return;
    }

    const fechaActualizada: FechaActual = {
      ...fechaActual,
      categoriaA,
      categoriaB,
    };

    localStorage.setItem(
      "laChangueadaFechaActual",
      JSON.stringify(fechaActualizada)
    );

    router.push("/scores");
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
            No hay una fecha por categorías
            en curso.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/nueva-fecha")
            }
            className="mt-5 w-full rounded-xl bg-green-700 p-4 text-xl font-bold text-white"
          >
            Crear nueva fecha
          </button>
        </div>
      </main>
    );
  }

  const puedeContinuar =
    jugadoresSinCategoria.length === 0 &&
    jugadoresA.length > 0 &&
    jugadoresB.length > 0;

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

        <p className="mt-3 font-bold">
          🅰️🅱️ Por categorías
        </p>
      </div>

      {jugadoresSinCategoria.length >
        0 && (
        <div className="mb-4 rounded-xl bg-yellow-100 p-3 text-yellow-900">
          <h2 className="mb-2 text-xl font-bold">
            ⚠️ Sin handicap
          </h2>

          <p className="mb-3 text-sm">
            Elegí manualmente una categoría
            para estos jugadores.
          </p>

          {jugadoresSinCategoria.map(
            (jugador) => (
              <div
                key={jugador.id}
                className="border-b border-yellow-300 py-3 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    abrirHandicap(
                      jugador.nombre
                    )
                  }
                  className="mb-2 block text-left font-bold underline decoration-yellow-700/40 underline-offset-4"
                >
                  {jugador.nombre}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      asignarCategoria(
                        jugador.id,
                        "A"
                      )
                    }
                    className="rounded-xl bg-green-700 p-3 font-bold text-white"
                  >
                    Categoría A
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      asignarCategoria(
                        jugador.id,
                        "B"
                      )
                    }
                    className="rounded-xl bg-blue-700 p-3 font-bold text-white"
                  >
                    Categoría B
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="mb-4 rounded-xl bg-white p-3 text-green-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">
            🅰️ Categoría A
          </h2>

          <span className="font-bold">
            {jugadoresA.length} jugadores
          </span>
        </div>

        <div className="mb-4 flex justify-between gap-4">
          <span>💰 Pozo</span>

          <span className="font-bold">
            {formatearDinero(pozoA)}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-bold">
          🏆 Premios
        </h3>

        {premiosVisiblesA.length > 0 ? (
          <div className="mb-4">
            {premiosVisiblesA.map(
              ({
                premio,
                puestoOriginal,
              }) => (
                <div
                  key={puestoOriginal}
                  className="flex justify-between border-b border-green-100 py-2 last:border-b-0"
                >
                  <span>
                    {obtenerIconoPuesto(
                      puestoOriginal
                    )}
                    {puestoOriginal < 3
                      ? ""
                      : " puesto"}
                  </span>

                  <span className="font-bold">
                    {formatearDinero(
                      premio
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="mb-4 text-sm">
            No hay premios configurados para{" "}
            {jugadoresA.length} jugadores.
          </p>
        )}

        <div className="border-t border-green-200 pt-2">
          {jugadoresA.map((jugador) => (
            <div
              key={jugador.id}
              className="flex items-center justify-between gap-3 border-b border-green-100 py-3 last:border-b-0"
            >
              <button
                type="button"
                onClick={() =>
                  abrirHandicap(
                    jugador.nombre
                  )
                }
                className="min-w-0 text-left"
              >
                <p className="truncate font-bold underline decoration-green-700/30 underline-offset-4">
                  {jugador.nombre}
                </p>

                <p className="text-sm">
                  HCP{" "}
                  {jugador.handicap !== null
                    ? formatearHandicap(
                        jugador.handicap
                      )
                    : "sin datos"}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  asignarCategoria(
                    jugador.id,
                    "B"
                  )
                }
                className="shrink-0 rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white"
              >
                Pasar a B
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-white p-3 text-green-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">
            🅱️ Categoría B
          </h2>

          <span className="font-bold">
            {jugadoresB.length} jugadores
          </span>
        </div>

        <div className="mb-4 flex justify-between gap-4">
          <span>💰 Pozo</span>

          <span className="font-bold">
            {formatearDinero(pozoB)}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-bold">
          🏆 Premios
        </h3>

        {premiosVisiblesB.length > 0 ? (
          <div className="mb-4">
            {premiosVisiblesB.map(
              ({
                premio,
                puestoOriginal,
              }) => (
                <div
                  key={puestoOriginal}
                  className="flex justify-between border-b border-green-100 py-2 last:border-b-0"
                >
                  <span>
                    {obtenerIconoPuesto(
                      puestoOriginal
                    )}
                    {puestoOriginal < 3
                      ? ""
                      : " puesto"}
                  </span>

                  <span className="font-bold">
                    {formatearDinero(
                      premio
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="mb-4 text-sm">
            No hay premios configurados para{" "}
            {jugadoresB.length} jugadores.
          </p>
        )}

        <div className="border-t border-green-200 pt-2">
          {jugadoresB.map((jugador) => (
            <div
              key={jugador.id}
              className="flex items-center justify-between gap-3 border-b border-green-100 py-3 last:border-b-0"
            >
              <button
                type="button"
                onClick={() =>
                  abrirHandicap(
                    jugador.nombre
                  )
                }
                className="min-w-0 text-left"
              >
                <p className="truncate font-bold underline decoration-green-700/30 underline-offset-4">
                  {jugador.nombre}
                </p>

                <p className="text-sm">
                  HCP{" "}
                  {jugador.handicap !== null
                    ? formatearHandicap(
                        jugador.handicap
                      )
                    : "sin datos"}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  asignarCategoria(
                    jugador.id,
                    "A"
                  )
                }
                className="shrink-0 rounded-lg bg-green-700 px-3 py-2 text-sm font-bold text-white"
              >
                Pasar a A
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={modificarFecha}
        className="mb-4 w-full rounded-xl bg-green-700 p-3 text-xl font-bold text-white"
      >
        Modificar fecha
      </button>

      <button
        type="button"
        onClick={continuarAScores}
        disabled={!puedeContinuar}
        className={`w-full rounded-xl p-3 text-2xl font-bold ${
          puedeContinuar
            ? "bg-white text-green-900"
            : "cursor-not-allowed bg-gray-400 text-white"
        }`}
      >
        Cargar scores
      </button>
    </main>
  );
}