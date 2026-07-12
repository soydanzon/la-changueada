"use client";

import Link from "next/link";

export default function BotonInicio() {
  return (
    <Link
      href="/"
      className="bg-white text-green-950 px-4 py-2 rounded-xl font-bold shadow"
    >
      🏠
    </Link>
  );
}