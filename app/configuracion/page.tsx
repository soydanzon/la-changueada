"use client";

import { useEffect, useState } from "react";
import { config } from "../config/config";

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
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold">
        Configuración
      </h1>

      <a
        href="/"
        className="inline-block mb-6 bg-white text-green-900 px-4 py-2 rounded-lg font-bold"
      >
        ← Menú principal
      </a>

      <p className="mt-6 text-xl font-bold">
        Valor de la Changueada
      </p>

      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        className="mt-3 w-full rounded-lg p-3 text-black text-xl"
      />

      <button
        onClick={guardarValor}
        className="mt-4 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        Guardar valor
      </button>

      <p className="mt-8 text-xl">
        Tabla de premios
      </p>

      <button
        onClick={borrarDatosPrueba}
        className="mt-10 bg-red-600 px-6 py-4 rounded-xl font-bold text-xl"
      >
        🧹 Borrar datos de prueba
      </button>
    </main>
  );
}