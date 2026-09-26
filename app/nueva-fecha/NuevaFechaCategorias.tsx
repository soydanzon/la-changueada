"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { config } from "../config/config";
import { normalizarTexto } from "../utils/texto";

import {
  type Jugador,
} from "../datos/jugadores";

import {
  type Cancha,
} from "../datos/canchas";

import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

type BorradorNuevaFechaCategorias = {
  canchaId?: number;
  jugadores?: number[];
  pagosPendientes?: number[];
  categoriaA?: number[];
  categoriaB?: number[];
  busqueda?: string;
};

function recuperarBorrador(
  clave: string
): BorradorNuevaFechaCategorias | null {
  const contenido = localStorage.getItem(clave);

  if (!contenido) {
    return null;
  }

  try {
    return JSON.parse(
      contenido
    ) as BorradorNuevaFechaCategorias;
  } catch {
    return null;
  }
}

const LETRAS_JUGADORES =
  "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

export default function NuevaFechaCategorias() {
  const router = useRouter();

  const [canchas, setCanchas] = useState<
    Cancha[]
  >([]);

  const [canchaId, setCanchaId] = useState(0);

  const [valorChangueada, setValorChangueada] =
    useState(config.valorChangueada);

  const [listaJugadores, setListaJugadores] =
    useState<Jugador[]>([]);

  const [busqueda, setBusqueda] = useState("");

  const [
    letraSeleccionada,
    setLetraSeleccionada,
  ] = useState("");

  const tecladoRef =
    useRef<HTMLDivElement>(null);

  const [
    jugadoresSeleccionados,
    setJugadoresSeleccionados,
  ] = useState<number[]>([]);

  const [pagosPendientes, setPagosPendientes] =
    useState<number[]>([]);

  const [categoriaA, setCategoriaA] =
  useState<number[]>([]);

const [categoriaB, setCategoriaB] =
  useState<number[]>([]);  

  const [jugadorParaScroll, setJugadorParaScroll] =
    useState<number | null>(null);

  const [borradorCargado, setBorradorCargado] =
    useState(false);

  const cancha =
    canchas.find((c) => c.id === canchaId) ??
    canchas[0];

  useEffect(() => {

    localStorage.removeItem(
      "laChangueadaFechaYaGuardada"
    );

    async function cargarConfiguracionNube() {
      const valorLocal =
        localStorage.getItem(
          "laChangueadaValor"
        );

      const supabase =
        createClient();

      try {
        const { data, error } =
          await supabase
            .from("configuracion")
            .select(
              "clave, valor"
            )
            .in("clave", [
              "valorChangueada",
              "tablaPremiosCategorias55_45",
            ]);

        if (error) {
          throw error;
        }

        const configuracionValor =
          data?.find(
            (fila: {
              clave: string;
              valor: unknown;
            }) =>
              fila.clave ===
              "valorChangueada"
          );

        const configuracionTabla =
          data?.find(
            (fila: {
              clave: string;
              valor: unknown;
            }) =>
              fila.clave ===
              "tablaPremiosCategorias55_45"
          );

        const valorNube =
          Number(
            configuracionValor?.valor
          );

        if (
          Number.isFinite(
            valorNube
          ) &&
          valorNube > 0
        ) {
          setValorChangueada(
            valorNube
          );

          localStorage.setItem(
            "laChangueadaValor",
            String(valorNube)
          );
        } else if (
          valorLocal
        ) {
          setValorChangueada(
            Number(valorLocal)
          );
        }

        if (
          configuracionTabla &&
          configuracionTabla.valor &&
          typeof configuracionTabla.valor ===
            "object" &&
          !Array.isArray(
            configuracionTabla.valor
          )
        ) {
          localStorage.setItem(
            "laChangueadaTablaPremiosCategorias55_45",
            JSON.stringify(
              configuracionTabla.valor
            )
          );
        }
      } catch (error) {
        console.error(
          "No se pudo cargar la configuración:",
          error
        );

        if (valorLocal) {
          setValorChangueada(
            Number(valorLocal)
          );
        }
      }
    }

    cargarConfiguracionNube();

    const canchaInicial = 0;

    async function cargarJugadoresNube() {
      const supabase = createClient();

      const { data, error } =
        await supabase
          .from("jugadores")
          .select(
            "id, nombre, frecuente"
          )
          .order("nombre");

      if (error) {
        console.error(
          "No se pudieron cargar los jugadores:",
          error
        );

        alert(
          "No se pudieron cargar los jugadores."
        );

        return;
      }

      const jugadoresNube: Jugador[] = (
        data ?? []
      ).map(
        (jugador: {
          id: number;
          nombre: string;
          frecuente: boolean | null;
        }) => ({
          id: Number(jugador.id),
          nombre: jugador.nombre,
          frecuente: Boolean(
            jugador.frecuente
          ),
        })
      );

      setListaJugadores(
        jugadoresNube
      );

      localStorage.setItem(
        "laChangueadaJugadores",
        JSON.stringify(
          jugadoresNube
        )
      );
    }

    cargarJugadoresNube();

    const borradorPrincipal = recuperarBorrador(
      "laChangueadaNuevaFechaCategoriasBorrador"
    );

    const borradorBackup = recuperarBorrador(
      "laChangueadaNuevaFechaCategoriasBorradorBackup"
    );

    const borrador =
      borradorPrincipal ?? borradorBackup;

    if (borrador) {
      setCanchaId(
        borrador.canchaId ?? canchaInicial
      );

      setJugadoresSeleccionados(
        borrador.jugadores ?? []
      );

      setPagosPendientes(
  borrador.pagosPendientes ?? []
);

setCategoriaA(
  borrador.categoriaA ?? []
);

setCategoriaB(
  borrador.categoriaB ?? []
);

setBusqueda("");

      setBusqueda("");

      if (!borradorPrincipal && borradorBackup) {
        localStorage.setItem(
          "laChangueadaNuevaFechaCategoriasBorrador",
          JSON.stringify(borradorBackup)
        );
      }
    }

    const jugadorRecienCreadoId = Number(
  localStorage.getItem(
    "laChangueadaJugadorRecienCreado"
  )
);

if (jugadorRecienCreadoId) {
  setTimeout(() => {
    setJugadoresSeleccionados((actual) =>
      actual.includes(jugadorRecienCreadoId)
        ? actual
        : [...actual, jugadorRecienCreadoId]
    );

    setJugadorParaScroll(
      jugadorRecienCreadoId
    );

    localStorage.removeItem(
      "laChangueadaJugadorRecienCreado"
    );
  }, 0);
}

    setBorradorCargado(true);
  }, []);

  useEffect(() => {
    async function cargarCanchasNube() {
      const supabase = createClient();

      const [
        resultadoCanchas,
        resultadoFechas,
      ] = await Promise.all([
        supabase
          .from("canchas")
          .select(
            "id, nombre, par, activa"
          ),

        supabase
          .from("fechas")
          .select("cancha_id"),
      ]);

      if (resultadoCanchas.error) {
        console.error(
          "No se pudieron cargar las canchas:",
          resultadoCanchas.error
        );

        setCanchas([]);

        alert(
          "No se pudieron cargar las canchas."
        );

        return;
      }

      if (resultadoFechas.error) {
        console.error(
          "No se pudo calcular el uso de las canchas:",
          resultadoFechas.error
        );
      }

      const usosPorCancha =
        new Map<number, number>();

      (
        resultadoFechas.data ?? []
      ).forEach(
        (fecha: {
          cancha_id: number | null;
        }) => {
          if (
            fecha.cancha_id === null
          ) {
            return;
          }

          const idCancha =
            Number(fecha.cancha_id);

          usosPorCancha.set(
            idCancha,
            (
              usosPorCancha.get(
                idCancha
              ) ?? 0
            ) + 1
          );
        }
      );

      const canchasNube: Cancha[] = (
        resultadoCanchas.data ?? []
      ).map(
        (cancha: {
          id: number;
          nombre: string;
          par: number;
          activa:
            | boolean
            | null;
        }) => ({
          id: Number(cancha.id),
          nombre: cancha.nombre,
          par: Number(cancha.par),
          activa: Boolean(
            cancha.activa
          ),
        })
      );

      const canchasActivas =
        canchasNube
          .filter(
            (cancha) =>
              cancha.activa
          )
          .sort((a, b) => {
            const usosA =
              usosPorCancha.get(
                a.id
              ) ?? 0;

            const usosB =
              usosPorCancha.get(
                b.id
              ) ?? 0;

            if (
              usosB !== usosA
            ) {
              return usosB - usosA;
            }

            return a.nombre.localeCompare(
              b.nombre,
              "es",
              {
                sensitivity:
                  "base",
              }
            );
          });

      setCanchas(
        canchasActivas
      );

      setCanchaId((actual) =>
        canchasActivas.some(
          (cancha) =>
            cancha.id === actual
        )
          ? actual
          : canchasActivas[0]
              ?.id ?? 0
      );

      localStorage.setItem(
        "laChangueadaCanchas",
        JSON.stringify(
          canchasNube
        )
      );
    }

    cargarCanchasNube();
  }, []);
  
  useEffect(() => {
    if (!borradorCargado) return;

    const borrador: BorradorNuevaFechaCategorias = {
  canchaId,
  jugadores: jugadoresSeleccionados,
  pagosPendientes,
  categoriaA,
  categoriaB,
  busqueda,
};

    const borradorAnterior =
      localStorage.getItem(
        "laChangueadaNuevaFechaCategoriasBorrador"
      );

    if (borradorAnterior) {
      localStorage.setItem(
        "laChangueadaNuevaFechaCategoriasBorradorBackup",
        borradorAnterior
      );
    }

    localStorage.setItem(
      "laChangueadaNuevaFechaCategoriasBorrador",
      JSON.stringify(borrador)
    );
  }, [
    borradorCargado,
    canchaId,
    jugadoresSeleccionados,
    pagosPendientes,
    categoriaA,
    categoriaB,
    busqueda,
  ]);

  useEffect(() => {
    if (jugadorParaScroll === null) return;

    const temporizador = window.setTimeout(() => {
      const tarjeta = document.getElementById(
        `jugador-${jugadorParaScroll}`
      );

      if (tarjeta) {
        tarjeta.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setJugadorParaScroll(null);
      }
    }, 100);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [
    jugadorParaScroll,
    listaJugadores,
    jugadoresSeleccionados,
  ]);

function elegirLetra(letra: string) {
    setLetraSeleccionada(letra);
  }

  useEffect(() => {
    if (!letraSeleccionada) return;

    const id = window.requestAnimationFrame(() => {
      document
        .querySelector("#lista-jugadores > div")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });

    return () => window.cancelAnimationFrame(id);
  }, [letraSeleccionada, listaJugadores]);

  function cambiarJugador(id: number) {
    setJugadoresSeleccionados((actual) => {
      if (actual.includes(id)) {
        setPagosPendientes((pendientes) =>
          pendientes.filter(
            (jugadorId) =>
              jugadorId !== id
          )
        );

        return actual.filter(
          (jugadorId) =>
            jugadorId !== id
        );
      }

      return [...actual, id];
    });

    window.requestAnimationFrame(() => {
      tecladoRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function cambiarPagoPendiente(id: number) {
    if (!jugadoresSeleccionados.includes(id)) {
      return;
    }

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
  categoriaA,
  categoriaB,
  busqueda,
})
    );

    localStorage.setItem(
      "laChangueadaOrigenNuevoJugador",
      window.location.pathname
    );

    router.push("/jugadores/nuevo");
  }

  function continuar() {
    if (
      !cancha ||
      jugadoresSeleccionados.length === 0
    ) {
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
    categoriaA: categoriaA.filter((id) =>
  jugadoresSeleccionados.includes(id)
),

categoriaB: categoriaB.filter((id) =>
  jugadoresSeleccionados.includes(id)
),
    pagosPendientes: pendientesAnotados,
    cancha: cancha.id,
  })
);

    router.push("/previa/categorias");
  }

  const jugadoresFiltrados = listaJugadores
    .filter((jugador) => {
      if (!letraSeleccionada) {
        return true;
      }

      return normalizarTexto(
        jugador.nombre
      ).startsWith(
        normalizarTexto(
          letraSeleccionada
        )
      );
    })
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
    jugadoresSeleccionados.length *
    valorChangueada;

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
            🅰️ 🅱️ Por categorías
          </p>

          <p className="mt-3 text-xl font-bold">
            📅{" "}
            {new Date().toLocaleDateString(
              "es-AR"
            )}
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
              {canchas.map(
                (canchaDisponible) => (
                  <option
                    key={canchaDisponible.id}
                    value={canchaDisponible.id}
                  >
                    {canchaDisponible.nombre}
                  </option>
                )
              )}
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
                $
                {pozoTotal.toLocaleString(
                  "es-AR"
                )}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Las categorías A y B se arman en la
              siguiente pantalla.
            </p>
          </div>

          <button
            onClick={continuar}
            disabled={
              jugadoresSeleccionados.length === 0
            }
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

      <div
        ref={tecladoRef}
        className="scroll-mt-24 rounded-xl bg-white p-4 text-green-900"
      >
        <p className="mb-3 text-lg font-bold">
          Buscar por inicial
        </p>

        <button
          type="button"
          onClick={() =>
  elegirLetra("")
}
          className={`mb-3 w-full rounded-lg py-2 font-bold ${
            letraSeleccionada === ""
              ? "bg-green-700 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Todos
        </button>

        <div className="grid grid-cols-9 gap-2">
          {LETRAS_JUGADORES.map(
            (letra) => (
              <button
                key={letra}
                type="button"
                onClick={() =>
                  setLetraSeleccionada(
                    letra
                  )
                }
                className={`h-10 rounded-lg font-bold ${
                  letraSeleccionada ===
                  letra
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {letra}
              </button>
            )
          )}
        </div>
      </div>

      <button
        onClick={agregarJugadorDesdeFecha}
        className="mb-6 mt-4 w-full rounded-xl bg-green-700 p-4 text-xl font-bold text-white"
      >
        ➕ Agregar jugador
      </button>

      {jugadoresSeleccionados.length > 0 && (
        <div className="mb-5 rounded-xl bg-white p-4 text-green-900">
          <p className="mb-3 text-lg font-bold">
            👥 Jugadores anotados (
            {jugadoresSeleccionados.length})
          </p>

          <div className="flex flex-wrap gap-2">
            {listaJugadores
              .filter((jugador) =>
                jugadoresSeleccionados.includes(
                  jugador.id
                )
              )
              .sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
              )
              .map((jugador) => (
                <span
                  key={jugador.id}
                  className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold"
                >
                  {jugador.nombre}

                  {pagosPendientes.includes(
                    jugador.id
                  ) && (
                    <span className="ml-2 text-red-600">
                      🔴
                    </span>
                  )}
                </span>
              ))}
          </div>
        </div>
      )}

      <div
  id="lista-jugadores"
  className={`scroll-mt-24 space-y-3 ${
  letraSeleccionada ? "pb-[100dvh]" : ""
}`}
>
  {jugadoresFiltrados.map((jugador) => {
          const jugadorAnotado =
            jugadoresSeleccionados.includes(
              jugador.id
            );

          const pagoPendiente =
            pagosPendientes.includes(jugador.id);

          return (
            <div
              id={`jugador-${jugador.id}`}
              key={jugador.id}
              className="scroll-mt-24 rounded-xl bg-white p-4 text-green-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-lg font-bold">
                  {jugador.frecuente
                    ? "⭐ "
                    : ""}
                  {jugador.nombre}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    cambiarPagoPendiente(
                      jugador.id
                    )
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
                OK
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}