"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [error, setError] =
    useState("");
  const [mensaje, setMensaje] =
    useState("");
  const [cargando, setCargando] =
    useState(false);

  async function ingresar() {
    setError("");
    setMensaje("");
    setCargando(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setCargando(false);

    if (error) {
      setError(
        "⚠️  Email o contraseña incorrectos"
      );
      return;
    }

    router.push("/");
  }

  async function recuperarContrasena() {
  setError("");
  setMensaje("");

  if (!email) {
    setError(
      "Escribí tu email primero."
    );
    return;
  }

  setCargando(true);

  try {
    const supabase = createClient();

    const resultado =
      await Promise.race([
        supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              "https://la-changueada.vercel.app/actualizar-contrasena",
          }
        ),

        new Promise<never>(
          (_, reject) => {
            setTimeout(() => {
              reject(
                new Error(
                  "TIMEOUT"
                )
              );
            }, 15000);
          }
        ),
      ]);

    if (resultado.error) {
      setError(
        `⚠️ ${resultado.error.message}`
      );
      return;
    }

    setMensaje(
      "📩 Te enviamos un mail para cambiar la contraseña."
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TIMEOUT"
    ) {
      setError(
        "⚠️ Supabase no respondió después de 15 segundos."
      );
    } else {
      setError(
        "⚠️ Ocurrió un error al pedir la recuperación."
      );
    }
  } finally {
    setCargando(false);
  }
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

        <div className="rounded-2xl bg-green-700 p-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(evento) =>
              setEmail(evento.target.value)
            }
            className="w-full bg-white rounded-xl border border-gray-300 p-4 text-lg text-black outline-none"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(evento) =>
              setPassword(
                evento.target.value
              )
            }
            className="mt-4 w-full bg-white rounded-xl border border-gray-300 p-4 text-lg text-black outline-none"
          />

          {error && (
            <p className="mt-4 text-center font-bold text-yellow-300">
              {error}
            </p>
          )}

          {mensaje && (
            <p className="mt-4 text-center font-bold text-green-800">
              {mensaje}
            </p>
          )}

          <button
            type="button"
            onClick={ingresar}
            disabled={
              cargando ||
              !email ||
              !password
            }
            className="mt-5 w-full rounded-xl bg-green-900 p-4 text-xl font-bold text-green-100 disabled:bg-gray-400 disabled:text-white"
          >
            {cargando
              ? "Procesando..."
              : "Ingresar"}
          </button>

          <button
            type="button"
            onClick={recuperarContrasena}
            disabled={cargando}
            className="mt-4 w-full text-center font-bold text-gray-200 underline underline-offset-4 disabled:text-gray-400"
          >
            Olvidé mi contraseña
          </button>
        </div>
      </div>
    </main>
  );
}