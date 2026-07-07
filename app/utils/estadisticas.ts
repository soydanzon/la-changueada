export type Resultado = {
  jugador: {
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
};

export type FechaGuardada = {
  id: number;
  fecha: string;
  general: Resultado[];
  viejitos: Resultado[];
};

export type EstadisticaJugador = {
  nombre: string;
  jugadas: number;
  aportado: number;
  ganado: number;
  balance: number;
  victorias: number;
  podios: number;
  sumaScores: number;
  promedio: number;
  mejorScore: number;
};

const VALOR_CHANGUEADA = 10000;

export function calcularEstadisticas(historial: FechaGuardada[]) {
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
      sumaScores: 0,
      promedio: 0,
      mejorScore: 999,
    };

    actual.jugadas += 1;
    actual.aportado += VALOR_CHANGUEADA;
    actual.ganado += resultado.premio;
    actual.sumaScores += resultado.score;

    if (resultado.score < actual.mejorScore) {
      actual.mejorScore = resultado.score;
    }

    if (resultado.puesto === 1) {
      actual.victorias += 1;
    }

    if (resultado.puesto <= 3) {
      actual.podios += 1;
    }

    actual.balance = actual.ganado - actual.aportado;
    actual.promedio = actual.sumaScores / actual.jugadas;

    mapa.set(nombre, actual);
  }

  historial.forEach((fecha) => {
    fecha.general.forEach(sumarResultado);
    fecha.viejitos.forEach(sumarResultado);
  });

  return Array.from(mapa.values()).map((jugador) => ({
    ...jugador,
    mejorScore: jugador.mejorScore === 999 ? 0 : jugador.mejorScore,
  }));
}