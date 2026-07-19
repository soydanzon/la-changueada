"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

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

function formatearPesos(valor: number) {
  return valor > 0 ? `$${valor.toLocaleString("es-AR")}` : "-";
}

function medalla(puesto: number) {
  if (puesto === 1) return "🥇";
  if (puesto === 2) return "🥈";
  if (puesto === 3) return "🥉";
  return `${puesto}.`;
}

function TablaResultados({ resultados }: { resultados: Resultado[] }) {
  return (
    <div className="space-y-2">
      {resultados.map((r) => (
        <div
          key={`${r.jugador.nombre}-${r.puesto}`}
          className="rounded-lg border p-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 shrink-0 text-center font-bold">
              {medalla(r.puesto)}
            </div>

            <div className="min-w-0 flex-1 font-semibold">
              {r.jugador.nombre}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between pl-11">
            <span className="font-bold">
              Score: {r.score}
            </span>

            <span className="font-bold text-green-700">
              {formatearPesos(r.premio)}
            </span>
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
      <main className="min-h-screen bg-green-900 p-6 text-white">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">
          {fecha.fecha}
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {fecha.cancha && (
        <div className="mt-6 rounded-xl bg-white p-5 text-green-900">
          <p className="text-xl">
  <span className="font-bold">
    🚩 {fecha.cancha.nombre}
  </span>

  &nbsp;&nbsp;&nbsp;

  <span className="font-normal">
    Par {fecha.cancha.par}
  </span>
</p>
        </div>
      )}

      <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          General
        </h2>

        <TablaResultados resultados={fecha.general} />
      </div>

      <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          Viejitos
        </h2>

        <TablaResultados resultados={fecha.viejitos} />
      </div>
    </main>
  );
}