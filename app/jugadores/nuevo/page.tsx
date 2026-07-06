"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jugadores, type Jugador } from "../../datos/jugadores";

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
    };

    const nuevaLista = [...listaActual, nuevoJugador];

    localStorage.setItem(
      "laChangueadaJugadores",
      JSON.stringify(nuevaLista)
    );

    router.push("/jugadores");
  }

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold">
        Nuevo jugador
      </h1>

      <input
        type="text"
        placeholder="Nombre del jugador"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="mt-8 w-full rounded-lg p-4 text-black text-xl"
      />

      <button
        onClick={guardarJugador}
        className="mt-6 bg-white text-green-900 px-6 py-3 rounded-xl font-bold text-xl"
      >
        Guardar
      </button>

      <p className="mt-4 text-xl">
        {mensaje}
      </p>

      <a
        href="/jugadores"
        className="inline-block mt-6 bg-white text-green-900 px-4 py-2 rounded-lg font-bold"
      >
        ← Volver
      </a>
    </main>
  );
}