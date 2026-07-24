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

type FechaPorEdad = {
  formato?: "edad";
  general: number[];
  viejitos: number[];
  cancha: number;
  pagosPendientes?: number[];
};

type FechaPorCategorias = {
  formato: "categorias";
  jugadores: number[];
  categoriaA: number[];
  categoriaB: number[];
  cancha: number;
  pagosPendientes?: number[];
};

type FechaActual =
  | FechaPorEdad
  | FechaPorCategorias;

export default function Scores() {
  const router = useRouter();

  const [categoriaUno, setCategoriaUno] = useState<
    Jugador[]
  >([]);

  const [categoriaDos, setCategoriaDos] = useState<
    Jugador[]
  >([]);

  const [formato, setFormato] = useState<
    "edad" | "categorias"
  >("edad");

  const [scores, setScores] = useState<
    Record<number, string>
  >({});

  const [nombreCancha, setNombreCancha] =
    useState("");

  const [parCancha, setParCancha] = useState(0);

  useEffect(() => {
    const fechaGuardada = localStorage.getItem(
      "laChangueadaFechaActual"
    );

    const scoresGuardados = localStorage.getItem(
      "laChangueadaScores"
    );

    if (scoresGuardados) {
      try {
        setScores(JSON.parse(scoresGuardados));
      } catch {
        setScores({});
      }
    }

    if (!fechaGuardada) return;

    try {
      const datos: FechaActual =
        JSON.parse(fechaGuardada);

      const cancha = obtenerCanchasGuardadas().find(
        (canchaGuardada) =>
          canchaGuardada.id === datos.cancha
      );

      if (cancha) {
        setNombreCancha(cancha.nombre);
        setParCancha(cancha.par);
      }

      const jugadoresGuardados = localStorage.getItem(
        "laChangueadaJugadores"
      );

      const lista: Jugador[] = jugadoresGuardados
        ? JSON.parse(jugadoresGuardados)
        : jugadores;

      if (datos.formato === "categorias") {
        setFormato("categorias");

        setCategoriaUno(
          lista.filter((jugador) =>
            (datos.categoriaA ?? []).includes(
              jugador.id
            )
          )
        );

        setCategoriaDos(
          lista.filter((jugador) =>
            (datos.categoriaB ?? []).includes(
              jugador.id
            )
          )
        );

        return;
      }

      setFormato("edad");

      setCategoriaUno(
        lista.filter((jugador) =>
          (datos.general ?? []).includes(jugador.id)
        )
      );

      setCategoriaDos(
        lista.filter((jugador) =>
          (datos.viejitos ?? []).includes(jugador.id)
        )
      );
    } catch (error) {
      console.error(
        "No se pudo cargar la fecha:",
        error
      );
    }
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

    if (fechaActual.formato === "categorias") {
      localStorage.setItem(
        "laChangueadaNuevaFechaCategoriasBorrador",
        JSON.stringify({
          canchaId: fechaActual.cancha,
          jugadores: fechaActual.jugadores,
          categoriaA: fechaActual.categoriaA,
          categoriaB: fechaActual.categoriaB,
          pagosPendientes:
            fechaActual.pagosPendientes ?? [],
          busqueda: "",
        })
      );

      localStorage.removeItem(
        "laChangueadaScores"
      );

      router.push("/nueva-fecha/categorias");
      return;
    }

    localStorage.setItem(
      "laChangueadaNuevaFechaBorrador",
      JSON.stringify({
        canchaId: fechaActual.cancha,
        general: fechaActual.general,
        viejitos: fechaActual.viejitos,
        pagosPendientes:
          fechaActual.pagosPendientes ?? [],
        busqueda: "",
      })
    );

    localStorage.removeItem(
      "laChangueadaScores"
    );

    router.push("/nueva-fecha/edad");
  }

  function calcularResultados() {
    localStorage.setItem(
      "laChangueadaScores",
      JSON.stringify(scores)
    );

    router.push("/resultados");
  }

  const jugadoresUnicos = [
    ...categoriaUno,
    ...categoriaDos,
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

  const nombreCategoriaUno =
    formato === "categorias"
      ? "Categoría A"
      : "General";

  const nombreCategoriaDos =
    formato === "categorias"
      ? "Categoría B"
      : "Viejitos";

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
         📝 Cargar Scores
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-white p-3 text-green-900">
        <p>
          <span className="font-bold">
            ⛳ {nombreCancha}
          </span>

          &nbsp;&nbsp;&nbsp;

          <span className="font-normal">
            Par {parCancha}
          </span>
        </p>
      </div>

      <div className="mb-4 rounded-xl bg-white p-3 text-green-900">
        <h2 className="mb-3 text-2xl font-bold">
          Scores
        </h2>

        {jugadoresUnicos.map((jugador) => (
          <div
            key={jugador.id}
            className="flex items-center justify-between gap-4 border-b py-2"
          >
            <div>
              <span className="font-bold">
                {jugador.nombre}
              </span>

              {formato === "categorias" && (
                <span className="ml-2 text-sm font-normal">
                  (
                  {categoriaUno.some(
                    (jugadorCategoria) =>
                      jugadorCategoria.id === jugador.id
                  )
                    ? "A"
                    : "B"}
                  )
                </span>
              )}
            </div>

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

      <div className="mb-8 rounded-xl bg-white p-3 text-green-900">
        <h2 className="text-2xl font-bold">
          Resumen
        </h2>

        <p className="mt-3">
          {nombreCategoriaUno}:{" "}
          {categoriaUno.length} jugadores
        </p>

        {categoriaDos.length > 0 && (
          <p>
            {nombreCategoriaDos}:{" "}
            {categoriaDos.length} jugadores
          </p>
        )}
      </div>

      <button
        onClick={anotarJugador}
        className="mb-4 w-full rounded-xl bg-white p-4 text-xl font-bold text-green-900"
      >
        ⬅️ Anotar jugador
      </button>

      <button
        onClick={calcularResultados}
        className="w-full rounded-xl bg-green-600 p-5 text-2xl font-bold text-white"
      >
        ✍️ Calcular resultados
      </button>
    </main>
  );
}