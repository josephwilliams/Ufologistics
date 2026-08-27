// Los sitios de la Gran Colombia. Coordenadas reales, casos reales.
//
// El `state` es el código ISO 3166-2 sin guion, tal como lo emite
// scripts/genmap-gc.mjs (CO-ANT -> COANT).

import type { Site } from "../types";
import { project } from "./map";

export const SITES: Site[] = [
  // --- Bases ---------------------------------------------------------------
  { id: "hato-corozal", name: "Hato Corozal", place: "Casanare", state: "COCAS", lat: 6.05, lon: -71.76, kind: "base", yield: 0, appeal: 0, risk: 0.77,
    note: "Llano adentro, donde el ganado se cuenta por miles y nadie lleva la cuenta exacta. Su predecesor perdió una nave aquí y el hato entero juró no haber visto nada." },
  { id: "sierra-nevada", name: "Sierra Nevada de Santa Marta", place: "Magdalena", state: "COMAG", lat: 10.83, lon: -73.69, kind: "base", yield: 0, appeal: 9, risk: 0.92,
    note: "Los kogi la llaman el Corazón del Mundo y se consideran Hermanos Mayores encargados de cuidarlo. Observan el cielo con más atención que cualquier radar." },
  { id: "tayos", name: "Cueva de los Tayos", place: "Morona Santiago", state: "ECS", lat: -2.90, lon: -78.22, kind: "base", yield: 0, appeal: 7, risk: 1.0,
    note: "Juan Moricz afirmó haber hallado una biblioteca metálica bajo tierra. En 1976 una expedición británico-ecuatoriana entró a buscarla con Neil Armstrong como presidente honorario. No encontraron nada. Eso dijeron." },

  // --- Anomalías -----------------------------------------------------------
  { id: "catatumbo", name: "Relámpago del Catatumbo", place: "Zulia", state: "VEV", lat: 9.40, lon: -71.70, kind: "anomaly", yield: 6, appeal: 10, risk: 1.15,
    note: "Doscientas sesenta noches al año, rayos sin trueno sobre la desembocadura del Catatumbo. Los navegantes lo usaron durante siglos como faro. Nada que ustedes hagan aquí se notará." },
  { id: "autana", name: "Cerro Autana", place: "Amazonas", state: "VEZ", lat: 4.79, lon: -67.44, kind: "anomaly", yield: 7, appeal: 9, risk: 1.08,
    note: "Un tepuy hueco que los piaroa llaman Kuaimayojo, el tocón del Árbol de la Vida. Las cuevas de cuarzo de su cima no deberían existir." },
  { id: "infiernito", name: "El Infiernito", place: "Monquirá, Boyacá", state: "COBOY", lat: 5.65, lon: -73.55, kind: "anomaly", yield: 5, appeal: 6, risk: 0.86,
    note: "Un observatorio astronómico muisca de columnas de piedra. Los frailes lo bautizaron así por los monolitos fálicos; el alineamiento solar es exacto." },
  { id: "guatavita", name: "Laguna de Guatavita", place: "Cundinamarca", state: "COCUN", lat: 4.98, lon: -73.77, kind: "anomaly", yield: 4, appeal: 9, risk: 0.79,
    note: "Aquí el zipa se cubría de oro y se sumergía. La leyenda de El Dorado empezó en este cráter, y cuatro siglos de europeos lo han vaciado buscándola." },
  { id: "tota", name: "Laguna de Tota", place: "Boyacá", state: "COBOY", lat: 5.55, lon: -72.92, kind: "anomaly", yield: 4, appeal: 6, risk: 0.79,
    note: "El cronista Rodríguez Freyle escribió que en el lago vivía un demonio con forma de pez negro. Es el lago más grande del país y el más frío." },
  { id: "darien", name: "Tapón del Darién", place: "Darién", state: "PA5", lat: 8.00, lon: -77.50, kind: "anomaly", yield: 8, appeal: 3, risk: 1.36,
    note: "Cien kilómetros de selva sin una sola carretera, entre dos continentes. Lo que entra al Darién deja de estar en los registros de alguien." },
  { id: "guacharo", name: "Cueva del Guácharo", place: "Monagas", state: "VEN", lat: 10.17, lon: -63.55, kind: "anomaly", yield: 5, appeal: 7, risk: 0.86,
    note: "Humboldt la describió en 1799: diez mil aves nocturnas que navegan por ecolocalización en oscuridad total. Los locales creían que ahí gritaban las almas." },
  { id: "malpelo", name: "Isla de Malpelo", place: "Pacífico colombiano", state: "COVAC", lat: 4.00, lon: -81.61, kind: "anomaly", yield: 6, appeal: 8, risk: 1.0, offshore: true,
    note: "Una roca volcánica a quinientos kilómetros de la costa, rodeada de tiburones martillo. La guarnición es de tres infantes de marina y un radio." },

  // --- Monumentos (turismo nórdico) ---------------------------------------
  { id: "salto-angel", name: "Salto Ángel", place: "Bolívar", state: "VEF", lat: 5.97, lon: -62.54, kind: "landmark", yield: 0, appeal: 10, risk: 1.01,
    note: "Kerepakupai Merú: casi un kilómetro de caída libre desde el Auyantepuy. El agua se deshace en niebla antes de tocar el suelo." },
  { id: "roraima", name: "Monte Roraima", place: "Bolívar", state: "VEF", lat: 5.14, lon: -60.75, kind: "landmark", yield: 0, appeal: 10, risk: 1.09,
    note: "Una meseta de arenisca de dos mil millones de años donde confluyen tres países. Inspiró El mundo perdido de Conan Doyle, y la cima tiene especies que no existen abajo." },
  { id: "cano-cristales", name: "Caño Cristales", place: "Meta", state: "COMET", lat: 2.26, lon: -73.79, kind: "landmark", yield: 0, appeal: 10, risk: 0.93,
    note: "El río de cinco colores. Durante unas semanas al año la macarenia clavigera lo tiñe de rojo sangre bajo el agua." },
  { id: "teyuna", name: "Ciudad Perdida", place: "Magdalena", state: "COMAG", lat: 11.04, lon: -73.93, kind: "landmark", yield: 0, appeal: 9, risk: 1.01,
    note: "Teyuna. Mil doscientos escalones de piedra y seiscientos cincuenta años más antigua que Machu Picchu. Los guaqueros la encontraron en 1972 buscando oro." },
  { id: "cotopaxi", name: "Cotopaxi", place: "Cotopaxi", state: "ECX", lat: -0.68, lon: -78.44, kind: "landmark", yield: 0, appeal: 9, risk: 1.09,
    note: "Un cono nevado casi perfecto de 5.897 metros, justo sobre la línea ecuatorial, y uno de los volcanes activos más altos del mundo." },
  { id: "chimborazo", name: "Chimborazo", place: "Chimborazo", state: "ECH", lat: -1.47, lon: -78.82, kind: "landmark", yield: 0, appeal: 9, risk: 1.01,
    note: "Por el abultamiento ecuatorial, su cumbre es el punto de la superficie terrestre más lejano del centro del planeta. El lugar más cerca del cielo que hay." },
  { id: "quilotoa", name: "Laguna Quilotoa", place: "Cotopaxi", state: "ECX", lat: -0.86, lon: -78.90, kind: "landmark", yield: 0, appeal: 8, risk: 0.85,
    note: "Una caldera de tres kilómetros llena de agua verde esmeralda por los minerales disueltos. La erupción que la formó se oyó a mil kilómetros." },
  { id: "tayrona", name: "Parque Tayrona", place: "Magdalena", state: "COMAG", lat: 11.31, lon: -74.03, kind: "landmark", yield: 0, appeal: 8, risk: 0.85,
    note: "Donde la Sierra Nevada cae directamente al Caribe. Los kogi cierran el parque un mes al año para que la tierra descanse." },
  { id: "medanos", name: "Médanos de Coro", place: "Falcón", state: "VEI", lat: 11.45, lon: -69.63, kind: "landmark", yield: 0, appeal: 7, risk: 0.93,
    note: "Dunas de arena de cuarenta metros junto al mar Caribe, en un istmo que el viento reordena cada temporada." },
  { id: "baru-volcan", name: "Volcán Barú", place: "Chiriquí", state: "PA4", lat: 8.81, lon: -82.54, kind: "landmark", yield: 0, appeal: 8, risk: 0.93,
    note: "El único punto de tierra desde el que, en un día despejado, se ven a la vez el Pacífico y el Caribe." },
  { id: "guna-yala", name: "Guna Yala", place: "Comarca Guna Yala", state: "PAKY", lat: 9.57, lon: -78.95, kind: "landmark", yield: 0, appeal: 8, risk: 0.93,
    note: "Trescientas sesenta y cinco islas y una nación autónoma que expulsó a Panamá en 1925 y nunca devolvió el control. Piden permiso antes de sobrevolar." },
  { id: "tequendama", name: "Salto del Tequendama", place: "Cundinamarca", state: "COCUN", lat: 4.57, lon: -74.30, kind: "landmark", yield: 0, appeal: 6, risk: 1.01,
    note: "Los muiscas decían que Bochica abrió la roca con su bastón para drenar la sabana inundada. Hoy el agua que cae por ahí es la de las cloacas de Bogotá." },

  // --- Ciudades (prensa) ---------------------------------------------------
  { id: "bogota", name: "Bogotá", place: "Distrito Capital", state: "COCUN", lat: 4.71, lon: -74.07, kind: "city", yield: 3, appeal: 5, risk: 2.04,
    note: "Dos mil seiscientos metros de altura, ocho millones de personas y cuatro periódicos que compiten por la misma primera plana." },
  { id: "caracas", name: "Caracas", place: "Distrito Capital", state: "VEA", lat: 10.49, lon: -66.90, kind: "city", yield: 3, appeal: 5, risk: 2.16,
    note: "Encajonada en un valle bajo el Ávila. En noviembre de 1954 dos hombres declararon en comisaría que algo peludo intentó subirlos a una nave en las afueras." },
  { id: "quito", name: "Quito", place: "Pichincha", state: "ECP", lat: -0.18, lon: -78.47, kind: "city", yield: 3, appeal: 7, risk: 1.92,
    note: "La capital más antigua de Sudamérica, a 22 kilómetros de la mitad del mundo. La Compañía tiene siete toneladas de pan de oro en el techo." },
  { id: "panama-city", name: "Ciudad de Panamá", place: "Panamá", state: "PA8", lat: 8.98, lon: -79.52, kind: "city", yield: 3, appeal: 5, risk: 2.16,
    note: "Donde el canal se paga y se cuenta. La mitad de los barcos del mundo pasan a la vista de sus rascacielos, y todos declaran su carga." },
  { id: "medellin", name: "Medellín", place: "Antioquia", state: "COANT", lat: 6.24, lon: -75.58, kind: "city", yield: 3, appeal: 5, risk: 2.04,
    note: "La ciudad de la eterna primavera, metida en un valle estrecho donde el ruido rebota en las montañas y todo el mundo se entera." },
  { id: "guayaquil", name: "Guayaquil", place: "Guayas", state: "ECG", lat: -2.19, lon: -79.88, kind: "city", yield: 3, appeal: 4, risk: 2.04,
    note: "El puerto que mueve el noventa por ciento del comercio ecuatoriano. Nada entra ni sale del país sin que alguien de aquí lo apunte." },
  { id: "maracaibo", name: "Maracaibo", place: "Zulia", state: "VEV", lat: 10.65, lon: -71.64, kind: "city", yield: 3, appeal: 4, risk: 2.04,
    note: "Cuarenta grados a la sombra y un lago cubierto de torres de petróleo. Desde aquí se ve el relámpago del Catatumbo casi todas las noches." },
  { id: "cali", name: "Cali", place: "Valle del Cauca", state: "COVAC", lat: 3.45, lon: -76.53, kind: "city", yield: 3, appeal: 4, risk: 1.92,
    note: "Puerta del Pacífico colombiano. Lo que no cabe en Buenaventura acaba saliendo por aquí, de una manera u otra." },
  { id: "barranquilla", name: "Barranquilla", place: "Atlántico", state: "COATL", lat: 10.96, lon: -74.80, kind: "city", yield: 3, appeal: 5, risk: 1.92,
    note: "La desembocadura del Magdalena y el carnaval más grande del país. Durante cuatro días al año nadie distingue un disco de una carroza." },

  // --- Pueblos (sujetos) ---------------------------------------------------
  { id: "villa-de-cura", name: "Villa de Cura", place: "Aragua", state: "VED", lat: 10.04, lon: -67.49, kind: "town", yield: 9, appeal: 3, risk: 1.24,
    note: "Diciembre de 1954: cuatro hombres pequeños y peludos intentaron llevarse a un cazador cerca de la carretera. La Guardia Nacional tomó declaración a todos y archivó el expediente." },
  { id: "petare", name: "Petare", place: "Miranda", state: "VEM", lat: 10.48, lon: -66.81, kind: "town", yield: 8, appeal: 2, risk: 1.33,
    note: "Noviembre de 1954. Gustavo González y José Ponce declararon que una esfera luminosa les cerró la vía y que algo salió de ella. El médico confirmó los arañazos." },
  { id: "carora", name: "Carora", place: "Lara", state: "VEK", lat: 10.17, lon: -70.08, kind: "town", yield: 8, appeal: 3, risk: 1.15,
    note: "Otro de los pueblos de la oleada de 1954. Aquí el testigo fue un médico, lo que hizo mucho más difícil desestimar el asunto." },
  { id: "armero", name: "Armero", place: "Tolima", state: "COTOL", lat: 4.97, lon: -74.90, kind: "town", yield: 7, appeal: 2, risk: 1.42,
    note: "Bajo el Nevado del Ruiz. Antes de la noche de 1985 hubo semanas de luces sobre el volcán que nadie supo interpretar a tiempo." },
  { id: "santa-elena", name: "Santa Elena de Uairén", place: "Bolívar", state: "VEF", lat: 4.60, lon: -61.11, kind: "town", yield: 8, appeal: 5, risk: 1.15,
    note: "El último pueblo antes de la Gran Sabana y del Roraima. Vive de guiar a los que suben y de no preguntar a los que bajan." },
  { id: "leticia", name: "Leticia", place: "Amazonas", state: "COAMA", lat: -4.21, lon: -69.94, kind: "town", yield: 9, appeal: 4, risk: 1.33,
    note: "Tres países se tocan en esta esquina del río. Se llega en avión o no se llega, y lo que sale del puerto no siempre figura en el manifiesto." },
  { id: "mitu", name: "Mitú", place: "Vaupés", state: "COVAU", lat: 1.25, lon: -70.23, kind: "town", yield: 9, appeal: 3, risk: 1.42,
    note: "Sin carreteras hacia ninguna parte. Los payés del Vaupés llevan generaciones describiendo viajes fuera del cuerpo con detalles incómodamente precisos." },
  { id: "puerto-ayacucho", name: "Puerto Ayacucho", place: "Amazonas", state: "VEZ", lat: 5.66, lon: -67.62, kind: "town", yield: 8, appeal: 4, risk: 1.24,
    note: "Donde el Orinoco deja de ser navegable. Los raudales de Atures suenan lo bastante fuerte para tapar cualquier otro ruido." },
  { id: "otavalo", name: "Otavalo", place: "Imbabura", state: "ECI", lat: 0.23, lon: -78.26, kind: "town", yield: 7, appeal: 6, risk: 1.06,
    note: "Mercado indígena desde antes de la conquista, entre dos volcanes y tres lagunas de cráter. Los otavaleños viajan más lejos que casi cualquiera." },
  { id: "banos", name: "Baños", place: "Tungurahua", state: "ECT", lat: -1.40, lon: -78.42, kind: "town", yield: 7, appeal: 7, risk: 1.24,
    note: "Al pie del Tungurahua, que ruge lo suficiente para que nadie mire hacia arriba por otras razones." },
  { id: "uribia", name: "Uribia", place: "La Guajira", state: "COLAG", lat: 11.71, lon: -72.27, kind: "town", yield: 8, appeal: 4, risk: 1.24,
    note: "Capital indígena de Colombia, en un desierto que llega hasta el mar. Los wayúu interpretan los sueños como información operativa, y sueñan mucho últimamente." },
  { id: "el-cocuy", name: "El Cocuy", place: "Boyacá", state: "COBOY", lat: 6.41, lon: -72.44, kind: "town", yield: 7, appeal: 7, risk: 1.06,
    note: "Bajo la última sierra nevada del país. Los u'wa amenazaron con arrojarse de un precipicio colectivamente antes que permitir perforaciones en su tierra." },

  // --- Hatos (biomasa) -----------------------------------------------------
  { id: "el-cedral", name: "Hato El Cedral", place: "Apure", state: "VEC", lat: 7.45, lon: -69.35, kind: "ranch", yield: 11, appeal: 4, risk: 0.88,
    note: "Cincuenta y tres mil hectáreas de llano inundable. En la seca, todo el ganado se concentra en los mismos bancos y nadie recorre el perímetro." },
  { id: "la-aurora", name: "Hato La Aurora", place: "Casanare", state: "COCAS", lat: 5.80, lon: -71.00, kind: "ranch", yield: 11, appeal: 5, risk: 0.8,
    note: "Un siglo de ganadería y una decisión, poco común, de no cazar. Hay más fauna aquí que en muchos parques, y muy pocos ojos humanos." },
  { id: "pinero", name: "Hato Piñero", place: "Cojedes", state: "VEH", lat: 8.98, lon: -68.07, kind: "ranch", yield: 10, appeal: 4, risk: 0.88,
    note: "Ochenta mil hectáreas entre el llano y la cordillera. El inventario de reses se hace a ojo desde una avioneta una vez al año." },
  { id: "paz-de-ariporo", name: "Paz de Ariporo", place: "Casanare", state: "COCAS", lat: 5.88, lon: -71.89, kind: "ranch", yield: 10, appeal: 3, risk: 0.88,
    note: "Uno de los municipios más extensos del país, y casi todo sabana. En 2014 se murieron veinte mil animales de sed y nadie lo supo durante semanas." },
  { id: "arauca-llano", name: "Llanos de Arauca", place: "Arauca", state: "COARA", lat: 7.09, lon: -70.76, kind: "ranch", yield: 10, appeal: 3, risk: 1.12,
    note: "Frontera de río con Venezuela y ganado que la cruza en ambos sentidos sin papeles. Aquí desaparecer una res no es noticia." },
  { id: "guarico-llano", name: "Llanos de Guárico", place: "Guárico", state: "VEJ", lat: 8.55, lon: -66.35, kind: "ranch", yield: 10, appeal: 3, risk: 0.88,
    note: "El centro geográfico del país y su despensa de carne. Horizonte plano en los 360 grados." },
  { id: "barinas-llano", name: "Barinas", place: "Barinas", state: "VEE", lat: 8.62, lon: -70.21, kind: "ranch", yield: 9, appeal: 4, risk: 0.88,
    note: "Al pie de los Andes, donde la montaña se acaba de golpe y empieza el llano. Ganado, maíz y avionetas que aterrizan en potreros." },
  { id: "sinu", name: "Valle del Sinú", place: "Córdoba", state: "COCOR", lat: 8.75, lon: -75.88, kind: "ranch", yield: 10, appeal: 4, risk: 0.96,
    note: "La mejor tierra ganadera del Caribe colombiano y la más disputada. Los zenúes construyeron aquí canales hace dos mil años." },
  { id: "valledupar", name: "Valledupar", place: "Cesar", state: "COCES", lat: 10.46, lon: -73.25, kind: "ranch", yield: 9, appeal: 5, risk: 0.96,
    note: "Entre la Sierra Nevada y la serranía del Perijá. Cuna del vallenato: aquí las noticias viajan cantadas antes de llegar al periódico." },
  { id: "san-fernando", name: "San Fernando de Apure", place: "Apure", state: "VEC", lat: 7.90, lon: -67.47, kind: "ranch", yield: 9, appeal: 3, risk: 0.96,
    note: "Puerto fluvial del llano profundo. En invierno el agua sube tres metros y la sabana entera se vuelve un mar de poca profundidad." },
  { id: "chiriqui", name: "Tierras Altas de Chiriquí", place: "Chiriquí", state: "PA4", lat: 8.60, lon: -82.43, kind: "ranch", yield: 9, appeal: 6, risk: 0.88,
    note: "Café de altura y ganado lechero en las faldas del Barú. Nubes bajas casi todos los días, que es lo que a ustedes les conviene." },

  // --- Militar -------------------------------------------------------------
  { id: "palanquero", name: "Base Aérea de Palanquero", place: "Puerto Salgar, Cundinamarca", state: "COCUN", lat: 5.48, lon: -74.66, kind: "military", yield: 13, appeal: 2, risk: 1.87,
    note: "La base aérea más importante de Colombia, sobre el Magdalena. Su pista aguanta cualquier cosa que quiera aterrizar en ella." },
  { id: "libertador", name: "Base Aérea El Libertador", place: "Palo Negro, Aragua", state: "VED", lat: 10.18, lon: -67.56, kind: "military", yield: 13, appeal: 2, risk: 1.96,
    note: "El grueso de la aviación de combate venezolana. Los cazas salen a interceptar cualquier eco que no responda, y a veces despegan sin explicación pública." },
  { id: "manta", name: "Base de Manta", place: "Manabí", state: "ECM", lat: -0.95, lon: -80.68, kind: "military", yield: 12, appeal: 2, risk: 1.78,
    note: "Durante diez años fue Puesto de Operaciones Avanzado de Estados Unidos, hasta que la constitución de 2008 prohibió bases extranjeras. Los hangares siguen ahí." },
  { id: "rodman", name: "Antigua Zona del Canal", place: "Colón", state: "PA3", lat: 9.35, lon: -79.95, kind: "military", yield: 13, appeal: 3, risk: 1.87,
    note: "Territorio estadounidense soberano hasta 1999, y sede del Comando Sur. Se marcharon; los archivos y algunos de sus intereses se quedaron." },
  { id: "tolemaida", name: "Fuerte Tolemaida", place: "Tolima", state: "COTOL", lat: 4.25, lon: -74.65, kind: "military", yield: 12, appeal: 2, risk: 1.78,
    note: "La mayor guarnición de entrenamiento del país, en tierra caliente. Aquí se entrena a saltar de noche, lo que complica bastante sus horarios." },
  { id: "fuerte-tiuna", name: "Fuerte Tiuna", place: "Caracas", state: "VEA", lat: 10.47, lon: -66.93, kind: "military", yield: 12, appeal: 2, risk: 1.96,
    note: "Ciudad militar dentro de la capital. Todo lo que se decide sobre el espacio aéreo venezolano se decide en un despacho de este perímetro." },
];

export const SITE_BY_ID: Record<string, Site> = Object.fromEntries(
  SITES.map((s) => [s.id, s]),
);

/** Posición del sitio en unidades del viewBox. */
export function siteXY(id: string): [number, number] {
  const s = SITE_BY_ID[id];
  if (!s) return [0, 0];
  return project(s.lon, s.lat);
}
