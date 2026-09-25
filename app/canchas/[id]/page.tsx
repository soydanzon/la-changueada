"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { type Cancha } from "../../datos/canchas";
import { createClient } from "../../lib/supabase/client";
import BotonInicio from "../../components/BotonInicio";
import BotonVolver from "../../components/BotonVolver";

export default function EditarCancha() {
  const params = useParams();
  const router = useRouter();

  const [nombre, setNombre] =
    useState("");

  const [par, setPar] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  useEffect(() => {
    async function cargarCancha() {
      const idCancha = Number(
        params.id
      );

      const supabase = createClient();

      const { data, error } =
        await supabase
          .from("canchas")
          .select(
            "id, nombre, par, activa"
          )
          .eq("id", idCancha)
          .single();

      if (error || !data) {
        console.error(
          "No se pudo cargar la cancha:",
          error
        );

        setMensaje(
          "⚠️ No se pudo cargar la cancha."
        );

        setCargando(false);
        return;
      }

      setNombre(data.nombre);
      setPar(String(data.par));
      setCargando(false);
    }

    cargarCancha();
  }, [params.id]);

  async function guardar() {
    if (
      !nombre.trim() ||
      !par
    ) {
      setMensaje(
        "⚠️ Completá nombre y par."
      );
      return;
    }

    const parNumero = Number(par);

    if (
      !Number.isFinite(parNumero) ||
      parNumero <= 0
    ) {
      setMensaje(
        "⚠️ Escribí un par válido."
      );
      return;
    }

    setGuardando(true);
    setMensaje("");

    const idCancha = Number(
      params.id
    );

    const supabase = createClient();

    const { error } = await supabase
      .from("canchas")
      .update({
        nombre: nombre.trim(),
        par: parNumero,
      })
      .eq("id", idCancha);

    if (error) {
      console.error(
        "No se pudo editar la cancha:",
        error
      );

      setMensaje(
        "⚠️ No se pudieron guardar los cambios."
      );

      setGuardando(false);
      return;
    }

    const {
      data: canchasActualizadas,
      error: errorActualizacion,
    } = await supabase
      .from("canchas")
      .select(
        "id, nombre, par, activa"
      )
      .order("nombre");

    if (
      !errorActualizacion &&
      canchasActualizadas
    ) {
      const copiaLocal: Cancha[] =
        canchasActualizadas.map(
          (cancha: {
            id: number;
            nombre: string;
            par: number;
            activa:
              | boolean
              | null;
          }) => ({
            id: Number(cancha.id),
            nombre: cancha.nombre,
            par: Number(cancha.par),
            activa: Boolean(
              cancha.activa
            ),
          })
        );

      localStorage.setItem(
        "laChangueadaCanchas",
        JSON.stringify(copiaLocal)
      );
    }

    router.push("/canchas");
  }

  return (
    <main className="min-h-screen bg-green-950 p-6 text-white">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black">
          ✏️ Editar cancha
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      {cargando ? (
        <div className="rounded-xl bg-white p-5 text-green-950">
          Cargando cancha...
        </div>
      ) : (
        <>
          <label className="font-bold">
            Nombre
          </label>

          <input
            type="text"
            value={nombre}
            disabled={guardando}
            onChange={(evento) => {
              setNombre(
                evento.target.value
              );
              setMensaje("");
            }}
            className="mb-6 mt-2 w-full rounded-xl bg-white p-4 text-xl text-black disabled:bg-gray-200"
          />

          <label className="font-bold">
            Par
          </label>

          <input
            type="number"
            inputMode="numeric"
            value={par}
            disabled={guardando}
            onChange={(evento) => {
              setPar(
                evento.target.value
              );
              setMensaje("");
            }}
            className="mt-2 w-full rounded-xl bg-white p-4 text-xl text-black disabled:bg-gray-200"
          />

          <button
            type="button"
            disabled={guardando}
            onClick={guardar}
            className="mt-8 w-full rounded-2xl bg-white p-4 font-black text-green-950 disabled:bg-gray-300"
          >
            {guardando
              ? "☁️ Guardando..."
              : "💾 Guardar cambios"}
          </button>
        </>
      )}

      {mensaje && (
        <p className="mt-4 text-xl">
          {mensaje}
        </p>
      )}
    </main>
  );
}