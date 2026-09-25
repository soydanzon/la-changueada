"use client";

import { obtenerPremiosCategorias } from "../premios/tablaPremiosCategorias";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import BotonInicio from "../components/BotonInicio";

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
  type Resultado,
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

type FechaSupabase = {
  id: number;
  fecha: string;
  formato: string;
  cancha_id: number | null;
  cancha_nombre: string | null;
  par: number | null;
};

type ResultadoSupabase = {
  fecha_id: number;
  jugador_nombre: string;
  categoria: string;
  score: number;
  puesto: number;
  premio: number;
};

type JugadorSupabase = {
  id: number;
  nombre: string;
  frecuente: boolean | null;
};

type CanchaSupabase = {
  id: number;
  nombre: string;
  par: number;
  activa: boolean | null;
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
    async function cargarPrevia() {
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

      const supabase = createClient();

      const [
        respuestaJugadores,
        respuestaFechas,
        respuestaResultados,
        respuestaCanchas,
      ] = await Promise.all([
        supabase
          .from("jugadores")
          .select(
            "id, nombre, frecuente"
          )
          .order("nombre"),

        supabase
          .from("fechas")
          .select(
            "id, fecha, formato, cancha_id, cancha_nombre, par"
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("resultados")
          .select(
            "fecha_id, jugador_nombre, categoria, score, puesto, premio"
          )
          .order("fecha_id", {
            ascending: true,
          })
          .order("puesto", {
            ascending: true,
          }),

        supabase
          .from("canchas")
          .select(
            "id, nombre, par, activa"
          )
          .order("id"),
      ]);

      if (respuestaJugadores.error) {
        throw respuestaJugadores.error;
      }

      if (respuestaFechas.error) {
        throw respuestaFechas.error;
      }

      if (respuestaResultados.error) {
        throw respuestaResultados.error;
      }

      if (respuestaCanchas.error) {
        throw respuestaCanchas.error;
      }

      const jugadoresDisponibles: Jugador[] =
        (
          (respuestaJugadores.data ??
            []) as JugadorSupabase[]
        ).map((jugador) => ({
          id: Number(jugador.id),
          nombre: jugador.nombre,
          frecuente: Boolean(
            jugador.frecuente
          ),
        }));

      const fechasSupabase =
        (respuestaFechas.data ??
          []) as FechaSupabase[];

      const resultadosSupabase =
        (respuestaResultados.data ??
          []) as ResultadoSupabase[];

      const historial: FechaGuardada[] =
        fechasSupabase.map(
          (fechaSupabase) => {
            const resultadosFecha =
              resultadosSupabase.filter(
                (resultado) =>
                  Number(
                    resultado.fecha_id
                  ) ===
                  Number(
                    fechaSupabase.id
                  )
              );

            function convertirResultados(
              categoria: string
            ): Resultado[] {
              return resultadosFecha
                .filter(
                  (resultado) =>
                    resultado.categoria ===
                    categoria
                )
                .map((resultado) => ({
                  jugador: {
                    nombre:
                      resultado.jugador_nombre,
                  },

                  score: Number(
                    resultado.score
                  ),

                  puesto: Number(
                    resultado.puesto
                  ),

                  premio: Number(
                    resultado.premio
                  ),
                }));
            }

            const formato:
              | "edad"
              | "categorias" =
              fechaSupabase.formato ===
              "categorias"
                ? "categorias"
                : "edad";

            return {
              id: Number(
                fechaSupabase.id
              ),

              fecha:
                fechaSupabase.fecha,

              formato,

              cancha:
                fechaSupabase.cancha_id !==
                  null &&
                fechaSupabase.cancha_nombre &&
                fechaSupabase.par !== null
                  ? {
                      id: Number(
                        fechaSupabase.cancha_id
                      ),

                      nombre:
                        fechaSupabase.cancha_nombre,

                      par: Number(
                        fechaSupabase.par
                      ),
                    }
                  : null,

              general:
                formato === "edad"
                  ? convertirResultados(
                      "general"
                    )
                  : [],

              viejitos:
                formato === "edad"
                  ? convertirResultados(
                      "viejitos"
                    )
                  : [],

              categoriaA:
                formato === "categorias"
                  ? convertirResultados(
                      "categoriaA"
                    )
                  : [],

              categoriaB:
                formato === "categorias"
                  ? convertirResultados(
                      "categoriaB"
                    )
                  : [],
            };
          }
        );

      const handicapsCalculados =
        calcularHandicap(historial);

      const mapaHandicaps =
        new Map<string, number>();

      handicapsCalculados.forEach(
        (jugador) => {
          mapaHandicaps.set(
            jugador.nombre,
            jugador.handicap
          );
        }
      );

      const canchasNube: Cancha[] = (
        (respuestaCanchas.data ??
          []) as CanchaSupabase[]
      ).map((cancha) => ({
        id: Number(cancha.id),
        nombre: cancha.nombre,
        par: Number(cancha.par),
        activa: Boolean(
          cancha.activa
        ),
      }));

      const canchaSeleccionada =
        canchasNube.find(
          (canchaGuardada) =>
            canchaGuardada.id ===
            fecha.cancha
        ) ?? null;

      setHandicapsPorNombre(
        mapaHandicaps
      );

      setListaJugadores(
        jugadoresDisponibles
      );

      setFechaActual(fecha);
      setCancha(canchaSeleccionada);
      setTablaPremios(
        obtenerTablaPremios()
      );

      localStorage.setItem(
        "laChangueadaJugadores",
        JSON.stringify(
          jugadoresDisponibles
        )
      );

      localStorage.setItem(
        "laChangueadaCanchas",
        JSON.stringify(canchasNube)
      );

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
      if (a.handicap !== b.handicap) {
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

const jugadoresActuales = new Set(
  fecha.jugadores
);

const jugadoresAsignadosAntes = new Set([
  ...fecha.categoriaA,
  ...fecha.categoriaB,
]);

const cambioLaNomina =
  jugadoresActuales.size !==
    jugadoresAsignadosAntes.size ||
  [...jugadoresActuales].some(
    (id) => !jugadoresAsignadosAntes.has(id)
  );

if (cambioLaNomina) {
  const cantidadCategoriaA =
    Math.floor(
      jugadoresConHandicap.length / 2
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
} else {
  setCategoriaA(fecha.categoriaA);
  setCategoriaB(fecha.categoriaB);
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
    }

    cargarPrevia();
  }, []);

useEffect(() => {
  if (!fechaActual) return;

  const fechaActualizada = {
    ...fechaActual,
    categoriaA,
    categoriaB,
  };

  localStorage.setItem(
    "laChangueadaFechaActual",
    JSON.stringify(fechaActualizada)
  );

  localStorage.setItem(
    "laChangueadaNuevaFechaCategoriasBorrador",
    JSON.stringify({
      canchaId: fechaActual.cancha,
      jugadores: fechaActual.jugadores,
      pagosPendientes:
        fechaActual.pagosPendientes ?? [],
      categoriaA,
      categoriaB,
      busqueda: "",
    })
  );
}, [fechaActual, categoriaA, categoriaB]);

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

  const premiosCategorias = useMemo(
  () =>
    obtenerPremiosCategorias(
      jugadoresA.length + jugadoresB.length
    ),
  [jugadoresA.length, jugadoresB.length]
);

const premiosA = premiosCategorias.a;
const premiosB = premiosCategorias.b;

  const premiosVisiblesA = useMemo(
    () => obtenerPremiosVisibles(premiosA),
    [premiosA]
  );

  const premiosVisiblesB = useMemo(
    () => obtenerPremiosVisibles(premiosB),
    [premiosB]
  );

  const pozoTotal =
  (jugadoresA.length + jugadoresB.length) *
  valorChangueada;

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

  async function compartirPrevia() {
  const fechaDeHoy = new Date().toLocaleDateString(
    "es-AR"
  );

  let esSegundaVuelta = false;

  const supabase = createClient();

  const {
    data: fechasDelMismoDia,
    error: errorFechas,
  } = await supabase
    .from("fechas")
    .select("id")
    .eq("fecha", fechaDeHoy)
    .limit(1);

  if (errorFechas) {
    console.error(
      "No se pudo revisar si es segunda vuelta:",
      errorFechas
    );
  } else {
    esSegundaVuelta =
      (fechasDelMismoDia?.length ?? 0) >
      0;
  }

  function crearTextoPremios(
    premios: PremioVisible[]
  ) {
    if (premios.length === 0) {
      return "Sin premios configurados";
    }

    return premios
      .map(
        ({ premio, puestoOriginal }) =>
          `${obtenerIconoPuesto(
            puestoOriginal
          )} ${formatearDinero(premio)}`
      )
      .join("\n");
  }

  function crearTextoJugadores(
    lista: JugadorConHandicap[]
  ) {
    return lista
      .map(
        (jugador) =>
          `${jugador.nombre} - Hcp ${
            jugador.handicap !== null
              ? formatearHandicap(
                  jugador.handicap
                )
              : "sin datos"
          }`
      )
      .join("\n");
  }

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
  }`,
  "",
  `💰 Pozo total: ${formatearDinero(pozoTotal)}`,
  "",
  "🅰️ CATEGORÍA A",
  "",
  "🏆 Premios",
  crearTextoPremios(premiosVisiblesA)
);

  if (jugadoresA.length > 0) {
    lineas.push(
      "",
      `👥 Jugadores (${jugadoresA.length})`,
      "",
      crearTextoJugadores(jugadoresA)
    );
  }

  lineas.push(
  "",
  "🅱️ CATEGORÍA B",
  "",
  "🏆 Premios",
  crearTextoPremios(premiosVisiblesB)
);

  if (jugadoresB.length > 0) {
    lineas.push(
      "",
      `👥 Jugadores (${jugadoresB.length})`,
      "",
      crearTextoJugadores(jugadoresB)
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
    categoriaA,
    categoriaB,
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
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          🚀 Previa
        </h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={modificarFecha}
            className="rounded-xl bg-white px-4 py-2 font-bold text-green-950"
            aria-label="Volver"
          >
            ←
          </button>

          <BotonInicio />
        </div>
      </div>

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

        <div className="mt-3 flex items-center justify-between">
  <span className="font-bold">
    🅰️ 🅱️ Por categorías
  </span>

  <span className="font-bold">
    💰 Pozo total: {formatearDinero(pozoTotal)}
  </span>
</div>
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

        <h3 className="mb-2 border-t border-green-200 pt-4 text-xl font-bold">
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
    abrirHandicap(jugador.nombre)
  }
  className="min-w-0 flex-1 text-left"
>
  <div className="flex items-center">
    <span className="flex-1 truncate text-lg font-bold underline decoration-green-700/30 underline-offset-4">
  {jugador.nombre}
</span>

<span className="mr-3 w-12 text-right text-base">
  {jugador.handicap !== null
    ? formatearHandicap(jugador.handicap)
    : "s/d"}
</span>
  </div>
</button>

<button
  type="button"
  onClick={() =>
    asignarCategoria(
      jugador.id,
      "B"
    )
  }
  className="shrink-0 rounded-lg bg-blue-700 px-3 py-2 text-base font-bold text-white"
>
  → B
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

        <h3 className="mb-2 border-t border-green-200 pt-4 text-xl font-bold">
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
    abrirHandicap(jugador.nombre)
  }
  className="min-w-0 flex-1 text-left"
>
  <div className="flex items-center">
    <span className="flex-1 truncate text-lg font-bold underline decoration-green-700/30 underline-offset-4">
      {jugador.nombre}
    </span>

    <span className="mr-3 w-12 text-right text-base">
      {jugador.handicap !== null
        ? formatearHandicap(
            jugador.handicap
          )
        : "s/d"}
    </span>
  </div>
</button>

<button
  type="button"
  onClick={() =>
    asignarCategoria(
      jugador.id,
      "A"
    )
  }
  className="shrink-0 rounded-lg bg-green-700 px-3 py-2 text-base font-bold text-white"
>
  → A
</button>
            </div>
          ))}
        </div>
      </div>

      <button
  type="button"
  onClick={compartirPrevia}
  className="mb-4 w-full rounded-xl bg-blue-600 p-3 text-xl font-bold text-white"
>
  📤 Compartir previa
</button>
      
      <button
        type="button"
        onClick={modificarFecha}
        className="mb-4 w-full rounded-xl bg-green-700 p-3 text-xl font-bold text-white"
      >
        ⬅️ Modificar fecha
      </button>

      <button
        type="button"
        onClick={continuarAScores}
        disabled={!puedeContinuar}
        className={`w-full rounded-xl p-5 text-2xl font-bold ${
          puedeContinuar
            ? "bg-green-600 text-white"
            : "cursor-not-allowed bg-gray-400 text-white"
        }`}
      >
        📝 Cargar scores
      </button>
    </main>
  );
}