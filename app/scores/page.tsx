"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  jugadores,
  type Jugador,
} from "../datos/jugadores";
import { obtenerCanchasGuardadas } from "../datos/canchas";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

type FechaActual = {
  general: number[];
  viejitos: number[];
  cancha: number;
};

export default function Scores() {
  const router = useRouter();

  const [general, setGeneral] = useState<Jugador[]>([]);
  const [viejitos, setViejitos] = useState<Jugador[]>([]);

  const [scores, setScores] = useState<
    Record<number, string>
  >({});

  const [nombreCancha, setNombreCancha] =
    useState("");

  const [parCancha, setParCancha] = useState(0);

  useEffect(() => {
    const fecha = localStorage.getItem(
      "laChangueadaFechaActual"
    );

    const scoresGuardados = localStorage.getItem(
      "laChangueadaScores"
    );

    if (scoresGuardados) {
      setScores(JSON.parse(scoresGuardados));
    }

    if (!fecha) return;

    const datos: FechaActual = JSON.parse(fecha);

    const cancha = obtenerCanchasGuardadas().find(
      (canchaGuardada) =>
        canchaGuardada.id === datos.cancha
    );

    if (cancha) {
      setNombreCancha(cancha.nombre);
      setParCancha(cancha.par);
    }

    const guardados = localStorage.getItem(
      "laChangueadaJugadores"
    );

    const lista: Jugador[] = guardados
      ? JSON.parse(guardados)
      : jugadores;

    setGeneral(
      lista.filter((jugador) =>
        datos.general.includes(jugador.id)
      )
    );

    setViejitos(
      lista.filter((jugador) =>
        datos.viejitos.includes(jugador.id)
      )
    );
  }, []);

  function cambiarScore(id: number, valor: string) {
    const nuevosScores = {
      ...scores,
      [id]: valor,
    };

    setScores(nuevosScores);

    localStorage.setItem(
      "laChangueadaScores",
      JSON.stringify(nuevosScores)
    );
  }

  function anotarJugador() {
    const fechaGuardada = localStorage.getItem(
      "laChangueadaFechaActual"
    );

    if (!fechaGuardada) return;

    const fechaActual: FechaActual =
      JSON.parse(fechaGuardada);

    localStorage.setItem(
      "laChangueadaNuevaFechaBorrador",
      JSON.stringify({
        canchaId: fechaActual.cancha,
        general: fechaActual.general,
        viejitos: fechaActual.viejitos,
        busqueda: "",
      })
    );

    localStorage.removeItem("laChangueadaScores");

    router.push("/nueva-fecha");
  }

  function calcularResultados() {
    localStorage.setItem(
      "laChangueadaScores",
      JSON.stringify(scores)
    );

    router.push("/resultados");
  }

  const jugadoresUnicos = [
    ...general,
    ...viejitos,
  ]
    .filter(
      (jugador, index, array) =>
        array.findIndex(
          (otroJugador) =>
            otroJugador.id === jugador.id
        ) === index
    )
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", {
        sensitivity: "base",
      })
    );

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Cargar Scores
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white p-5 text-green-900">
        <p className="font-bold">
          🚩 {nombreCancha}
        </p>

        <p>E {parCancha}</p>
      </div>

      <div className="mb-8 rounded-xl bg-white p-5 text-green-900">
        <h2 className="mb-4 text-2xl font-bold">
          Scores
        </h2>

        {jugadoresUnicos.map((jugador) => (
          <div
            key={jugador.id}
            className="flex items-center justify-between gap-4 border-b py-3"
          >
            <span className="font-bold">
              {jugador.nombre}
            </span>

            <input
              type="number"
              inputMode="numeric"
              value={scores[jugador.id] || ""}
              onChange={(evento) =>
                cambiarScore(
                  jugador.id,
                  evento.target.value
                )
              }
              className="w-24 rounded-lg border bg-white p-2 text-center text-xl text-black"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl bg-white p-5 text-green-900">
        <h2 className="text-2xl font-bold">
          Resumen
        </h2>

        <p className="mt-3">
          General: {general.length} jugadores
        </p>

        <p>
          Viejitos: {viejitos.length} jugadores
        </p>
      </div>

      <button
        onClick={anotarJugador}
        className="mb-4 w-full rounded-xl bg-green-700 p-4 text-xl font-bold text-white"
      >
        ← Anotar jugador
      </button>

      <button
        onClick={calcularResultados}
        className="w-full rounded-xl bg-white p-5 text-2xl font-bold text-green-900"
      >
        Calcular resultados
      </button>
    </main>
  );
}