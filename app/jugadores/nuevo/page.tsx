"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  jugadores,
  type Jugador,
} from "../../datos/jugadores";
import { normalizarTexto } from "../../utils/texto";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

export default function NuevoJugador() {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  function volverAlOrigen() {
  const origen = localStorage.getItem(
    "laChangueadaOrigenNuevoJugador"
  );

  const vieneDeCategorias = localStorage.getItem(
    "laChangueadaNuevaFechaCategoriasBorrador"
  );

  const vieneDeEdad = localStorage.getItem(
    "laChangueadaNuevaFechaBorrador"
  );

  localStorage.removeItem(
    "laChangueadaOrigenNuevoJugador"
  );

  if (vieneDeCategorias) {
    router.push("/nueva-fecha/categorias");
    return;
  }

  if (vieneDeEdad) {
    router.push("/nueva-fecha/edad");
    return;
  }

  if (origen) {
    const rutaCorrecta = origen.startsWith("/")
      ? origen
      : `/${origen}`;

    router.push(rutaCorrecta);
    return;
  }

  router.push("/jugadores");
}

  function guardarJugador() {
    const nombreLimpio = nombre.trim();

    if (nombreLimpio === "") {
      setMensaje("⚠️ Escribí un nombre");
      return;
    }

    const guardados = localStorage.getItem(
      "laChangueadaJugadores"
    );

    const listaActual: Jugador[] = guardados
      ? JSON.parse(guardados)
      : jugadores;

    const jugadorExistente = listaActual.find(
      (jugador) =>
        normalizarTexto(jugador.nombre) ===
        normalizarTexto(nombreLimpio)
    );

    if (jugadorExistente) {
      const crearIgual = window.confirm(
        `⚠️ Ya existe un jugador llamado "${jugadorExistente.nombre}".\n\n¿Estás seguro de que querés crear otro jugador con el mismo nombre?`
      );

      if (!crearIgual) {
        setMensaje(
          "No se agregó el jugador duplicado."
        );
        return;
      }
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

const origen = localStorage.getItem(
  "laChangueadaOrigenNuevoJugador"
);

if (origen?.includes("/categorias")) {
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
        onChange={(evento) => {
          setNombre(evento.target.value);
          setMensaje("");
        }}
        onKeyDown={(evento) => {
          if (evento.key === "Enter") {
            guardarJugador();
          }
        }}
        className="mt-8 w-full rounded-lg bg-white p-4 text-xl text-black"
      />

      <button
        type="button"
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