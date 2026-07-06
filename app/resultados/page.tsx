export default function Resultados() {
  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Resultados
      </h1>

      <div className="bg-white text-green-900 rounded-xl p-5">
        <p className="text-xl font-bold">
          Próximo paso: mostrar clasificación y premios.
        </p>
      </div>

      <a
        href="/scores"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Volver a scores
      </a>
    </main>
  );
}