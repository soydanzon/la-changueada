"use client";

import { useEffect, useState } from "react";
import {
  obtenerTablaPremios,
  type FilaPremios,
} from "../premios/tablaPremios";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function TablaPremios() {
  const [tabla, setTabla] = useState<FilaPremios[]>([]);

  useEffect(() => {
    setTabla(obtenerTablaPremios());
  }, []);

  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>

            <h1 className="text-3xl font-black">
              Tabla de Premios
            </h1>
          </div>

          <p className="mt-2 text-green-200">
  Tabla oficial de premios vigente
</p>
        </div>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white p-4 text-green-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-3">Jug.</th>
              <th className="px-2">🥇</th>
              <th className="px-2">🥈</th>
              <th className="px-2">🥉</th>
              <th className="px-2">4°</th>
              <th className="px-2">5°</th>
            </tr>
          </thead>

          <tbody>
            {tabla.map((fila, index) => (
              <tr
                key={fila.jugadores}
                className={`border-b ${
                  index % 2 === 0
                    ? "bg-green-50"
                    : "bg-white"
                }`}
              >
                <td className="px-2 py-3 font-black">
                  {fila.jugadores}
                </td>

                {[0, 1, 2, 3, 4].map((i) => (
                  <td
                    key={i}
                    className="px-2 font-bold"
                  >
                    {fila.premios[i]
                      ? formatearPesos(fila.premios[i])
                      : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a
        href="/tabla-premios/editar"
        className="mt-6 block w-full rounded-xl bg-white p-4 text-center font-bold text-green-900"
      >
        ✏️ Editar tabla
      </a>

      <a
  href="/tabla-premios/compartir"
  className="mt-3 block w-full rounded-xl bg-blue-600 p-4 text-center font-bold text-white"
>
  📤 Compartir tabla
</a>

    </main>
  );
}