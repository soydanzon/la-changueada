"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { createClient } from "../../../lib/supabase/client";
import BotonInicio from "../../../components/BotonInicio";
import BotonVolver from "../../../components/BotonVolver";

import { type Cancha } from "../../../datos/canchas";
import { obtenerTablaPremios } from "../../../premios/tablaPremios";
import { obtenerPremiosCategorias } from "../../../premios/tablaPremiosCategorias";

type JugadorResultado = {
  id?: number;
  nombre: string;
  [key: string]: unknown;
};

type Resultado = {
  jugador: JugadorResultado;
  score: number;
  puesto: number;
  premio: number;
};

type ResultadoBase = {
  jugador: JugadorResultado;
  score: number;
};

type CanchaFecha = {
  id: number;
  nombre: string;
  par: number;
};

type FechaGuardada = {
  id: number;
  fecha: string;
  formato?: "edad" | "categorias";
  cancha?: CanchaFecha | null;

  general?: Resultado[];
  viejitos?: Resultado[];

  categoriaA?: Resultado[];
  categoriaB?: Resultado[];

  pagosPendientes?: number[];
  pagosCompletados?: number[];
};

type FechaSupabase = {
  id: number;
  fecha: string;
  formato: string;
  cancha_id: number | null;
  cancha_nombre: string | null;
  par: number | null;
  pagos_pendientes: number[] | null;
  pagos_completados: number[] | null;
};

type ResultadoSupabase = {
  jugador_id: number;
  jugador_nombre: string;
  categoria: string;
  score: number;
  puesto: number;
  premio: number;
};

type CanchaSupabase = {
  id: number;
  nombre: string;
  par: number;
  activa: boolean | null;
};

function calcularConPremios(
  resultados: ResultadoBase[],
  premios: number[]
): Resultado[] {
  const ordenados = [
    ...resultados,
  ].sort(
    (a, b) =>
      a.score - b.score
  );

  const finales: Resultado[] = [];
  let i = 0;

  while (i < ordenados.length) {
    const scoreActual =
      ordenados[i].score;

    let cantidad = 1;

    while (
      i + cantidad <
        ordenados.length &&
      ordenados[i + cantidad]
        .score === scoreActual
    ) {
      cantidad += 1;
    }

    const premiosInvolucrados =
      premios.slice(
        i,
        i + cantidad
      );

    const totalPremios =
      premiosInvolucrados.reduce(
        (suma, premio) =>
          suma + premio,
        0
      );

    const premioBase =
      Math.floor(
        totalPremios / cantidad
      );

    const resto =
      totalPremios -
      premioBase * cantidad;

    ordenados
      .slice(i, i + cantidad)
      .forEach(
        (
          resultado,
          index
        ) => {
          finales.push({
            ...resultado,
            puesto: i + 1,
            premio:
              premioBase +
              (index === 0
                ? resto
                : 0),
          });
        }
      );

    i += cantidad;
  }

  return finales;
}

function calcularPremios(
  resultados: ResultadoBase[]
): Resultado[] {
  const fila =
    obtenerTablaPremios().find(
      (filaPremios) =>
        filaPremios.jugadores ===
        resultados.length
    );

  return calcularConPremios(
    resultados,
    fila?.premios ?? []
  );
}

function formatearScore(
  score: number,
  par: number
) {
  const relativo = score - par;

  if (relativo === 0) {
    return "P";
  }

  if (relativo > 0) {
    return `+${relativo}`;
  }

  return String(relativo);
}

export default function EditarFecha() {
  const params = useParams();
  const router = useRouter();

  const idFecha = Number(
    params.id
  );

  const [fecha, setFecha] =
    useState<FechaGuardada | null>(
      null
    );

  const [canchas, setCanchas] =
    useState<Cancha[]>([]);

  const [canchaId, setCanchaId] =
    useState(0);

  const [par, setPar] =
    useState(0);

  const [
    resultadosUno,
    setResultadosUno,
  ] = useState<Resultado[]>([]);

  const [
    resultadosDos,
    setResultadosDos,
  ] = useState<Resultado[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    async function cargarFecha() {
      const supabase =
        createClient();

      try {
        const [
          respuestaFecha,
          respuestaResultados,
          respuestaCanchas,
        ] = await Promise.all([
          supabase
            .from("fechas")
            .select(
              "id, fecha, formato, cancha_id, cancha_nombre, par, pagos_pendientes, pagos_completados"
            )
            .eq("id", idFecha)
            .single(),

          supabase
            .from("resultados")
            .select(
              "jugador_id, jugador_nombre, categoria, score, puesto, premio"
            )
            .eq(
              "fecha_id",
              idFecha
            )
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

        if (respuestaFecha.error) {
          throw respuestaFecha.error;
        }

        if (
          respuestaResultados.error
        ) {
          throw respuestaResultados.error;
        }

        if (
          respuestaCanchas.error
        ) {
          throw respuestaCanchas.error;
        }

        const fechaSupabase =
          respuestaFecha.data as FechaSupabase;

        const resultadosSupabase =
          (respuestaResultados.data ??
            []) as ResultadoSupabase[];

        const canchasSupabase =
          (respuestaCanchas.data ??
            []) as CanchaSupabase[];

        const canchasNube: Cancha[] =
          canchasSupabase.map(
            (cancha) => ({
              id: Number(cancha.id),
              nombre: cancha.nombre,
              par: Number(cancha.par),
              activa: Boolean(
                cancha.activa
              ),
            })
          );

        setCanchas(canchasNube);

        localStorage.setItem(
          "laChangueadaCanchas",
          JSON.stringify(
            canchasNube
          )
        );

        function convertirResultados(
          categoria: string
        ): Resultado[] {
          return resultadosSupabase
            .filter(
              (resultado) =>
                resultado.categoria ===
                categoria
            )
            .map(
              (resultado) => ({
                jugador: {
                  id: Number(
                    resultado.jugador_id
                  ),

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
              })
            );
        }

        const formato:
          | "edad"
          | "categorias" =
          fechaSupabase.formato ===
          "categorias"
            ? "categorias"
            : "edad";

        const general =
          formato === "edad"
            ? convertirResultados(
                "general"
              )
            : [];

        const viejitos =
          formato === "edad"
            ? convertirResultados(
                "viejitos"
              )
            : [];

        const categoriaA =
          formato === "categorias"
            ? convertirResultados(
                "categoriaA"
              )
            : [];

        const categoriaB =
          formato === "categorias"
            ? convertirResultados(
                "categoriaB"
              )
            : [];

        const fechaConvertida:
          FechaGuardada = {
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

          general,
          viejitos,
          categoriaA,
          categoriaB,

          pagosPendientes:
            (
              fechaSupabase.pagos_pendientes ??
              []
            ).map(Number),

          pagosCompletados:
            (
              fechaSupabase.pagos_completados ??
              []
            ).map(Number),
        };

        setFecha(fechaConvertida);

        setCanchaId(
          fechaConvertida.cancha?.id ??
            0
        );

        setPar(
          fechaConvertida.cancha?.par ??
            0
        );

        if (
          formato ===
          "categorias"
        ) {
          setResultadosUno(
            categoriaA
          );

          setResultadosDos(
            categoriaB
          );
        } else {
          setResultadosUno(
            general
          );

          setResultadosDos(
            viejitos
          );
        }
      } catch (error) {
        console.error(
          "No se pudo cargar la fecha:",
          error
        );

        setMensaje(
          "⚠️ No se pudo cargar la fecha desde Supabase."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarFecha();
  }, [idFecha]);

  function cambiarCancha(
    nuevoId: number
  ) {
    setCanchaId(nuevoId);

    const nuevaCancha =
      canchas.find(
        (cancha) =>
          cancha.id === nuevoId
      );

    if (nuevaCancha) {
      setPar(nuevaCancha.par);
    }
  }

  function cambiarScoreUno(
    index: number,
    valor: string
  ) {
    const numero = Number(valor);

    if (
      !Number.isFinite(numero)
    ) {
      return;
    }

    setResultadosUno(
      (actuales) =>
        actuales.map(
          (
            resultado,
            indice
          ) =>
            indice === index
              ? {
                  ...resultado,
                  score: numero,
                }
              : resultado
        )
    );
  }

  function cambiarScoreDos(
    index: number,
    valor: string
  ) {
    const numero = Number(valor);

    if (
      !Number.isFinite(numero)
    ) {
      return;
    }

    setResultadosDos(
      (actuales) =>
        actuales.map(
          (
            resultado,
            indice
          ) =>
            indice === index
              ? {
                  ...resultado,
                  score: numero,
                }
              : resultado
        )
    );
  }

  async function guardarCambios() {
    if (
      !fecha ||
      guardando
    ) {
      return;
    }

    const confirmar =
      window.confirm(
        "¿Guardar los cambios de esta fecha?"
      );

    if (!confirmar) {
      return;
    }

    const canchaElegida =
      canchas.find(
        (cancha) =>
          cancha.id === canchaId
      );

    const canchaActualizada =
      canchaElegida
        ? {
            id: canchaElegida.id,
            nombre:
              canchaElegida.nombre,
            par,
          }
        : fecha.cancha
          ? {
              ...fecha.cancha,
              par,
            }
          : null;

    let categoriaUnoCalculada:
      Resultado[];

    let categoriaDosCalculada:
      Resultado[];

    if (
      fecha.formato ===
      "categorias"
    ) {
      const premiosCategorias =
        obtenerPremiosCategorias(
          resultadosUno.length +
            resultadosDos.length
        );

      categoriaUnoCalculada =
        calcularConPremios(
          resultadosUno.map(
            (resultado) => ({
              jugador:
                resultado.jugador,
              score:
                resultado.score,
            })
          ),
          premiosCategorias.a
        );

      categoriaDosCalculada =
        calcularConPremios(
          resultadosDos.map(
            (resultado) => ({
              jugador:
                resultado.jugador,
              score:
                resultado.score,
            })
          ),
          premiosCategorias.b
        );
    } else {
      categoriaUnoCalculada =
        calcularPremios(
          resultadosUno.map(
            (resultado) => ({
              jugador:
                resultado.jugador,
              score:
                resultado.score,
            })
          )
        );

      categoriaDosCalculada =
        calcularPremios(
          resultadosDos.map(
            (resultado) => ({
              jugador:
                resultado.jugador,
              score:
                resultado.score,
            })
          )
        );
    }

    const todosLosResultados = [
      ...categoriaUnoCalculada,
      ...categoriaDosCalculada,
    ];

    const faltaJugadorId =
      todosLosResultados.some(
        (resultado) =>
          !Number.isFinite(
            Number(
              resultado.jugador.id
            )
          )
      );

    if (faltaJugadorId) {
      alert(
        "No se pudo identificar a uno de los jugadores."
      );
      return;
    }

    const resultadosParaSupabase =
      fecha.formato ===
      "categorias"
        ? [
            ...categoriaUnoCalculada.map(
              (resultado) => ({
                ...resultado,
                categoria:
                  "categoriaA",
              })
            ),

            ...categoriaDosCalculada.map(
              (resultado) => ({
                ...resultado,
                categoria:
                  "categoriaB",
              })
            ),
          ]
        : [
            ...categoriaUnoCalculada.map(
              (resultado) => ({
                ...resultado,
                categoria:
                  "general",
              })
            ),

            ...categoriaDosCalculada.map(
              (resultado) => ({
                ...resultado,
                categoria:
                  "viejitos",
              })
            ),
          ];

    setGuardando(true);
    setMensaje("");

    const supabase =
      createClient();

    const { error } =
      await supabase.rpc(
        "editar_fecha_completa",
        {
          p_fecha: {
            id: fecha.id,
            fecha: fecha.fecha,
            formato:
              fecha.formato ===
              "categorias"
                ? "categorias"
                : "edad",
            cancha:
              canchaActualizada,
            pagosPendientes:
              fecha.pagosPendientes ??
              [],
            pagosCompletados:
              fecha.pagosCompletados ??
              [],
          },

          p_resultados:
            resultadosParaSupabase,
        }
      );

    if (error) {
      console.error(
        "No se pudo editar la fecha:",
        error
      );

      alert(
        "No se pudieron guardar los cambios. La fecha original sigue intacta."
      );

      setGuardando(false);
      return;
    }

    const fechaActualizada:
      FechaGuardada =
      fecha.formato ===
      "categorias"
        ? {
            ...fecha,

            cancha:
              canchaActualizada,

            categoriaA:
              categoriaUnoCalculada,

            categoriaB:
              categoriaDosCalculada,

            general:
              categoriaUnoCalculada,

            viejitos:
              categoriaDosCalculada,
          }
        : {
            ...fecha,

            cancha:
              canchaActualizada,

            general:
              categoriaUnoCalculada,

            viejitos:
              categoriaDosCalculada,
          };

    const datosLocales =
      localStorage.getItem(
        "laChangueadaHistorial"
      );

    if (datosLocales) {
      try {
        const historialLocal:
          FechaGuardada[] =
          JSON.parse(datosLocales);

        localStorage.setItem(
          "laChangueadaHistorial",
          JSON.stringify(
            historialLocal.map(
              (item) =>
                item.id ===
                fecha.id
                  ? fechaActualizada
                  : item
            )
          )
        );
      } catch {
        // La edición ya quedó guardada
        // correctamente en Supabase.
      }
    }

    router.push(
      `/historial/${fecha.id}`
    );
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        Cargando fecha...
      </main>
    );
  }

  if (!fecha) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        <div className="mb-6 flex justify-end gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>

        <div className="rounded-xl bg-white p-5 text-green-900">
          {mensaje ||
            "No se encontró la fecha."}
        </div>
      </main>
    );
  }

  const tituloUno =
    fecha.formato ===
    "categorias"
      ? "🅰️ Categoría A"
      : "🙎🏻‍♂️ General";

  const tituloDos =
    fecha.formato ===
    "categorias"
      ? "🅱️ Categoría B"
      : "🧓🏻 Viejitos";

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between gap-3 bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          ✏️ Editar fecha
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 text-green-900">
        <p className="mb-4 text-xl font-bold">
          📅 {fecha.fecha}
        </p>

        <label className="block font-bold">
          Cancha
        </label>

        <select
          value={canchaId}
          disabled={guardando}
          onChange={(evento) =>
            cambiarCancha(
              Number(
                evento.target.value
              )
            )
          }
          className="mt-2 w-full rounded-lg border p-3 text-black disabled:bg-gray-200"
        >
          {canchas.map(
            (cancha) => (
              <option
                key={cancha.id}
                value={cancha.id}
              >
                {cancha.nombre}
              </option>
            )
          )}
        </select>

        <label className="mt-4 block font-bold">
          Par
        </label>

        <input
          type="number"
          value={par}
          disabled={guardando}
          onChange={(evento) =>
            setPar(
              Number(
                evento.target.value
              )
            )
          }
          className="mt-2 w-full rounded-lg border p-3 text-black disabled:bg-gray-200"
        />
      </div>

      <section className="mt-6 rounded-xl bg-white p-4 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          {tituloUno}
        </h2>

        <div className="space-y-3">
          {resultadosUno.map(
            (
              resultado,
              index
            ) => (
              <div
                key={`${resultado.jugador.nombre}-${index}`}
                className="flex items-center justify-between gap-4 border-b border-green-900/15 pb-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {
                      resultado
                        .jugador
                        .nombre
                    }
                  </p>

                  <p className="text-sm text-gray-600">
                    {formatearScore(
                      resultado.score,
                      par
                    )}
                  </p>
                </div>

                <input
                  type="number"
                  value={
                    resultado.score
                  }
                  disabled={guardando}
                  onChange={(
                    evento
                  ) =>
                    cambiarScoreUno(
                      index,
                      evento.target
                        .value
                    )
                  }
                  className="w-20 rounded-lg border p-2 text-center text-lg font-bold text-black disabled:bg-gray-200"
                />
              </div>
            )
          )}
        </div>
      </section>

      {resultadosDos.length >
        0 && (
        <section className="mt-6 rounded-xl bg-white p-4 text-green-900">
          <h2 className="mb-4 text-2xl font-bold">
            {tituloDos}
          </h2>

          <div className="space-y-3">
            {resultadosDos.map(
              (
                resultado,
                index
              ) => (
                <div
                  key={`${resultado.jugador.nombre}-${index}`}
                  className="flex items-center justify-between gap-4 border-b border-green-900/15 pb-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {
                        resultado
                          .jugador
                          .nombre
                      }
                    </p>

                    <p className="text-sm text-gray-600">
                      {formatearScore(
                        resultado.score,
                        par
                      )}
                    </p>
                  </div>

                  <input
                    type="number"
                    value={
                      resultado.score
                    }
                    disabled={guardando}
                    onChange={(
                      evento
                    ) =>
                      cambiarScoreDos(
                        index,
                        evento.target
                          .value
                      )
                    }
                    className="w-20 rounded-lg border p-2 text-center text-lg font-bold text-black disabled:bg-gray-200"
                  />
                </div>
              )
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        disabled={guardando}
        onClick={guardarCambios}
        className="mt-6 w-full rounded-xl bg-blue-600 p-5 text-2xl font-bold text-white disabled:bg-gray-400"
      >
        {guardando
          ? "☁️ Guardando..."
          : "💾 Guardar cambios"}
      </button>
    </main>
  );
}