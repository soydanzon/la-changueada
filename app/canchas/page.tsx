"use client";

import {
  useEffect,
  useState,
} from "react";
import { type Cancha } from "../datos/canchas";
import { createClient } from "../lib/supabase/client";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

export default function Canchas() {
  const [canchas, setCanchas] =
    useState<Cancha[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    async function cargarCanchas() {
      const supabase = createClient();

      const { data, error } =
        await supabase
          .from("canchas")
          .select(
            "id, nombre, par, activa"
          )
          .order("nombre");

      if (error) {
        console.error(
          "No se pudieron cargar las canchas:",
          error
        );

        setMensaje(
          "⚠️ No se pudieron cargar las canchas."
        );

        setCargando(false);
        return;
      }

      const canchasNube: Cancha[] = (
        data ?? []
      ).map(
        (cancha: {
          id: number;
          nombre: string;
          par: number;
          activa: boolean | null;
        }) => ({
          id: Number(cancha.id),
          nombre: cancha.nombre,
          par: Number(cancha.par),
          activa: Boolean(
            cancha.activa
          ),
        })
      );

      setCanchas(canchasNube);

      localStorage.setItem(
        "laChangueadaCanchas",
        JSON.stringify(canchasNube)
      );

      setCargando(false);
    }

    cargarCanchas();
  }, []);

  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-black">
          ⛳ Canchas
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {cargando && (
        <div className="rounded-2xl bg-white p-5 text-green-950">
          Cargando canchas...
        </div>
      )}

      {mensaje && (
        <div className="rounded-2xl bg-white p-5 font-bold text-green-950">
          {mensaje}
        </div>
      )}

      {!cargando && !mensaje && (
        <div className="space-y-4">
          {canchas
            .filter(
              (cancha) =>
                cancha.activa
            )
            .map((cancha) => (
              <div
                key={cancha.id}
                className="rounded-2xl bg-white p-5 text-green-950"
              >
                <h2 className="text-2xl font-black">
                  {cancha.nombre}
                </h2>

                <p className="mt-2 text-lg">
                  Par {cancha.par}
                </p>

                <a
                  href={`/canchas/${cancha.id}`}
                  className="mt-5 block rounded-xl bg-green-900 p-3 text-center font-bold text-white"
                >
                  ✏️ Editar
                </a>
              </div>
            ))}
        </div>
      )}

      <a
        href="/canchas/nueva"
        className="mt-8 block w-full rounded-2xl bg-green-700 p-4 text-center font-black text-white"
      >
        ➕ Agregar cancha
      </a>
    </main>
  );
}