"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jugadores, type Jugador } from "../../datos/jugadores";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

export default function NuevoJugador() {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  function guardarJugador() {
    const nombreLimpio = nombre.trim();

    if (nombreLimpio === "") {
      setMensaje("⚠️ Escribí un nombre");
      return;
    }

    const guardados = localStorage.getItem("laChangueadaJugadores");

    const listaActual: Jugador[] = guardados
      ? JSON.parse(guardados)
      : jugadores;

    const existe = listaActual.some(
      (j) => j.nombre.toLowerCase() === nombreLimpio.toLowerCase()
    );

    if (existe) {
      setMensaje("⚠️ Ese jugador ya existe");
      return;
    }

    const nuevoJugador: Jugador = {
  id: Date.now(),
  nombre: nombreLimpio,
  frecuente: false,
};

    const nuevaLista = [...listaActual, nuevoJugador];

    localStorage.setItem(
      "laChangueadaJugadores",
      JSON.stringify(nuevaLista)
    );

    router.push("/jugadores");
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
         👤 Nuevo jugador
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <input
        type="text"
        placeholder="Nombre del jugador"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="mt-8 w-full rounded-lg bg-white p-4 text-xl text-black"
      />

      <button
        onClick={guardarJugador}
        className="mt-6 rounded-xl bg-white px-6 py-3 text-xl font-bold text-green-900"
      >
        Guardar
      </button>

      {mensaje && (
        <p className="mt-4 text-xl">
          {mensaje}
        </p>
      )}
    </main>
  );
}