"use client";

export default function Configuracion() {
  function borrarDatosPrueba() {
    const confirmar = confirm(
      "¿Borrar todas las fechas y estadísticas de prueba?"
    );

    if (!confirmar) return;

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

      <p className="mt-6 text-xl">
        Valor de la Changueada
      </p>

      <p className="mt-6 text-xl">
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