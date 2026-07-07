"use client";

import { useEffect, useState } from "react";

type Resultado = {
  jugador: {
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
};

type FechaGuardada = {
  id: number;
  fecha: string;
  general: Resultado[];
  viejitos: Resultado[];
};

type EstadisticaJugador = {
  nombre: string;
  jugadas: number;
  aportado: number;
  ganado: number;
  balance: number;
  victorias: number;
  podios: number;
};

const VALOR_CHANGUEADA = 10000;

function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-AR")}`;
}

export default function Estadisticas() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaJugador[]>([]);

  useEffect(() => {
    const datos = localStorage.getItem("laChangueadaHistorial");

    if (!datos) return;

    const historial: FechaGuardada[] = JSON.parse(datos);
    const mapa = new Map<string, EstadisticaJugador>();

    function sumarResultado(resultado: Resultado) {
      const nombre = resultado.jugador.nombre;

      const actual = mapa.get(nombre) || {
        nombre,
        jugadas: 0,
        aportado: 0,
        ganado: 0,
        balance: 0,
        victorias: 0,
        podios: 0,
      };

      actual.jugadas += 1;
      actual.aportado += VALOR_CHANGUEADA;
      actual.ganado += resultado.premio;

      if (resultado.puesto === 1) {
        actual.victorias += 1;
      }

      if (resultado.puesto <= 3) {
        actual.podios += 1;
      }

      actual.balance = actual.ganado - actual.aportado;

      mapa.set(nombre, actual);
    }

    historial.forEach((fecha) => {
      fecha.general.forEach(sumarResultado);
      fecha.viejitos.forEach(sumarResultado);
    });

    setEstadisticas(
      Array.from(mapa.values()).sort((a, b) => b.balance - a.balance)
    );
  }, []);

  return (
    <main className="min-h-screen bg-green-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">
        Estadísticas
      </h1>

      <div className="space-y-4">
        {estadisticas.map((jugador) => (
          <div
            key={jugador.nombre}
            className="bg-white text-green-900 rounded-xl p-5"
          >
            <h2 className="text-2xl font-bold">
              {jugador.nombre}
            </h2>

            <p className="mt-2">
              Jugadas: {jugador.jugadas}
            </p>

            <p>
              Aportado: {formatearPesos(jugador.aportado)}
            </p>

            <p>
              Ganado: {formatearPesos(jugador.ganado)}
            </p>

            <p className="font-bold">
              Balance: {formatearPesos(jugador.balance)}
            </p>

            <p>
              Victorias: {jugador.victorias}
            </p>

            <p>
              Podios: {jugador.podios}
            </p>
          </div>
        ))}
      </div>

      <a
        href="/"
        className="inline-block mt-8 bg-white text-green-900 px-5 py-3 rounded-xl font-bold"
      >
        ← Menú principal
      </a>
    </main>
  );
}