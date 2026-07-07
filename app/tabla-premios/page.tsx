import { tablaPremios } from "../premios/tablaPremios";

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function TablaPremios() {
  return (
    <main className="min-h-screen bg-green-950 text-white p-6">
      <div className="text-center mb-8">
        <div className="text-6xl">🏆</div>

        <h1 className="text-5xl font-black mt-3">
          Tabla de Premios
        </h1>

        <p className="mt-2 text-green-200 font-bold">
          La Changueada
        </p>
      </div>

      <div className="bg-white text-green-900 rounded-3xl p-4 shadow-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b text-left">
              <th className="py-3 px-2">Jug.</th>
              <th className="px-2 text-yellow-600">🥇</th>
              <th className="px-2 text-gray-500">🥈</th>
              <th className="px-2 text-orange-700">🥉</th>
              <th className="px-2">4°</th>
              <th className="px-2">5°</th>
            </tr>
          </thead>

          <tbody>
            {tablaPremios.map((fila, index) => (
              <tr
                key={fila.jugadores}
                className={`border-b ${
                  index % 2 === 0 ? "bg-green-50" : "bg-white"
                }`}
              >
                <td className="py-3 px-2 font-black">
                  {fila.jugadores}
                </td>

                {[0, 1, 2, 3, 4].map((i) => (
                  <td
                    key={i}
                    className="px-2 font-bold whitespace-nowrap"
                  >
                    {fila.premios[i]
                      ? formatearPesos(fila.premios[i])
                      : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a
        href="/configuracion"
        className="block mt-8 bg-white text-green-900 px-5 py-4 rounded-2xl text-center font-black"
      >
        ← Volver
      </a>
    </main>
  );
}