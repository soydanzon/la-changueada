"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";
import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../../datos/canchas";

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
  return `$${valor.toLocaleString("es-AR")}`;
}

function medalla(puesto: number) {
  if (puesto === 1) return "🥇";
  if (puesto === 2) return "🥈";
  if (puesto === 3) return "🥉";

  return `${puesto}.`;
}

function formatearScore(score: number, par?: number) {
  if (typeof par !== "number") {
    return String(score);
  }

  const relativo = score - par;

  if (relativo === 0) {
    return `${score} (P)`;
  }

  if (relativo > 0) {
    return `${score} (+${relativo})`;
  }

  return `${score} (${relativo})`;
}

function TablaResultados({
  resultados,
  par,
}: {
  resultados: Resultado[];
  par?: number;
}) {
  const premiados = resultados.filter(
    (resultado) => resultado.premio > 0
  );

  const noPremiados = resultados.filter(
    (resultado) => resultado.premio <= 0
  );

  return (
    <div>
      {premiados.length > 0 && (
        <div>
          {premiados.map((resultado, index) => (
            <div
              key={`${resultado.jugador.nombre}-${resultado.puesto}`}
              className={
                index < premiados.length - 1
                  ? "border-b border-green-900/20 py-2.5"
                  : "py-2.5"
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="w-8 shrink-0 text-center text-xl font-bold">
                    {medalla(resultado.puesto)}
                  </span>

                  <span className="font-bold">
                    {resultado.jugador.nombre}
                  </span>
                </div>

                <span className="shrink-0 text-right font-bold">
                  {formatearScore(resultado.score, par)}
                </span>
              </div>

              <p className="mt-1 pl-11 font-bold text-green-700">
                {formatearPesos(resultado.premio)}
              </p>
            </div>
          ))}
        </div>
      )}

      {premiados.length > 0 && noPremiados.length > 0 && (
        <div className="my-1 border-t border-green-900/30" />
      )}

      {noPremiados.length > 0 && (
        <div>
          {noPremiados.map((resultado, index) => (
            <div
              key={`${resultado.jugador.nombre}-${resultado.puesto}`}
              className={`flex items-start justify-between gap-4 py-2 ${
                index < noPremiados.length - 1
                  ? "border-b border-green-900/15"
                  : ""
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="w-8 shrink-0 text-center font-bold">
                  {medalla(resultado.puesto)}
                </span>

                <span className="font-semibold">
                  {resultado.jugador.nombre}
                </span>
              </div>

              <span className="shrink-0 text-right font-semibold">
                {formatearScore(resultado.score, par)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DetalleFecha() {
  const params = useParams();

  const [fecha, setFecha] = useState<FechaGuardada | null>(null);
const [canchas, setCanchas] = useState<Cancha[]>([]);

  useEffect(() => {
  setCanchas(obtenerCanchasGuardadas());

  const datos = localStorage.getItem(
    "laChangueadaHistorial"
  );

    if (!datos) return;

    const historial: FechaGuardada[] = JSON.parse(datos);

    const encontrada = historial.find(
      (fechaGuardada) =>
        fechaGuardada.id === Number(params.id)
    );

    if (encontrada) {
      setFecha(encontrada);
    }
  }, [params.id]);

  function obtenerNombreCancha() {
  if (!fecha?.cancha) return "";

  const canchaActual = canchas.find(
    (cancha) => cancha.id === fecha.cancha?.id
  );

  return canchaActual?.nombre ?? fecha.cancha.nombre;
}
  
  if (!fecha) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between gap-4 bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          {fecha.fecha}
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {fecha.cancha && (
        <div className="rounded-xl bg-white p-5 text-green-900">
          <p className="text-xl">
            <span className="font-bold">
              ⛳ {obtenerNombreCancha()}
            </span>

            <span className="ml-5 font-normal">
              Par {fecha.cancha.par}
            </span>
          </p>
        </div>
      )}

      {fecha.general.length > 0 && (
        <section className="mt-6 rounded-xl bg-white p-5 text-green-900">
          <h2 className="mb-2 text-2xl font-bold">
            General
          </h2>

          <TablaResultados
            resultados={fecha.general}
            par={fecha.cancha?.par}
          />
        </section>
      )}

      {fecha.viejitos.length > 0 && (
        <section className="mt-6 rounded-xl bg-white p-5 text-green-900">
          <h2 className="mb-2 text-2xl font-bold">
            Viejitos
          </h2>

          <TablaResultados
            resultados={fecha.viejitos}
            par={fecha.cancha?.par}
          />
        </section>
      )}
    </main>
  );
}