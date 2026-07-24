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

      <div className="space-y-10">
  <div className="rounded-2xl bg-white p-3 mt-12">
    <button
      type="button"
      onClick={() =>
        router.push("/nueva-fecha/categorias")
      }
      className="w-full rounded-2xl bg-green-600 p-7 text-left text-white"
    >
      <p className="text-2xl font-black">
        🅰️ 🅱️ Por categorías
      </p>

      <p className="mt-2 text-xl">
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
      className="w-full rounded-2xl bg-blue-600 p-7 text-left text-white"
    >
      <p className="text-2xl font-black">
        🙎🏻‍♂️ 🧓🏻 Por edad
      </p>

      <p className="mt-2 text-xl">
        General y Viejitos
      </p>
    </button>
  </div>
</div>
    </main>
  );
}