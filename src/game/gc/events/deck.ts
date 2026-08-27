// Mazo de eventos de la Gran Colombia.
//
// Las plantillas evitan a propósito poner un verbo justo detrás de {witness}:
// las entradas del vocabulario mezclan singular y plural, y el relleno de
// ranuras es una sustitución de texto, no un analizador gramatical. «Según
// {witness}, …» funciona con las dos; «{witness} informa» no.

import type { EventDef } from "../../types";

export const DECK_GC: EventDef[] = [
  // --- Avistamientos -------------------------------------------------------
  { id: "gc-luz-carretera", tier: 1, tags: ["sighting"], weight: 10,
    headline: "LUZ SOBRE LA CARRETERA DE {place}",
    dek: "Según {witness}, {object} se mantuvo sobre la vía cerca de {place} durante varios minutos. {official} no ha querido comentar, y {oddity}.",
    choices: [
      { label: "Comprar el rollo antes de que revele", cost: { cash: 45 }, effect: { disclosure: -2, suspicion: -4 }, note: "El fotógrafo acepta el dinero y una explicación sobre globos meteorológicos." },
      { label: "Dejar que salga", effect: { disclosure: 1.5, suspicion: 3 }, note: "Sale en página siete, entre un robo de ganado y la programación de radio." },
    ] },
  { id: "gc-perros", tier: 1, tags: ["sighting", "weird"], weight: 9,
    headline: "NOCHE SIN PERROS EN {place}",
    dek: "Declaración de {witness}, tomada en la inspección de policía: {oddity}. Nadie vio nada; todos oyeron lo mismo.",
    choices: [
      { label: "Mandar a alguien a escuchar", cost: { cash: 30 }, effect: { disclosure: -1, suspicion: -3 }, note: "Un enviado toma nota de los nombres. No vuelve a pasar nada en ese caserío." },
      { label: "No hacer nada", effect: { suspicion: 2 }, note: "El asunto se comenta dos semanas y se olvida en tres." },
    ] },
  { id: "gc-fumigador", tier: 2, tags: ["sighting"], weight: 8, needsRoute: true,
    headline: "UNA AVIONETA ESQUIVA ALGO SOBRE EL LLANO",
    dek: "Un fumigador que trabajaba cerca de {place} tuvo que virar bruscamente. Traía copiloto, y el copiloto habla. {official} pidió el registro de vuelo.",
    choices: [
      { label: "Comprar el registro de vuelo", cost: { cash: 120 }, effect: { disclosure: -5 }, note: "El registro aparece incompleto. Estas cosas pasan con el papel en el trópico." },
      { label: "Desacreditar al piloto", cost: { standing: 4 }, effect: { disclosure: -3, faction: { movement: 6 } }, backfire: { chance: 0.3, effect: { disclosure: 4, faction: { movement: 12 } }, note: "El piloto resulta ser instructor con dos mil horas y un abogado. La entrevista se emite entera." }, note: "Se filtra que llevaba turno doble. El asunto se enfría." },
      { label: "Ignorarlo", effect: { disclosure: 3, suspicion: 6 }, note: "La revista de misterio de la capital le dedica la portada." },
    ] },
  { id: "gc-radar-maiquetia", tier: 3, tags: ["sighting", "crisis"], weight: 6, minDisclosure: 25,
    headline: "ECO NO IDENTIFICADO EN EL RADAR DE APROXIMACIÓN",
    dek: "Un control de tránsito aéreo registró durante once minutos algo que no respondía y que no debería moverse así. La cinta existe y hay tres copias.",
    choices: [
      { label: "Conseguir las tres copias", cost: { cash: 260 }, effect: { disclosure: -9 }, note: "Las tres copias se archivan en el mismo sitio y ese sitio se inunda." },
      { label: "Que la Fuerza Aérea lo explique", cost: { standing: 8 }, effect: { disclosure: -4, faction: { mj12: 6 } }, note: "Un coronel explica en rueda de prensa que fue una inversión térmica. Nadie queda convencido, pero nadie insiste." },
      { label: "Dejarlo correr", effect: { disclosure: 7, suspicionAll: 3 }, note: "La cinta se emite en horario estelar. Dos veces." },
    ] },

  // --- Prensa y humanos ----------------------------------------------------
  { id: "gc-revista", tier: 2, tags: ["human"], weight: 9,
    headline: "UNA REVISTA DE MISTERIO ABRE OFICINA EN {place}",
    dek: "Financiada por {believer}. Publican mensualmente, citan fuentes y, lo que es peor, archivan.",
    choices: [
      { label: "Comprar la línea editorial", cost: { cash: 150 }, effect: { disclosure: -6, faction: { movement: -8 } }, note: "El siguiente número trata sobre pirámides y no vuelve a mencionar el llano." },
      { label: "Filtrarles material falso", cost: { cash: 60 }, effect: { disclosure: -4, faction: { movement: -5 } }, backfire: { chance: 0.35, effect: { disclosure: 6, faction: { movement: 10 } }, note: "Verifican el material, descubren que es falso y publican quién se lo dio." }, note: "Publican una patraña verificable y pierden la mitad de sus lectores serios." },
      { label: "Dejarlos trabajar", effect: { disclosure: 2.5, faction: { movement: 6 } }, note: "En seis meses tienen corresponsales en cuatro departamentos." },
    ] },
  { id: "gc-obispo", tier: 2, tags: ["human", "faction"], weight: 7,
    headline: "EL OBISPO PIDE CALMA Y ALGO MÁS",
    dek: "Desde el púlpito de {place} se ha pedido a los fieles que no suban al cerro de noche. La petición ha tenido el efecto contrario.",
    choices: [
      { label: "Donar a la parroquia", cost: { cash: 90 }, effect: { disclosure: -4, standing: 2 }, note: "El techo de la iglesia se arregla y el tema no vuelve a la homilía." },
      { label: "Que suban", effect: { disclosure: 2, suspicion: 5, faction: { movement: 4 } }, note: "Cuatrocientas personas en el cerro un sábado por la noche, todas mirando arriba." },
    ] },
  { id: "gc-contactados", tier: 2, tags: ["human", "faction"], weight: 7,
    headline: "UN GRUPO DE CONTACTADOS ANUNCIA UNA CITA",
    dek: "{believer} ha convocado a la prensa para una aparición programada cerca de {place}. Han acertado dos veces de once, lo que ya es demasiado.",
    choices: [
      { label: "Aparecerse, brevemente", cost: { cash: 70 }, effect: { faction: { movement: 10, nordic: 6 }, disclosure: 1, standing: -3 }, note: "Se les da un minuto de luces. Vuelven a casa convencidos y dejan de buscar." },
      { label: "No aparecer", effect: { faction: { movement: -6 }, disclosure: -1 }, note: "Esperan hasta las cuatro de la mañana. Tres de ellos abandonan el grupo." },
    ] },
  { id: "gc-fraude", tier: 1, tags: ["human", "boon"], weight: 8,
    headline: "DESENMASCARAN UN MONTAJE EN {place}",
    dek: "Resultó ser {hoaxer}. La prensa lo ha celebrado más de lo que el asunto merecía.",
    choices: [
      { label: "Amplificar la burla", cost: { cash: 40 }, effect: { disclosure: -6, faction: { movement: -8 } }, note: "Durante un mes, cualquiera que declare algo es «otro del plato de aluminio»." },
      { label: "Dejarlo estar", effect: { disclosure: -2 }, note: "El escepticismo sube solo un poco, pero sube." },
    ] },

  // --- Facciones -----------------------------------------------------------
  { id: "gc-comando-sur", tier: 3, tags: ["faction", "crisis"], weight: 7, minDisclosure: 20,
    headline: "MANIOBRAS CONJUNTAS EN LA ANTIGUA ZONA",
    dek: "Los archivos que se quedaron en Colón han empezado a consultarse otra vez, y alguien ha pedido cobertura de radar sobre el istmo.",
    choices: [
      { label: "Pagar el retainer", cost: { cash: 220 }, effect: { faction: { mj12: 12 }, disclosure: -7 }, note: "El radar del istmo tiene un mantenimiento programado de nueve días." },
      { label: "Ofrecerles una nave averiada", cost: { standing: 12 }, effect: { faction: { mj12: 18, federation: -8 }, disclosure: -10 }, note: "Se llevan un casco vacío y se pasan un año felices con él." },
      { label: "Negarse", effect: { faction: { mj12: -10 }, disclosure: 4 }, note: "El istmo queda cubierto por radar las veinticuatro horas." },
    ] },
  { id: "gc-federacion-auditoria", tier: 3, tags: ["faction"], weight: 6,
    headline: "LA FEDERACIÓN ANUNCIA UNA AUDITORÍA DE SECTOR",
    dek: "Su licencia sobre el Sector 4 se revisa cada cierto tiempo. Esta vez han avisado, lo que nunca es buena señal.",
    choices: [
      { label: "Presentar libros limpios", cost: { cash: 180 }, effect: { standing: 14, disclosure: -4 }, note: "La auditoría pasa. Le felicitan por el orden y le recuerdan quién manda." },
      { label: "Presentar los libros reales", effect: { standing: -10, disclosure: -6, faction: { federation: -6 } }, note: "Se aprecia la honestidad y se castiga el contenido." },
    ] },
  { id: "gc-draco", tier: 4, tags: ["faction", "crisis"], weight: 4, minDisclosure: 45,
    headline: "LOS DRACO PROPONEN «ACELERAR»",
    dek: "Un emisario sugiere que el disimulo ya ha costado bastante y que un aterrizaje público sobre una capital resolvería el problema de raíz.",
    choices: [
      { label: "Rechazarlo en firme", cost: { standing: 10 }, effect: { faction: { draco: -14, federation: 10 }, disclosure: -6 }, note: "Se marchan ofendidos. La Federación toma nota de su lealtad." },
      { label: "Escuchar la propuesta", effect: { faction: { draco: 12, federation: -10 }, disclosure: 9 }, note: "No se compromete a nada, pero alguien los vio reunidos y eso ya circula." },
    ] },
  { id: "gc-nordicos-queja", tier: 2, tags: ["faction"], weight: 7, races: ["grey", "mantid"],
    headline: "LOS NÓRDICOS PRESENTAN UNA QUEJA FORMAL",
    dek: "Alegan que su operación está estropeando paisajes que ellos tenían contratados para la temporada.",
    choices: [
      { label: "Compensarles", cost: { cash: 130 }, effect: { faction: { nordic: 12 }, standing: 3 }, note: "Aceptan el pago y retiran la queja antes de que llegue a la Federación." },
      { label: "Ignorar la queja", effect: { faction: { nordic: -12 }, standing: -4 }, note: "La queja llega a la Federación con fotografías adjuntas." },
    ] },

  // --- Rarezas -------------------------------------------------------------
  { id: "gc-catatumbo-tapadera", tier: 1, tags: ["weird", "boon"], weight: 9,
    headline: "OTRA NOCHE DE RELÁMPAGO EN EL SUR DEL LAGO",
    dek: "Doscientos sesenta días al año de tormenta sin trueno. Cualquier cosa que se mueva sobre esa agua es, oficialmente, meteorología.",
    choices: [
      { label: "Mover todo lo posible esta noche", effect: { disclosure: -3, suspicionAll: -4 }, note: "Bajo el relámpago no hay testigo que valga. Nadie levanta un solo informe." },
      { label: "Operar normal", effect: {}, note: "Se desaprovecha la mejor tapadera natural del hemisferio." },
    ] },
  { id: "gc-tepuy", tier: 2, tags: ["weird"], weight: 7, kinds: ["landmark", "anomaly"],
    headline: "UNA EXPEDICIÓN NO BAJA DEL TEPUY CUANDO DEBÍA",
    dek: "Cuatro días de retraso sobre el plan. Cuando bajaron, todos contaban lo mismo y ninguno quería repetirlo ante {official}.",
    choices: [
      { label: "Pagar el rescate y el silencio", cost: { cash: 110 }, effect: { disclosure: -5, standing: 2 }, note: "Bajan sanos, agradecidos y con una versión sobre niebla y brújulas." },
      { label: "Dejar que lo cuenten", effect: { disclosure: 4, suspicion: 8, faction: { movement: 8 } }, note: "Cuatro testimonios independientes y coincidentes. Eso es exactamente lo que nadie necesitaba." },
    ] },
  { id: "gc-kogi", tier: 3, tags: ["weird", "faction"], weight: 5, minHeat: 30,
    headline: "LOS HERMANOS MAYORES ENVÍAN UN AVISO",
    dek: "Cuatro mamos han bajado de la Sierra por primera vez en años. No han hablado con la prensa. Han hablado con el gobernador, y han sido específicos.",
    choices: [
      { label: "Retirarse de la Sierra una temporada", cost: { cash: 90 }, effect: { disclosure: -8, suspicionAll: -6 }, note: "Se suspenden operaciones en el macizo. La montaña se calma y ellos vuelven a subir." },
      { label: "Seguir operando", effect: { disclosure: 6, suspicion: 10 }, note: "El aviso se repite, esta vez ante cámaras, y con nombres de sitios exactos." },
    ] },
  { id: "gc-tayos-expedicion", tier: 3, tags: ["weird"], weight: 5,
    headline: "SE ANUNCIA UNA NUEVA EXPEDICIÓN A LOS TAYOS",
    dek: "Patrocinada, con permiso del ejército y con un astronauta retirado en el comité de honor. La última vez no encontraron nada. Esta vez llevan sensores.",
    choices: [
      { label: "Financiarla y guiarla lejos", cost: { cash: 190 }, effect: { disclosure: -8 }, note: "Se les asigna un ramal precioso, larguísimo y absolutamente vacío." },
      { label: "Cerrar el acceso por la vía militar", cost: { standing: 9 }, effect: { disclosure: -5, faction: { mj12: 5 } }, note: "La cueva queda cerrada por «riesgo geológico». La prensa lo publica tal cual." },
      { label: "Dejarles entrar", effect: { disclosure: 8, suspicion: 6 }, note: "Bajan seiscientos metros con instrumentos y suben con lecturas que no saben explicar." },
    ] },
  { id: "gc-ganado", tier: 2, tags: ["weird", "crisis"], weight: 8, kinds: ["ranch"], races: ["grey"],
    headline: "RESES APARECIDAS SIN UNA GOTA DE SANGRE",
    dek: "Nueve animales en el mismo potrero de {place}, con cortes limpios y sin rastros alrededor. El dueño ha llamado a la prensa antes que al veterinario.",
    choices: [
      { label: "Pagar el ganado al triple", cost: { cash: 140 }, effect: { disclosure: -6, suspicion: -8 }, note: "El hacendado cobra, firma y recuerda de pronto que fue un jaguar." },
      { label: "Culpar al chupacabras", cost: { cash: 35 }, effect: { disclosure: -3, faction: { movement: 5 } }, backfire: { chance: 0.3, effect: { disclosure: 5, suspicion: 6 }, note: "La historia del chupacabras atrae a tres equipos de televisión a su zona de operaciones." }, note: "El país entero discute sobre un animal mitológico y se olvida del cielo." },
      { label: "No responder", effect: { disclosure: 4, suspicion: 9 }, note: "Las fotografías del potrero salen en primera plana, a cuatro columnas." },
    ] },
  { id: "gc-apagon", tier: 2, tags: ["weird"], weight: 7,
    headline: "APAGÓN DE ONCE MINUTOS EN {place}",
    dek: "Sin causa técnica identificada. La empresa habla de una falla en la subestación; {oddity}, y eso no lo explica ninguna subestación.",
    choices: [
      { label: "Pagar el peritaje conveniente", cost: { cash: 80 }, effect: { disclosure: -4 }, note: "El informe técnico concluye «sobrecarga por vegetación». Se archiva." },
      { label: "Dejar el peritaje real", effect: { disclosure: 3, suspicion: 5 }, note: "El perito no encuentra la causa y lo escribe así, con su firma." },
    ] },
  { id: "gc-especimen", tier: 2, tags: ["weird"], weight: 6, races: ["mantid"], kinds: ["town"],
    headline: "UNA DENUNCIA POR DESAPARICIÓN DE HORAS",
    dek: "Un vecino de {place} declara haber perdido tres horas volviendo de un velorio. El médico rural le ha encontrado una marca que no sabe clasificar.",
    choices: [
      { label: "Enviar a un híbrido a cerrar el asunto", cost: { cash: 95 }, effect: { disclosure: -6 }, note: "Un funcionario amable le explica que fue fatiga. Se lo cree, y es cierto que estaba cansado." },
      { label: "Dejarlo", effect: { disclosure: 4, suspicion: 7, faction: { movement: 6 } }, note: "El caso llega a la revista, con el nombre del médico y la fecha." },
    ] },
  { id: "gc-mareas", tier: 1, tags: ["weird"], weight: 8, kinds: ["anomaly", "landmark"],
    headline: "PESCADORES REPORTAN BRÚJULAS LOCAS",
    dek: "Frente a {place}, tres lanchas dieron la misma novedad la misma noche. {oddity}.",
    choices: [
      { label: "Comprarles las brújulas", cost: { cash: 35 }, effect: { disclosure: -2 }, note: "Se les cambian por otras nuevas y mejores. Nadie vuelve a mencionarlo." },
      { label: "No intervenir", effect: { disclosure: 1.5, suspicion: 3 }, note: "La capitanía de puerto abre un expediente por escrito." },
    ] },
  { id: "gc-volcan", tier: 3, tags: ["weird", "crisis"], weight: 5, minDisclosure: 30,
    headline: "LUCES SOBRE EL VOLCÁN ANTES DE LA ALERTA",
    dek: "El Instituto Geofísico ha subido el nivel de alerta. Lo incómodo es que las luces se vieron dos semanas antes, y alguien las filmó con fecha.",
    choices: [
      { label: "Comprar la cinta y la fecha", cost: { cash: 240 }, effect: { disclosure: -9 }, note: "La cinta desaparece del archivo de la televisora regional." },
      { label: "Colaborar con la evacuación", cost: { cash: 160 }, effect: { standing: 10, disclosure: -5, faction: { movement: -6 } }, note: "Se mueven camiones que no eran suyos. Salva a mucha gente y compra mucho silencio." },
      { label: "Mantenerse al margen", effect: { disclosure: 8, suspicionAll: 4 }, note: "Después de lo que pasó, esa filmación se emite en todos los canales del continente." },
    ] },
  { id: "gc-frontera", tier: 2, tags: ["crisis"], weight: 7, needsRoute: true,
    headline: "CIERRE DE FRONTERA SIN PREVIO AVISO",
    dek: "Los dos gobiernos han cerrado los pasos del río y han puesto radar en el sector. Sus rutas cruzan por ahí.",
    choices: [
      { label: "Sobornar en ambos lados", cost: { cash: 170 }, effect: { disclosure: -4, suspicionAll: -3 }, note: "Los radares del sector entran en mantenimiento simultáneo, lo que es una casualidad notable." },
      { label: "Suspender esa ruta unos días", effect: { disclosure: -2, cash: -40 }, note: "Se pierde carga, pero no se pierde la operación." },
      { label: "Volar igual", effect: { disclosure: 5, suspicion: 10 }, note: "Un radar militar lo registra dos noches seguidas a la misma hora." },
    ] },
  { id: "gc-hallazgo", tier: 2, tags: ["boon"], weight: 6,
    headline: "UN CARGAMENTO SE DA POR PERDIDO EN EL DARIÉN",
    dek: "Se perdió de verdad, pero no como cree la aduana. Lo que apareció al recuperarlo no figuraba en ningún manifiesto suyo.",
    choices: [
      { label: "Recuperarlo discretamente", cost: { cash: 60 }, effect: { cash: 260, disclosure: 1 }, note: "Se recupera de noche y con gente de confianza. Sale muy a cuenta." },
      { label: "Dejarlo donde está", effect: { disclosure: -2 }, note: "El Darién se queda con lo suyo, como siempre." },
    ] },
  { id: "gc-mecenas", tier: 1, tags: ["boon"], weight: 7,
    headline: "UN GANADERO OFRECE SUS TIERRAS",
    dek: "Ha visto lo suficiente para deducir bastante, y en lugar de llamar a la prensa ha preguntado cuánto pagan.",
    choices: [
      { label: "Aceptar el trato", cost: { cash: 50 }, effect: { cash: 190, suspicion: -6, disclosure: -2 }, note: "Cobra por hectárea y por silencio, y cumple las dos cosas." },
      { label: "Declinar", effect: { disclosure: 1 }, note: "Se queda pensando, que es peor que si hubiera cobrado." },
    ] },
];
