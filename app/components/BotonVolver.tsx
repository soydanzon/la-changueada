"use client";

import { useRouter } from "next/navigation";

export default function BotonVolver() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="bg-white text-green-950 px-4 py-2 rounded-xl font-bold shadow"
    >
      ←
    </button>
  );
}