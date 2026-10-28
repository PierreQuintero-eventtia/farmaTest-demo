import { CategoryInfo, CourseLesson } from '../types/farmacia';

export const CATEGORIES_CONFIG: CategoryInfo[] = [
  {
    id: 'LEGISLACION',
    name: 'Legislación Farmacéutica y Código Sanitario',
    shortName: 'Legislación',
    description: 'Decreto Supremo 466/84, Código Sanitario Libro VI, requisitos de instalación y facultades del Director Técnico y Auxiliar.',
    decreeReference: 'D.S. 466/84 y Código Sanitario',
    isProOnly: false,
    color: 'emerald',
    iconName: 'Scale',
  },
  {
    id: 'ALMACENAMIENTO',
    name: 'Almacenamiento, BPD y Cadena de Frío',
    shortName: 'Cadena de Frío',
    description: 'Conservación de termolábiles (2°C a 8°C), control de temperatura ambiente, humedad (<65%) y sistema FEFO/FIFO.',
    decreeReference: 'D.S. 466 Art. 38 al 42',
    isProOnly: false,
    color: 'teal',
    iconName: 'ThermometerSnowflake',
  },
  {
    id: 'PSICOTROPICOS',
    name: 'Control de Psicotrópicos y Estupefacientes',
    shortName: 'Psicotrópicos',
    description: 'Decretos Supremos 404/83 y 405/83, Receta Cheque oficial, Receta Retenida con control de stock, libros foliados y balances SEREMI/ISP.',
    decreeReference: 'D.S. 404/83 y D.S. 405/83',
    isProOnly: true,
    color: 'amber',
    iconName: 'ShieldAlert',
  },
  {
    id: 'FARMACOLOGIA',
    name: 'Farmacología, Bioequivalencia y RAM',
    shortName: 'Bioequivalencia',
    description: 'Sello amarillo oficial del ISP, Denominación Común Internacional (DCI), farmacovigilancia RED-RAM, formas farmacéuticas y vías.',
    decreeReference: 'Ley de Fármacos I/II y D.S. 3/10',
    isProOnly: true,
    color: 'indigo',
    iconName: 'Pill',
  },
  {
    id: 'DISPENSACION',
    name: 'Dispensación Ética y Condiciones de Venta',
    shortName: 'Dispensación',
    description: 'Condición de venta directa, receta médica simple, receta retenida, fraccionamiento, recetario magistral (D.S. 79/10) y atención al paciente.',
    decreeReference: 'D.S. 466/84 y D.S. 79/10',
    isProOnly: true,
    color: 'rose',
    iconName: 'ShoppingBag',
  },
];

export const COURSES_LESSONS: CourseLesson[] = [
  {
    id: 'les_leg_01',
    category: 'LEGISLACION',
    title: 'D.S. 466/84: Estructura y Funcionamiento de la Farmacia',
    subtitle: 'El rol legal del Auxiliar bajo supervisión del Químico Farmacéutico',
    estimatedMinutes: 6,
    isProOnly: false,
    sections: [
      {
        heading: '1. Definición y Dirección Técnica',
        content:
          'En Chile, la farmacia es un centro de salud regulado por el Decreto Supremo N° 466/84. Toda farmacia debe estar bajo la dirección permanente y presencial de un profesional Químico Farmacéutico o Farmacéutico (Director Técnico).',
        keyPoints: [
          'La presencia del Químico Farmacéutico es obligatoria durante todo el horario de funcionamiento legal.',
          'El Auxiliar de Farmacia actúa como colaborador bajo la supervisión directa y responsabilidad del Director Técnico.',
          'La autorización sanitaria de instalación y funcionamiento es otorgada exclusivamente por la SEREMI de Salud de la región respectiva.',
        ],
        normativeBadge: 'D.S. 466/84 Art. 1, 9 y 12',
      },
      {
        heading: '2. Deberes y Prohibiciones del Auxiliar de Farmacia',
        content:
          'El Auxiliar de Farmacia debidamente autorizado por la SEREMI de Salud cuenta con un carnet o resolución sanitaria habilitante. Su labor está acotada al despacho, ordenamiento y atención, sin alterar ni emitir prescripciones.',
        keyPoints: [
          'PROHIBIDO sustituir medicamentos que requieran receta médica retenida o receta cheque sin autorización del Químico Farmacéutico.',
          'PROHIBIDO formular recomendaciones de medicamentos que requieran diagnóstico médico previo.',
          'OBLIGATORIO solicitar la receta médica vigente antes de dispensar productos sometidos a control legal.',
        ],
        normativeBadge: 'Código Sanitario Art. 129',
      },
      {
        heading: '3. Libros Oficiales Obligatorios en Farmacia',
        content:
          'Toda farmacia debe mantener permanentemente en su local libros oficiales foliados y timbrados por la SEREMI de Salud o ISP:',
        keyPoints: [
          'Libro de Inspección (para actas y visitas de fiscalizadores de la SEREMI/ISP).',
          'Libro de Reclamos y Sugerencias (a disposición inmediata del público).',
          'Libro de Control de Estupefacientes y Libro de Control de Psicotrópicos.',
          'Libro de Recetario Magistral (si el establecimiento cuenta con recetario autorizado).',
        ],
        normativeBadge: 'D.S. 466/84 Art. 34',
      },
    ],
    quickCheckQuestionId: 'q_leg_01',
  },
  {
    id: 'les_alm_01',
    category: 'ALMACENAMIENTO',
    title: 'Cadena de Frío, BPD y Gestión de Vencimientos (FEFO)',
    subtitle: 'Control riguroso de termolábiles (2°C a 8°C) y humedad',
    estimatedMinutes: 7,
    isProOnly: false,
    sections: [
      {
        heading: '1. La Regla de Oro de los Medicamentos Termolábiles',
        content:
          'Los productos biológicos, vacunas, insulinas y colirios especiales pierden irremediablemente su actividad farmacológica si se rompe la cadena de frío. La normativa chilena exige mantenerlos estrictamente entre 2°C y 8°C.',
        keyPoints: [
          'Rango estricto de refrigeración: +2°C a +8°C (NUNCA congelar, ya que desnaturaliza proteínas e inactiva insulinas).',
          'Registro de temperatura mínimo dos veces al día (mañana y tarde) en planilla visible en la puerta del refrigerador.',
          'Los refrigeradores clínicos deben tener termómetro de máxima y mínima calibrado o datalogger continuo.',
        ],
        normativeBadge: 'D.S. 466/84 Art. 40 y NTS N° 147',
      },
      {
        heading: '2. Temperatura Ambiente y Humedad en Sala de Ventas y Bodega',
        content:
          'Para los medicamentos generales que no requieren refrigeración, deben mantenerse en ambiente fresco y seco para evitar hidrólisis o degradación acelerada del principio activo.',
        keyPoints: [
          'Temperatura ambiente controlada: No debe exceder los 25°C (máximo 30°C según monografía).',
          'Humedad relativa máxima recomendada: Menor al 65%.',
          'Almacenar sobre tarimas o repisas separadas al menos 15 cm del piso y 30 cm de paredes exteriores.',
        ],
        normativeBadge: 'Buenas Prácticas de Almacenamiento ISP',
      },
      {
        heading: '3. El Sistema FEFO (First Expired, First Out)',
        content:
          'En farmacia comunitaria no se utiliza FIFO tradicional por fecha de llegada, sino prioritariamente **FEFO** (Primero en Vencer, Primero en Salir).',
        keyPoints: [
          'El producto con fecha de caducidad más cercana siempre se coloca al frente del estante.',
          'Medicamentos vencidos deben ser retirados de inmediato al área de "Merma o Devolución" identificada y bloqueada.',
          'Dispensar un medicamento vencido constituye una falta sanitaria gravísima penada por el Código Sanitario.',
        ],
        normativeBadge: 'D.S. 466/84 Art. 42',
      },
    ],
    quickCheckQuestionId: 'q_alm_01',
  },
  {
    id: 'les_psi_01',
    category: 'PSICOTROPICOS',
    title: 'Decretos 404/83 y 405/83: Estupefacientes y Psicotrópicos',
    subtitle: 'Manejo de Receta Cheque oficial y balance de existencias',
    estimatedMinutes: 8,
    isProOnly: true,
    sections: [
      {
        heading: '1. Diferencia entre Psicotrópicos y Estupefacientes',
        content:
          'En Chile, los estupefacientes (D.S. 404/83) abarcan opioides potentes como morfina, metadona, fentanilo y codeína en ciertas concentraciones. Los psicotrópicos (D.S. 405/83) abarcan benzodiacepinas, barbitúricos y psicoestimulantes como metilfenidato.',
        keyPoints: [
          'D.S. 404/83 regula Estupefacientes (Lista I, II, III, IV).',
          'D.S. 405/83 regula Productos Psicotrópicos (Listas I, II, III, IV).',
          'Deben mantenerse bajo llave en estante o caja de seguridad exclusiva, con llave custodiada por el Químico Farmacéutico.',
        ],
        normativeBadge: 'D.S. 404/83 Art. 21 y D.S. 405/83 Art. 23',
      },
      {
        heading: '2. Receta Cheque Oficial: Requisitos Inflexibles',
        content:
          'La Receta Cheque es un formulario oficial valorado, foliado e impreso por la Casa de Moneda de Chile y distribuido por el Servicio de Salud a los médicos autorizados.',
        keyPoints: [
          'Vigencia: 30 días corridos desde la fecha de emisión por el médico.',
          'No se admiten enmiendas, borrones, tachaduras ni correcciones con corrector líquido.',
          'El Auxiliar o Químico debe exigir la cédula de identidad del comprador y anotar en el talón: nombre, RUT y domicilio del adquirente.',
          'Se debe archivar correlativamente y registrar en el Libro de Control dentro de las 48 horas.',
        ],
        normativeBadge: 'D.S. 404 Art. 26 y D.S. 405 Art. 28',
      },
      {
        heading: '3. Receta Retenida con Control de Stock vs Simple Retenida',
        content:
          'Benzodiacepinas como Clonazepam, Alprazolam o Diazepam se despachan con Receta Retenida con control de serie y registro en libro/sistema informático oficial.',
        keyPoints: [
          'El Auxiliar retiene la receta física en el mostrador.',
          'Se timbra en el reverso con el sello de la farmacia, fecha de despacho y cantidad entregada.',
          'Se realiza el balance trimestral que se envía a la SEREMI de Salud o ISP.',
        ],
        normativeBadge: 'D.S. 405/83 Art. 31',
      },
    ],
    quickCheckQuestionId: 'q_psi_01',
  },
  {
    id: 'les_far_01',
    category: 'FARMACOLOGIA',
    title: 'Bioequivalencia Oficial ISP y Sistema RED-RAM',
    subtitle: 'Sello amarillo de intercambiabilidad y farmacovigilancia',
    estimatedMinutes: 7,
    isProOnly: true,
    sections: [
      {
        heading: '1. ¿Qué es un Medicamento Bioequivalente en Chile?',
        content:
          'Un medicamento bioequivalente ha demostrado mediante estudios in vivo (curvas de concentración plasmática AUC y Cmax) tener la misma velocidad y cantidad de absorción que el fármaco innovador original con margen de confianza del 80% al 125%.',
        keyPoints: [
          'Identificable por la franja amarilla en 4 de las 6 caras del envase con la leyenda "BIOEQUIVALENTE".',
          'Permite la intercambiabilidad terapéutica segura por el Químico Farmacéutico.',
          'La prescripción médica debe indicar obligatoriamente la Denominación Común Internacional (DCI).',
        ],
        normativeBadge: 'D.S. 3/10 y Ley 20.724 (Fármacos I)',
      },
      {
        heading: '2. Farmacovigilancia y Notificación de RAM al ISP',
        content:
          'Cualquier Reacción Adversa a Medicamentos (RAM) grave, inesperada o falla de calidad (ej. precipitado en jarabe, blíster vacío, cambio de color) debe ser comunicada al Director Técnico.',
        keyPoints: [
          'El Químico Farmacéutico notifica a través del portal oficial RED-RAM del Instituto de Salud Pública (ISP).',
          'El Auxiliar de Farmacia debe aislar inmediatamente el lote sospechoso y no continuar su dispensación.',
        ],
        normativeBadge: 'NTS N° 140 de Farmacovigilancia ISP',
      },
    ],
    quickCheckQuestionId: 'q_far_01',
  },
  {
    id: 'les_dis_01',
    category: 'DISPENSACION',
    title: 'Dispensación Ética, Condición de Venta y Recetario Magistral',
    subtitle: 'Diferenciación de recetas y preparación bajo D.S. 79/10',
    estimatedMinutes: 6,
    isProOnly: true,
    sections: [
      {
        heading: '1. Condiciones de Venta en la Legislación Chilena',
        content:
          'El Instituto de Salud Pública clasifica el registro sanitario de cada producto farmacéutico bajo 4 condiciones de venta estrictas:',
        keyPoints: [
          'Venta Directa (VD / OTC): No exige receta médica (ej. Paracetamol 500mg, Ibuprofeno 400mg).',
          'Venta Bajo Receta Médica Simple: El paciente debe exhibir la receta, pero esta se devuelve timbrada.',
          'Venta Bajo Receta Retenida: La farmacia debe retener y archivar el documento.',
          'Venta Bajo Receta Cheque: Formulario oficial del MINSAL para listas de estupefacientes y psicotrópicos mayores.',
        ],
        normativeBadge: 'D.S. 466/84 Art. 36',
      },
      {
        heading: '2. Recetario Magistral (D.S. 79/10)',
        content:
          'Los preparados magistrales son medicamentos elaborados en el recetario de la farmacia para un paciente individualizado según fórmula prescrita por médico o médico veterinario.',
        keyPoints: [
          'Vigencia de un preparado magistral sin preservante: típicamente máximo 30 a 40 días.',
          'Etiqueta debe indicar nombre del paciente, médico, fecha de preparación, vencimiento y advertencias.',
        ],
        normativeBadge: 'D.S. 79/10 Reglamento de Recetarios',
      },
    ],
    quickCheckQuestionId: 'q_dis_01',
  },
];
