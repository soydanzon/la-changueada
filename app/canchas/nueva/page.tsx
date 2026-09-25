"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Cancha } from "../../datos/canchas";
import { createClient } from "../../lib/supabase/client";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

export default function NuevaCancha() {
  const router = useRouter();

  const [nombre, setNombre] =
    useState("");

  const [par, setPar] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);

  async function guardar() {
    if (guardando) {
      return;
    }

    if (
      !nombre.trim() ||
      !par
    ) {
      setMensaje(
        "⚠️ Completá nombre y par."
      );
      return;
    }

    const parNumero = Number(par);

    if (
      !Number.isFinite(parNumero) ||
      parNumero <= 0
    ) {
      setMensaje(
        "⚠️ Escribí un par válido."
      );
      return;
    }

    setGuardando(true);
    setMensaje("");

    const nuevaCancha: Cancha = {
      id: Date.now(),
      nombre: nombre.trim(),
      par: parNumero,
      activa: true,
    };

    const supabase = createClient();

    const { error } = await supabase
      .from("canchas")
      .insert({
        id: nuevaCancha.id,
        nombre: nuevaCancha.nombre,
        par: nuevaCancha.par,
        activa: nuevaCancha.activa,
      });

    if (error) {
      console.error(
        "No se pudo guardar la cancha:",
        error
      );

      setMensaje(
        "⚠️ No se pudo guardar la cancha."
      );

      setGuardando(false);
      return;
    }

    const {
      data: canchasActualizadas,
      error: errorActualizacion,
    } = await supabase
      .from("canchas")
      .select(
        "id, nombre, par, activa"
      )
      .order("nombre");

    if (
      !errorActualizacion &&
      canchasActualizadas
    ) {
      const copiaLocal: Cancha[] =
        canchasActualizadas.map(
          (cancha: {
            id: number;
            nombre: string;
            par: number;
            activa:
              | boolean
              | null;
          }) => ({
            id: Number(cancha.id),
            nombre: cancha.nombre,
            par: Number(cancha.par),
            activa: Boolean(
              cancha.activa
            ),
          })
        );

      localStorage.setItem(
        "laChangueadaCanchas",
        JSON.stringify(copiaLocal)
      );
    }

    router.push("/canchas");
  }

  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black">
          ⛳ Nueva cancha
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
        disabled={guardando}
        onChange={(evento) => {
          setNombre(
            evento.target.value
          );
          setMensaje("");
        }}
        className="mb-6 mt-2 w-full rounded-xl bg-white p-4 text-xl text-black disabled:bg-gray-200"
        placeholder="Ej. Los Álamos"
      />

      <label className="font-bold">
        Par
      </label>

      <input
        type="number"
        inputMode="numeric"
        value={par}
        disabled={guardando}
        onChange={(evento) => {
          setPar(
            evento.target.value
          );
          setMensaje("");
        }}
        className="mt-2 w-full rounded-xl bg-white p-4 text-xl text-black disabled:bg-gray-200"
        placeholder="69"
      />

      <button
        type="button"
        disabled={guardando}
        onClick={guardar}
        className="mt-8 w-full rounded-2xl bg-white p-4 font-black text-green-950 disabled:bg-gray-300"
      >
        {guardando
          ? "☁️ Guardando..."
          : "💾 Guardar"}
      </button>

      {mensaje && (
        <p className="mt-4 text-xl">
          {mensaje}
        </p>
      )}
    </main>
  );
}