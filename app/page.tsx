export default function Home() {
  return (
    <main className="min-h-screen bg-green-950 text-white p-6 flex flex-col">
      <div className="text-center mt-8 mb-10">
  <div className="text-5xl mb-4">
    ⚽ 🚩
  </div>

  <h1 className="text-4xl font-black">
    La Changueada
  </h1>

  <p className="mt-2 text-green-200 font-bold">
    Footgolf
  </p>
</div>

      <div className="space-y-4">
        <a
          href="/nueva-fecha"
          className="block bg-white text-green-950 rounded-2xl p-4 text-center text-xl font-black"
        >
          ➕ Nueva Fecha ➕
        </a>

        <a
          href="/historial"
          className="block bg-white text-green-950 rounded-2xl p-4 text-center text-xl font-black"
        >
          📜 Historial 📜
        </a>

        <a
          href="/estadisticas"
          className="block bg-white text-green-950 rounded-2xl p-4 text-center text-xl font-black"
        >
          📊 Estadísticas 📊
        </a>

        <a
          href="/ranking"
          className="block bg-white text-green-950 rounded-2xl p-4 text-center text-xl font-black"
        >
          🎖️ Ranking 🎖️
        </a>

        <a
          href="/jugadores"
          className="block bg-white text-green-950 rounded-2xl p-4 text-center text-xl font-black"
        >
          👤 Jugadores 👤
        </a>

        <a
  href="/handicap"
  className="block bg-white text-green-950 rounded-2xl p-4 text-center text-xl font-black"
>
  🧢 Handicap 🧢
</a>

        <a
          href="/configuracion"
          className="block bg-white text-green-950 rounded-2xl p-4 text-center text-xl font-black"
        >

          ⚙️ Configuración ⚙️
        </a>
      </div>

      <div className="mt-auto pt-8 text-center text-sm text-green-300">
        v2.10
      </div>
    </main>
  );
}