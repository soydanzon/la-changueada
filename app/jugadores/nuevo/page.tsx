"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Jugador } from "../../datos/jugadores";
import { createClient } from "../../lib/supabase/client";
import { normalizarTexto } from "../../utils/texto";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

export default function NuevoJugador() {
  const [nombre, setNombre] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);

  const router = useRouter();

  function volverAlOrigen() {
    const origen = localStorage.getItem(
      "laChangueadaOrigenNuevoJugador"
    );

    if (origen) {
      const rutaCorrecta =
        origen.startsWith("/")
          ? origen
          : `/${origen}`;

      router.push(rutaCorrecta);
      return;
    }

    router.push("/jugadores");
  }

  async function guardarJugador() {
    if (guardando) {
      return;
    }

    const nombreLimpio =
      nombre.trim();

    if (nombreLimpio === "") {
      setMensaje(
        "⚠️ Escribí un nombre"
      );
      return;
    }

    setGuardando(true);
    setMensaje("");

    const supabase = createClient();

    const {
      data,
      error: errorConsulta,
    } = await supabase
      .from("jugadores")
      .select("id, nombre, frecuente")
      .order("nombre");

    if (errorConsulta) {
      console.error(
        "No se pudo revisar la lista:",
        errorConsulta
      );

      setMensaje(
        "⚠️ No se pudo revisar la lista de jugadores."
      );

      setGuardando(false);
      return;
    }

    const listaActual: Jugador[] = (
      data ?? []
    ).map(
      (jugador: {
        id: number;
        nombre: string;
        frecuente: boolean | null;
      }) => ({
        id: Number(jugador.id),
        nombre: jugador.nombre,
        frecuente: Boolean(
          jugador.frecuente
        ),
      })
    );

    const jugadorExistente =
      listaActual.find(
        (jugador) =>
          normalizarTexto(
            jugador.nombre
          ) ===
          normalizarTexto(
            nombreLimpio
          )
      );

    if (jugadorExistente) {
      const crearIgual =
        window.confirm(
          `⚠️ Ya existe un jugador llamado "${jugadorExistente.nombre}".\n\n¿Estás seguro de que querés crear otro jugador con el mismo nombre?`
        );

      if (!crearIgual) {
        setMensaje(
          "No se agregó el jugador duplicado."
        );

        setGuardando(false);
        return;
      }
    }

    const nuevoJugador: Jugador = {
      id: Date.now(),
      nombre: nombreLimpio,
      frecuente: false,
    };

    const { error } = await supabase
      .from("jugadores")
      .insert({
        id: nuevoJugador.id,
        nombre: nuevoJugador.nombre,
        frecuente:
          nuevoJugador.frecuente,
      });

    if (error) {
      console.error(
        "No se pudo guardar el jugador:",
        error
      );

      setMensaje(
        "⚠️ No se pudo guardar el jugador."
      );

      setGuardando(false);
      return;
    }

    localStorage.setItem(
      "laChangueadaJugadores",
      JSON.stringify([
        ...listaActual,
        nuevoJugador,
      ])
    );

    const origen =
      localStorage.getItem(
        "laChangueadaOrigenNuevoJugador"
      );

    if (
      origen?.includes(
        "/categorias"
      ) ||
      origen?.includes("/edad")
    ) {
      localStorage.setItem(
        "laChangueadaJugadorRecienCreado",
        String(nuevoJugador.id)
      );
    } else {
      localStorage.removeItem(
        "laChangueadaJugadorRecienCreado"
      );
    }

    volverAlOrigen();
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          🍬 Agregar jugador
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
        disabled={guardando}
        onChange={(evento) => {
          setNombre(
            evento.target.value
          );
          setMensaje("");
        }}
        onKeyDown={(evento) => {
          if (
            evento.key === "Enter"
          ) {
            guardarJugador();
          }
        }}
        className="mt-8 w-full rounded-lg bg-white p-4 text-xl text-black disabled:bg-gray-200"
      />

      <button
        type="button"
        disabled={guardando}
        onClick={guardarJugador}
        className="mt-6 rounded-xl bg-white px-6 py-3 text-xl font-bold text-green-900 disabled:bg-gray-300"
      >
        {guardando
          ? "☁️ Guardando..."
          : "Guardar"}
      </button>

      {mensaje && (
        <p className="mt-4 text-xl">
          {mensaje}
        </p>
      )}
    </main>
  );
}