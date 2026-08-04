"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

export default function ElegirFormatoFecha() {
  const router = useRouter();

  const [confirmandoReset, setConfirmandoReset] =
    useState(false);

  function resetearFecha() {
    localStorage.removeItem(
      "laChangueadaFechaActual"
    );
    localStorage.removeItem(
      "laChangueadaScores"
    );
    localStorage.removeItem(
      "laChangueadaFechaYaGuardada"
    );
    localStorage.removeItem(
      "laChangueadaNuevaFechaCategoriasBorrador"
    );
    localStorage.removeItem(
      "laChangueadaNuevaFechaCategoriasBorradorBackup"
    );
    localStorage.removeItem(
      "laChangueadaNuevaFechaBorrador"
    );
    localStorage.removeItem(
      "laChangueadaNuevaFechaBorradorBackup"
    );

    router.push("/");
  }

  return (
    <main className="flex min-h-screen flex-col bg-green-900 p-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          📝 Nueva Fecha
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 flex flex-col justify-center space-y-8 -mt-12">
          <div className="rounded-2xl bg-white p-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/nueva-fecha/categorias"
                )
              }
              className="min-h-36 w-full rounded-2xl bg-green-600 px-5 py-14 text-left text-white"
            >
              <p className="text-2xl font-black">
                🅰️ 🅱️ Por categorías
              </p>

              <p className="mt-3 text-xl">
                Categorías A y B
              </p>
            </button>
          </div>

          <div className="rounded-2xl bg-white p-3">
            <button
              type="button"
              onClick={() =>
                router.push("/nueva-fecha/edad")
              }
              className="min-h-36 w-full rounded-2xl bg-blue-600 px-5 py-14 text-left text-white"
            >
              <p className="text-2xl font-black">
                🙎🏻‍♂️ 🧓🏻 Por edad
              </p>

              <p className="mt-3 text-xl">
                General y Viejitos
              </p>
            </button>
          </div>
        </div>

        {!confirmandoReset ? (
          <button
            type="button"
            onClick={() =>
              setConfirmandoReset(true)
            }
            className="mt-auto w-full rounded-2xl bg-green-700 py-3 text-xl font-semibold text-white"
          >
            🗑️ Resetear fecha actual
          </button>
        ) : (
          <div className="mt-auto rounded-2xl bg-white p-5 text-center text-green-900">
            <p className="text-xl font-bold">
              ¿Querés borrar la fecha en curso?
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={resetearFecha}
                className="flex-1 rounded-xl bg-red-700 p-4 text-xl font-bold text-white"
              >
                ✅ Sí
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfirmandoReset(false)
                }
                className="flex-1 rounded-xl bg-gray-500 p-4 text-xl font-bold text-white"
              >
                ❌ No
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}