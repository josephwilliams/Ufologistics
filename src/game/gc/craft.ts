// Naves, tripulaciones y corredores de la edición Gran Colombia.
//
// Los identificadores, las razas y TODOS los números son idénticos a los de
// ../craft.ts a propósito: el motor compartido y sus valores por defecto se
// resuelven por id, así que sólo se traduce la superficie.

import type { CorridorDef, CraftDef, CrewDef } from "../types";

// ---------------------------------------------------------------------------
// A route is craft × crew × corridor. The three multiply, so the interesting
// builds are the ones that trade on different axes: a loud craft flown by a
// careful crew down a cold corridor is a genuinely different proposition from
// a quiet craft flown fast and direct.
// ---------------------------------------------------------------------------

export const CRAFT: CraftDef[] = [
  {
    id: "pill",
    name: "Píldora luminosa",
    races: ["grey", "nordic", "mantid"],
    cost: 90,
    capacity: 5,
    speed: 62,
    noise: 0.7,
    upkeep: 2,
    blurb: "Una cápsula del tamaño de un barril. Rápida, casi gratuita, apenas carga nada.",
  },
  {
    id: "scout",
    name: "Platillo explorador",
    races: ["grey", "mantid"],
    cost: 165,
    capacity: 12,
    speed: 44,
    noise: 1,
    upkeep: 5,
    blurb: "El furgón de la flota. Todo lo que la imaginación popular cree que es un platillo.",
  },
  {
    id: "vessel",
    name: "Nave de muestreo",
    races: ["mantid"],
    cost: 310,
    capacity: 14,
    speed: 40,
    noise: 0.75,
    upkeep: 8,
    blurb: "Bodegas refrigeradas y motor muy silencioso. Construida para mantener especímenes viables, no para correr.",
  },
  {
    id: "triangle",
    name: "Triángulo negro",
    races: ["grey", "nordic", "mantid"],
    cost: 345,
    capacity: 26,
    speed: 30,
    noise: 0.55,
    upkeep: 11,
    blurb:
      "Carga pesada, lenta y de baja exposición por la mejor razón posible: los testigos suponen que es de ellos.",
  },
  {
    id: "lantern",
    name: "Farol del Catatumbo",
    races: ["nordic"],
    cost: 235,
    capacity: 16,
    speed: 36,
    noise: 0.5,
    upkeep: 7,
    blurb: "Se confunde con el relámpago perpetuo. Nadie levanta un informe por una luz más sobre el lago.",
  },
  {
    id: "cigar",
    name: "Nave cigarro",
    races: ["grey", "mantid"],
    cost: 430,
    capacity: 34,
    speed: 34,
    noise: 1.3,
    upkeep: 14,
    blurb: "Carga de largo recorrido. Sesenta metros de silueta inconfundible sobre la sabana.",
  },
  {
    id: "liner",
    name: "Crucero de excursión",
    races: ["nordic"],
    cost: 495,
    capacity: 30,
    speed: 32,
    noise: 0.4,
    upkeep: 16,
    blurb:
      "Ventanales panorámicos y bar. Los pasajeros pagan por ver, lo que obliga a volar bajo.",
  },
  {
    id: "harvester",
    name: "Cosechadora",
    races: ["grey"],
    cost: 580,
    capacity: 48,
    speed: 24,
    noise: 2,
    upkeep: 21,
    blurb:
      "Un galpón volador. Levanta un hato entero por noche y se ve desde tres departamentos.",
  },
];

export const CRAFT_BY_ID: Record<string, CraftDef> = Object.fromEntries(
  CRAFT.map((c) => [c.id, c]),
);

export const CREWS: CrewDef[] = [
  {
    id: "auto",
    name: "Sin tripulación",
    races: ["grey", "nordic", "mantid"],
    yieldMul: 0.75,
    noiseMul: 0.7,
    upkeep: 0,
    blurb: "Nadie a bordo. Barata y silenciosa, y estropea una cuarta parte de la carga.",
  },
  {
    id: "drone",
    name: "Obreros grises",
    races: ["grey", "mantid"],
    yieldMul: 1,
    noiseMul: 1.3,
    upkeep: 3,
    blurb: "Mano de obra estándar de la Zeta. Cumplen, se distraen, y de vez en cuando dejan algo caer.",
  },
  {
    id: "tall",
    name: "Supervisores altos",
    races: ["grey", "mantid"],
    yieldMul: 1.15,
    noiseMul: 0.78,
    upkeep: 7,
    blurb: "Caros y meticulosos. Cargan más y hacen menos ruido, y opinan sobre sus rutas.",
  },
  {
    id: "attendants",
    name: "Azafatas pleyadianas",
    races: ["nordic"],
    yieldMul: 1.3,
    noiseMul: 0.55,
    upkeep: 9,
    blurb: "Entrenadas para ser vistas de lejos y recordadas con cariño.",
  },
  {
    id: "mantidsci",
    name: "Científicos mántidos",
    races: ["mantid", "grey"],
    yieldMul: 1.5,
    noiseMul: 0.85,
    upkeep: 14,
    blurb:
      "Manipulan el material como si importara, porque importa.",
  },
  {
    id: "hybrid",
    name: "Tripulación híbrida",
    races: ["grey", "nordic", "mantid"],
    yieldMul: 1.2,
    noiseMul: 0.42,
    upkeep: 11,
    blurb: "Pasan por humanos en una gasolinera. Eso vale más que cualquier blindaje.",
  },
];

export const CREW_BY_ID: Record<string, CrewDef> = Object.fromEntries(
  CREWS.map((c) => [c.id, c]),
);

export const CORRIDORS: CorridorDef[] = [
  {
    id: "direct",
    name: "Directo",
    lengthMul: 1,
    noiseMul: 1,
    blurb: "En línea recta. El regreso más rápido, y todo el que esté debajo lo ve con claridad.",
  },
  {
    id: "highalt",
    name: "Gran altitud",
    lengthMul: 1.15,
    noiseMul: 0.74,
    blurb: "Por encima del tiempo. Se lee como una estrella a simple vista y como un problema en el radar.",
  },
  {
    id: "nap",
    name: "A ras de terreno",
    lengthMul: 1.32,
    noiseMul: 0.56,
    blurb: "Metidos en la topografía, bajo el horizonte del radar. Lento, y algún camionero se lleva una historia.",
  },
  {
    id: "coastal",
    name: "Ruta de cabotaje",
    lengthMul: 1.48,
    noiseMul: 0.44,
    blurb: "Sobre el agua siempre que se pueda. Mucho más largo y casi nadie mirando.",
  },
  {
    id: "night",
    name: "Sólo de noche",
    lengthMul: 1.72,
    noiseMul: 0.32,
    blurb: "Moverse únicamente con oscuridad total. El corredor más frío que existe y desperdicia casi todo el día esperando.",
  },
  {
    id: "vortex",
    name: "Tránsito por vórtice",
    lengthMul: 0.58,
    noiseMul: 1.25,
    blurb:
      "Se pliega el trayecto. Llega antes de lo que debería y deja el cielo revuelto detrás.",
  },
];

export const CORRIDOR_BY_ID: Record<string, CorridorDef> = Object.fromEntries(
  CORRIDORS.map((c) => [c.id, c]),
);

/** Naves que una raza puede comprar. */
export function craftFor(race: string): CraftDef[] {
  return CRAFT.filter((c) => (c.races as string[]).includes(race));
}

export function crewsFor(race: string): CrewDef[] {
  return CREWS.filter((c) => (c.races as string[]).includes(race));
}
