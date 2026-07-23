"use client";

import { useRouter } from "next/navigation";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

export default function ElegirFormatoFecha() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          📝 Nueva Fecha
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 text-green-900">
        <h2 className="text-center text-2xl font-black">
          ¿Cómo se va a jugar?
        </h2>

        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={() =>
              router.push("/nueva-fecha/categorias")
            }
            className="w-full rounded-2xl bg-green-600 p-5 text-left text-white"
          >
            <p className="text-2xl font-black">
              🅰️🅱️ Por categorías
            </p>

            <p className="mt-1 text-lg">
              Categoría A y Categoría B
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/nueva-fecha/edad")
            }
            className="w-full rounded-2xl bg-blue-600 p-5 text-left text-white"
          >
            <p className="text-2xl font-black">
              🙎🏻‍♂️🧓🏻 Por edad
            </p>

            <p className="mt-1 text-lg">
              General y Viejitos
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}