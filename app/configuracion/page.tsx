"use client";

import {
  useEffect,
  useState,
} from "react";
import { config } from "../config/config";
import { createClient } from "../lib/supabase/client";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

export default function Configuracion() {
  const [valor, setValor] = useState(
    config.valorChangueada
  );

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  useEffect(() => {
    async function cargarValor() {
      const supabase = createClient();

      const { data, error } =
        await supabase
          .from("configuracion")
          .select("valor")
          .eq(
            "clave",
            "valorChangueada"
          )
          .single();

      if (error || !data) {
        console.error(
          "No se pudo cargar el valor:",
          error
        );

        setCargando(false);
        return;
      }

      const valorSupabase = Number(
        data.valor
      );

      if (
        Number.isFinite(
          valorSupabase
        ) &&
        valorSupabase > 0
      ) {
        setValor(valorSupabase);

        localStorage.setItem(
          "laChangueadaValor",
          String(valorSupabase)
        );
      }

      setCargando(false);
    }

    cargarValor();
  }, []);

  async function guardarValor() {
    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      alert(
        "⚠️ Escribí un valor válido."
      );
      return;
    }

    setGuardando(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("configuracion")
      .upsert({
        clave:
          "valorChangueada",

        valor,

        actualizado_en:
          new Date().toISOString(),
      });

    if (error) {
      console.error(
        "No se pudo guardar el valor:",
        error
      );

      alert(
        "⚠️ No se pudo actualizar el valor."
      );

      setGuardando(false);
      return;
    }

    localStorage.setItem(
      "laChangueadaValor",
      String(valor)
    );

    setGuardando(false);

    alert("✅ Valor actualizado");
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          ⚙️ Configuración
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <p className="mt-8 text-xl font-bold">
        Valor de la Changueada
      </p>

      <input
        type="number"
        value={valor}
        disabled={
          cargando || guardando
        }
        onChange={(evento) =>
          setValor(
            Number(
              evento.target.value
            )
          )
        }
        className="mt-3 w-full rounded-lg bg-white p-3 text-xl text-black disabled:bg-gray-200"
      />

      <button
        type="button"
        onClick={guardarValor}
        disabled={
          cargando || guardando
        }
        className="mt-4 w-full rounded-xl bg-green-600 px-5 py-3 text-xl font-bold text-white disabled:bg-gray-400"
      >
        {cargando
          ? "Cargando..."
          : guardando
            ? "Guardando..."
            : "Guardar valor"}
      </button>

      <a
        href="/tabla-premios"
        className="mt-8 block rounded-xl bg-yellow-200 px-5 py-4 text-center text-xl font-bold text-green-900"
      >
        🙎🏻‍♂️🧓🏻 Tabla de premios General
      </a>

      <a
        href="/tabla-premios-categorias"
        className="mt-4 block rounded-xl bg-yellow-200 px-5 py-4 text-center text-xl font-bold text-green-900"
      >
        🅰️🅱️ Tabla de premios 55-45
      </a>

      <a
        href="/canchas"
        className="mt-4 block rounded-xl bg-green-700 px-5 py-4 text-center text-xl font-bold text-white"
      >
        ⛳ Canchas
      </a>

      <a
        href="/respaldo"
        className="mt-4 block rounded-xl bg-blue-600 px-5 py-4 text-center text-xl font-bold text-white"
      >
        💾 Respaldo
      </a>
    </main>
  );
}