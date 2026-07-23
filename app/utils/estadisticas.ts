export type Resultado = {
  jugador: {
    nombre: string;
  };
  score: number;
  puesto: number;
  premio: number;
};

export type CanchaFecha = {
  id: number;
  nombre: string;
  par: number;
};

export type FechaGuardada = {
  id: number;
  fecha: string;
  formato?: "edad" | "categorias";
  cancha?: CanchaFecha | null;

  general: Resultado[];
  viejitos: Resultado[];

  categoriaA?: Resultado[];
  categoriaB?: Resultado[];
};

export type EstadisticaJugador = {
  nombre: string;

  jugadas: number;

  participacionesGeneral: number;
  participacionesViejitos: number;
  participacionesCategoriaA: number;
  participacionesCategoriaB: number;

  aportado: number;
  ganado: number;
  balance: number;

  victorias: number;
  victoriasGeneral: number;
  victoriasViejitos: number;
  victoriasCategoriaA: number;
  victoriasCategoriaB: number;

  podios: number;
  podiosGeneral: number;
  podiosViejitos: number;
  podiosCategoriaA: number;
  podiosCategoriaB: number;

  sumaScores: number;
  promedioGolpes: number;

  sumaRespectoPar: number;
  jugadasConPar: number;
  promedio: number;

  mejorScore: number;
  mejorScoreGolpes: number;
};

export type EstadisticaCancha = {
  canchaId: number;
  cancha: string;
  par: number;

  jugadas: number;
  victorias: number;
  podios: number;

  sumaScores: number;
  promedioGolpes: number;

  sumaRespectoPar: number;
  promedioRespectoPar: number;

  mejorVuelta: number;
  mejorVueltaGolpes: number;
};

export type FechaHandicap = {
  fecha: string;
  cancha: string;
  score: number;
  golpes: number;
  cuenta: boolean;
};

export type HandicapJugador = {
  nombre: string;
  handicap: number;
  fechas: FechaHandicap[];
};

const VALOR_CHANGUEADA = 10000;

type CanchaActual = {
  id: number;
  nombre: string;
};

function obtenerNombreCanchaActual(
  cancha: CanchaFecha
) {
  if (typeof window === "undefined") {
    return cancha.nombre;
  }

  try {
    const datos = localStorage.getItem(
      "laChangueadaCanchas"
    );

    if (!datos) {
      return cancha.nombre;
    }

    const canchas: CanchaActual[] =
      JSON.parse(datos);

    return (
      canchas.find(
        (canchaActual) =>
          canchaActual.id === cancha.id
      )?.nombre ?? cancha.nombre
    );
  } catch {
    return cancha.nombre;
  }
}

function obtenerResultadosFecha(
  fecha: FechaGuardada
) {
  if (fecha.formato === "categorias") {
    return {
      formato: "categorias" as const,

      categoriaUno:
        fecha.categoriaA ??
        fecha.general ??
        [],

      categoriaDos:
        fecha.categoriaB ??
        fecha.viejitos ??
        [],
    };
  }

  return {
    formato: "edad" as const,
    categoriaUno: fecha.general ?? [],
    categoriaDos: fecha.viejitos ?? [],
  };
}

export function calcularEstadisticas(
  historial: FechaGuardada[]
): EstadisticaJugador[] {
  const mapa = new Map<
    string,
    EstadisticaJugador
  >();

  historial.forEach((fecha) => {
    const {
      formato,
      categoriaUno,
      categoriaDos,
    } = obtenerResultadosFecha(fecha);

    const nombres = new Set<string>();

    categoriaUno.forEach((resultado) => {
      nombres.add(resultado.jugador.nombre);
    });

    categoriaDos.forEach((resultado) => {
      nombres.add(resultado.jugador.nombre);
    });

    nombres.forEach((nombre) => {
      const resultadosCategoriaUno =
        categoriaUno.filter(
          (resultado) =>
            resultado.jugador.nombre === nombre
        );

      const resultadosCategoriaDos =
        categoriaDos.filter(
          (resultado) =>
            resultado.jugador.nombre === nombre
        );

      const resultadosJugador = [
        ...resultadosCategoriaUno,
        ...resultadosCategoriaDos,
      ];

      if (resultadosJugador.length === 0) {
        return;
      }

      const score = resultadosJugador[0].score;

      const actual =
        mapa.get(nombre) ?? {
          nombre,

          jugadas: 0,

          participacionesGeneral: 0,
          participacionesViejitos: 0,
          participacionesCategoriaA: 0,
          participacionesCategoriaB: 0,

          aportado: 0,
          ganado: 0,
          balance: 0,

          victorias: 0,
          victoriasGeneral: 0,
          victoriasViejitos: 0,
          victoriasCategoriaA: 0,
          victoriasCategoriaB: 0,

          podios: 0,
          podiosGeneral: 0,
          podiosViejitos: 0,
          podiosCategoriaA: 0,
          podiosCategoriaB: 0,

          sumaScores: 0,
          promedioGolpes: 0,

          sumaRespectoPar: 0,
          jugadasConPar: 0,
          promedio: 0,

          mejorScore: 999,
          mejorScoreGolpes: 999,
        };

      actual.jugadas += 1;

      actual.sumaScores += score;

      actual.promedioGolpes =
        actual.sumaScores / actual.jugadas;

      actual.aportado +=
        VALOR_CHANGUEADA *
        resultadosJugador.length;

      actual.ganado +=
        resultadosJugador.reduce(
          (total, resultado) =>
            total + resultado.premio,
          0
        );

      const victoriasCategoriaUno =
        resultadosCategoriaUno.filter(
          (resultado) =>
            resultado.puesto === 1
        ).length;

      const victoriasCategoriaDos =
        resultadosCategoriaDos.filter(
          (resultado) =>
            resultado.puesto === 1
        ).length;

      const podiosCategoriaUno =
        resultadosCategoriaUno.filter(
          (resultado) =>
            resultado.puesto <= 3
        ).length;

      const podiosCategoriaDos =
        resultadosCategoriaDos.filter(
          (resultado) =>
            resultado.puesto <= 3
        ).length;

      if (formato === "categorias") {
        actual.participacionesCategoriaA +=
          resultadosCategoriaUno.length;

        actual.participacionesCategoriaB +=
          resultadosCategoriaDos.length;

        actual.victoriasCategoriaA +=
          victoriasCategoriaUno;

        actual.victoriasCategoriaB +=
          victoriasCategoriaDos;

        actual.podiosCategoriaA +=
          podiosCategoriaUno;

        actual.podiosCategoriaB +=
          podiosCategoriaDos;
      } else {
        actual.participacionesGeneral +=
          resultadosCategoriaUno.length;

        actual.participacionesViejitos +=
          resultadosCategoriaDos.length;

        actual.victoriasGeneral +=
          victoriasCategoriaUno;

        actual.victoriasViejitos +=
          victoriasCategoriaDos;

        actual.podiosGeneral +=
          podiosCategoriaUno;

        actual.podiosViejitos +=
          podiosCategoriaDos;
      }

      actual.victorias =
        actual.victoriasGeneral +
        actual.victoriasViejitos +
        actual.victoriasCategoriaA +
        actual.victoriasCategoriaB;

      actual.podios =
        actual.podiosGeneral +
        actual.podiosViejitos +
        actual.podiosCategoriaA +
        actual.podiosCategoriaB;

      if (fecha.cancha) {
        const respectoPar =
          score - fecha.cancha.par;

        actual.jugadasConPar += 1;

        actual.sumaRespectoPar +=
          respectoPar;

        actual.promedio =
          actual.sumaRespectoPar /
          actual.jugadasConPar;

        if (
          respectoPar < actual.mejorScore
        ) {
          actual.mejorScore = respectoPar;
          actual.mejorScoreGolpes = score;
        }
      }

      actual.balance =
        actual.ganado - actual.aportado;

      mapa.set(nombre, actual);
    });
  });

  return Array.from(mapa.values()).map(
    (jugador) => ({
      ...jugador,

      mejorScore:
        jugador.mejorScore === 999
          ? 0
          : jugador.mejorScore,

      mejorScoreGolpes:
        jugador.mejorScoreGolpes === 999
          ? 0
          : jugador.mejorScoreGolpes,
    })
  );
}

export function calcularEstadisticasPorCancha(
  historial: FechaGuardada[],
  nombreJugador: string
): EstadisticaCancha[] {
  const mapa = new Map<
    number,
    EstadisticaCancha
  >();

  historial.forEach((fecha) => {
    if (!fecha.cancha) {
      return;
    }

    const {
      categoriaUno,
      categoriaDos,
    } = obtenerResultadosFecha(fecha);

    const resultadosJugador = [
      ...categoriaUno.filter(
        (resultado) =>
          resultado.jugador.nombre ===
          nombreJugador
      ),

      ...categoriaDos.filter(
        (resultado) =>
          resultado.jugador.nombre ===
          nombreJugador
      ),
    ];

    if (resultadosJugador.length === 0) {
      return;
    }

    const score = resultadosJugador[0].score;

    const respectoPar =
      score - fecha.cancha.par;

    const actual =
      mapa.get(fecha.cancha.id) ?? {
        canchaId: fecha.cancha.id,
        cancha:
          obtenerNombreCanchaActual(
            fecha.cancha
          ),
        par: fecha.cancha.par,

        jugadas: 0,
        victorias: 0,
        podios: 0,

        sumaScores: 0,
        promedioGolpes: 0,

        sumaRespectoPar: 0,
        promedioRespectoPar: 0,

        mejorVuelta: 999,
        mejorVueltaGolpes: 999,
      };

    actual.jugadas += 1;

    actual.victorias +=
      resultadosJugador.filter(
        (resultado) =>
          resultado.puesto === 1
      ).length;

    actual.podios +=
      resultadosJugador.filter(
        (resultado) =>
          resultado.puesto <= 3
      ).length;

    actual.sumaScores += score;

    actual.promedioGolpes =
      actual.sumaScores / actual.jugadas;

    actual.sumaRespectoPar +=
      respectoPar;

    actual.promedioRespectoPar =
      actual.sumaRespectoPar /
      actual.jugadas;

    if (
      respectoPar < actual.mejorVuelta
    ) {
      actual.mejorVuelta = respectoPar;
      actual.mejorVueltaGolpes = score;
    }

    actual.cancha =
      obtenerNombreCanchaActual(
        fecha.cancha
      );

    mapa.set(fecha.cancha.id, actual);
  });

  return Array.from(mapa.values())
    .map((cancha) => ({
      ...cancha,

      mejorVuelta:
        cancha.mejorVuelta === 999
          ? 0
          : cancha.mejorVuelta,

      mejorVueltaGolpes:
        cancha.mejorVueltaGolpes === 999
          ? 0
          : cancha.mejorVueltaGolpes,
    }))
    .sort(
      (a, b) => b.jugadas - a.jugadas
    );
}

export function calcularHandicap(
  historial: FechaGuardada[]
): HandicapJugador[] {
  const mapa = new Map<
    string,
    Omit<FechaHandicap, "cuenta">[]
  >();

  const historialOrdenado = [
    ...historial,
  ].sort((a, b) => a.id - b.id);

  historialOrdenado.forEach((fecha) => {
    if (!fecha.cancha) {
      return;
    }

    const cancha = fecha.cancha;

    const {
      categoriaUno,
      categoriaDos,
    } = obtenerResultadosFecha(fecha);

    const nombres = new Set<string>();

    categoriaUno.forEach((resultado) => {
      nombres.add(resultado.jugador.nombre);
    });

    categoriaDos.forEach((resultado) => {
      nombres.add(resultado.jugador.nombre);
    });

    nombres.forEach((nombre) => {
      const resultado =
        categoriaUno.find(
          (resultadoCategoria) =>
            resultadoCategoria.jugador.nombre ===
            nombre
        ) ??
        categoriaDos.find(
          (resultadoCategoria) =>
            resultadoCategoria.jugador.nombre ===
            nombre
        );

      if (!resultado) {
        return;
      }

      const fechasJugador =
        mapa.get(nombre) ?? [];

      fechasJugador.push({
        fecha: fecha.fecha,

        cancha:
          obtenerNombreCanchaActual(
            cancha
          ),

        score:
          resultado.score - cancha.par,

        golpes: resultado.score,
      });

      mapa.set(nombre, fechasJugador);
    });
  });

  return Array.from(mapa.entries())
    .map(
      ([nombre, todasLasFechas]) => {
        const ultimas16 =
          todasLasFechas.slice(-16);

        const cantidadQueCuenta =
          Math.min(
            8,
            Math.ceil(
              ultimas16.length / 2
            )
          );

        const indicesQueCuentan =
          ultimas16
            .map((fecha, index) => ({
              index,
              score: fecha.score,
            }))
            .sort(
              (a, b) =>
                a.score - b.score
            )
            .slice(
              0,
              cantidadQueCuenta
            )
            .map(
              (fecha) => fecha.index
            );

        const fechas = ultimas16.map(
          (fecha, index) => ({
            ...fecha,

            cuenta:
              indicesQueCuentan.includes(
                index
              ),
          })
        );

        const fechasQueCuentan =
          fechas.filter(
            (fecha) => fecha.cuenta
          );

        const handicap =
          fechasQueCuentan.length > 0
            ? fechasQueCuentan.reduce(
                (total, fecha) =>
                  total + fecha.score,
                0
              ) /
              fechasQueCuentan.length
            : 0;

        return {
          nombre,
          handicap,
          fechas,
        };
      }
    )
    .sort(
      (a, b) =>
        a.handicap - b.handicap
    );
}