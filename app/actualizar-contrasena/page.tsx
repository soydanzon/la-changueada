"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function ActualizarContrasena() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [confirmacion, setConfirmacion] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  async function guardarContrasena() {
    setMensaje("");

    if (!password || !confirmacion) {
      setMensaje(
        "Completá los dos campos."
      );
      return;
    }

    if (password !== confirmacion) {
      setMensaje(
        "Las contraseñas no coinciden."
      );
      return;
    }

    setCargando(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    setCargando(false);

    if (error) {
      setMensaje(
        `Error: ${error.message}`
      );
      return;
    }

    setMensaje(
      "✅ Contraseña guardada"
    );

    window.setTimeout(() => {
      router.push("/login");
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-green-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="text-6xl leading-none">
            ⚽️ 🚩
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            La Changueada
          </h1>

          <p className="mt-3 text-lg font-bold tracking-[0.35em] text-green-200">
            FOOTGOLF
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(evento) =>
              setPassword(
                evento.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-lg text-black outline-none"
          />

          <input
            type="password"
            placeholder="Repetir contraseña"
            value={confirmacion}
            onChange={(evento) =>
              setConfirmacion(
                evento.target.value
              )
            }
            className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-lg text-black outline-none"
          />

          {mensaje && (
            <p className="mt-4 text-center font-bold text-green-900">
              {mensaje}
            </p>
          )}

          <button
            type="button"
            onClick={guardarContrasena}
            disabled={cargando}
            className="mt-5 w-full rounded-xl bg-green-900 p-4 text-xl font-bold text-green-100 disabled:bg-gray-400"
          >
            {cargando
              ? "Guardando..."
              : "Guardar contraseña"}
          </button>
        </div>
      </div>
    </main>
  );
}