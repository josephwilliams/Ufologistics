import type { GameState } from "../types";
import { RACES, goalObjective } from "./races";
import { SITE_BY_ID } from "./sites";
import { ALARM } from "../engine";

// Primera partida guiada. Cada paso avanza solo cuando el jugador hace la cosa
// (`done`), o espera un toque en Siguiente si es puramente explicativo.

export type TutorialCtx = {
  state: GameState;
  selectedId: string | null;
  linkFrom: string | null;
  everDelivered: boolean;
  everAnsweredEvent: boolean;
  everTunedRoute: boolean;
};

export type TutorialStep = {
  id: string;
  title: string | ((c: TutorialCtx) => string);
  body: (c: TutorialCtx) => string;
  done?: (c: TutorialCtx) => boolean;
  tab?: "map" | "routes" | "hangar" | "world";
  highlight?: "speed" | "map" | "routes" | "meters";
};

const KIND_PLURAL: Record<string, string> = {
  ranch: "hatos",
  town: "pueblos",
  landmark: "monumentos",
  military: "instalaciones militares",
  city: "ciudades",
  anomaly: "anomalías",
  base: "bases",
};

export const TUTORIAL: TutorialStep[] = [
  {
    id: "welcome",
    title: "Usted es el nuevo operador",
    body: (c) => {
      const race = RACES[c.state.race];
      const disc = Math.round(c.state.disclosure);
      const heredado =
        c.state.race === "grey"
          ? `Su predecesor dejó caer una nave en un potrero del Casanare y la versión oficial aguantó por poco. Hereda usted el desastre: por eso la Divulgación ya va por el ${disc}%.`
          : `El año pasado, dos hombres declararon en una comisaría de Caracas que algo intentó subirlos a una nave. No fue operación suya, pero medio continente mira al cielo desde entonces y la Divulgación ya va por el ${disc}%.`;
      return `${heredado} Su trabajo es ${goalObjective(race)} antes de que los periódicos entiendan qué es usted.`;
    },
    highlight: "meters",
  },
  {
    id: "read-meters",
    title: "Tres palabras deciden la partida",
    body: () =>
      `Tres palabras, una cadena. Sus naves hacen RUIDO. El ruido levanta SOSPECHA en cada estado que sobrevuelan. La sospecha alimenta la DIVULGACIÓN, que es el marcador de derrota: al 100% le revocan la licencia y se acabó. La sospecha baja sola si deja un sitio en paz; la Divulgación no.`,
    highlight: "meters",
  },
  {
    id: "pick-site",
    title: "Elija dónde trabajar",
    body: (c) => {
      const names = RACES[c.state.race].harvestKinds.map((k) => KIND_PLURAL[k] ?? k);
      const kinds =
        names.length > 1
          ? `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`
          : names[0];
      return `Toque un sitio del mapa. Usted puede trabajar ${kinds}. Al tocarlo verá lo que paga, el riesgo que tiene y el caso real que hay detrás.`;
    },
    done: (c) => !!c.selectedId && c.selectedId !== RACES[c.state.race].homeId,
    tab: "map",
    highlight: "map",
  },
  {
    id: "start-wiring",
    title: "Conecte una ruta",
    body: () =>
      "En el panel de debajo del mapa, pulse «Conectar una ruta desde aquí». Los destinos legales se encenderán en el mapa; toque uno para cerrar la ruta.",
    done: (c) => !!c.linkFrom || c.state.routes.length > 0,
    tab: "map",
    highlight: "map",
  },
  {
    id: "finish-wiring",
    title: "Ahora toque el destino encendido",
    body: (c) =>
      c.state.race === "mantid"
        ? "La carga mántida tiene que llegar a un laboratorio, o a la Cueva de los Tayos. Sólo esos se encenderán."
        : `${
            c.state.race === "nordic" ? "Toda excursión regresa a" : "Todo lo que levante va a"
          } ${SITE_BY_ID[RACES[c.state.race].homeId].name}. Es el único sitio encendido.`,
    done: (c) => c.state.routes.length > 0,
    tab: "map",
    highlight: "map",
  },
  {
    id: "run-clock",
    title: "Ponga el reloj en marcha",
    body: () =>
      "La nave repetirá esa ruta indefinidamente sin más instrucciones. Pulse ▶ arriba a la derecha para que corran las noches, y ❚❚ (o la barra espaciadora) para detenerlas.",
    done: (c) => c.state.night > 2,
    highlight: "speed",
  },
  {
    id: "first-delivery",
    title: (c) => (c.state.race === "nordic" ? "La excursión paga al aterrizar" : "La carga paga al llegar"),
    body: (c) =>
      `Mírela cruzar el mapa. ${
        c.state.race === "nordic"
          ? "El chárter cobra cuando los huéspedes vuelven a casa"
          : "Se cobra al llegar al otro extremo"
      }, y eso es lo que mueve su ${RACES[c.state.race].goalShort}. Cada tramo que vuela también levanta sospecha en todos los estados que cruza.`,
    done: (c) => c.everDelivered,
    highlight: "map",
  },
  {
    id: "suspicion",
    title: "La sospecha se dibuja en el mapa",
    body: () =>
      `La trama de puntos sobre cada estado indica lo sospechoso que está: cian es tranquilo, magenta va a ser su problema. Por encima de ${ALARM} un estado empuja la Divulgación solo, todas las noches. Las rutas largas reparten sospecha por todo lo que sobrevuelan, y por eso una ruta corta y fea suele ganarle a una larga y bonita.`,
    highlight: "map",
  },
  {
    id: "tune",
    title: "Cada ruta tiene tres mandos",
    body: () =>
      "Abra RUTAS. Cada ruta tiene nave, tripulación y corredor, y los tres cambian carga por ruido. Directo es el corredor más rápido y el más escandaloso; Sólo de noche es el más silencioso del juego y desperdicia casi todo el día esperando.",
    done: (c) => c.everTunedRoute,
    tab: "routes",
    highlight: "routes",
  },
  {
    id: "event",
    title: "La prensa se va a enterar",
    body: () =>
      "Cada cierto tiempo un periódico detiene el reloj y le pregunta algo. Léalos con cuidado: comprar una noticia es lo ÚNICO en todo el juego que baja la Divulgación. Todo lo demás sólo la sube. Elegir siempre la opción gratis es como se pierden casi todas las partidas.",
    done: (c) => c.everAnsweredEvent,
  },
  {
    id: "done",
    title: "Ese es el juego entero",
    body: (c) =>
      `Conecte rutas, mantenga el mapa tranquilo, compre a la prensa y ${goalObjective(
        RACES[c.state.race],
      )} antes de que la Divulgación llegue al 100%. Lo demás son detalles que puede leer en las fichas. Suerte, y procure no ser el próximo expediente.`,
  },
];
