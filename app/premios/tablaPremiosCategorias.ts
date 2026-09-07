export type PremiosCategorias = {
  a: number[];
  b: number[];
};

export type TablaPremiosCategorias = Record<
  number,
  PremiosCategorias
>;

const CLAVE_TABLA_PREMIOS_CATEGORIAS =
  "laChangueadaTablaPremiosCategorias55_45";

const PRIMERA_CANTIDAD = 14;
const ULTIMA_CANTIDAD = 100;
const VALOR_POR_JUGADOR = 10000;

const tablaPremiosCategoriasBase: TablaPremiosCategorias = {
  14: {
    a: [40000, 25000, 15000],
    b: [30000, 20000, 10000],
  },
  15: {
    a: [40000, 25000, 20000],
    b: [30000, 20000, 15000],
  },
  16: {
    a: [45000, 25000, 20000],
    b: [35000, 20000, 15000],
  },
  17: {
    a: [45000, 30000, 20000],
    b: [35000, 25000, 15000],
  },
  18: {
    a: [50000, 30000, 20000],
    b: [40000, 25000, 15000],
  },
  19: {
    a: [50000, 30000, 25000],
    b: [40000, 25000, 20000],
  },
  20: {
    a: [55000, 35000, 20000],
    b: [45000, 25000, 20000],
  },
  21: {
    a: [55000, 35000, 25000],
    b: [45000, 30000, 20000],
  },
  22: {
    a: [60000, 35000, 25000],
    b: [50000, 30000, 20000],
  },
  23: {
    a: [55000, 35000, 25000, 10000],
    b: [45000, 30000, 20000, 10000],
  },
  24: {
    a: [60000, 35000, 25000, 10000],
    b: [50000, 30000, 20000, 10000],
  },
  25: {
    a: [65000, 40000, 25000, 10000],
    b: [50000, 30000, 20000, 10000],
  },
  26: {
    a: [65000, 40000, 30000, 10000],
    b: [50000, 30000, 25000, 10000],
  },
  27: {
    a: [70000, 40000, 30000, 10000],
    b: [55000, 35000, 20000, 10000],
  },
  28: {
    a: [70000, 45000, 30000, 10000],
    b: [55000, 35000, 25000, 10000],
  },
  29: {
    a: [75000, 45000, 30000, 10000],
    b: [60000, 35000, 25000, 10000],
  },
  30: {
    a: [75000, 45000, 35000, 10000],
    b: [60000, 40000, 25000, 10000],
  },
};

function redondearA5000(valor: number) {
  return Math.round(valor / 5000) * 5000;
}

function repartirPrimerosTres(
  disponible: number
): number[] {
  const segundo = redondearA5000(
    disponible * 0.3
  );

  const tercero = redondearA5000(
    disponible * 0.2
  );

  const primero =
    disponible - segundo - tercero;

  return [primero, segundo, tercero];
}

function generarFila(
  totalJugadores: number
): PremiosCategorias {
  const pozoTotal =
    totalJugadores * VALOR_POR_JUGADOR;

  const pozoA = redondearA5000(
    pozoTotal * 0.55
  );

  const pozoB = pozoTotal - pozoA;

  const premiosFijos =
    totalJugadores >= 40
      ? [20000, 10000]
      : [10000];

  const totalPremiosFijos =
    premiosFijos.reduce(
      (total, premio) => total + premio,
      0
    );

  return {
    a: [
      ...repartirPrimerosTres(
        pozoA - totalPremiosFijos
      ),
      ...premiosFijos,
    ],
    b: [
      ...repartirPrimerosTres(
        pozoB - totalPremiosFijos
      ),
      ...premiosFijos,
    ],
  };
}

function crearTablaOriginal(): TablaPremiosCategorias {
  const tabla: TablaPremiosCategorias = {};

  for (
    let jugadores = PRIMERA_CANTIDAD;
    jugadores <= ULTIMA_CANTIDAD;
    jugadores++
  ) {
    const filaBase =
      tablaPremiosCategoriasBase[jugadores];

    tabla[jugadores] = filaBase
      ? {
          a: [...filaBase.a],
          b: [...filaBase.b],
        }
      : generarFila(jugadores);
  }

  return tabla;
}

export const tablaPremiosCategoriasOriginal =
  crearTablaOriginal();

function copiarTabla(
  tabla: TablaPremiosCategorias
): TablaPremiosCategorias {
  return Object.fromEntries(
    Object.entries(tabla).map(
      ([jugadores, premios]) => [
        Number(jugadores),
        {
          a: [...premios.a],
          b: [...premios.b],
        },
      ]
    )
  );
}

function cantidadPremiosEsperada(
  jugadores: number
) {
  if (jugadores >= 40) return 5;
  if (jugadores >= 23) return 4;
  return 3;
}

function filaValida(
  valor: unknown,
  jugadores: number
): valor is PremiosCategorias {
  if (
    typeof valor !== "object" ||
    valor === null
  ) {
    return false;
  }

  const fila = valor as PremiosCategorias;
  const cantidadEsperada =
    cantidadPremiosEsperada(jugadores);

  return (
    Array.isArray(fila.a) &&
    Array.isArray(fila.b) &&
    fila.a.length === cantidadEsperada &&
    fila.b.length === cantidadEsperada &&
    [...fila.a, ...fila.b].every(
      (premio) =>
        typeof premio === "number" &&
        Number.isFinite(premio) &&
        premio >= 0
    )
  );
}

export function obtenerTablaPremiosCategorias(): TablaPremiosCategorias {
  const original = copiarTabla(
    tablaPremiosCategoriasOriginal
  );

  if (typeof window === "undefined") {
    return original;
  }

  const guardada = localStorage.getItem(
    CLAVE_TABLA_PREMIOS_CATEGORIAS
  );

  if (!guardada) {
    return original;
  }

  try {
    const tablaGuardada = JSON.parse(
      guardada
    ) as Record<number, unknown>;

    for (
      let jugadores = PRIMERA_CANTIDAD;
      jugadores <= ULTIMA_CANTIDAD;
      jugadores++
    ) {
      const fila = tablaGuardada[jugadores];

      if (filaValida(fila, jugadores)) {
        original[jugadores] = {
          a: [...fila.a],
          b: [...fila.b],
        };
      }
    }

    return original;
  } catch {
    return original;
  }
}

export function guardarTablaPremiosCategorias(
  tabla: TablaPremiosCategorias
) {
  localStorage.setItem(
    CLAVE_TABLA_PREMIOS_CATEGORIAS,
    JSON.stringify(tabla)
  );
}

export function restaurarTablaPremiosCategorias() {
  localStorage.removeItem(
    CLAVE_TABLA_PREMIOS_CATEGORIAS
  );
}

export function obtenerPremiosCategorias(
  totalJugadores: number
): PremiosCategorias {
  const tabla = obtenerTablaPremiosCategorias();

  return (
    tabla[totalJugadores] ?? {
      a: [],
      b: [],
    }
  );
}