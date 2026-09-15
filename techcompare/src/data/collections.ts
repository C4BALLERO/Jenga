import type { ProductCategory } from "@/types/common";

export interface CollectionFaq {
  question: string;
  answer: string;
}

/**
 * Colecciones editoriales = páginas de SEO programático.
 *
 * Cada entrada produce una página real con criterio declarado, ranking
 * calculado sobre el catálogo y preguntas frecuentes propias. No se generan
 * combinaciones automáticas vacías: una colección existe solo si aporta un
 * criterio de compra que un lector podría buscar.
 */
export interface Collection {
  slug: string;
  category: ProductCategory;
  title: string;
  heading: string;
  /** Meta description. */
  description: string;
  intro: string;
  /** Qué se ha tenido en cuenta para ordenar. Se muestra al lector. */
  criteria: string[];
  /** Dimensión de puntuación por la que se ordena. */
  rankBy: string;
  maxPrice?: number;
  minPrice?: number;
  /** Filtros por especificación numérica mínima. */
  minSpecs?: Record<string, number>;
  flags?: Record<string, boolean>;
  limit?: number;
  faq: CollectionFaq[];
}

export const collections: Collection[] = [
  {
    slug: "mejor-celular-por-2000-bs",
    category: "phone",
    title: "Mejor celular por 2.000 Bs",
    heading: "Los mejores celulares por menos de 2.000 Bs",
    description:
      "Ranking de celulares por debajo de 2.000 Bs ordenados por equilibrio entre rendimiento, batería y cámara.",
    intro:
      "Por debajo de 2.000 Bs el margen es estrecho: casi siempre hay que elegir entre pantalla, cámara o autonomía. Este ranking prioriza los equipos que menos sacrifican en lo que más se nota en el día a día: fluidez del sistema y batería que aguante la jornada.",
    criteria: [
      "Precio de referencia por debajo de 2.000 Bs",
      "Puntuación combinada de rendimiento, batería y pantalla",
      "Penaliza los equipos con menos de 6 GB de RAM",
    ],
    rankBy: "value",
    maxPrice: 2000,
    faq: [
      {
        question: "¿Merece la pena pagar un poco más de 2.000 Bs?",
        answer:
          "Entre 2.000 y 2.600 Bs el salto es notable en procesador y pantalla. Si puedes estirar el presupuesto un 25%, el equipo te durará más tiempo sin sentirse lento.",
      },
      {
        question: "¿Cuánta RAM necesito en esta franja?",
        answer:
          "6 GB es el mínimo razonable para que el sistema no cierre aplicaciones en segundo plano. Con 8 GB el equipo envejece bastante mejor.",
      },
    ],
  },
  {
    slug: "mejor-celular-por-3000-bs",
    category: "phone",
    title: "Mejor celular por 3.000 Bs",
    heading: "Los mejores celulares por menos de 3.000 Bs",
    description:
      "Comparativa de celulares hasta 3.000 Bs: pantalla AMOLED, carga rápida y procesadores de gama media alta.",
    intro:
      "Los 3.000 Bs son el punto dulce del mercado boliviano. Aquí ya se consiguen paneles AMOLED a 120 Hz, carga rápida de verdad y procesadores que mueven cualquier juego popular sin tirones.",
    criteria: [
      "Precio de referencia por debajo de 3.000 Bs",
      "Equilibrio entre rendimiento, cámara y batería",
      "Se valora la carga rápida y la pantalla de alta frecuencia",
    ],
    rankBy: "value",
    maxPrice: 3000,
    faq: [
      {
        question: "¿Qué gano frente a un celular de 2.000 Bs?",
        answer:
          "Sobre todo procesador y pantalla. La diferencia se nota en juegos, en la fluidez general y en la calidad del panel.",
      },
      {
        question: "¿Son suficientes 128 GB?",
        answer:
          "Para un uso normal sí, pero si grabas vídeo con frecuencia te quedarás corto en dos años. Usa la calculadora de almacenamiento para salir de dudas.",
      },
    ],
  },
  {
    slug: "mejor-celular-para-gaming",
    category: "phone",
    title: "Mejor celular para gaming",
    heading: "Los mejores celulares para jugar",
    description:
      "Ranking de celulares para gaming: procesador, tasa de refresco y disipación evaluados en conjunto.",
    intro:
      "En móviles, jugar bien depende de tres cosas: potencia bruta del procesador, una pantalla que acompañe con alta tasa de refresco y suficiente RAM para que el juego no se recargue al cambiar de aplicación. Este ranking pondera esos tres factores.",
    criteria: [
      "65% del peso al rendimiento del procesador",
      "20% a la tasa de refresco de la pantalla",
      "15% a la cantidad de RAM disponible",
    ],
    rankBy: "gaming",
    faq: [
      {
        question: "¿Importan los 120 Hz para jugar?",
        answer:
          "Sí, pero solo si el juego los aprovecha. En títulos competitivos la diferencia es clara; en juegos limitados a 60 fps, el beneficio es menor.",
      },
      {
        question: "¿Cuánta RAM hace falta para jugar?",
        answer:
          "8 GB cubren la mayoría de casos. Con 12 GB puedes alternar entre el juego y otras aplicaciones sin que se reinicie la partida.",
      },
    ],
  },
  {
    slug: "mejor-celular-para-fotografia",
    category: "phone",
    title: "Mejor celular para fotografía",
    heading: "Los mejores celulares para hacer fotos",
    description:
      "Celulares ordenados por calidad fotográfica: sensor principal, número de cámaras, zoom óptico y cámara frontal.",
    intro:
      "Los megapíxeles no lo son todo, pero en igualdad de condiciones un sensor mayor capta más luz. Este ranking combina resolución del sensor principal, versatilidad del conjunto de cámaras, zoom óptico y calidad de la cámara frontal.",
    criteria: [
      "Resolución del sensor principal en escala logarítmica",
      "Número de cámaras traseras útiles",
      "Zoom óptico disponible",
      "Resolución de la cámara frontal",
    ],
    rankBy: "camera",
    faq: [
      {
        question: "¿Más megapíxeles significa mejores fotos?",
        answer:
          "No directamente. El procesado y el tamaño del sensor pesan más. Los megapíxeles ayudan al recortar y en condiciones de mucha luz.",
      },
      {
        question: "¿Vale la pena el zoom óptico?",
        answer:
          "Si haces retratos o fotografías a distancia, sí. El zoom digital pierde detalle muy rápido a partir de 2 aumentos.",
      },
    ],
  },
  {
    slug: "mejor-celular-bateria",
    category: "phone",
    title: "Mejor celular por batería",
    heading: "Los celulares con mejor batería",
    description:
      "Celulares con más autonomía: capacidad en mAh y potencia de carga rápida evaluadas juntas.",
    intro:
      "Una batería grande sin carga rápida obliga a dejar el equipo enchufado media tarde. Este ranking pondera capacidad y velocidad de carga, que es lo que de verdad determina si el teléfono te deja tirado.",
    criteria: [
      "70% del peso a la capacidad en mAh",
      "30% a la potencia de carga rápida",
    ],
    rankBy: "battery",
    faq: [
      {
        question: "¿Cuántos mAh necesito para llegar al final del día?",
        answer:
          "Con 5.000 mAh la mayoría de usuarios llega sin problema. Por encima de 6.000 mAh se puede aspirar a dos días de uso moderado.",
      },
      {
        question: "¿La carga rápida daña la batería?",
        answer:
          "Los sistemas modernos gestionan la temperatura y reducen la potencia al acercarse al 100%. El desgaste existe pero es menor de lo que se suele creer.",
      },
    ],
  },
  {
    slug: "mejor-laptop-para-estudiantes",
    category: "laptop",
    title: "Mejor laptop para estudiantes",
    heading: "Las mejores laptops para estudiar",
    description:
      "Laptops para estudiantes: autonomía, peso y rendimiento suficiente para clases y trabajos.",
    intro:
      "Una laptop de estudio se juzga por lo que pesa en la mochila y por cuánto aguanta sin enchufe, no por cuántos fotogramas mueve. Este ranking prioriza portabilidad y autonomía, con un rendimiento suficiente para ofimática, navegación y videollamadas.",
    criteria: [
      "60% del peso a portabilidad (peso del equipo y batería)",
      "40% al rendimiento en tareas de productividad",
      "Se valora la pantalla para largas sesiones de lectura",
    ],
    rankBy: "portability",
    maxPrice: 9000,
    faq: [
      {
        question: "¿8 GB de RAM son suficientes para estudiar?",
        answer:
          "Para ofimática y navegación sí, pero hoy 16 GB es la elección sensata si quieres que el equipo dure toda la carrera.",
      },
      {
        question: "¿Necesito gráfica dedicada?",
        answer:
          "Solo si vas a trabajar con diseño 3D, edición de vídeo o juegos. Para el resto, la gráfica integrada actual es más que suficiente.",
      },
    ],
  },
  {
    slug: "mejor-laptop-para-gaming",
    category: "laptop",
    title: "Mejor laptop para gaming",
    heading: "Las mejores laptops gaming",
    description:
      "Laptops gaming comparadas por gráfica, procesador y pantalla de alta frecuencia.",
    intro:
      "En una laptop gaming la gráfica manda, pero un procesador desequilibrado la frena y una pantalla de 60 Hz desperdicia el trabajo de ambos. El ranking pondera los tres elementos en esa proporción.",
    criteria: [
      "70% del peso a la gráfica dedicada",
      "30% al procesador",
      "Se exige pantalla de al menos 120 Hz para el podio",
    ],
    rankBy: "gaming",
    faq: [
      {
        question: "¿Cuánta VRAM necesito en 2026?",
        answer:
          "8 GB es el mínimo para jugar en 1080p con texturas altas. Para 1440p conviene apuntar a 12 GB o más.",
      },
      {
        question: "¿Merece la pena una pantalla de 240 Hz?",
        answer:
          "Solo si juegas a títulos competitivos y la gráfica puede sostener esas tasas. Para juegos de campaña, 120-165 Hz es más que suficiente.",
      },
    ],
  },
  {
    slug: "mejor-procesador-para-gaming",
    category: "cpu",
    title: "Mejor procesador para gaming",
    heading: "Los mejores procesadores para jugar",
    description:
      "Procesadores para gaming ordenados por rendimiento single-core, el factor que más limita los fotogramas.",
    intro:
      "Los juegos dependen sobre todo del rendimiento por núcleo: muy pocos aprovechan más de ocho hilos. Por eso este ranking da tres cuartas partes del peso al rendimiento single-core y solo una cuarta al multi-core.",
    criteria: [
      "75% del peso al rendimiento single-core",
      "25% al rendimiento multi-core",
      "Se tiene en cuenta el consumo para equipos compactos",
    ],
    rankBy: "gaming",
    faq: [
      {
        question: "¿Cuántos núcleos necesito para jugar?",
        answer:
          "Seis núcleos siguen siendo suficientes para la mayoría de juegos. Ocho dan margen si además transmites o grabas la partida.",
      },
      {
        question: "¿La caché extra ayuda en juegos?",
        answer:
          "Sí, de forma notable. Las variantes con caché ampliada suelen rendir mejor en juegos que modelos con más núcleos pero menos caché.",
      },
    ],
  },
  {
    slug: "mejor-procesador-calidad-precio",
    category: "cpu",
    title: "Mejor procesador calidad-precio",
    heading: "Los procesadores con mejor relación calidad-precio",
    description:
      "Procesadores ordenados por rendimiento obtenido respecto a lo que cuestan.",
    intro:
      "Un procesador tope de gama rinde más, pero rara vez rinde proporcionalmente más de lo que cuesta. Este ranking divide el rendimiento combinado entre el precio para encontrar dónde está el punto de mayor retorno.",
    criteria: [
      "Rendimiento combinado single-core y multi-core",
      "Dividido por el precio de referencia en bolivianos",
      "Solo se incluyen modelos que se venden por separado",
    ],
    rankBy: "value",
    faq: [
      {
        question: "¿Compensa comprar la generación anterior?",
        answer:
          "Muchas veces sí. La diferencia de rendimiento entre generaciones consecutivas suele ser menor que la diferencia de precio.",
      },
      {
        question: "¿Debo cambiar también de placa base?",
        answer:
          "Depende del socket. Cambiar de plataforma implica placa y a menudo memoria nueva, lo que puede duplicar el coste real de la actualización.",
      },
    ],
  },
  {
    slug: "mejor-procesador-para-edicion",
    category: "cpu",
    title: "Mejor procesador para edición",
    heading: "Los mejores procesadores para edición de vídeo",
    description:
      "Procesadores para edición y renderizado, ordenados por rendimiento multi-núcleo.",
    intro:
      "Renderizar, exportar y aplicar efectos son tareas que escalan con el número de hilos. Aquí el multi-core pesa el doble que el single-core, aunque este último sigue importando para que la línea de tiempo vaya fluida.",
    criteria: [
      "65% del peso al rendimiento multi-core",
      "35% al rendimiento single-core",
      "Se considera el consumo por su impacto en refrigeración",
    ],
    rankBy: "editing",
    faq: [
      {
        question: "¿Importa más la CPU o la GPU al editar?",
        answer:
          "Depende del códec. Muchos formatos modernos se decodifican por hardware en la GPU, pero los efectos y el renderizado final siguen apoyándose en la CPU.",
      },
      {
        question: "¿Cuánta RAM acompaña a estos procesadores?",
        answer:
          "Para vídeo en 4K, 32 GB es el punto de partida razonable. Con 16 GB el sistema empieza a tirar de disco.",
      },
    ],
  },
  {
    slug: "mejor-gpu-para-1080p",
    category: "gpu",
    title: "Mejor GPU para 1080p",
    heading: "Las mejores tarjetas gráficas para 1080p",
    description:
      "Tarjetas gráficas para jugar en 1080p, ordenadas por rendimiento a esa resolución.",
    intro:
      "En 1080p la mayoría de tarjetas actuales van sobradas, así que la decisión se mueve hacia el precio y el consumo. Este ranking ordena por rendimiento a esa resolución concreta, no por potencia bruta.",
    criteria: [
      "Rendimiento medido a 1920 x 1080",
      "Se valora el consumo por su efecto en la fuente de alimentación",
      "8 GB de VRAM como mínimo recomendable",
    ],
    rankBy: "p1080",
    faq: [
      {
        question: "¿Me sobra una tarjeta de gama alta para 1080p?",
        answer:
          "En la mayoría de casos sí. A esa resolución el procesador suele convertirse en el cuello de botella antes que la gráfica.",
      },
      {
        question: "¿Son suficientes 8 GB de VRAM?",
        answer:
          "Para 1080p con texturas altas, sí en la mayoría de títulos. Algunos juegos recientes ya rozan ese límite con ray tracing activado.",
      },
    ],
  },
  {
    slug: "mejor-gpu-para-1440p",
    category: "gpu",
    title: "Mejor GPU para 1440p",
    heading: "Las mejores tarjetas gráficas para 1440p",
    description:
      "Comparativa de GPUs para jugar en 1440p con ray tracing y escalado por IA.",
    intro:
      "1440p es hoy el equilibrio más razonable entre nitidez y coste. Pide bastante más que 1080p sin llegar a las exigencias del 4K, y es donde la diferencia entre gamas se nota de verdad.",
    criteria: [
      "Rendimiento medido a 2560 x 1440",
      "Se valora la cantidad de VRAM por las texturas de alta resolución",
      "Se tiene en cuenta el escalado por IA disponible",
    ],
    rankBy: "p1440",
    faq: [
      {
        question: "¿Cuánta VRAM necesito para 1440p?",
        answer:
          "12 GB es la cifra cómoda. Con 8 GB funcionarás, pero tendrás que bajar texturas en los títulos más exigentes.",
      },
      {
        question: "¿El escalado por IA sustituye a más potencia?",
        answer:
          "Ayuda mucho, pero parte de una imagen de menor resolución. Es una herramienta excelente, no un sustituto de hardware más capaz.",
      },
    ],
  },
  {
    slug: "mejor-gpu-calidad-precio",
    category: "gpu",
    title: "Mejor GPU calidad-precio",
    heading: "Las tarjetas gráficas con mejor relación calidad-precio",
    description:
      "GPUs ordenadas por rendimiento por boliviano invertido, considerando 1080p, 1440p y 4K.",
    intro:
      "La gama alta siempre gana en fotogramas, pero casi nunca en eficiencia de gasto. Este ranking divide el rendimiento combinado de las tres resoluciones entre el precio de referencia.",
    criteria: [
      "Rendimiento combinado en 1080p, 1440p y 4K",
      "Dividido por el precio de referencia en bolivianos",
      "Se penaliza el consumo excesivo por su coste eléctrico",
    ],
    rankBy: "value",
    faq: [
      {
        question: "¿Compensa la gama alta?",
        answer:
          "Solo si juegas en 4K o necesitas la potencia para trabajo profesional. Para 1080p y 1440p, la gama media suele ofrecer mucho mejor retorno.",
      },
      {
        question: "¿Debo tener en cuenta la fuente de alimentación?",
        answer:
          "Sí. Una tarjeta de 300 W o más puede obligarte a cambiar la fuente, y ese coste hay que sumarlo al de la gráfica.",
      },
    ],
  },
];

export const collectionBySlug = new Map(
  collections.map((collection) => [collection.slug, collection]),
);

export function collectionsForCategory(category: ProductCategory): Collection[] {
  return collections.filter((collection) => collection.category === category);
}
