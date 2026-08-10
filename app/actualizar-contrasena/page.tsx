"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { createClient } from "../lib/supabase/client";

export default function ActualizarContrasena() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] =
    useState("");

  const [confirmacion, setConfirmacion] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const [sesionLista, setSesionLista] =
    useState(false);

  useEffect(() => {
    async function prepararSesion() {
      const supabase = createClient();

      const code =
        searchParams.get("code");

      if (code) {
        const { error } =
          await supabase.auth.exchangeCodeForSession(
            code
          );

        if (error) {
          setMensaje(
            "⚠️ El enlace venció o ya fue utilizado. Pedí uno nuevo."
          );
          return;
        }
      }

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session) {
        setMensaje(
          "⚠️ No hay una sesión válida. Pedí un nuevo mail de recuperación."
        );
        return;
      }

      setSesionLista(true);
    }

    prepararSesion();
  }, [searchParams]);

  async function guardarContrasena() {
    setMensaje("");

    if (!sesionLista) {
      setMensaje(
        "⚠️ Esperá a que se valide el enlace."
      );
      return;
    }

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

    try {
  const resultado =
    await Promise.race([
      supabase.auth.updateUser({
        password,
      }),

      new Promise<never>(
        (_, reject) => {
          setTimeout(() => {
            reject(
              new Error("TIMEOUT")
            );
          }, 15000);
        }
      ),
    ]);

  if (resultado.error) {
    setMensaje(
      `⚠️ No se pudo guardar: ${resultado.error.message}`
    );
    return;
  }
} catch (error) {
  if (
    error instanceof Error &&
    error.message === "TIMEOUT"
  ) {
    setMensaje(
      "⚠️ Supabase no respondió al guardar la contraseña."
    );
  } else {
    setMensaje(
      "⚠️ Ocurrió un error al guardar la contraseña."
    );
  }

  return;
} finally {
  setCargando(false);
}

    setMensaje(
      "✅ Contraseña guardada"
    );

    window.setTimeout(() => {
      router.push("/login");
    }, 1200);
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
            disabled={!sesionLista}
            className="w-full rounded-xl border border-gray-300 p-4 text-lg text-black outline-none disabled:bg-gray-100"
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
            disabled={!sesionLista}
            className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-lg text-black outline-none disabled:bg-gray-100"
          />

          {mensaje && (
            <p className="mt-4 text-center font-bold text-green-900">
              {mensaje}
            </p>
          )}

          <button
            type="button"
            onClick={guardarContrasena}
            disabled={
              cargando ||
              !sesionLista
            }
            className="mt-5 w-full rounded-xl bg-green-900 p-4 text-xl font-bold text-green-100 disabled:bg-gray-400"
          >
            {cargando
              ? "Guardando..."
              : sesionLista
                ? "Guardar contraseña"
                : "Validando enlace..."}
          </button>
        </div>
      </div>
    </main>
  );
}