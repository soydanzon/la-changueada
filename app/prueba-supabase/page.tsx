"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function PruebaSupabase() {
  const [mensaje, setMensaje] =
    useState("Conectando...");

  useEffect(() => {
    async function cargar() {
      const supabase = createClient();

      const { data, error } =
        await supabase
          .from("prueba_conexion")
          .select("mensaje")
          .single();

      if (error) {
        console.error(error);
        setMensaje(
          `Error: ${error.message}`
        );
        return;
      }

      setMensaje(
        data?.mensaje ??
          "Sin datos"
      );
    }

    cargar();
  }, []);

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="rounded-xl bg-white p-5 text-green-900">
        <h1 className="text-2xl font-bold">
          Prueba Supabase
        </h1>

        <p className="mt-4 text-xl">
          {mensaje}
        </p>
      </div>
    </main>
  );
}