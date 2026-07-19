"use client";

import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

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
  cancha?: CanchaFecha | null;
  general: Resultado[];
  viejitos: Resultado[];
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

export default function Compartir() {
  const [general, setGeneral] = useState<Resultado[]>([]);
  const [viejitos, setViejitos] = useState<Resultado[]>([]);
  const [fecha, setFecha] = useState("");
const [nombreDeVuelta, setNombreDeVuelta] =
  useState("");
const [cancha, setCancha] =
  useState<CanchaFecha | null>(null);

  const placaGeneralRef = useRef<HTMLDivElement>(null);
  const placaViejitosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const historial = localStorage.getItem(
      "laChangueadaHistorial"
    );

    const fechaElegida = localStorage.getItem(
      "laChangueadaFechaParaCompartir"
    );

    if (!historial) return;

    const fechas: FechaGuardada[] = JSON.parse(historial);

    const fechaSeleccionada = fechaElegida
      ? fechas.find(
          (fechaGuardada) =>
            fechaGuardada.id === Number(fechaElegida)
        )
      : fechas[0];

    if (!fechaSeleccionada) return;

    setGeneral(fechaSeleccionada.general);
    setViejitos(fechaSeleccionada.viejitos);
    setFecha(fechaSeleccionada.fecha);

setNombreDeVuelta(
  nombreVuelta(fechaSeleccionada, fechas)
);

setCancha(fechaSeleccionada.cancha ?? null);
  }, []);

  async function compartirImagen(
    placa: HTMLDivElement | null,
    categoria: string
  ) {
    if (!placa) return;

    try {
      const dataUrl = await htmlToImage.toPng(placa, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const respuesta = await fetch(dataUrl);
      const blob = await respuesta.blob();

      const nombreCategoria = categoria.toLowerCase();

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
          text: `LA CHANGUEADA ⚽🚩
${fecha}${nombreDeVuelta ? ` · ${nombreDeVuelta}` : ""}
Resultados ${categoria}`,
          files: [archivo],
        });

        return;
      }

      const enlace = document.createElement("a");
      enlace.href = dataUrl;
      enlace.download = archivo.name;
      enlace.click();
    } catch (error) {
      console.error(error);
      alert("No se pudo generar la imagen.");
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

    const resultadosVisibles = resultados.slice(0, 15);

    return (
      <div className="mt-3">
        {resultadosVisibles.map((resultado, indice) => {
          const anterior = resultados[indice - 1];
          const siguiente = resultados[indice + 1];

          const empatado =
            anterior?.score === resultado.score ||
            siguiente?.score === resultado.score;

          let posicion = empatado
            ? `T${resultado.puesto}.`
            : `${resultado.puesto}.`;

          if (resultado.puesto === 1) {
            posicion = empatado ? "T🥇" : "🥇";
          } else if (resultado.puesto === 2) {
            posicion = empatado ? "T🥈" : "🥈";
          } else if (resultado.puesto === 3) {
            posicion = empatado ? "T🥉" : "🥉";
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
                  {resultado.jugador.nombre}
                </span>
              </div>

              <span className="shrink-0 font-black">
                {resultado.score}
              </span>
            </div>
          );
        })}
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
    const esTop15 = resultados.length > 15;

    return (
      <div
        ref={referencia}
        className="mx-auto w-full max-w-xl rounded-3xl bg-white px-5 py-5 shadow-2xl"
      >
        <header className="border-b border-gray-200 pb-4 text-center">
          <h1 className="text-2xl font-black text-green-900">
            LA CHANGUEADA
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
      🚩 {cancha.nombre}
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
            {categoria} · {resultados.length} jugadores
          </h2>

          <ListaResultados resultados={resultados} />
        </section>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 p-4 text-black">
      <div className="mx-auto mb-4 flex max-w-xl justify-end gap-2">
        <BotonVolver />
        <BotonInicio />
      </div>

      <Placa
        referencia={placaGeneralRef}
        categoria="General"
        resultados={general}
      />

      <button
        onClick={() =>
          compartirImagen(
            placaGeneralRef.current,
            "General"
          )
        }
        className="mx-auto mb-10 mt-4 block w-full max-w-xl rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
      >
        📤 Compartir General
      </button>

      <Placa
        referencia={placaViejitosRef}
        categoria="Viejitos"
        resultados={viejitos}
      />

      <button
        onClick={() =>
          compartirImagen(
            placaViejitosRef.current,
            "Viejitos"
          )
        }
        className="mx-auto mt-4 block w-full max-w-xl rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
      >
        📤 Compartir Viejitos
      </button>
    </main>
  );
}