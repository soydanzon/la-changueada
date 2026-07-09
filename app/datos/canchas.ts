export type Cancha = {
  id: number;
  nombre: string;
  par: number;
  activa: boolean;
};

export const canchasIniciales: Cancha[] = [
  {
    id: 1,
    nombre: "Los Álamos",
    par: 69,
    activa: true,
  },
  {
    id: 2,
    nombre: "Cedros",
    par: 72,
    activa: true,
  },
];

export function obtenerCanchasGuardadas(): Cancha[] {
  const guardadas = localStorage.getItem("laChangueadaCanchas");

  if (guardadas) {
    return JSON.parse(guardadas);
  }

  localStorage.setItem(
    "laChangueadaCanchas",
    JSON.stringify(canchasIniciales)
  );

  return canchasIniciales;
}