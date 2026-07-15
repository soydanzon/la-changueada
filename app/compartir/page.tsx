"use client";

import { useEffect, useRef, useState } from "react";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";
import * as htmlToImage from "html-to-image";

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
  const placaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const historial = localStorage.getItem("laChangueadaHistorial");
    const fechaElegida = localStorage.getItem(
      "laChangueadaFechaParaCompartir"
    );

    if (!historial) return;

    const fechas: FechaGuardada[] = JSON.parse(historial);

    const fechaSeleccionada = fechaElegida
      ? fechas.find((f) => f.id === Number(fechaElegida))
      : fechas[0];

    if (!fechaSeleccionada) return;

    setGeneral(fechaSeleccionada.general);
    setViejitos(fechaSeleccionada.viejitos);
    setFecha(fechaSeleccionada.fecha);
  }, []);

  async function compartirImagen() {
  if (!placaRef.current) return;

  try {
    const dataUrl = await htmlToImage.toPng(placaRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const respuesta = await fetch(dataUrl);
    const blob = await respuesta.blob();

    const archivo = new File(
      [blob],
      `la-changueada-${fecha || "resultados"}.png`,
      { type: "image/png" }
    );

    if (
      navigator.share &&
      navigator.canShare?.({ files: [archivo] })
    ) {
      await navigator.share({
        title: "La Changueada",
        text: `Resultados ${fecha}`,
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

  function ListaPremios({
    resultados,
  }: {
    resultados: Resultado[];
  }) {
    const premiados = resultados.filter((r) => r.premio > 0);

    if (premiados.length === 0) {
      return (
        <p className="text-sm text-gray-500">
          Sin premios
        </p>
      );
    }

    return (
      <div className="mt-3 space-y-3">
        {premiados.map((r) => (
          <div
            key={`${r.puesto}-${r.jugador.nombre}`}
            className="flex items-center justify-between gap-4 rounded-xl bg-green-50 px-4 py-3"
          >
            <div>
              <p className="text-lg font-black">
                {medalla(r.puesto)} {r.jugador.nombre}
              </p>

              <p className="text-sm text-gray-600">
                Score: {r.score}
              </p>
            </div>

            <p className="font-black text-green-900">
              {formatearPesos(r.premio)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 p-4 text-black">
      <div className="mx-auto mb-4 flex max-w-xl justify-end gap-2">
        <BotonVolver />
        <BotonInicio />
      </div>

      <div 
      ref={placaRef}
      className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="rounded-2xl bg-green-900 p-6 text-center text-white">
  <h1 className="text-4xl font-black">
    LA CHANGUEADA
  </h1>

  <p className="mt-2 text-sm font-bold tracking-[0.3em]">
    FOOTGOLF
  </p>

          <p className="mt-2 font-bold">
            Resultados {fecha && `- ${fecha}`}
          </p>
        </div>

        <section className="mt-6">
          <h2 className="rounded-xl bg-green-900 px-4 py-2 text-2xl font-black text-white">
            GENERAL
          </h2>

          <ListaPremios resultados={general} />
        </section>

        <section className="mt-6">
          <h2 className="rounded-xl bg-green-900 px-4 py-2 text-2xl font-black text-white">
            VIEJITOS
          </h2>

          <ListaPremios resultados={viejitos} />
        </section>

        <p className="mt-8 text-center text-lg font-black text-green-900">
          ⚽ Que viva La Changueada ⚽
        </p>
      </div>

      <button
  onClick={compartirImagen}
  className="mx-auto mt-4 block w-full max-w-xl rounded-xl bg-blue-600 p-4 text-xl font-bold text-white"
>
  📤 Compartir imagen
</button>

    </main>
  );
}