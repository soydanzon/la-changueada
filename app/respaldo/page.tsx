"use client";

import { useRef, useState } from "react";
import BotonInicio from "../components/BotonInicio";
import BotonVolver from "../components/BotonVolver";

type Respaldo = {
  app: "La Changueada";
  version: number;
  fechaExportacion: string;
  datos: Record<string, string>;
};

const CLAVES_RESPALDO = [
  "laChangueadaJugadores",
  "laChangueadaHistorial",
  "laChangueadaCanchas",
  "laChangueadaValor",
  "laChangueadaTablaPremios",
];

function leerCantidad(
  datos: Record<string, string>,
  clave: string
) {
  try {
    const contenido = datos[clave];

    if (!contenido) return 0;

    const valor = JSON.parse(contenido);

    return Array.isArray(valor) ? valor.length : 0;
  } catch {
    return 0;
  }
}

export default function RespaldoPage() {
  const inputArchivo = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState("");

  function exportarDatos() {
    const datos: Record<string, string> = {};

    CLAVES_RESPALDO.forEach((clave) => {
      const valor = localStorage.getItem(clave);

      if (valor !== null) {
        datos[clave] = valor;
      }
    });

    const cantidadJugadores = leerCantidad(
      datos,
      "laChangueadaJugadores"
    );

    const cantidadFechas = leerCantidad(
      datos,
      "laChangueadaHistorial"
    );

    if (Object.keys(datos).length === 0) {
      setMensaje(
        "⚠️ No hay información guardada para exportar."
      );
      return;
    }

    const respaldo: Respaldo = {
      app: "La Changueada",
      version: 1,
      fechaExportacion: new Date().toISOString(),
      datos,
    };

    const archivo = new Blob(
      [JSON.stringify(respaldo, null, 2)],
      { type: "application/json" }
    );

    const enlace = document.createElement("a");

    const fecha = new Date()
      .toLocaleDateString("es-AR")
      .replaceAll("/", "-");

    const direccion = URL.createObjectURL(archivo);

    enlace.href = direccion;
    enlace.download =
      `la-changueada-respaldo-${fecha}.json`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(direccion);

    setMensaje(
      `✅ Respaldo exportado: ${cantidadJugadores} jugadores y ${cantidadFechas} fechas.`
    );
  }

  async function importarDatos(
    evento: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    try {
      const texto = await archivo.text();
      const respaldo: Respaldo = JSON.parse(texto);

      const datosValidos =
        respaldo.app === "La Changueada" &&
        respaldo.datos &&
        typeof respaldo.datos === "object" &&
        Object.keys(respaldo.datos).some((clave) =>
          CLAVES_RESPALDO.includes(clave)
        );

      if (!datosValidos) {
        setMensaje(
          "⚠️ El archivo no es un respaldo válido de La Changueada."
        );
        return;
      }

      const cantidadJugadores = leerCantidad(
        respaldo.datos,
        "laChangueadaJugadores"
      );

      const cantidadFechas = leerCantidad(
        respaldo.datos,
        "laChangueadaHistorial"
      );

      const confirmar = window.confirm(
        `El respaldo contiene:\n\n` +
          `Jugadores: ${cantidadJugadores}\n` +
          `Fechas: ${cantidadFechas}\n\n` +
          `¿Querés reemplazar los datos actuales?`
      );

      if (!confirmar) return;

      const datosAnteriores: Record<string, string> = {};

      CLAVES_RESPALDO.forEach((clave) => {
        const valor = localStorage.getItem(clave);

        if (valor !== null) {
          datosAnteriores[clave] = valor;
        }
      });

      try {
        CLAVES_RESPALDO.forEach((clave) => {
          localStorage.removeItem(clave);
        });

        Object.entries(respaldo.datos).forEach(
          ([clave, valor]) => {
            if (
              CLAVES_RESPALDO.includes(clave) &&
              typeof valor === "string"
            ) {
              localStorage.setItem(clave, valor);
            }
          }
        );
      } catch {
        CLAVES_RESPALDO.forEach((clave) => {
          localStorage.removeItem(clave);
        });

        Object.entries(datosAnteriores).forEach(
          ([clave, valor]) => {
            localStorage.setItem(clave, valor);
          }
        );

        throw new Error("No se pudo restaurar");
      }

      setMensaje(
        `✅ Respaldo importado: ${cantidadJugadores} jugadores y ${cantidadFechas} fechas.`
      );
    } catch {
      setMensaje(
        "⚠️ No se pudo leer o restaurar el archivo."
      );
    } finally {
      evento.target.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-green-900 p-6 text-white">
      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between bg-green-900 px-6 py-4">
        <h1 className="text-3xl font-bold">
          💾 Respaldo
        </h1>

        <div className="flex gap-2">
          <BotonVolver />
          <BotonInicio />
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 text-green-900">
        <h2 className="text-2xl font-bold">
          Exportar datos
        </h2>

        <p className="mt-2">
          Guarda jugadores, fechas, canchas, valor de la
          Changueada y tabla de premios.
        </p>

        <button
          onClick={exportarDatos}
          className="mt-5 w-full rounded-xl bg-green-700 p-4 font-bold text-white"
        >
          📤 Exportar respaldo
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 text-green-900">
        <h2 className="text-2xl font-bold">
          Importar datos
        </h2>

        <p className="mt-2">
          Antes de reemplazar los datos, muestra cuántos
          jugadores y fechas contiene el archivo.
        </p>

        <input
          ref={inputArchivo}
          type="file"
          accept=".json,application/json"
          onChange={importarDatos}
          className="hidden"
        />

        <button
          onClick={() => inputArchivo.current?.click()}
          className="mt-5 w-full rounded-xl bg-blue-600 p-4 font-bold text-white"
        >
          📥 Elegir respaldo
        </button>
      </div>

      {mensaje && (
        <p className="mt-6 rounded-xl bg-white p-4 text-center font-bold text-green-900">
          {mensaje}
        </p>
      )}
    </main>
  );
}