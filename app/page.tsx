export default function Home() {
  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-green-950 p-6 text-white">
      <div className="mb-6 mt-4 text-center">
        <div className="mb-3 text-5xl">
          ⚽ 🚩
        </div>

        <h1 className="text-4xl font-black">
          La Changueada
        </h1>

        <p className="mt-2 text-lg font-bold tracking-wider text-green-200">
          FOOTGOLF
        </p>
      </div>

      <div className="space-y-3">
        <a
          href="/nueva-fecha"
          className="block rounded-2xl bg-white py-4 pl-8 text-xl font-black text-green-950"
        >
          ➕ Nueva Fecha
        </a>

        <a
          href="/historial"
          className="block rounded-2xl bg-white py-4 pl-8 text-xl font-black text-green-950"
        >
          📜 Historial
        </a>

        <a
          href="/estadisticas"
          className="block rounded-2xl bg-white py-4 pl-8 text-xl font-black text-green-950"
        >
          📊 Estadísticas
        </a>

        <a
          href="/ranking"
          className="block rounded-2xl bg-white py-4 pl-8 text-xl font-black text-green-950"
        >
          🎖️ Ranking
        </a>

        <a
          href="/jugadores"
          className="block rounded-2xl bg-white py-4 pl-8 text-xl font-black text-green-950"
        >
          👤 Jugadores
        </a>

        <a
          href="/handicap"
          className="block rounded-2xl bg-white py-4 pl-8 text-xl font-black text-green-950"
        >
          🧢 Proyecto HCP
        </a>

        <a
          href="/configuracion"
          className="block rounded-2xl bg-white py-4 pl-8 text-xl font-black text-green-950"
        >
          ⚙️ Configuración
        </a>
      </div>

      <div className="mt-auto pt-4 text-center text-sm tracking-widest text-green-300">
        - v2.48 -
      </div>
    </main>
  );
}