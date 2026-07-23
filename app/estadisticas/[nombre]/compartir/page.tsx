"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  calcularEstadisticas,
  calcularEstadisticasPorCancha,
  type EstadisticaCancha,
  type EstadisticaJugador,
  type FechaGuardada,
} from "../../../utils/estadisticas";
import BotonInicio from "../../../components/BotonInicio";
import BotonVolver from "../../../components/BotonVolver";

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

function formatearNumero(valor?: number) {
  if (
    valor === undefined ||
    Number.isNaN(valor)
  ) {
    return "-";
  }

  return Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(1);
}

function formatearRespectoPar(
  valor?: number
) {
  if (
    valor === undefined ||
    Number.isNaN(valor)
  ) {
    return "-";
  }

  if (valor === 0) {
    return "E";
  }

  const numero = formatearNumero(valor);

  return valor > 0 ? `+${numero}` : numero;
}

export default function CompartirPerfil() {
  const params = useParams();

  const nombre = decodeURIComponent(
    params.nombre as string
  );

  const [resumen, setResumen] =
    useState<EstadisticaJugador | null>(null);

  const [
    estadisticasCancha,
    setEstadisticasCancha,
  ] = useState<EstadisticaCancha[]>([]);

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    const datos = localStorage.getItem(
      "laChangueadaHistorial"
    );

    if (!datos) {
      return;
    }

    try {
      const historial: FechaGuardada[] =
        JSON.parse(datos);

      const estadisticas =
        calcularEstadisticas(historial);

      const jugador = estadisticas.find(
        (estadistica) =>
          estadistica.nombre === nombre
      );

      if (jugador) {
        setResumen(jugador);
      }

      setEstadisticasCancha(
        calcularEstadisticasPorCancha(
          historial,
          nombre
        )
      );
    } catch {
      setResumen(null);
      setEstadisticasCancha([]);
    }
  }, [nombre]);

  function generarDetalleVictorias() {
    if (!resumen) {
      return "";
    }

    const lineas: string[] = [];

    if (resumen.victoriasGeneral > 0) {
      lineas.push(
        `🙎🏻‍♂️ General: ${resumen.victoriasGeneral}`
      );
    }

    if (resumen.victoriasViejitos > 0) {
      lineas.push(
        `🧓🏻 Viejitos: ${resumen.victoriasViejitos}`
      );
    }

    if (
      resumen.victoriasCategoriaA > 0
    ) {
      lineas.push(
        `🅰️ Categoría A: ${resumen.victoriasCategoriaA}`
      );
    }

    if (
      resumen.victoriasCategoriaB > 0
    ) {
      lineas.push(
        `🅱️ Categoría B: ${resumen.victoriasCategoriaB}`
      );
    }

    return lineas.length > 0
      ? `\n${lineas.join("\n")}`
      : "";
  }

  function generarDetallePodios() {
    if (!resumen) {
      return "";
    }

    const lineas: string[] = [];

    if (resumen.podiosGeneral > 0) {
      lineas.push(
        `🙎🏻‍♂️ General: ${resumen.podiosGeneral}`
      );
    }

    if (resumen.podiosViejitos > 0) {
      lineas.push(
        `🧓🏻 Viejitos: ${resumen.podiosViejitos}`
      );
    }

    if (resumen.podiosCategoriaA > 0) {
      lineas.push(
        `🅰️ Categoría A: ${resumen.podiosCategoriaA}`
      );
    }

    if (resumen.podiosCategoriaB > 0) {
      lineas.push(
        `🅱️ Categoría B: ${resumen.podiosCategoriaB}`
      );
    }

    return lineas.length > 0
      ? `\n${lineas.join("\n")}`
      : "";
  }

  function generarTexto() {
    if (!resumen) {
      return "";
    }

    const canchas = estadisticasCancha
      .map(
        (cancha) =>
          `⛳ ${cancha.cancha}

⚽ Changueadas jugadas: ${cancha.jugadas}
🏆 Victorias: ${cancha.victorias}
🥇🥈🥉 Podios: ${cancha.podios}
📊 Promedio: ${formatearRespectoPar(
            cancha.promedioRespectoPar
          )} (${formatearNumero(
            cancha.promedioGolpes
          )} golpes)
⭐ Mejor vuelta: ${formatearRespectoPar(
            cancha.mejorVuelta
          )} (${cancha.mejorVueltaGolpes} golpes)`
      )
      .join("\n\n");

    const bloqueCanchas =
      estadisticasCancha.length > 0
        ? `

📌 Estadísticas por cancha

${canchas}`
        : "";

    return `⚽ LA CHANGUEADA 🚩

${nombre}

⚽ Changueadas jugadas: ${resumen.jugadas}

🏆 Victorias: ${
      resumen.victorias
    }${generarDetalleVictorias()}

🥇🥈🥉 Podios: ${
      resumen.podios
    }${generarDetallePodios()}

📊 Promedio: ${formatearRespectoPar(
      resumen.promedio
    )} (${formatearNumero(
      resumen.promedioGolpes
    )} golpes)

⭐ Mejor vuelta: ${formatearRespectoPar(
      resumen.mejorScore
    )} (${resumen.mejorScoreGolpes} golpes)

💸 Aportado: ${formatearPesos(
      resumen.aportado
    )}
💰 Ganado: ${formatearPesos(
      resumen.ganado
    )}
📈 Balance: ${formatearPesos(
      resumen.balance
    )}${bloqueCanchas}`;
  }

  async function compartirPerfil() {
    const texto = generarTexto();

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Perfil de ${nombre}`,
          text: texto,
        });

        setMensaje(
          "✅ Perfil compartido"
        );

        return;
      }

      await navigator.clipboard.writeText(
        texto
      );

      setMensaje("✅ Perfil copiado");
    } catch {
      setMensaje("");
    }
  }

  if (!resumen) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        Cargando...
      </main>
    );
  }

  const mostrarVictoriaGeneral =
    resumen.victoriasGeneral > 0;

  const mostrarVictoriaViejitos =
    resumen.victoriasViejitos > 0;

  const mostrarVictoriaCategoriaA =
    resumen.victoriasCategoriaA > 0;

  const mostrarVictoriaCategoriaB =
    resumen.victoriasCategoriaB > 0;

  const mostrarPodioGeneral =
    resumen.podiosGeneral > 0;

  const mostrarPodioViejitos =
    resumen.podiosViejitos > 0;

  const mostrarPodioCategoriaA =
    resumen.podiosCategoriaA > 0;

  const mostrarPodioCategoriaB =
    resumen.podiosCategoriaB > 0;

  return (
    <main className="min-h-screen bg-green-900 p-4 text-black">
      <div className="mx-auto mb-4 flex max-w-xl justify-end gap-2">
        <BotonVolver />
        <BotonInicio />
      </div>

      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="rounded-2xl bg-green-900 px-6 py-4 text-center text-white">
          <h1 className="text-2xl font-black">
            ⚽ LA CHANGUEADA 🚩
          </h1>

          <p className="mt-4 text-3xl font-black">
            {nombre}
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-green-50 p-5 text-green-950">
          <p className="text-lg font-bold">
            ⚽ Changueadas jugadas:{" "}
            {resumen.jugadas}
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>🏆 Victorias</span>
              <span>{resumen.victorias}</span>
            </div>

            <div className="mt-2 space-y-1 font-normal">
              {mostrarVictoriaGeneral && (
                <div className="flex items-center justify-between">
                  <span>
                    🙎🏻‍♂️ General
                  </span>

                  <span>
                    {
                      resumen.victoriasGeneral
                    }
                  </span>
                </div>
              )}

              {mostrarVictoriaViejitos && (
                <div className="flex items-center justify-between">
                  <span>
                    🧓🏻 Viejitos
                  </span>

                  <span>
                    {
                      resumen.victoriasViejitos
                    }
                  </span>
                </div>
              )}

              {mostrarVictoriaCategoriaA && (
                <div className="flex items-center justify-between">
                  <span>
                    🅰️ Categoría A
                  </span>

                  <span>
                    {
                      resumen.victoriasCategoriaA
                    }
                  </span>
                </div>
              )}

              {mostrarVictoriaCategoriaB && (
                <div className="flex items-center justify-between">
                  <span>
                    🅱️ Categoría B
                  </span>

                  <span>
                    {
                      resumen.victoriasCategoriaB
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>🥇🥈🥉 Podios</span>
              <span>{resumen.podios}</span>
            </div>

            <div className="mt-2 space-y-1 font-normal">
              {mostrarPodioGeneral && (
                <div className="flex items-center justify-between">
                  <span>
                    🙎🏻‍♂️ General
                  </span>

                  <span>
                    {resumen.podiosGeneral}
                  </span>
                </div>
              )}

              {mostrarPodioViejitos && (
                <div className="flex items-center justify-between">
                  <span>
                    🧓🏻 Viejitos
                  </span>

                  <span>
                    {resumen.podiosViejitos}
                  </span>
                </div>
              )}

              {mostrarPodioCategoriaA && (
                <div className="flex items-center justify-between">
                  <span>
                    🅰️ Categoría A
                  </span>

                  <span>
                    {
                      resumen.podiosCategoriaA
                    }
                  </span>
                </div>
              )}

              {mostrarPodioCategoriaB && (
                <div className="flex items-center justify-between">
                  <span>
                    🅱️ Categoría B
                  </span>

                  <span>
                    {
                      resumen.podiosCategoriaB
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-lg font-bold">
              📊 Promedio:{" "}
              {formatearRespectoPar(
                resumen.promedio
              )}{" "}
              <span className="text-base font-normal">
                (
                {formatearNumero(
                  resumen.promedioGolpes
                )}{" "}
                golpes)
              </span>
            </p>

            <p className="text-lg font-bold">
              ⭐ Mejor vuelta:{" "}
              {formatearRespectoPar(
                resumen.mejorScore
              )}{" "}
              <span className="text-base font-normal">
                ({resumen.mejorScoreGolpes}{" "}
                golpes)
              </span>
            </p>

            <p className="text-lg font-bold">
              💸 Aportado:{" "}
              {formatearPesos(
                resumen.aportado
              )}
            </p>

            <p className="text-lg font-bold">
              💰 Ganado:{" "}
              {formatearPesos(
                resumen.ganado
              )}
            </p>

            <p className="text-lg font-bold">
              📈 Balance:{" "}
              {formatearPesos(
                resumen.balance
              )}
            </p>
          </div>
        </div>

        {estadisticasCancha.length > 0 && (
          <section className="mt-6 rounded-2xl bg-green-50 p-5 text-green-950">
            <h2 className="mb-5 text-2xl font-bold">
              📌 Estadísticas por cancha
            </h2>

            <div className="space-y-6">
              {estadisticasCancha.map(
                (cancha, index) => (
                  <div
                    key={cancha.canchaId}
                  >
                    <h3 className="text-xl font-bold">
                      ⛳ {cancha.cancha}
                    </h3>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          ⚽ Changueadas jugadas
                        </span>

                        <span className="font-bold">
                          {cancha.jugadas}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          🏆 Victorias
                        </span>

                        <span className="font-bold">
                          {cancha.victorias}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          🥇🥈🥉 Podios
                        </span>

                        <span className="font-bold">
                          {cancha.podios}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="font-bold">
                          📊 Promedio
                        </span>

                        <span className="text-right font-bold">
                          {formatearRespectoPar(
                            cancha.promedioRespectoPar
                          )}{" "}
                          <span className="font-normal">
                            (
                            {formatearNumero(
                              cancha.promedioGolpes
                            )}{" "}
                            golpes)
                          </span>
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="font-bold">
                          ⭐ Mejor vuelta
                        </span>

                        <span className="text-right font-bold">
                          {formatearRespectoPar(
                            cancha.mejorVuelta
                          )}{" "}
                          <span className="font-normal">
                            (
                            {
                              cancha.mejorVueltaGolpes
                            }{" "}
                            golpes)
                          </span>
                        </span>
                      </div>
                    </div>

                    {index <
                      estadisticasCancha.length -
                        1 && (
                      <div className="mt-6 border-b border-green-900/20" />
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        )}
      </div>

      <button
        type="button"
        onClick={compartirPerfil}
        className="mx-auto mt-6 block w-full max-w-xl rounded-xl bg-white p-4 text-xl font-black text-green-900"
      >
        📤 Compartir perfil
      </button>

      {mensaje && (
        <p className="mt-4 text-center font-bold text-white">
          {mensaje}
        </p>
      )}
    </main>
  );
}