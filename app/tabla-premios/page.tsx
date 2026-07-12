import { tablaPremios } from "../premios/tablaPremios";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function TablaPremios() {
  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="text-5xl">
            🏆
          </div>

          <h1 className="mt-2 text-4xl font-black">
            Tabla de Premios
          </h1>

          <p className="mt-2 font-bold text-green-200">
            La Changueada
          </p>
        </div>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white p-4 text-green-900 shadow-2xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b text-left">
              <th className="px-2 py-3">
                Jug.
              </th>

              <th className="px-2 text-yellow-600">
                🥇
              </th>

              <th className="px-2 text-gray-500">
                🥈
              </th>

              <th className="px-2 text-orange-700">
                🥉
              </th>

              <th className="px-2">
                4°
              </th>

              <th className="px-2">
                5°
              </th>
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
                <td className="px-2 py-3 font-black">
                  {fila.jugadores}
                </td>

                {[0, 1, 2, 3, 4].map((i) => (
                  <td
                    key={i}
                    className="whitespace-nowrap px-2 font-bold"
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
    </main>
  );
}