"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="bg-green-950 text-white px-6 py-4 border-b border-green-800">
      <Link
        href="/"
        className="font-bold text-lg"
      >
        ← Menú principal
      </Link>
    </header>
  );
}