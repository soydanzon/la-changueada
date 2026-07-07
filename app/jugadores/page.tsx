"use client";

import { useEffect, useState } from "react";
import { jugadores, type Jugador } from "../datos/jugadores";

export default function Jugadores() {
  const [listaJugadores, setListaJugadores] = useState<Jugador[]>([]);

  useEffect(() => {
    const guardados = localStorage.getItem("laChangueadaJugadores");

    if (guardados) {
      setListaJugadores(JSON.parse(guardados));
    } else {
      setListaJugadores(jugadores);
      localStorage.setItem(
        "laChangueadaJugadores",
        JSON.stringify(jugadores)
      );
    }
  }, []);

  function guardarLista(nuevaLista: Jugador[]) {
    setListaJugadores(nuevaLista);
    localStorage.setItem(
      "laChangueadaJugadores",
      JSON.stringify(nuevaLista)
    );
  }

  function editarJugador(jugador: Jugador) {
    const nuevoNombre = prompt(
      "Editar nombre del jugador",
      jugador.nombre
    );

    if (!nuevoNombre) return;

    const nuevaLista = listaJugadores.map((j) =>
      j.id === jugador.id
        ? { ...j, nombre: nuevoNombre.trim() }
        : j
    );

    guardarLista(nuevaLista);
  }

  function cambiarFrecuente(jugador: Jugador) {
    const nuevaLista = listaJugadores.map((j) =>
      j.id === jugador.id
        ? { ...j, frecuente: !j.frecuente }
        : j
    );

    guardarLista(nuevaLista);
  }

  function eliminarJugador(jugador: Jugador) {
    if (!confirm(`¿Eliminar a ${jugador.nombre}?`)) return;

    guardarLista(
      listaJugadores.filter((j) => j.id !== jugador.id)
    );
  }

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold">
        Jugadores
      </h1>

      <a
        href="/jugadores/nuevo"
        className="inline-block mt-8 bg-white text-green-900 px-6 py-3 rounded-xl font-bold text-xl"
      >
        + Agregar jugador
      </a>

      <div className="mt-8 space-y-3">
        {listaJugadores.map((jugador) => (
          <div
            key={jugador.id}
            className="bg-white text-green-900 rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <span className="text-xl font-bold">
              {jugador.frecuente ? "⭐ " : ""}
              {jugador.nombre}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => cambiarFrecuente(jugador)}
                className="bg-yellow-500 text-white px-3 py-2 rounded-lg"
              >
                ⭐
              </button>

              <button
                onClick={() => editarJugador(jugador)}
                className="bg-yellow-300 text-black px-3 py-2 rounded-lg"
              >
                ✏️
              </button>

              <button
                onClick={() => eliminarJugador(jugador)}
                className="bg-red-600 text-white px-3 py-2 rounded-lg"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/"
        className="inline-block mt-8 bg-white text-green-900 px-4 py-2 rounded-lg font-bold"
      >
        ← Menú principal
      </a>
    </main>
  );
}