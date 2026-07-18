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

type FechaGuardada = {
  id: number;
  fecha: string;
  general: Resultado[];
  viejitos: Resultado[];
};

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function medalla(puesto: number) {
  if (puesto === 1) return "🥇";
  if (puesto === 2) return "🥈";
  if (puesto === 3) return "🥉";

  return `${puesto}.`;
}

export default function Compartir() {
  const [general, setGeneral] = useState<Resultado[]>([]);
  const [viejitos, setViejitos] = useState<Resultado[]>([]);
  const [fecha, setFecha] = useState("");

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
          text: `Resultados ${categoria} - ${fecha}`,
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
      <p className="mt-3 text-center text-sm font-bold text-gray-500">
        Sin resultados
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-1">
      {resultados.map((resultado, indice) => {
        const anterior = resultados[indice - 1];

        const empatado =
          anterior &&
          anterior.score === resultado.score;

        let puesto = `${resultado.puesto}.`;

        if (empatado) {
          puesto = `T${resultado.puesto}`;
        }

        let posicion = puesto;

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
            className="flex items-center justify-between px-2 py-1"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 shrink-0 font-black">
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
    return (
      <div
        ref={referencia}
        className="mx-auto w-full max-w-xl rounded-3xl bg-white p-4 shadow-2xl"
      >
        <div className="rounded-2xl bg-green-900 px-4 py-4 text-center text-white">
          <h1 className="text-2xl font-black">
            LA CHANGUEADA
          </h1>

          <p className="mt-1 text-xs font-bold tracking-[0.3em]">
            FOOTGOLF
          </p>

          <p className="mt-2 text-sm font-bold">
            {fecha}
          </p>
        </div>

        <section className="mt-4">
          <h2 className="rounded-xl bg-green-900 px-4 py-2 text-center text-xl font-black text-white">
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
        categoria="GENERAL"
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
        categoria="VIEJITOS"
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