import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

const RUTAS_PUBLICAS = [
  "/login",
  "/actualizar-contrasena",
  "/historial",
  "/estadisticas",
  "/ranking",
  "/handicap",
  "/prueba-supabase",
];

function esRutaPublica(ruta: string) {
  if (ruta === "/") {
    return true;
  }

  return RUTAS_PUBLICAS.some(
    (rutaPublica) =>
      ruta === rutaPublica ||
      ruta.startsWith(
        `${rutaPublica}/`
      )
  );
}

function crearRedireccion(
  destino: string,
  request: NextRequest,
  response: NextResponse
) {
  const redireccion =
    NextResponse.redirect(
      new URL(destino, request.url)
    );

  response.cookies
    .getAll()
    .forEach((cookie) => {
      redireccion.cookies.set(cookie);
    });

  return redireccion;
}

export async function proxy(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const { data } =
    await supabase.auth.getClaims();

  const usuarioId =
    data?.claims?.sub;

  if (
    esRutaPublica(
      request.nextUrl.pathname
    )
  ) {
    return response;
  }

  if (!usuarioId) {
    return crearRedireccion(
      "/login",
      request,
      response
    );
  }

  const { data: perfil } =
    await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", usuarioId)
      .maybeSingle();

  if (perfil?.rol !== "admin") {
    return crearRedireccion(
      "/",
      request,
      response
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};