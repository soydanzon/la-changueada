"use client";

import { useEffect, useState } from "react";
import { config } from "../config/config";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

export default function Configuracion() {
  const [valor, setValor] = useState(config.valorChangueada);

  useEffect(() => {
    const guardado = localStorage.getItem("laChangueadaValor");

    if (guardado) {
      setValor(Number(guardado));
    }
  }, []);

  function guardarValor() {
    localStorage.setItem(
      "laChangueadaValor",
      valor.toString()
    );

    alert("✅ Valor actualizado");
  }

  function borrarDatosPrueba() {
    if (
      !confirm("¿Borrar todas las fechas y estadísticas de prueba?")
    ) {
      return;
    }

    localStorage.removeItem("laChangueadaHistorial");
    localStorage.removeItem("laChangueadaScores");
    localStorage.removeItem("laChangueadaFechaActual");
    localStorage.removeItem("laChangueadaFechaParaCompartir");

    alert("✅ Datos de prueba eliminados.");
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">
          Configuración
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
        onChange={(e) => setValor(Number(e.target.value))}
        className="mt-3 w-full rounded-lg bg-white p-3 text-xl text-black"
      />

      <button
        onClick={guardarValor}
        className="mt-4 w-full rounded-xl bg-white px-5 py-3 font-bold text-green-900"
      >
        Guardar valor
      </button>

      <a
        href="/tabla-premios"
        className="mt-8 block rounded-xl bg-white px-5 py-4 text-center font-bold text-green-900"
      >
        🏆 Tabla de premios
      </a>

      <a
        href="/canchas"
        className="mt-4 block rounded-xl bg-white px-5 py-4 text-center font-bold text-green-900"
      >
        🚩 Canchas
      </a>

      <button
        onClick={borrarDatosPrueba}
        className="mt-10 w-full rounded-xl bg-red-600 px-6 py-4 text-xl font-bold"
      >
        🧹 Borrar datos de prueba
      </button>
    </main>
  );
}