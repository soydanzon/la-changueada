"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  obtenerCanchasGuardadas,
  type Cancha,
} from "../../datos/canchas";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

export default function EditarCancha() {
  const params = useParams();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [par, setPar] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const canchas = obtenerCanchasGuardadas();

    const cancha = canchas.find(
      (c) => c.id === Number(params.id)
    );

    if (!cancha) return;

    setNombre(cancha.nombre);
    setPar(String(cancha.par));
  }, [params.id]);

  function guardar() {
    if (!nombre.trim() || !par) {
      setMensaje("⚠️ Completá nombre y par.");
      return;
    }

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
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black">
          ✏️ Editar cancha
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <label className="font-bold">
        Nombre
      </label>

      <input
        type="text"
        value={nombre}
        onChange={(e) => {
          setNombre(e.target.value);
          setMensaje("");
        }}
        className="mt-2 mb-6 w-full rounded-xl bg-white p-4 text-xl text-black"
      />

      <label className="font-bold">
        E Par
      </label>

      <input
        type="number"
        inputMode="numeric"
        value={par}
        onChange={(e) => {
          setPar(e.target.value);
          setMensaje("");
        }}
        className="mt-2 w-full rounded-xl bg-white p-4 text-xl text-black"
      />

      <button
        onClick={guardar}
        className="mt-8 w-full rounded-2xl bg-white p-4 font-black text-green-950"
      >
        💾 Guardar cambios
      </button>

      {mensaje && (
        <p className="mt-4 text-xl">
          {mensaje}
        </p>
      )}
    </main>
  );
}