"use client";

import { useEffect, useState } from "react";
import {
  guardarTablaPremios,
  obtenerTablaPremios,
  tablaPremiosOriginal,
  type FilaPremios,
} from "../../premios/tablaPremios";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

function totalFila(fila: FilaPremios) {
  return fila.premios.reduce(
    (total, premio) => total + premio,
    0
  );
}

export default function TablaPremios() {
  const [tabla, setTabla] = useState<FilaPremios[]>([]);
  const [cantidadPremios, setCantidadPremios] = useState(5);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const guardada = obtenerTablaPremios();

    setTabla(guardada);

    const mayorCantidad = Math.max(
      5,
      ...guardada.map((fila) => fila.premios.length)
    );

    setCantidadPremios(mayorCantidad);
  }, []);

  function cambiarJugadores(
    indiceFila: number,
    valor: number
  ) {
    setTabla((actual) =>
      actual.map((fila, indice) =>
        indice === indiceFila
          ? { ...fila, jugadores: valor }
          : fila
      )
    );

    setMensaje("");
  }

  function cambiarPremio(
    indiceFila: number,
    indicePremio: number,
    valor: number
  ) {
    setTabla((actual) =>
      actual.map((fila, indice) => {
        if (indice !== indiceFila) return fila;

        const premios = Array.from(
          { length: cantidadPremios },
          (_, posicion) => fila.premios[posicion] ?? 0
        );

        premios[indicePremio] = valor;

        return {
          ...fila,
          premios,
        };
      })
    );

    setMensaje("");
  }

  function agregarFila() {
    const mayorCantidad =
      tabla.length > 0
        ? Math.max(...tabla.map((fila) => fila.jugadores))
        : 5;

    setTabla((actual) => [
      ...actual,
      {
        jugadores: mayorCantidad + 1,
        premios: Array(cantidadPremios).fill(0),
      },
    ]);

    setMensaje("");
  }

  function eliminarFila(indiceFila: number) {
    if (!confirm("¿Eliminar esta fila de premios?")) {
      return;
    }

    setTabla((actual) =>
      actual.filter((_, indice) => indice !== indiceFila)
    );

    setMensaje("");
  }

  function agregarPremio() {
    setCantidadPremios((actual) => actual + 1);

    setTabla((actual) =>
      actual.map((fila) => ({
        ...fila,
        premios: [...fila.premios, 0],
      }))
    );

    setMensaje("");
  }

  function quitarPremio() {
    if (cantidadPremios <= 1) return;

    if (
      !confirm(
        "¿Eliminar el último puesto de todas las filas?"
      )
    ) {
      return;
    }

    setCantidadPremios((actual) => actual - 1);

    setTabla((actual) =>
      actual.map((fila) => ({
        ...fila,
        premios: fila.premios.slice(
          0,
          cantidadPremios - 1
        ),
      }))
    );

    setMensaje("");
  }

  function guardar() {
    const cantidades = tabla.map(
      (fila) => fila.jugadores
    );

    const cantidadesUnicas = new Set(cantidades);

    if (cantidadesUnicas.size !== cantidades.length) {
      setMensaje(
        "⚠️ Hay cantidades de jugadores repetidas."
      );
      return;
    }

    const valorGuardado = localStorage.getItem("laChangueadaValor");

const valorChangueada = valorGuardado
  ? Number(valorGuardado)
  : 10000;
    const filaConTotalIncorrecto = tabla.find(
  (fila) =>
    totalFila(fila) !==
    fila.jugadores * valorChangueada
);

if (filaConTotalIncorrecto) {
  setMensaje(
    `⚠️ La fila de ${filaConTotalIncorrecto.jugadores} jugadores debe sumar $${(
      filaConTotalIncorrecto.jugadores * valorChangueada
    ).toLocaleString("es-AR")}.`
  );
  return;
}

    const tablaOrdenada = [...tabla]
      .map((fila) => ({
        jugadores: fila.jugadores,
        premios: fila.premios.map((premio) =>
          Number(premio)
        ),
      }))
      .sort((a, b) => a.jugadores - b.jugadores);

    guardarTablaPremios(tablaOrdenada);
    setTabla(tablaOrdenada);
    setMensaje("✅ Tabla de premios guardada");
  }

  function restaurar() {
    if (
      !confirm(
        "¿Restaurar la tabla de premios original?"
      )
    ) {
      return;
    }

    localStorage.removeItem(
      "laChangueadaTablaPremios"
    );

    setTabla(tablaPremiosOriginal);
    setCantidadPremios(5);
    setMensaje("✅ Tabla original restaurada");
  }

  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
  <div className="flex items-center gap-3">
    <span className="text-4xl">
      🏆
    </span>

    <h1 className="text-4xl font-black">
      Tabla de Premios
    </h1>
  </div>

  <p className="mt-2 font-bold text-green-200">
    La Changueada
  </p>
</div>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <button
          onClick={agregarFila}
          className="rounded-xl bg-white px-4 py-3 font-bold text-green-950"
        >
          ➕ Agregar fila
        </button>

        <button
          onClick={agregarPremio}
          className="rounded-xl bg-white px-4 py-3 font-bold text-green-950"
        >
          ➕ Agregar puesto
        </button>

        <button
          onClick={quitarPremio}
          className="rounded-xl bg-white px-4 py-3 font-bold text-green-950"
        >
          ➖ Quitar puesto
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white p-4 text-green-900 shadow-2xl">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-3">
                Jug.
              </th>

              {Array.from(
                { length: cantidadPremios },
                (_, indice) => (
                  <th
                    key={indice}
                    className="px-2 py-3"
                  >
                    {indice + 1}°
                  </th>
                )
              )}

              <th className="px-2 py-3">
                Total
              </th>

              <th className="px-2 py-3">
                Borrar
              </th>
            </tr>
          </thead>

          <tbody>
            {tabla.map((fila, indiceFila) => (
              <tr
                key={`${fila.jugadores}-${indiceFila}`}
                className={`border-b ${
                  indiceFila % 2 === 0
                    ? "bg-green-50"
                    : "bg-white"
                }`}
              >
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min="1"
                    value={fila.jugadores}
                    onChange={(evento) =>
                      cambiarJugadores(
                        indiceFila,
                        Number(evento.target.value)
                      )
                    }
                    className="w-20 rounded-lg border bg-white p-2 text-center font-bold text-black"
                  />
                </td>

                {Array.from(
                  { length: cantidadPremios },
                  (_, indicePremio) => (
                    <td
                      key={indicePremio}
                      className="px-2 py-2"
                    >
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={
                          fila.premios[indicePremio] ?? 0
                        }
                        onChange={(evento) =>
                          cambiarPremio(
                            indiceFila,
                            indicePremio,
                            Number(evento.target.value)
                          )
                        }
                        className="w-28 rounded-lg border bg-white p-2 text-right font-bold text-black"
                      />
                    </td>
                  )
                )}

                <td className="whitespace-nowrap px-2 py-2 font-bold">
                  ${totalFila(fila).toLocaleString(
                    "es-AR"
                  )}
                </td>

                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() =>
                      eliminarFila(indiceFila)
                    }
                    className="rounded-lg bg-red-600 px-3 py-2 text-white"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={guardar}
        className="mt-6 w-full rounded-xl bg-white p-4 text-xl font-black text-green-950"
      >
        💾 Guardar tabla
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