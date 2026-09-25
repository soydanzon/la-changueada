"use client";

import {
  useEffect,
  useState,
} from "react";
import { type Jugador } from "../datos/jugadores";
import { createClient } from "../lib/supabase/client";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

export default function Jugadores() {
  const [listaJugadores, setListaJugadores] =
    useState<Jugador[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    async function cargarJugadores() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("jugadores")
        .select("id, nombre, frecuente")
        .order("nombre");

      if (error) {
        console.error(
          "No se pudieron cargar los jugadores:",
          error
        );

        setMensaje(
          "⚠️ No se pudieron cargar los jugadores."
        );

        setCargando(false);
        return;
      }

      const jugadoresNube: Jugador[] = (
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

      setListaJugadores(jugadoresNube);

      localStorage.setItem(
        "laChangueadaJugadores",
        JSON.stringify(jugadoresNube)
      );

      setCargando(false);
    }

    cargarJugadores();
  }, []);

  function actualizarListaLocal(
    nuevaLista: Jugador[]
  ) {
    setListaJugadores(nuevaLista);

    localStorage.setItem(
      "laChangueadaJugadores",
      JSON.stringify(nuevaLista)
    );
  }

  async function editarJugador(
    jugador: Jugador
  ) {
    const nuevoNombre = prompt(
      "Editar nombre del jugador",
      jugador.nombre
    );

    if (!nuevoNombre?.trim()) {
      return;
    }

    const nombreLimpio =
      nuevoNombre.trim();

    const supabase = createClient();

    const { error } = await supabase
      .from("jugadores")
      .update({
        nombre: nombreLimpio,
      })
      .eq("id", jugador.id);

    if (error) {
      console.error(
        "No se pudo editar el jugador:",
        error
      );

      alert(
        "No se pudo editar el jugador."
      );

      return;
    }

    actualizarListaLocal(
      listaJugadores.map((actual) =>
        actual.id === jugador.id
          ? {
              ...actual,
              nombre: nombreLimpio,
            }
          : actual
      )
    );
  }

  async function cambiarFrecuente(
    jugador: Jugador
  ) {
    const nuevoEstado =
      !jugador.frecuente;

    const supabase = createClient();

    const { error } = await supabase
      .from("jugadores")
      .update({
        frecuente: nuevoEstado,
      })
      .eq("id", jugador.id);

    if (error) {
      console.error(
        "No se pudo modificar el jugador:",
        error
      );

      alert(
        "No se pudo modificar el jugador."
      );

      return;
    }

    actualizarListaLocal(
      listaJugadores.map((actual) =>
        actual.id === jugador.id
          ? {
              ...actual,
              frecuente: nuevoEstado,
            }
          : actual
      )
    );
  }

  async function eliminarJugador(
    jugador: Jugador
  ) {
    const confirmar = confirm(
      `¿Eliminar a ${jugador.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    const supabase = createClient();

    const {
      count,
      error: errorConsulta,
    } = await supabase
      .from("resultados")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("jugador_id", jugador.id);

    if (errorConsulta) {
      console.error(
        "No se pudo revisar el historial:",
        errorConsulta
      );

      alert(
        "No se pudo revisar el historial del jugador."
      );

      return;
    }

    if ((count ?? 0) > 0) {
      alert(
        "Este jugador tiene resultados históricos y no puede eliminarse. Podés quitarle la estrella de frecuente."
      );

      return;
    }

    const { error } = await supabase
      .from("jugadores")
      .delete()
      .eq("id", jugador.id);

    if (error) {
      console.error(
        "No se pudo eliminar el jugador:",
        error
      );

      alert(
        "No se pudo eliminar el jugador."
      );

      return;
    }

    actualizarListaLocal(
      listaJugadores.filter(
        (actual) =>
          actual.id !== jugador.id
      )
    );
  }

  const jugadoresOrdenados = [
    ...listaJugadores,
  ].sort((a, b) =>
    a.nombre.localeCompare(
      b.nombre,
      "es",
      {
        sensitivity: "base",
      }
    )
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

      {cargando && (
        <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
          Cargando jugadores...
        </div>
      )}

      {mensaje && (
        <div className="mt-8 rounded-xl bg-white p-5 font-bold text-green-900">
          {mensaje}
        </div>
      )}

      {!cargando && !mensaje && (
        <div className="mt-8 space-y-3">
          {jugadoresOrdenados.map(
            (jugador) => (
              <div
                key={jugador.id}
                className="rounded-lg bg-white p-4 text-green-900"
              >
                <div className="text-xl font-bold">
                  {jugador.frecuente
                    ? "⭐ "
                    : ""}
                  {jugador.nombre}
                </div>

                <div className="mt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      cambiarFrecuente(
                        jugador
                      )
                    }
                    className="h-12 w-12 rounded-lg bg-yellow-500 text-xl text-white"
                  >
                    ⭐
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editarJugador(jugador)
                    }
                    className="h-12 w-12 rounded-lg bg-yellow-300 text-xl text-black"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      eliminarJugador(
                        jugador
                      )
                    }
                    className="h-12 w-12 rounded-lg bg-red-600 text-xl text-white"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}