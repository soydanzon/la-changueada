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
  if (valor === undefined || Number.isNaN(valor)) {
    return "-";
  }

  return Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(1);
}

function formatearRespectoPar(valor?: number) {
  if (valor === undefined || Number.isNaN(valor)) {
    return "-";
  }

  if (valor === 0) return "E";

  const numero = formatearNumero(valor);

  return valor > 0 ? `+${numero}` : numero;
}

export default function CompartirPerfil() {
  const params = useParams();
  const nombre = decodeURIComponent(params.nombre as string);

  const [resumen, setResumen] =
    useState<EstadisticaJugador | null>(null);

  const [estadisticasCancha, setEstadisticasCancha] = useState<
    EstadisticaCancha[]
  >([]);

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const historial: FechaGuardada[] = JSON.parse(datos);
    const estadisticas = calcularEstadisticas(historial);

    const jugador = estadisticas.find(
      (estadistica) => estadistica.nombre === nombre
    );

    if (jugador) {
      setResumen(jugador);
    }

    setEstadisticasCancha(
      calcularEstadisticasPorCancha(historial, nombre)
    );
  }, [nombre]);

  function generarTexto() {
    if (!resumen) return "";

    const canchas = estadisticasCancha
      .map(
        (cancha) =>
          `🚩 ${cancha.cancha}
Fechas jugadas: ${cancha.jugadas}
Victorias: ${cancha.victorias}
Podios: ${cancha.podios}
Promedio: ${formatearRespectoPar(
            cancha.promedioRespectoPar
          )} (${formatearNumero(cancha.promedioGolpes)} golpes)
Mejor vuelta: ${formatearRespectoPar(
            cancha.mejorVuelta
          )} (${cancha.mejorVueltaGolpes} golpes)`
      )
      .join("\n\n");

    return `⚽ LA CHANGUEADA 🚩
FOOTGOLF

${nombre}

📅 Fechas jugadas: ${resumen.jugadas}

🥇 Victorias
• General: ${resumen.victoriasGeneral}
• Viejitos: ${resumen.victoriasViejitos}
• Total: ${resumen.victorias}

🏆 Podios
• General: ${resumen.podiosGeneral}
• Viejitos: ${resumen.podiosViejitos}
• Total: ${resumen.podios}

📊 Promedio: ${formatearRespectoPar(
      resumen.promedio
    )} (${formatearNumero(resumen.promedioGolpes)} golpes)

⭐ Mejor vuelta: ${formatearRespectoPar(
      resumen.mejorScore
    )} (${resumen.mejorScoreGolpes} golpes)

💰 Ganado: ${formatearPesos(resumen.ganado)}
📈 Balance: ${formatearPesos(resumen.balance)}

${canchas}`;
  }

  async function compartirPerfil() {
    const texto = generarTexto();

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Perfil de ${nombre}`,
          text: texto,
        });

        setMensaje("✅ Perfil compartido");
        return;
      }

      await navigator.clipboard.writeText(texto);
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

  return (
    <main className="min-h-screen bg-green-900 p-4 text-black">
      <div className="mx-auto mb-4 flex max-w-xl justify-end gap-2">
        <BotonVolver />
        <BotonInicio />
      </div>

      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="rounded-2xl bg-green-900 p-6 text-center text-white">
          <p className="text-sm font-bold tracking-[0.3em]">
            FOOTGOLF
          </p>

          <h1 className="mt-2 text-4xl font-black">
            LA CHANGUEADA
          </h1>

          <p className="mt-4 text-2xl font-bold">
            {nombre}
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-green-50 p-5 text-green-950">
          <p>
            📅 Fechas jugadas: {resumen.jugadas}
          </p>

          <div className="mt-4 rounded-xl border p-4">
            <p className="font-bold">
              🥇 Victorias
            </p>

            <p className="mt-2">
              • General: {resumen.victoriasGeneral}
            </p>

            <p>
              • Viejitos: {resumen.victoriasViejitos}
            </p>

            <p className="mt-2 font-bold">
              • Total: {resumen.victorias}
            </p>
          </div>

          <div className="mt-4 rounded-xl border p-4">
            <p className="font-bold">
              🏆 Podios
            </p>

            <p className="mt-2">
              • General: {resumen.podiosGeneral}
            </p>

            <p>
              • Viejitos: {resumen.podiosViejitos}
            </p>

            <p className="mt-2 font-bold">
              • Total: {resumen.podios}
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <p>
              📊 Promedio:{" "}
              <strong>
                {formatearRespectoPar(resumen.promedio)}
              </strong>{" "}
              ({formatearNumero(resumen.promedioGolpes)} golpes)
            </p>

            <p>
              ⭐ Mejor vuelta:{" "}
              <strong>
                {formatearRespectoPar(resumen.mejorScore)}
              </strong>{" "}
              ({resumen.mejorScoreGolpes} golpes)
            </p>

            <p>
              💰 Ganado: {formatearPesos(resumen.ganado)}
            </p>

            <p className="font-bold">
              📈 Balance: {formatearPesos(resumen.balance)}
            </p>
          </div>
        </div>

        {estadisticasCancha.length > 0 && (
          <section className="mt-6">
            <h2 className="rounded-xl bg-green-900 px-4 py-3 text-xl font-black text-white">
              RENDIMIENTO POR CANCHA
            </h2>

            <div className="mt-3 space-y-3">
              {estadisticasCancha.map((cancha) => (
                <div
                  key={cancha.canchaId}
                  className="rounded-xl border p-4 text-green-950"
                >
                  <h3 className="text-lg font-black">
                    🚩 {cancha.cancha}
                  </h3>

                  <p className="mt-2">
                    Fechas jugadas: {cancha.jugadas}
                  </p>

                  <p>
                    Victorias: {cancha.victorias}
                  </p>

                  <p>
                    Podios: {cancha.podios}
                  </p>

                  <p>
                    Promedio:{" "}
                    <strong>
                      {formatearRespectoPar(
                        cancha.promedioRespectoPar
                      )}
                    </strong>{" "}
                    ({formatearNumero(cancha.promedioGolpes)} golpes)
                  </p>

                  <p>
                    Mejor vuelta:{" "}
                    <strong>
                      {formatearRespectoPar(cancha.mejorVuelta)}
                    </strong>{" "}
                    ({cancha.mejorVueltaGolpes} golpes)
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="mt-8 text-center font-black text-green-900">
          ⚽ LA CHANGUEADA 🚩
        </p>
      </div>

      <button
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