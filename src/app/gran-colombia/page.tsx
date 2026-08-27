import type { Metadata } from "next";
import GameShell from "@/components/gc/GameShell";

export const metadata: Metadata = {
  title: "Ufologística · Gran Colombia",
  description:
    "Usted dirige la operación secreta de carga de la Tierra sobre la Gran Colombia. Conecte rutas, mueva carga y evite que los periódicos entiendan qué es usted.",
};

/** Sector 4. Mismo motor, otro mapa, otro idioma. */
export default function Page() {
  return <GameShell />;
}
