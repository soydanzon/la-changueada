"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import BotonInicio from "../../../components/BotonInicio";
import BotonVolver from "../../../components/BotonVolver";

import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../../../datos/canchas";

import { obtenerTablaPremios } from "../../../premios/tablaPremios";

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

function calcularPremios(
  resultados: ResultadoBase[]
): Resultado[] {
  const tablaPremios =
    obtenerTablaPremios();

  const fila = tablaPremios.find(
    (filaPremios) =>
      filaPremios.jugadores ===
      resultados.length
  );

  const premios = fila
    ? fila.premios
    : [];

  const ordenados = [
    ...resultados,
  ].sort(
    (a, b) => a.score - b.score
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

  const idFecha = Number(params.id);

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

  useEffect(() => {
    const canchasGuardadas =
      obtenerCanchasGuardadas();

    setCanchas(canchasGuardadas);

    const datos =
      localStorage.getItem(
        "laChangueadaHistorial"
      );

    if (!datos) {
      return;
    }

    try {
      const historial: FechaGuardada[] =
        JSON.parse(datos);

      const encontrada =
        historial.find(
          (item) =>
            item.id === idFecha
        );

      if (!encontrada) {
        return;
      }

      setFecha(encontrada);

      setCanchaId(
        encontrada.cancha?.id ?? 0
      );

      setPar(
        encontrada.cancha?.par ?? 0
      );

      if (
        encontrada.formato ===
        "categorias"
      ) {
        setResultadosUno(
          encontrada.categoriaA ??
            encontrada.general ??
            []
        );

        setResultadosDos(
          encontrada.categoriaB ??
            encontrada.viejitos ??
            []
        );
      } else {
        setResultadosUno(
          encontrada.general ?? []
        );

        setResultadosDos(
          encontrada.viejitos ?? []
        );
      }
    } catch {
      setFecha(null);
    }
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
    const numero =
      Number(valor);

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
    const numero =
      Number(valor);

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

  function guardarCambios() {
    if (!fecha) {
      return;
    }

    const confirmar =
      window.confirm(
        "¿Guardar los cambios de esta fecha?"
      );

    if (!confirmar) {
      return;
    }

    const datos =
      localStorage.getItem(
        "laChangueadaHistorial"
      );

    if (!datos) {
      return;
    }

    try {
      const historial: FechaGuardada[] =
        JSON.parse(datos);

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

      const categoriaUnoCalculada =
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

      const categoriaDosCalculada =
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

              // Se mantienen estas
              // copias por compatibilidad
              // con handicap y estadísticas.
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

      const nuevoHistorial =
        historial.map((item) =>
          item.id === fecha.id
            ? fechaActualizada
            : item
        );

      localStorage.setItem(
        "laChangueadaHistorial",
        JSON.stringify(
          nuevoHistorial
        )
      );

      router.push(
        `/historial/${fecha.id}`
      );
    } catch (error) {
      console.error(
        "No se pudo editar la fecha:",
        error
      );

      alert(
        "No se pudieron guardar los cambios."
      );
    }
  }

  if (!fecha) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        Cargando...
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
          onChange={(evento) =>
            cambiarCancha(
              Number(
                evento.target.value
              )
            )
          }
          className="mt-2 w-full rounded-lg border p-3 text-black"
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
          onChange={(evento) =>
            setPar(
              Number(
                evento.target.value
              )
            )
          }
          className="mt-2 w-full rounded-lg border p-3 text-black"
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
                  onChange={(
                    evento
                  ) =>
                    cambiarScoreUno(
                      index,
                      evento.target
                        .value
                    )
                  }
                  className="w-20 rounded-lg border p-2 text-center text-lg font-bold text-black"
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
                    onChange={(
                      evento
                    ) =>
                      cambiarScoreDos(
                        index,
                        evento.target
                          .value
                      )
                    }
                    className="w-20 rounded-lg border p-2 text-center text-lg font-bold text-black"
                  />
                </div>
              )
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={guardarCambios}
        className="mt-6 w-full rounded-xl bg-blue-600 p-5 text-2xl font-bold text-white"
      >
        💾 Guardar cambios
      </button>
    </main>
  );
}