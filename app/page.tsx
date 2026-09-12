"use client";

import {
  useEffect,
  useState,
} from "react";

import { createClient } from "./lib/supabase/client";

export default function Home() {
  const [accesoRevisado, setAccesoRevisado] =
    useState(false);

  const [esAdmin, setEsAdmin] =
    useState(false);

  useEffect(() => {
    let componenteActivo = true;

    async function revisarAcceso() {
      const supabase = createClient();

      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!session) {
          return;
        }

        const { data } =
          await supabase
            .from("perfiles")
            .select("rol")
            .eq(
              "id",
              session.user.id
            )
            .maybeSingle();

        if (
          componenteActivo &&
          data?.rol === "admin"
        ) {
          setEsAdmin(true);
        }
      } catch (error) {
        console.error(
          "No se pudo revisar el acceso:",
          error
        );
      } finally {
        if (componenteActivo) {
          setAccesoRevisado(true);
        }
      }
    }

    revisarAcceso();

    return () => {
      componenteActivo = false;
    };
  }, []);

  async function cerrarSesion() {
    const supabase = createClient();

    await supabase.auth.signOut();

    setEsAdmin(false);
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-green-950 text-white p-6 flex flex-col overflow-y-auto">
      <div className="mb-10 mt-4 text-center">
        <div className="mb-3 text-5xl">
          ⚽ 🚩
        </div>

        <h1 className="text-4xl font-black">
          La Changueada
        </h1>

        <p className="mt-2 text-lg font-bold tracking-[0.25em] text-green-200">
          FOOTGOLF
        </p>

        {accesoRevisado &&
          esAdmin && (
            <p className="mt-4 font-bold text-yellow-300">
              🔐 Administrador
            </p>
          )}
      </div>

      {!accesoRevisado ? (
        <p className="text-center text-lg font-bold text-green-200">
          Verificando acceso...
        </p>
      ) : (
        <div className="space-y-4">
          {esAdmin && (
            <a
              href="/nueva-fecha"
              className="block rounded-2xl bg-white py-4 pl-6 text-xl font-black text-green-950"
            >
              ➕ Nueva Fecha
            </a>
          )}

          <a
            href="/historial"
            className="block rounded-2xl bg-white py-4 pl-6 text-xl font-black text-green-950"
          >
            📜 Historial
          </a>

          <a
            href="/estadisticas"
            className="block rounded-2xl bg-white py-4 pl-6 text-xl font-black text-green-950"
          >
            📊 Estadísticas
          </a>

          <a
            href="/ranking"
            className="block rounded-2xl bg-white py-4 pl-6 text-xl font-black text-green-950"
          >
            🎖️ Ranking
          </a>

          {esAdmin && (
            <a
              href="/jugadores"
              className="block rounded-2xl bg-white py-4 pl-6 text-xl font-black text-green-950"
            >
              👤 Jugadores
            </a>
          )}

          <a
            href="/handicap"
            className="block rounded-2xl bg-white py-4 pl-6 text-xl font-black text-green-950"
          >
            🧢 Proyecto HCP
          </a>

          {esAdmin && (
            <a
              href="/configuracion"
              className="block rounded-2xl bg-white py-4 pl-6 text-xl font-black text-green-950"
            >
              ⚙️ Configuración
            </a>
          )}

          {esAdmin ? (
            <button
              type="button"
              onClick={cerrarSesion}
              className="w-full rounded-2xl bg-green-700 py-4 text-lg font-bold text-white"
            >
              Cerrar sesión
            </button>
          ) : (
            <a
              href="/login"
              className="block pt-4 text-center text-sm font-bold text-green-300 underline underline-offset-4"
            >
              🔐 Acceso administrador
            </a>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 text-center text-sm tracking-widest text-green-300">
        - v3.29 -
      </div>
    </main>
  );
}