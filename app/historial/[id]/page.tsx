"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  return valor > 0 ? `$${valor.toLocaleString("es-AR")}` : "-";
}

function medalla(puesto: number) {
  if (puesto === 1) return "🥇";
  if (puesto === 2) return "🥈";
  if (puesto === 3) return "🥉";
  return `${puesto}.`;
}

function TablaResultados({
  resultados,
}: {
  resultados: Resultado[];
}) {
  return (
    <div className="space-y-2">
      {resultados.map((r) => (
        <div
          key={`${r.jugador.nombre}-${r.puesto}`}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <div className="w-8 text-center font-bold">
            {medalla(r.puesto)}
          </div>

          <div className="flex-1 font-semibold truncate">
            {r.jugador.nombre}
          </div>

          <div className="w-12 text-center font-bold">
            {r.score}
          </div>

          <div className="w-24 text-right font-bold text-green-700">
            {formatearPesos(r.premio)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DetalleFecha() {
  const params = useParams();

  const [fecha, setFecha] = useState<FechaGuardada | null>(null);

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const historial: FechaGuardada[] = JSON.parse(datos);

    const encontrada = historial.find(
      (f) => f.id === Number(params.id)
    );

    if (encontrada) {
      setFecha(encontrada);
    }
  }, [params.id]);

  if (!fecha) {
    return (
      <main className="min-h-screen bg-green-900 text-white p-6">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold">
        {fecha.fecha}
      </h1>

      <div className="mt-8 bg-white text-green-900 rounded-xl p-5">
        <h2 className="text-2xl font-bold mb-4">
          🏆 General
        </h2>

        <TablaResultados resultados={fecha.general} />
      </div>

      <div className="mt-8 bg-white text-green-900 rounded-xl p-5">
        <h2 className="text-2xl font-bold mb-4">
          👴 Viejitos
        </h2>

        <TablaResultados resultados={fecha.viejitos} />
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