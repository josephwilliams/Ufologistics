// Las tres razas de la edición Gran Colombia.
//
// Las mecánicas son idénticas a las de ../races.ts — triaje, pureza y cadenas —
// porque lo que define a cada raza es en qué gasta usted su atención, y eso no
// depende del continente. Cambian las bases, los nombres y la letra.

import type { Faction, FactionId, RaceId } from "../types";
import type { RaceDef } from "../races";

export const RACES: Record<RaceId, RaceDef> = {
  grey: {
    id: "grey",
    name: "Grises de Zeta",
    caste: "Rango obrero · subcontrata",
    tagline: "Mueva el volumen. Ya se disculpará.",
    currency: { name: "Biomasa", symbol: "⌬" },
    concept:
      "Platillos baratos, tripulaciones descuidadas y más rutas de las que puede vigilar. Va usted permanentemente sobreextendido y el trabajo consiste en decidir qué incendio apagar.",
    rules: [
      "Hasta 9 rutas: la red más amplia del juego.",
      "Las tripulaciones son descuidadas: cualquier ruta activa puede provocar su propio incidente, cualquier noche.",
      "Hace un 35% más de ruido. Va a comprar silencio constantemente.",
      "Trabaja hatos y pueblos. Nadie echa de menos una res.",
    ],
    mechanic: "sloppy",
    color: "#2f6b46",
    ink: "#14361f",
    homeId: "hato-corozal",
    startCash: 260,
    startDisclosure: 24,
    startCraft: ["scout", "scout", "pill"],
    maxRoutes: 9,
    harvestKinds: ["ranch", "town"],
    yieldMul: 1,
    noiseMul: 1.35,
    // Recortada desde 2200: en este mapa las fuentes rinden algo menos y la
    // partida se alargaba hasta 250 noches.
    goalTarget: 1800,
    goalLabel: "Cuota de biomasa",
    goalObjective: "sacar {n} unidades de biomasa de este planeta",
    goalShort: "cuota de biomasa",
    winText:
      "Los compradores reptilianos recibieron su tonelaje y ningún periódico serio imprimió la palabra «platillo» por encima del doblez. Lo ascienden a jefe de cuadrilla. En algún llano, un vaquero sigue explicándole las luces a un teniente aburrido.",
  },

  nordic: {
    id: "nordic",
    name: "Nórdicos de las Pléyades",
    caste: "Fuera de la pirámide · turismo de altura",
    tagline: "Venda el paisaje. No lo estropee.",
    currency: { name: "Metraje", symbol: "◉" },
    concept:
      "Usted no cosecha nada. Trae turistas que pagan por mirar la Tierra, y la Tierra sólo vale la pena mirarla mientras esté intacta. Hacer menos suele ser la jugada correcta.",
    rules: [
      "Sólo 4 rutas. Son caras y son excursiones, no carga.",
      "No puede cosechar. Únicamente monumentos y anomalías.",
      "Pureza: la excursión paga menos cuanto más sospechoso esté su estado, y por encima de 60 el sitio queda arruinado para siempre.",
      "La sospecha de otros operadores también le arruina los sitios. Limpiará desastres que no son suyos.",
    ],
    mechanic: "purity",
    color: "#8a6a1f",
    ink: "#4a3708",
    homeId: "sierra-nevada",
    startCash: 540,
    startDisclosure: 10,
    startCraft: ["liner"],
    maxRoutes: 4,
    harvestKinds: ["landmark", "anomaly"],
    yieldMul: 1.15,
    // Las excursiones son llamativas a propósito: que las vean es el producto.
    //
    // 1,8 y no 3 como en la edición de EE. UU.: la Gran Colombia es una región
    // mucho más compacta, y un tramo nórdico se completa en 4,3 noches en vez
    // de 7,4. Al ciclar 1,7 veces más rápido, el mismo multiplicador producía
    // 1,7 veces más ruido por noche; como el pago nórdico baja con la sospecha
    // y el mantenimiento no, la raza entraba en quiebra en 40 partidas de 40.
    noiseMul: 1.8,
    // 1300 y no 1900: con los riesgos ya equiparados la raza gana, pero la
    // partida se iba a 341 noches porque cada excursión rinde menos en un mapa
    // donde la sospecha en el estado de origen recorta el pago.
    goalTarget: 1300,
    goalLabel: "Metraje contratado",
    goalObjective: "contratar {n} horas de metraje turístico",
    goalShort: "metraje contratado",
    winText:
      "Diez mil pleyadianos volvieron a casa con el recuerdo de un mundo azul que no sabía que lo estaban mirando, y la tienda de regalos cerró su cuota. Licencia renovada. La Tierra sigue siendo, técnicamente, un documental de naturaleza.",
  },

  mantid: {
    id: "mantid",
    name: "Directorio Mántido",
    caste: "Rango director · autoridad científica",
    tagline: "Menos viajes. Viajes correctos.",
    currency: { name: "Secuencia", symbol: "⟁" },
    concept:
      "Un rompecabezas de correspondencias disfrazado de juego de transporte. Los pueblos producen especímenes con rasgos aleatorios; el Directorio compra rasgos concretos; nada vale nada hasta que ha pasado por un laboratorio.",
    rules: [
      "Cadenas de dos saltos: sitio → laboratorio → base. Un viaje directo vale una fracción.",
      "Los laboratorios los construye usted, sobre sitios que ya haya conectado.",
      "El Directorio compra 3 rasgos a la vez y los rota. Las secuencias fuera de pedido rinden una fracción simbólica.",
      "Un pueblo cuyo estado supere la línea de alarma deja de producir por completo.",
      "6 rutas. Todas deberían ser deliberadas.",
    ],
    mechanic: "chains",
    color: "#4a2f6b",
    ink: "#2a1740",
    homeId: "tayos",
    startCash: 400,
    startDisclosure: 16,
    startCraft: ["scout", "triangle"],
    maxRoutes: 6,
    harvestKinds: ["town", "military", "anomaly"],
    yieldMul: 1,
    noiseMul: 0.9,
    goalTarget: 27,
    goalLabel: "Programa Híbrido",
    goalObjective: "entregar {n} grados de secuencia al Programa Híbrido",
    goalShort: "recuento de secuencias",
    winText:
      "Las secuencias cuadran. El Directorio firma, la línea híbrida entra en producción y una generación de personas que pasan por humanas empieza a ocupar empleos corrientes en pueblos corrientes. Sobre esto no habrá titular jamás.",
  },
};

export const PLAYABLE: RaceId[] = ["grey", "nordic", "mantid"];

/** El objetivo de la partida, con la cifra ya sustituida. */
export function goalObjective(r: RaceDef): string {
  return r.goalObjective.replace("{n}", r.goalTarget.toLocaleString("es"));
}

// ---------------------------------------------------------------------------
// Todos los que tienen una opinión sobre usted. Las dos razas que no eligió
// siguen en el mundo como clientes y rivales.
//
// Nota: el identificador «mj12» se conserva porque el tipo es compartido, pero
// en este sector el papel de «potencia humana que quiere su tecnología y su
// desmentido» no lo hace un comité legendario de Estados Unidos: lo hace el
// Comando Sur, que administró una franja soberana del istmo hasta 1999.
// ---------------------------------------------------------------------------

export const FACTIONS: Record<FactionId, Faction> = {
  grey: { id: "grey", name: "Grises de Zeta", short: "Zeta", wants: "Tonelaje, y que usted no les estorbe el espacio aéreo.", playable: true },
  nordic: { id: "nordic", name: "Nórdicos de las Pléyades", short: "Nórdicos", wants: "Que deje en paz las partes bonitas.", playable: true },
  mantid: { id: "mantid", name: "Directorio Mántido", short: "Mántidos", wants: "Especímenes limpios y el derecho a decir que no.", playable: true },
  draco: { id: "draco", name: "Aristocracia Draco", short: "Draco", wants: "Volumen, ya, y una excusa para acabar con el disimulo.", playable: false },
  federation: { id: "federation", name: "Federación Galáctica", short: "Federación", wants: "Cumplimiento. Ellos tienen su licencia.", playable: false },
  mj12: { id: "mj12", name: "Comando Sur", short: "Comando Sur", wants: "Tecnología, desmentido plausible y su cuota puntual.", playable: false },
  movement: { id: "movement", name: "El Movimiento por la Divulgación", short: "Movimiento", wants: "Demostrar que usted existe. Crece cada año.", playable: false },
};

/** Bandas de reputación, para mostrar. */
export function standingLabel(v: number): string {
  if (v >= 70) return "Ejemplar";
  if (v >= 40) return "De confianza";
  if (v >= 15) return "Correcto";
  if (v > -15) return "Neutral";
  if (v > -45) return "Vigilado";
  return "En revisión";
}
