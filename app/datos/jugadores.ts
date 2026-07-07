export type Jugador = {
  id: number;
  nombre: string;
  frecuente: boolean;
};

export const jugadores: Jugador[] = [
  {
    id: 1,
    nombre: "Guillermo Tkach",
    frecuente: true,
  },
  {
    id: 2,
    nombre: "Sergio Vázquez",
    frecuente: true,
  },
  {
    id: 3,
    nombre: "Martín López",
    frecuente: true,
  },
  {
    id: 4,
    nombre: "Pablo Pérez",
    frecuente: false,
  },
];