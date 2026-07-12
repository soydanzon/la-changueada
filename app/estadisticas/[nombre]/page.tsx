"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  calcularEstadisticas,
  calcularEstadisticasPorCancha,
  type EstadisticaCancha,
  type EstadisticaJugador,
  type FechaGuardada,
} from "../../utils/estadisticas";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

type HistorialJugador = {
  fecha: string;
  categoria: string;
  score: number;
  puesto: number;
  premio: number;
};

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

function formatearRespectoPar(valor: number) {
  if (valor === 0) return "E";

  const numero = formatearNumero(valor);

  return valor > 0 ? `+${numero}` : numero;
}

function medalla(puesto: number) {
  if (puesto === 1) return "🥇";
  if (puesto === 2) return "🥈";
  if (puesto === 3) return "🥉";
  return `${puesto}°`;
}

export default function PerfilJugador() {
  const params = useParams();
  const nombre = decodeURIComponent(params.nombre as string);

  const [resumen, setResumen] =
    useState<EstadisticaJugador | null>(null);

  const [estadisticasCancha, setEstadisticasCancha] = useState<
    EstadisticaCancha[]
  >([]);

  const [historialJugador, setHistorialJugador] = useState<
    HistorialJugador[]
  >([]);

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const fechas: FechaGuardada[] = JSON.parse(datos);

    const estadisticas = calcularEstadisticas(fechas);

    const jugador = estadisticas.find(
      (estadistica) => estadistica.nombre === nombre
    );

    if (jugador) {
      setResumen(jugador);
    }

    setEstadisticasCancha(
      calcularEstadisticasPorCancha(fechas, nombre)
    );

    const historial: HistorialJugador[] = [];

    fechas.forEach((fecha) => {
      fecha.general.forEach((resultado) => {
        if (resultado.jugador.nombre !== nombre) return;

        historial.push({
          fecha: fecha.fecha,
          categoria: "General",
          score: resultado.score,
          puesto: resultado.puesto,
          premio: resultado.premio,
        });
      });

      fecha.viejitos.forEach((resultado) => {
        if (resultado.jugador.nombre !== nombre) return;

        historial.push({
          fecha: fecha.fecha,
          categoria: "Viejitos",
          score: resultado.score,
          puesto: resultado.puesto,
          premio: resultado.premio,
        });
      });
    });

    setHistorialJugador(historial);
  }, [nombre]);

  if (!resumen) {
    return (
      <main className="min-h-screen bg-green-900 p-6 text-white">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">
          {nombre}
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          Resumen general
        </h2>

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
            💸 Aportado: {formatearPesos(resumen.aportado)}
          </p>

          <p>
            💰 Ganado: {formatearPesos(resumen.ganado)}
          </p>

          <p className="text-lg font-bold">
            📈 Balance: {formatearPesos(resumen.balance)}
          </p>
        </div>

        <a
          href={`/estadisticas/${encodeURIComponent(nombre)}/compartir`}
          className="mt-8 block w-full rounded-xl bg-green-900 p-4 text-center font-bold text-white"
        >
          📤 Compartir perfil
        </a>
      </div>

      {estadisticasCancha.length > 0 && (
        <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
          <h2 className="mb-4 text-2xl font-bold">
            🚩 Rendimiento por cancha
          </h2>

          <div className="space-y-4">
            {estadisticasCancha.map((cancha) => (
              <div
                key={cancha.canchaId}
                className="rounded-xl border p-4"
              >
                <h3 className="text-xl font-bold">
                  🚩 {cancha.cancha}
                </h3>

                <p className="mt-2">
                  📅 Fechas jugadas: {cancha.jugadas}
                </p>

                <p>
                  🥇 Victorias: {cancha.victorias}
                </p>

                <p>
                  🏆 Podios: {cancha.podios}
                </p>

                <p>
                  📊 Promedio:{" "}
                  <strong>
                    {formatearRespectoPar(
                      cancha.promedioRespectoPar
                    )}
                  </strong>{" "}
                  ({formatearNumero(cancha.promedioGolpes)} golpes)
                </p>

                <p>
                  ⭐ Mejor vuelta:{" "}
                  <strong>
                    {formatearRespectoPar(cancha.mejorVuelta)}
                  </strong>{" "}
                  ({cancha.mejorVueltaGolpes} golpes)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl bg-white p-5 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          Historial
        </h2>

        {historialJugador.map((h, index) => (
          <div
            key={index}
            className="mb-4 rounded-xl border p-4"
          >
            <p className="font-bold">
              📅 {h.fecha}
            </p>

            <p>
              🏆 {h.categoria}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xl font-bold">
                {medalla(h.puesto)}
              </span>

              <span>
                ⚽ {h.score}
              </span>

              <span className="font-bold">
                💰 {formatearPesos(h.premio)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}