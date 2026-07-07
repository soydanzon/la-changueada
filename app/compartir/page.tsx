"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const historial = localStorage.getItem("laChangueadaHistorial");
    const fechaElegida = localStorage.getItem("laChangueadaFechaParaCompartir");

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

  function ListaPremios({ resultados }: { resultados: Resultado[] }) {
    const premiados = resultados.filter((r) => r.premio > 0);

    if (premiados.length === 0) {
      return <p className="text-sm text-gray-500">Sin premios</p>;
    }

    return (
      <div className="mt-3 space-y-3">
        {premiados.map((r) => (
          <div
            key={`${r.puesto}-${r.jugador.nombre}`}
            className="flex items-center justify-between gap-4 rounded-xl bg-green-50 px-4 py-3"
          >
            <div>
              <p className="font-black text-lg">
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
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="rounded-2xl bg-green-900 p-6 text-center text-white">
          <p className="text-sm font-bold tracking-[0.3em]">
            TORNEO AMATEUR
          </p>

          <h1 className="mt-2 text-4xl font-black">
            LA CHANGUEADA
          </h1>

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

      <a
        href="/historial"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Volver
      </a>
    </main>
  );
}