"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../../datos/canchas";

export default function EditarCancha() {
  const params = useParams();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [par, setPar] = useState("");

  useEffect(() => {
    const canchas = obtenerCanchasGuardadas();
    const cancha = canchas.find((c) => c.id === Number(params.id));

    if (!cancha) return;

    setNombre(cancha.nombre);
    setPar(String(cancha.par));
  }, [params.id]);

  function guardar() {
    const canchas = obtenerCanchasGuardadas();

    const nuevasCanchas: Cancha[] = canchas.map((cancha) =>
      cancha.id === Number(params.id)
        ? {
            ...cancha,
            nombre: nombre.trim(),
            par: Number(par),
          }
        : cancha
    );

    localStorage.setItem(
      "laChangueadaCanchas",
      JSON.stringify(nuevasCanchas)
    );

    router.push("/canchas");
  }

  return (
    <main className="min-h-screen bg-green-950 text-white p-6">
      <h1 className="text-4xl font-black mb-8">
        ✏️ Editar cancha
      </h1>

      <label className="font-bold">
        Nombre
      </label>

      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="mt-2 mb-6 w-full rounded-xl p-4 text-black text-xl"
      />

      <label className="font-bold">
        E Par
      </label>

      <input
        type="number"
        value={par}
        onChange={(e) => setPar(e.target.value)}
        className="mt-2 w-full rounded-xl p-4 text-black text-xl"
      />

      <button
        onClick={guardar}
        className="mt-8 w-full bg-white text-green-950 rounded-2xl p-4 font-black"
      >
        💾 Guardar cambios
      </button>

      <a
        href="/canchas"
        className="block mt-6 bg-white text-green-950 rounded-2xl p-4 text-center font-black"
      >
        ← Volver
      </a>
    </main>
  );
}