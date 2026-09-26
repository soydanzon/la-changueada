"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { config } from "../config/config";
import {
  type Jugador,
} from "../datos/jugadores";
import {
  type Cancha,
} from "../datos/canchas";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";
import {
  obtenerTablaPremios,
  type FilaPremios,
} from "../premios/tablaPremios";
import { normalizarTexto } from "../utils/texto";

type BorradorNuevaFecha = {
  canchaId?: number;
  general?: number[];
  viejitos?: number[];
  pagosPendientes?: number[];
  busqueda?: string;
};

const LETRAS_JUGADORES =
  "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

export default function NuevaFecha() {
  const router = useRouter();

  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [canchaId, setCanchaId] = useState(0);

  const [valorChangueada, setValorChangueada] =
    useState(config.valorChangueada);

  const [listaJugadores, setListaJugadores] =
    useState<Jugador[]>([]);

  const [letraSeleccionada, setLetraSeleccionada] =
    useState("");

  const tecladoRef = useRef<HTMLDivElement>(null);

  const [general, setGeneral] = useState<number[]>([]);
  const [viejitos, setViejitos] = useState<number[]>([]);

  const [pagosPendientes, setPagosPendientes] =
    useState<number[]>([]);

  const [tablaPremios, setTablaPremios] =
    useState<FilaPremios[]>([]);

  const [borradorCargado, setBorradorCargado] =
    useState(false);

  const [tablaPremiosCargada, setTablaPremiosCargada] =
    useState(false);

  const [jugadorParaScroll, setJugadorParaScroll] =
    useState<number | null>(null);

  const cancha =
    canchas.find((c) => c.id === canchaId) ??
    canchas[0];

  useEffect(() => {
    localStorage.removeItem(
      "laChangueadaFechaYaGuardada"
    );

    async function cargarConfiguracionNube() {
      const tablaLocal =
        obtenerTablaPremios();

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
            .select("clave, valor")
            .in("clave", [
              "valorChangueada",
              "tablaPremiosGeneral",
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
              "tablaPremiosGeneral"
          );

        const valorNube =
          Number(
            configuracionValor?.valor
          );

        if (
          Number.isFinite(valorNube) &&
          valorNube > 0
        ) {
          setValorChangueada(valorNube);

          localStorage.setItem(
            "laChangueadaValor",
            String(valorNube)
          );
        } else if (valorLocal) {
          setValorChangueada(
            Number(valorLocal)
          );
        }

        if (
          configuracionTabla &&
          Array.isArray(
            configuracionTabla.valor
          )
        ) {
          const tablaNube =
            configuracionTabla.valor as unknown as FilaPremios[];

          setTablaPremios(tablaNube);

          localStorage.setItem(
            "laChangueadaTablaPremios",
            JSON.stringify(tablaNube)
          );
        } else {
          setTablaPremios(tablaLocal);
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

        setTablaPremios(tablaLocal);
      } finally {
        setTablaPremiosCargada(true);
      }
    }

    cargarConfiguracionNube();

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

    const claveBorrador =
      "laChangueadaNuevaFechaBorrador";

    const claveBackup =
      "laChangueadaNuevaFechaBorradorBackup";

    function recuperarBorrador(
      datos: string | null
    ): BorradorNuevaFecha | null {
      if (!datos) return null;

      try {
        return JSON.parse(datos);
      } catch {
        return null;
      }
    }

    const borradorPrincipal =
      recuperarBorrador(
        localStorage.getItem(
          claveBorrador
        )
      );

    const borradorBackup =
      recuperarBorrador(
        localStorage.getItem(
          claveBackup
        )
      );

    const borrador =
      borradorPrincipal ??
      borradorBackup;

    if (borrador) {
      setCanchaId(
        borrador.canchaId ?? 0
      );

      setGeneral(
        borrador.general ?? []
      );

      setViejitos(
        borrador.viejitos ?? []
      );

      setPagosPendientes(
        borrador.pagosPendientes ?? []
      );

      if (
        !borradorPrincipal &&
        borradorBackup
      ) {
        localStorage.setItem(
          claveBorrador,
          JSON.stringify(
            borradorBackup
          )
        );
      }
    }

    const jugadorRecienCreadoId =
      Number(
        localStorage.getItem(
          "laChangueadaJugadorRecienCreado"
        )
      );

    if (jugadorRecienCreadoId) {
      setJugadorParaScroll(
        jugadorRecienCreadoId
      );

      localStorage.removeItem(
        "laChangueadaJugadorRecienCreado"
      );
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
          activa: boolean | null;
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

            if (usosB !== usosA) {
              return usosB - usosA;
            }

            return a.nombre.localeCompare(
              b.nombre,
              "es",
              {
                sensitivity: "base",
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

    const claveBorrador =
      "laChangueadaNuevaFechaBorrador";

    const claveBackup =
      "laChangueadaNuevaFechaBorradorBackup";

    const borrador: BorradorNuevaFecha = {
      canchaId,
      general,
      viejitos,
      pagosPendientes,
    };

    try {
      const borradorAnterior =
        localStorage.getItem(
          claveBorrador
        );

      if (borradorAnterior) {
        localStorage.setItem(
          claveBackup,
          borradorAnterior
        );
      }

      localStorage.setItem(
        claveBorrador,
        JSON.stringify(borrador)
      );
    } catch {
      // Se conserva la última copia válida.
    }
  }, [
    borradorCargado,
    canchaId,
    general,
    viejitos,
    pagosPendientes,
  ]);

  useEffect(() => {
    if (jugadorParaScroll === null) {
      return;
    }

    const temporizador =
      window.setTimeout(() => {
        const tarjeta =
          document.getElementById(
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
      window.clearTimeout(
        temporizador
      );
    };
  }, [
    jugadorParaScroll,
    listaJugadores,
  ]);

  useEffect(() => {
    if (!letraSeleccionada) {
      return;
    }

    const id =
      window.requestAnimationFrame(
        () => {
          document
            .querySelector(
              "#lista-jugadores > div"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }
      );

    return () =>
      window.cancelAnimationFrame(id);
  }, [
    letraSeleccionada,
    listaJugadores,
  ]);

  function volverAlTeclado() {
    window.requestAnimationFrame(() => {
      tecladoRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function cambiarGeneral(id: number) {
    if (general.includes(id)) {
      setGeneral((actual) =>
        actual.filter(
          (jugadorId) =>
            jugadorId !== id
        )
      );

      volverAlTeclado();
      return;
    }

    const nuevoGeneral = [
      ...general,
      id,
    ];

    if (
      nuevoGeneral.length === 14
    ) {
      const pasarACategorias =
        window.confirm(
          "Ya hay 14 jugadores en General.\n\n¿Querés pasar todos los jugadores anotados a una nueva fecha por categorías A y B?"
        );

      if (
        pasarACategorias
      ) {
        const jugadoresMigrados =
          Array.from(
            new Set([
              ...nuevoGeneral,
              ...viejitos,
            ])
          );

        const pendientesMigrados =
          pagosPendientes.filter(
            (jugadorId) =>
              jugadoresMigrados.includes(
                jugadorId
              )
          );

        localStorage.setItem(
          "laChangueadaNuevaFechaCategoriasBorrador",
          JSON.stringify({
            canchaId,
            jugadores:
              jugadoresMigrados,
            pagosPendientes:
              pendientesMigrados,
            categoriaA: [],
            categoriaB: [],
            busqueda: "",
          })
        );

        router.push(
          "/nueva-fecha/categorias"
        );
        return;
      }
    }

    setGeneral(nuevoGeneral);
    volverAlTeclado();
  }

  function cambiarViejitos(id: number) {
    setViejitos((actual) =>
      actual.includes(id)
        ? actual.filter(
            (jugadorId) =>
              jugadorId !== id
          )
        : [...actual, id]
    );

    volverAlTeclado();
  }

  function cambiarPagoPendiente(id: number) {
    const jugadorAnotado =
      general.includes(id) ||
      viejitos.includes(id);

    if (!jugadorAnotado) {
      return;
    }

    setPagosPendientes(
      (actual) =>
        actual.includes(id)
          ? actual.filter(
              (jugadorId) =>
                jugadorId !== id
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
        busqueda: "",
      })
    );

    localStorage.setItem(
      "laChangueadaOrigenNuevoJugador",
      window.location.pathname
    );

    router.push(
      "/jugadores/nuevo"
    );
  }

  function continuar() {
    if (!cancha) {
      return;
    }

    const jugadoresAnotados =
      new Set([
        ...general,
        ...viejitos,
      ]);

    const pendientesAnotados =
      pagosPendientes.filter(
        (jugadorId) =>
          jugadoresAnotados.has(
            jugadorId
          )
      );

    localStorage.setItem(
      "laChangueadaFechaActual",
      JSON.stringify({
        general,
        viejitos,
        pagosPendientes:
          pendientesAnotados,
        cancha: cancha.id,
      })
    );

    router.push("/previa");
  }

  const jugadoresFiltrados =
    listaJugadores
      .filter((jugador) => {
        if (
          !letraSeleccionada
        ) {
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
        if (
          a.frecuente &&
          !b.frecuente
        ) {
          return -1;
        }

        if (
          !a.frecuente &&
          b.frecuente
        ) {
          return 1;
        }

        return a.nombre.localeCompare(
          b.nombre
        );
      });

  const totalJugadores =
    new Set([
      ...general,
      ...viejitos,
    ]).size;

  const puedeContinuar =
    totalJugadores > 0;

  const jugadoresAnotados =
    new Set([
      ...general,
      ...viejitos,
    ]);

  const premiosGeneral =
    tablaPremios.find(
      (fila) =>
        fila.jugadores ===
        general.length
    )?.premios ?? [];

  const premiosViejitos =
    tablaPremios.find(
      (fila) =>
        fila.jugadores ===
        viejitos.length
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
                  Number(
                    evento.target.value
                  )
                )
              }
              className="flex-1 rounded-lg border px-3 py-2 text-black"
            >
              {canchas.map(
                (canchaDisponible) => (
                  <option
                    key={
                      canchaDisponible.id
                    }
                    value={
                      canchaDisponible.id
                    }
                  >
                    {
                      canchaDisponible.nombre
                    }
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

              <span>
                Par {cancha.par}
              </span>
            </p>

            <p className="mt-2 text-xl font-bold">
              👥 Jugadores:{" "}
              {totalJugadores}
            </p>

            <div className="mt-4 flex justify-between gap-4">
              <span>
                General:{" "}
                <strong>
                  {general.length}
                </strong>
              </span>

              <span className="text-right">
                $
                {(
                  general.length *
                  valorChangueada
                ).toLocaleString(
                  "es-AR"
                )}
              </span>
            </div>

            {viejitos.length >
              0 && (
              <div className="mt-2 flex justify-between gap-4">
                <span>
                  Viejitos:{" "}
                  <strong>
                    {
                      viejitos.length
                    }
                  </strong>
                </span>

                <span className="text-right">
                  $
                  {(
                    viejitos.length *
                    valorChangueada
                  ).toLocaleString(
                    "es-AR"
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-gray-200 pt-5">
            <h2 className="text-xl font-black">
              🏆 Reparto de premios
            </h2>

            <div className="mt-4">
              <p className="font-bold">
                General —{" "}
                {general.length}{" "}
                jugadores
              </p>

              {premiosGeneral.length >
              0 ? (
                <div className="mt-2 space-y-1">
                  {premiosGeneral.map(
                    (
                      premio,
                      indice
                    ) =>
                      premio >
                      0 ? (
                        <p
                          key={`general-${indice}`}
                        >
                          {indice +
                            1}
                          .º —{" "}
                          <strong>
                            $
                            {premio.toLocaleString(
                              "es-AR"
                            )}
                          </strong>
                        </p>
                      ) : null
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

            {viejitos.length >
              0 && (
              <div className="mt-5">
                <p className="font-bold">
                  Viejitos —{" "}
                  {viejitos.length}{" "}
                  jugadores
                </p>

                {premiosViejitos.length >
                0 ? (
                  <div className="mt-2 space-y-1">
                    {premiosViejitos.map(
                      (
                        premio,
                        indice
                      ) =>
                        premio >
                        0 ? (
                          <p
                            key={`viejitos-${indice}`}
                          >
                            {indice +
                              1}
                            .º —{" "}
                            <strong>
                              $
                              {premio.toLocaleString(
                                "es-AR"
                              )}
                            </strong>
                          </p>
                        ) : null
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
            )}
          </div>

          <button
            onClick={continuar}
            disabled={
              !puedeContinuar
            }
            className={`mt-6 w-full rounded-xl p-4 text-2xl font-bold text-white ${
              puedeContinuar
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
            setLetraSeleccionada(
              ""
            )
          }
          className={`mb-3 w-full rounded-lg py-2 font-bold ${
            letraSeleccionada ===
            ""
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
        onClick={
          agregarJugadorDesdeFecha
        }
        className="mb-6 mt-4 w-full rounded-xl bg-green-700 p-4 text-xl font-bold text-white"
      >
        ➕ Agregar jugador
      </button>

      {jugadoresAnotados.size >
        0 && (
        <div className="mb-5 rounded-xl bg-white p-4 text-green-900">
          <p className="mb-3 text-lg font-bold">
            👥 Jugadores anotados (
            {jugadoresAnotados.size}
            )
          </p>

          <div className="flex flex-wrap gap-2">
            {listaJugadores
              .filter(
                (jugador) =>
                  general.includes(
                    jugador.id
                  ) ||
                  viejitos.includes(
                    jugador.id
                  )
              )
              .sort((a, b) =>
                a.nombre.localeCompare(
                  b.nombre
                )
              )
              .map(
                (jugador) => (
                  <span
                    key={
                      jugador.id
                    }
                    className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold"
                  >
                    {
                      jugador.nombre
                    }

                    {pagosPendientes.includes(
                      jugador.id
                    ) && (
                      <span className="ml-2 text-red-600">
                        🔴
                      </span>
                    )}
                  </span>
                )
              )}
          </div>
        </div>
      )}

      <div
        id="lista-jugadores"
        className={`scroll-mt-24 space-y-3 ${
          letraSeleccionada
            ? "pb-[100dvh]"
            : ""
        }`}
      >
        {jugadoresFiltrados.map(
          (jugador) => {
            const jugadorAnotado =
              general.includes(
                jugador.id
              ) ||
              viejitos.includes(
                jugador.id
              );

            const pagoPendiente =
              pagosPendientes.includes(
                jugador.id
              );

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
                    disabled={
                      !jugadorAnotado
                    }
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
                      cambiarGeneral(
                        jugador.id
                      )
                    }
                    className={`h-12 rounded-full px-4 text-base font-bold ${
                      general.includes(
                        jugador.id
                      )
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    General
                  </button>

                  <button
                    onClick={() =>
                      cambiarViejitos(
                        jugador.id
                      )
                    }
                    className={`h-12 rounded-full px-4 text-base font-bold ${
                      viejitos.includes(
                        jugador.id
                      )
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Viejitos
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>
    </main>
  );
}