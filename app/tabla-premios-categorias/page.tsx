"use client";

import { useEffect, useState } from "react";
import {
  guardarTablaPremiosCategorias,
  obtenerTablaPremiosCategorias,
  restaurarTablaPremiosCategorias,
  type TablaPremiosCategorias,
} from "../premios/tablaPremiosCategorias";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

const CANTIDADES_JUGADORES = Array.from(
  { length: 87 },
  (_, indice) => indice + 14
);

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function sumar(premios: number[]) {
  return premios.reduce(
    (total, premio) => total + premio,
    0
  );
}

function cantidadPremiosEsperada(
  jugadores: number
) {
  if (jugadores >= 40) return 5;
  if (jugadores >= 23) return 4;
  return 3;
}

export default function TablaPremiosCategoriasPage() {
  const [tabla, setTabla] =
    useState<TablaPremiosCategorias>({});
  const [valorChangueada, setValorChangueada] =
    useState(10000);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setTabla(obtenerTablaPremiosCategorias());

    const valorGuardado = localStorage.getItem(
      "laChangueadaValor"
    );

    if (valorGuardado) {
      setValorChangueada(Number(valorGuardado));
    }
  }, []);

  function cambiarPremio(
    jugadores: number,
    categoria: "a" | "b",
    indicePremio: number,
    valor: number
  ) {
    setTabla((actual) => {
      const fila = actual[jugadores];

      if (!fila) return actual;

      const premiosActualizados = [
        ...fila[categoria],
      ];

      premiosActualizados[indicePremio] = valor;

      return {
        ...actual,
        [jugadores]: {
          ...fila,
          [categoria]: premiosActualizados,
        },
      };
    });

    setMensaje("");
  }

  function guardar() {
    for (const jugadores of CANTIDADES_JUGADORES) {
      const fila = tabla[jugadores];

      if (!fila) {
        setMensaje(
          `⚠️ Falta la fila de ${jugadores} jugadores.`
        );
        return;
      }

      const cantidadEsperada =
        cantidadPremiosEsperada(jugadores);

      if (
        fila.a.length !== cantidadEsperada ||
        fila.b.length !== cantidadEsperada
      ) {
        setMensaje(
          `⚠️ La fila de ${jugadores} jugadores debe tener ${cantidadEsperada} premios en A y ${cantidadEsperada} en B.`
        );
        return;
      }

      const premios = [...fila.a, ...fila.b];

      const premioInvalido = premios.some(
        (premio) =>
          !Number.isFinite(premio) ||
          premio < 0 ||
          premio % 5000 !== 0
      );

      if (premioInvalido) {
        setMensaje(
          `⚠️ Todos los premios de la fila de ${jugadores} jugadores deben ser múltiplos de $5.000.`
        );
        return;
      }

      const totalFila =
        sumar(fila.a) + sumar(fila.b);

      const totalEsperado =
        jugadores * valorChangueada;

      if (totalFila !== totalEsperado) {
        setMensaje(
          `⚠️ La fila de ${jugadores} jugadores debe sumar ${formatearPesos(
            totalEsperado
          )}. Actualmente suma ${formatearPesos(
            totalFila
          )}.`
        );
        return;
      }
    }

    guardarTablaPremiosCategorias(tabla);
    setMensaje("✅ Tabla 55/45 guardada");
  }

  function restaurar() {
    if (
      !confirm(
        "¿Restaurar la tabla A/B 55/45 original?"
      )
    ) {
      return;
    }

    restaurarTablaPremiosCategorias();
    setTabla(obtenerTablaPremiosCategorias());
    setMensaje("✅ Tabla 55/45 original restaurada");
  }

  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-start justify-between gap-4 bg-green-900 px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              🅰️🅱️
            </span>

            <h1 className="text-3xl font-black">
              Tabla A/B
            </h1>
          </div>

          <p className="mt-2 font-bold text-green-200">
            Distribución 55% A — 45% B
          </p>
        </div>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <p className="mb-4 text-sm text-green-100">
        Cada fila debe sumar el pozo completo. Los
        premios se modifican en múltiplos de $5.000.
      </p>

      <div className="space-y-4">
        {CANTIDADES_JUGADORES.map((jugadores) => {
          const fila = tabla[jugadores];

          if (!fila) return null;

          const totalA = sumar(fila.a);
          const totalB = sumar(fila.b);
          const totalFila = totalA + totalB;
          const totalEsperado =
            jugadores * valorChangueada;
          const totalCorrecto =
            totalFila === totalEsperado;

          return (
            <section
              key={jugadores}
              className="rounded-2xl bg-white p-4 text-green-950"
            >
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <h2 className="text-xl font-black">
                  {jugadores} jugadores
                </h2>

                <span
                  className={`font-bold ${
                    totalCorrecto
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  Total: {formatearPesos(totalFila)}
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-black">
                    🅰️ Categoría A
                  </h3>

                  <span className="font-bold">
                    {formatearPesos(totalA)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {fila.a.map(
                    (premio, indicePremio) => (
                      <label
                        key={indicePremio}
                        className="text-sm font-bold"
                      >
                        {indicePremio + 1}° premio

                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={premio}
                          onChange={(evento) =>
                            cambiarPremio(
                              jugadores,
                              "a",
                              indicePremio,
                              Number(
                                evento.target.value
                              )
                            )
                          }
                          className="mt-1 w-full rounded-lg border p-2 text-right text-black"
                        />
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-black">
                    🅱️ Categoría B
                  </h3>

                  <span className="font-bold">
                    {formatearPesos(totalB)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {fila.b.map(
                    (premio, indicePremio) => (
                      <label
                        key={indicePremio}
                        className="text-sm font-bold"
                      >
                        {indicePremio + 1}° premio

                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={premio}
                          onChange={(evento) =>
                            cambiarPremio(
                              jugadores,
                              "b",
                              indicePremio,
                              Number(
                                evento.target.value
                              )
                            )
                          }
                          className="mt-1 w-full rounded-lg border p-2 text-right font-bold text-black"
                        />
                      </label>
                    )
                  )}
                </div>
              </div>

              {!totalCorrecto && (
                <p className="mt-3 font-bold text-red-600">
                  Debe sumar{" "}
                  {formatearPesos(totalEsperado)}.
                </p>
              )}
            </section>
          );
        })}
      </div>

      <button
        onClick={guardar}
        className="mt-6 w-full rounded-xl bg-white p-4 text-xl font-black text-green-950"
      >
        💾 Guardar tabla 55/45
      </button>

      <button
        onClick={restaurar}
        className="mt-3 w-full rounded-xl bg-red-600 p-4 font-bold text-white"
      >
        Restaurar tabla original
      </button>

      {mensaje && (
        <p className="mt-4 text-xl font-bold">
          {mensaje}
        </p>
      )}
    </main>
  );
}