export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: "phone" | "laptop" | "cpu" | "gpu" | "general";
  readingMinutes: number;
  updated: string;
  intro: string;
  sections: GuideSection[];
  faq: { question: string; answer: string }[];
}

/**
 * Guías de compra. Contenido editorial propio, sin especificaciones de producto
 * concretas, por lo que no depende de datos de proveedores.
 */
export const guides: Guide[] = [
  {
    slug: "como-elegir-celular",
    title: "Cómo elegir un celular en 2026",
    description:
      "Guía práctica para elegir celular: qué mirar de verdad en procesador, pantalla, cámara, batería y actualizaciones.",
    category: "phone",
    readingMinutes: 7,
    updated: "2026-01-10",
    intro:
      "Las fichas técnicas están llenas de cifras que apenas cambian la experiencia de uso. Esta guía separa lo que importa de lo que es puro marketing, con el mercado boliviano en mente: aquí muchos modelos llegan por importación y el soporte oficial no siempre está garantizado.",
    sections: [
      {
        heading: "Empieza por el presupuesto, no por el modelo",
        paragraphs: [
          "Define primero cuánto quieres gastar y solo después mira equipos. Es la única forma de no acabar justificando un gasto mayor con argumentos técnicos que no vas a notar.",
          "Como referencia orientativa en Bolivia: por debajo de 1.500 Bs se compran equipos básicos, entre 2.000 y 3.500 Bs está la gama media con mejor relación calidad-precio, y a partir de 7.000 Bs se entra en gama alta.",
        ],
      },
      {
        heading: "El procesador marca cuántos años te va a durar",
        paragraphs: [
          "Es el componente que peor envejece y el único que no se puede mejorar después. Un procesador holgado hoy sigue siendo suficiente en tres años; uno justo empieza a notarse lento en uno.",
          "No te fijes solo en el número de núcleos: la arquitectura y el proceso de fabricación pesan más. Un procesador de 8 núcleos moderno supera con facilidad a uno de 8 núcleos de hace tres generaciones.",
        ],
      },
      {
        heading: "La pantalla es lo que más vas a mirar",
        paragraphs: [
          "Un panel OLED ofrece negros reales y mejor contraste que un LCD. Los 120 Hz se notan al desplazar contenido, aunque consumen más batería.",
          "El brillo máximo importa más de lo que parece si usas el teléfono en exteriores, algo habitual en ciudades con mucha luz.",
        ],
      },
      {
        heading: "Batería: capacidad y carga van de la mano",
        paragraphs: [
          "Una batería de 5.000 mAh es hoy el estándar y llega al final del día con uso normal. Por encima de 6.000 mAh puedes aspirar a dos días.",
          "La carga rápida cambia la relación con el cargador: con 60 W o más, quince minutos enchufado resuelven media jornada.",
        ],
      },
      {
        heading: "Lo que casi nadie comprueba y luego se echa de menos",
        paragraphs: [
          "Hay tres detalles que no aparecen destacados en la caja y condicionan el uso diario.",
        ],
        bullets: [
          "Años de actualizaciones de seguridad prometidos por el fabricante.",
          "NFC, imprescindible si quieres pagar con el teléfono.",
          "Compatibilidad con las bandas de red de tu operador, especialmente en equipos importados.",
        ],
      },
    ],
    faq: [
      {
        question: "¿Compro ahora o espero al siguiente modelo?",
        answer:
          "Si el equipo que quieres lleva menos de seis meses en el mercado, no vas a ganar nada esperando. Si lleva casi un año, conviene esperar al relevo porque suele bajar de precio.",
      },
      {
        question: "¿Merece la pena un equipo importado sin garantía local?",
        answer:
          "El ahorro puede ser importante, pero cualquier reparación corre por tu cuenta. Compensa en gama media, mucho menos en gama alta.",
      },
    ],
  },
  {
    slug: "como-elegir-laptop",
    title: "Cómo elegir una laptop según tu uso",
    description:
      "Qué procesador, memoria, disco y pantalla necesitas según si estudias, trabajas, editas o juegas.",
    category: "laptop",
    readingMinutes: 8,
    updated: "2026-01-10",
    intro:
      "No existe la mejor laptop, existe la adecuada para lo que vas a hacer con ella. Esta guía traduce cuatro perfiles de uso habituales en configuraciones concretas.",
    sections: [
      {
        heading: "Estudio y ofimática",
        paragraphs: [
          "Prioriza peso y autonomía por encima de potencia. Un equipo de 1,3 kg con batería para toda la jornada te servirá mejor que uno potente que obligue a cargar el cargador.",
          "16 GB de memoria es hoy la elección sensata: 8 GB funciona, pero se queda corto antes de lo que uno espera.",
        ],
      },
      {
        heading: "Trabajo profesional y multitarea",
        paragraphs: [
          "Aquí manda el procesador y la memoria. Si trabajas con muchas pestañas, máquinas virtuales o bases de datos, 32 GB deja de ser un lujo.",
          "Un buen panel y un teclado cómodo influyen más en la productividad diaria que unos puntos extra de rendimiento.",
        ],
      },
      {
        heading: "Edición de vídeo y diseño",
        paragraphs: [
          "Busca rendimiento multinúcleo, memoria abundante y una pantalla con buena cobertura de color. El disco también importa: los proyectos de vídeo llenan un SSD de 512 GB con sorprendente rapidez.",
        ],
      },
      {
        heading: "Gaming",
        paragraphs: [
          "La gráfica dedicada es el componente decisivo, pero comprueba también la refrigeración y la potencia que el fabricante permite a esa gráfica: dos equipos con la misma tarjeta pueden rendir muy distinto.",
          "Una pantalla de 144 Hz o más aprovecha el hardware; una de 60 Hz lo desperdicia.",
        ],
      },
    ],
    faq: [
      {
        question: "¿Puedo ampliar la memoria más adelante?",
        answer:
          "Cada vez menos. Muchos equipos delgados llevan la memoria soldada. Compruébalo antes de comprar si piensas ampliarla.",
      },
      {
        question: "¿Cuántos vatios-hora de batería son suficientes?",
        answer:
          "Por encima de 60 Wh puedes contar con una jornada de trabajo ligero. Por debajo de 50 Wh conviene llevar el cargador siempre.",
      },
    ],
  },
  {
    slug: "cpu-vs-gpu-para-juegos",
    title: "CPU o GPU: dónde invertir para jugar mejor",
    description:
      "Cómo repartir el presupuesto entre procesador y tarjeta gráfica según la resolución a la que juegues.",
    category: "gpu",
    readingMinutes: 6,
    updated: "2026-01-10",
    intro:
      "La pregunta se repite en cada configuración: ¿mejor procesador o mejor gráfica? La respuesta depende casi por completo de la resolución del monitor.",
    sections: [
      {
        heading: "A 1080p el procesador pesa más de lo que parece",
        paragraphs: [
          "A resoluciones bajas la gráfica termina su trabajo rápido y queda esperando al procesador. Es el escenario clásico de cuello de botella por CPU.",
          "Si juegas a 1080p con un monitor de alta frecuencia, un procesador rápido por núcleo rinde más que subir un escalón de gráfica.",
        ],
      },
      {
        heading: "A 1440p y 4K la gráfica manda",
        paragraphs: [
          "Al subir la resolución, cada fotograma exige mucho más trabajo a la gráfica y el procesador deja de ser el límite.",
          "En 4K, la diferencia entre un procesador de gama media y uno tope de gama suele ser de pocos fotogramas.",
        ],
      },
      {
        heading: "Una regla de reparto que funciona",
        paragraphs: [
          "Como punto de partida para un equipo equilibrado de juego:",
        ],
        bullets: [
          "1080p a alta frecuencia: 40% del presupuesto al procesador, 45% a la gráfica.",
          "1440p: 30% al procesador, 55% a la gráfica.",
          "4K: 25% al procesador, 60% a la gráfica.",
        ],
      },
    ],
    faq: [
      {
        question: "¿Y la memoria RAM?",
        answer:
          "16 GB siguen siendo suficientes para jugar. Subir a 32 GB ayuda si además transmites o tienes muchas aplicaciones abiertas.",
      },
      {
        question: "¿El escalado por IA cambia este reparto?",
        answer:
          "Sí. Al renderizar internamente a menor resolución, el peso vuelve a desplazarse hacia el procesador, sobre todo con generación de fotogramas activada.",
      },
    ],
  },
  {
    slug: "cuanto-almacenamiento-necesito",
    title: "Cuánto almacenamiento necesitas realmente",
    description:
      "Guía para calcular el almacenamiento de tu próximo celular sin pagar de más ni quedarte corto.",
    category: "general",
    readingMinutes: 5,
    updated: "2026-01-10",
    intro:
      "El almacenamiento es la decisión más difícil de corregir después: en la mayoría de teléfonos actuales no se puede ampliar. Estos son los números que conviene tener en cuenta antes de elegir.",
    sections: [
      {
        heading: "El sistema se queda su parte",
        paragraphs: [
          "Entre el sistema operativo, las aplicaciones preinstaladas y las cachés, conviene descontar unos 20 GB de la capacidad anunciada.",
          "Además, la capacidad real utilizable es menor que la de la caja porque el fabricante cuenta en gigabytes decimales: un equipo de 128 GB ofrece alrededor de 119 GB reales.",
        ],
      },
      {
        heading: "Lo que más ocupa es el vídeo",
        paragraphs: [
          "Un minuto de vídeo en 4K a 60 fps puede superar el medio gigabyte. Diez minutos al mes durante tres años son más de 200 GB solo en vídeo.",
          "Las fotos, en comparación, son modestas: unos 4 MB cada una en formatos comprimidos modernos.",
        ],
      },
      {
        heading: "La mensajería crece en silencio",
        paragraphs: [
          "Las carpetas de WhatsApp y Telegram acumulan imágenes y vídeos recibidos durante años. En un uso intenso pueden superar los 15 GB sin que te des cuenta.",
        ],
      },
    ],
    faq: [
      {
        question: "¿128 GB siguen siendo suficientes?",
        answer:
          "Para un uso moderado y con fotos en la nube, sí. Si grabas vídeo con frecuencia o instalas juegos grandes, quédate en 256 GB.",
      },
      {
        question: "¿La nube sustituye al almacenamiento local?",
        answer:
          "Ayuda, pero depende de tener buena conexión y de pagar una suscripción. Conviene tratarla como complemento, no como sustituto.",
      },
    ],
  },
];

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));
