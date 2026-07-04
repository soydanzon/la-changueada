export default function Home() {
  return (
    <main className="min-h-screen bg-green-900 text-white flex flex-col items-center p-8">
      <h1 className="text-5xl font-bold mt-10">
        La Changueada
      </h1>

      <p className="mt-3 text-green-200">
        Organizador de torneos
      </p>

      <div className="flex flex-col gap-5 mt-16 w-full max-w-sm">

        <a
  href="/nueva-fecha"
  className="bg-white text-green-900 text-2xl font-bold rounded-xl p-5 text-center"
>
  ➕ Nueva Fecha
</a>

        <button className="bg-white text-green-900 text-2xl font-bold rounded-xl p-5">
          👥 Jugadores
        </button>

        <button className="bg-white text-green-900 text-2xl font-bold rounded-xl p-5">
          📜 Historial
        </button>

        <button className="bg-white text-green-900 text-2xl font-bold rounded-xl p-5">
          ⚙️ Configuración
        </button>

      </div>
    </main>
  );
}