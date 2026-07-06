export default function Home() {
  return (
    <main className="min-h-screen bg-green-900 text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">
        La Changueada
      </h1>

      <a
        href="/nueva-fecha"
        className="bg-white text-green-900 px-6 py-4 rounded-xl text-2xl font-bold"
      >
        Nueva Fecha
      </a>

      <a
  href="/configuracion"
  className="bg-white text-green-900 px-6 py-4 rounded-xl text-2xl font-bold"
>
  Configuración
</a>

<a
  href="/jugadores"
  className="bg-white text-green-900 px-6 py-4 rounded-xl text-2xl font-bold"
>
  Jugadores
</a>
    </main>
  );
}