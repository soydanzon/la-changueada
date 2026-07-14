"use client";

import { useEffect, useState } from "react";
import { jugadores, type Jugador } from "../datos/jugadores";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

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

  const jugadoresOrdenados = [...listaJugadores].sort((a, b) =>
  a.nombre.localeCompare(b.nombre)
);

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          👤 Jugadores
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <a
        href="/jugadores/nuevo"
        className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-xl font-bold text-green-900"
      >
        + Agregar jugador
      </a>

      <div className="mt-8 space-y-3">
        {jugadoresOrdenados.map((jugador) => (
          <div
  key={jugador.id}
  className="rounded-lg bg-white p-4 text-green-900"
>
  <div className="text-xl font-bold">
    {jugador.frecuente ? "⭐ " : ""}
    {jugador.nombre}
  </div>

  <div className="mt-3 flex justify-end gap-3">
    <button
      onClick={() => cambiarFrecuente(jugador)}
      className="h-12 w-12 rounded-lg bg-yellow-500 text-xl text-white"
    >
      ⭐
    </button>

    <button
      onClick={() => editarJugador(jugador)}
      className="h-12 w-12 rounded-lg bg-yellow-300 text-xl text-black"
    >
      ✏️
    </button>

    <button
      onClick={() => eliminarJugador(jugador)}
      className="h-12 w-12 rounded-lg bg-red-600 text-xl text-white"
    >
      🗑️
    </button>
  </div>
</div>
        ))}
      </div>
    </main>
  );
}