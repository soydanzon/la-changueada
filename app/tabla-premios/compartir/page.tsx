"use client";

import { useEffect, useState } from "react";
import {
  obtenerTablaPremios,
  type FilaPremios,
} from "../../premios/tablaPremios";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function CompartirTablaPremios() {
  const [tabla, setTabla] = useState<FilaPremios[]>([]);
  const [valorChangueada, setValorChangueada] = useState(10000);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setTabla(obtenerTablaPremios());

    const valorGuardado = localStorage.getItem(
      "laChangueadaValor"
    );

    if (valorGuardado) {
      setValorChangueada(Number(valorGuardado));
    }
  }, []);

  function generarTexto() {
    const filas = tabla
      .map((fila) => {
        const premios = fila.premios
          .map((premio, index) =>
            premio > 0
              ? `${index + 1}° ${formatearPesos(premio)}`
              : null
          )
          .filter(Boolean)
          .join(" · ");

        return `${fila.jugadores} jugadores: ${premios}`;
      })
      .join("\n");

    return `🏆 LA CHANGUEADA
FOOTGOLF

TABLA DE PREMIOS

Valor por jugador: ${formatearPesos(valorChangueada)}

${filas}`;
  }

  async function compartirTabla() {
    const texto = generarTexto();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Tabla de premios - La Changueada",
          text: texto,
        });

        setMensaje("✅ Tabla compartida");
        return;
      }

      await navigator.clipboard.writeText(texto);
      setMensaje("✅ Tabla copiada");
    } catch {
      setMensaje("");
    }
  }

  return (
    <main className="min-h-screen bg-green-950 p-4 text-black">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end gap-2">
        <BotonVolver />
        <BotonInicio />
      </div>

      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="rounded-2xl bg-green-900 p-6 text-center text-white">
          <h1 className="text-2xl font-black text-white">
  ⚽ La Changueada 🚩
</h1>

<p className="mt-1 text-sm font-semibold tracking-[0.25em] text-green-200">
  FOOTGOLF
</p>

          <p className="mt-3 text-xl font-bold">
            🏆 Tabla de Premios
          </p>

          <p className="mt-2">
            Valor por jugador:{" "}
            <strong>
              {formatearPesos(valorChangueada)}
            </strong>
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-max text-sm text-green-950">
            <thead>
              <tr className="border-b text-left">
                <th className="px-2 py-3">Jug.</th>
                <th className="px-2 py-3">🥇</th>
                <th className="px-2 py-3">🥈</th>
                <th className="px-2 py-3">🥉</th>
                <th className="px-2 py-3">4°</th>
                <th className="px-2 py-3">5°</th>
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

                  {[0, 1, 2, 3, 4].map((puesto) => (
                    <td
                      key={puesto}
                      className="whitespace-nowrap px-2 py-3 font-bold"
                    >
                      {fila.premios[puesto]
                        ? formatearPesos(
                            fila.premios[puesto]
                          )
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={compartirTabla}
        className="mx-auto mt-6 block w-full max-w-3xl rounded-xl bg-white p-4 text-xl font-black text-green-900"
      >
        📤 Compartir tabla
      </button>

      {mensaje && (
        <p className="mt-4 text-center font-bold text-white">
          {mensaje}
        </p>
      )}
    </main>
  );
}