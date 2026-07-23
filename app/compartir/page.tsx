"use client";

import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";
import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../datos/canchas";

type Resultado = {
  jugador: {
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
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
};

function nombreVuelta(
  fechaActual: FechaGuardada,
  historial: FechaGuardada[]
) {
  const diaActual = new Date(
    fechaActual.id
  ).toLocaleDateString("es-AR");

  const fechasDelMismoDia = historial
    .filter(
      (fecha) =>
        new Date(fecha.id).toLocaleDateString("es-AR") ===
        diaActual
    )
    .sort((a, b) => a.id - b.id);

  if (fechasDelMismoDia.length === 1) {
    return "";
  }

  const posicion =
    fechasDelMismoDia.findIndex(
      (fecha) => fecha.id === fechaActual.id
    ) + 1;

  if (posicion === 1) return "Primera vuelta";
  if (posicion === 2) return "Segunda vuelta";
  if (posicion === 3) return "Tercera vuelta";

  return `${posicion}ª vuelta`;
}

function obtenerResultadosFecha(
  fecha: FechaGuardada
) {
  if (fecha.formato === "categorias") {
    return {
      formato: "categorias" as const,

      resultadosUno:
        fecha.categoriaA ??
        fecha.general ??
        [],

      resultadosDos:
        fecha.categoriaB ??
        fecha.viejitos ??
        [],
    };
  }

  return {
    formato: "edad" as const,
    resultadosUno: fecha.general ?? [],
    resultadosDos: fecha.viejitos ?? [],
  };
}

export default function Compartir() {
  const [resultadosUno, setResultadosUno] =
    useState<Resultado[]>([]);

  const [resultadosDos, setResultadosDos] =
    useState<Resultado[]>([]);

  const [fecha, setFecha] = useState("");

  const [nombreDeVuelta, setNombreDeVuelta] =
    useState("");

  const [cancha, setCancha] =
    useState<CanchaFecha | null>(null);

  const [formato, setFormato] =
    useState<"edad" | "categorias">("edad");

  const placaUnoRef =
    useRef<HTMLDivElement>(null);

  const placaDosRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const historialGuardado =
      localStorage.getItem(
        "laChangueadaHistorial"
      );

    const fechaElegida =
      localStorage.getItem(
        "laChangueadaFechaParaCompartir"
      );

    if (!historialGuardado) {
      return;
    }

    try {
      const fechas: FechaGuardada[] =
        JSON.parse(historialGuardado);

      const fechaSeleccionada =
        fechaElegida
          ? fechas.find(
              (fechaGuardada) =>
                fechaGuardada.id ===
                Number(fechaElegida)
            )
          : fechas[0];

      if (!fechaSeleccionada) {
        return;
      }

      const {
        formato: formatoFecha,
        resultadosUno:
          resultadosCategoriaUno,
        resultadosDos:
          resultadosCategoriaDos,
      } = obtenerResultadosFecha(
        fechaSeleccionada
      );

      setResultadosUno(
        resultadosCategoriaUno
      );

      setResultadosDos(
        resultadosCategoriaDos
      );

      setFecha(fechaSeleccionada.fecha);
      setFormato(formatoFecha);

      setNombreDeVuelta(
        nombreVuelta(
          fechaSeleccionada,
          fechas
        )
      );

      if (fechaSeleccionada.cancha) {
        const canchaActual =
          obtenerCanchasGuardadas().find(
            (canchaGuardada: Cancha) =>
              canchaGuardada.id ===
              fechaSeleccionada.cancha?.id
          );

        setCancha({
          ...fechaSeleccionada.cancha,
          nombre:
            canchaActual?.nombre ??
            fechaSeleccionada.cancha.nombre,
        });
      } else {
        setCancha(null);
      }
    } catch {
      setResultadosUno([]);
      setResultadosDos([]);
      setFecha("");
      setNombreDeVuelta("");
      setCancha(null);
      setFormato("edad");
    }
  }, []);

  async function compartirImagen(
    placa: HTMLDivElement | null,
    categoria: string
  ) {
    if (!placa) {
      return;
    }

    try {
      const dataUrl =
        await htmlToImage.toPng(placa, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });

      const respuesta = await fetch(dataUrl);
      const blob = await respuesta.blob();

      const nombreCategoria = categoria
        .toLowerCase()
        .replace(/\s+/g, "-");

      const archivo = new File(
        [blob],
        `la-changueada-${nombreCategoria}-${
          fecha || "resultados"
        }.png`,
        {
          type: "image/png",
        }
      );

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [archivo],
        })
      ) {
        await navigator.share({
          title: `La Changueada - ${categoria}`,
          text: `⚽ LA CHANGUEADA 🚩
${fecha}${
            nombreDeVuelta
              ? ` · ${nombreDeVuelta}`
              : ""
          }
Resultados ${categoria}`,
          files: [archivo],
        });

        return;
      }

      const enlace =
        document.createElement("a");

      enlace.href = dataUrl;
      enlace.download = archivo.name;
      enlace.click();
    } catch (error) {
      console.error(error);

      alert(
        "No se pudo generar la imagen."
      );
    }
  }

  function ListaResultados({
    resultados,
  }: {
    resultados: Resultado[];
  }) {
    if (resultados.length === 0) {
      return (
        <p className="mt-4 text-center text-sm text-gray-500">
          Sin resultados
        </p>
      );
    }

    const resultadosVisibles =
      resultados.slice(0, 15);

    return (
      <div className="mt-3">
        {resultadosVisibles.map(
          (resultado, indice) => {
            const anterior =
              resultadosVisibles[indice - 1];

            const siguiente =
              resultadosVisibles[indice + 1];

            const empatado =
              anterior?.score ===
                resultado.score ||
              siguiente?.score ===
                resultado.score;

            let posicion = empatado
              ? `T${resultado.puesto}.`
              : `${resultado.puesto}.`;

            if (resultado.puesto === 1) {
              posicion = empatado
                ? "T🥇"
                : "🥇";
            } else if (
              resultado.puesto === 2
            ) {
              posicion = empatado
                ? "T🥈"
                : "🥈";
            } else if (
              resultado.puesto === 3
            ) {
              posicion = empatado
                ? "T🥉"
                : "🥉";
            }

            return (
              <div
                key={`${resultado.puesto}-${resultado.jugador.nombre}`}
                className="flex items-center justify-between gap-4 px-2 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-9 shrink-0 font-black">
                    {posicion}
                  </span>

                  <span className="truncate font-semibold">
                    {
                      resultado.jugador
                        .nombre
                    }
                  </span>
                </div>

                <div className="flex shrink-0 items-baseline gap-1">
                  <span className="font-black">
                    {resultado.score}
                  </span>

                  {cancha && (
                    <span className="font-normal">
                      (
                      {resultado.score -
                        cancha.par ===
                      0
                        ? "P"
                        : resultado.score -
                              cancha.par >
                            0
                          ? `+${
                              resultado.score -
                              cancha.par
                            }`
                          : resultado.score -
                            cancha.par}
                      )
                    </span>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  }

  function Placa({
    referencia,
    categoria,
    resultados,
  }: {
    referencia: React.RefObject<HTMLDivElement | null>;
    categoria: string;
    resultados: Resultado[];
  }) {
    const esTop15 =
      resultados.length > 15;

    return (
      <div
        ref={referencia}
        className="mx-auto w-full max-w-xl rounded-3xl bg-white px-5 py-5 shadow-2xl"
      >
        <header className="border-b border-gray-200 pb-4 text-center">
          <h1 className="text-2xl font-black text-green-900">
            ⚽ LA CHANGUEADA 🚩
          </h1>

          <p className="mt-1 text-sm font-semibold text-gray-700">
            {fecha}

            {nombreDeVuelta && (
              <>
                {" · "}
                {nombreDeVuelta}
              </>
            )}
          </p>

          {cancha && (
            <p className="mt-1 text-base text-green-900">
              <span className="font-bold">
                ⛳ {cancha.nombre}
              </span>

              &nbsp;&nbsp;&nbsp;

              <span className="font-normal">
                Par {cancha.par}
              </span>
            </p>
          )}
        </header>

        <section className="pt-4">
          <h2 className="text-center text-lg font-black text-green-900">
            {esTop15 && "Top 15 · "}
            {categoria} ·{" "}
            {resultados.length} jugadores
          </h2>

          <ListaResultados
            resultados={resultados}
          />
        </section>
      </div>
    );
  }

  const nombreCategoriaUno =
    formato === "categorias"
      ? "Categoría A"
      : "General";

  const tituloCategoriaUno =
    formato === "categorias"
      ? "🅰️ Categoría A"
      : "General";

  const nombreCategoriaDos =
    formato === "categorias"
      ? "Categoría B"
      : "Viejitos";

  const tituloCategoriaDos =
    formato === "categorias"
      ? "🅱️ Categoría B"
      : "Viejitos";

  return (
    <main className="min-h-screen bg-green-900 p-4 text-black">
      <div className="mx-auto mb-4 flex max-w-xl justify-end gap-2">
        <BotonVolver />
        <BotonInicio />
      </div>

      {resultadosUno.length > 0 && (
        <>
          <Placa
            referencia={placaUnoRef}
            categoria={tituloCategoriaUno}
            resultados={resultadosUno}
          />

          <button
            type="button"
            onClick={() =>
              compartirImagen(
                placaUnoRef.current,
                nombreCategoriaUno
              )
            }
            className="mx-auto mb-10 mt-4 block w-full max-w-xl rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
          >
            📤 Compartir{" "}
            {nombreCategoriaUno}
          </button>
        </>
      )}

      {resultadosDos.length > 0 && (
        <>
          <Placa
            referencia={placaDosRef}
            categoria={tituloCategoriaDos}
            resultados={resultadosDos}
          />

          <button
            type="button"
            onClick={() =>
              compartirImagen(
                placaDosRef.current,
                nombreCategoriaDos
              )
            }
            className="mx-auto mt-4 block w-full max-w-xl rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
          >
            📤 Compartir{" "}
            {nombreCategoriaDos}
          </button>
        </>
      )}

      {resultadosUno.length === 0 &&
        resultadosDos.length === 0 && (
          <div className="mx-auto max-w-xl rounded-xl bg-white p-5 text-center font-bold text-green-900">
            No hay resultados para compartir.
          </div>
        )}
    </main>
  );
}