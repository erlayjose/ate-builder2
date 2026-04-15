export const COMPONENTS = [
  "Naturaleza y Evolución de la T&I",
  "Uso y Apropiación de la T&I",
  "Solución de Problemas con T&I",
  "Tecnología y Sociedad",
];

export const STRATEGIES = [
  "Aprendizaje Basado en Proyectos (ABP)",
  "Metodología Maker",
  "Aprendizaje Colaborativo",
  "Pensamiento Crítico",
  "Otro",
];

export const EVALUATION_TYPES = [
  "Formativa",
  "Sumativa",
  "Ambas",
];

export const PHASES = [
  {
    id: 1,
    name: "CONTEXTUALIZACIÓN",
    description: "Identificación del problema o necesidad",
    color: "#06B6D4",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    fields: [
      {
        key: "situacionProblema",
        label: "Situación Problema",
        type: "textarea",
        placeholder: "Describe el reto contextualizado y significativo...",
        required: true,
      },
      {
        key: "analisisEntorno",
        label: "Análisis del Entorno y Recursos",
        type: "textarea",
        placeholder: "Describe los recursos disponibles y el contexto local...",
        required: true,
      },
      {
        key: "vinculacionIntereses",
        label: "Vinculación con Intereses Estudiantiles",
        type: "textarea",
        placeholder: "¿Cómo se conecta con los intereses de los estudiantes?",
        required: true,
      },
    ],
  },
  {
    id: 2,
    name: "FUNDAMENTACIÓN",
    description: "Definición de objetivos y contenidos",
    color: "#F59E0B",
    bg: "bg-amber-50",
    border: "border-amber-200",
    fields: [
      {
        key: "objetivosAprendizaje",
        label: "Objetivos de Aprendizaje",
        type: "textarea",
        placeholder: "Define los objetivos que los estudiantes deben lograr...",
        required: true,
      },
      {
        key: "contenidosDisciplinares",
        label: "Contenidos Disciplinares",
        type: "textarea",
        placeholder: "Selecciona los conceptos técnicos y sociales a trabajar...",
        required: true,
      },
      {
        key: "articulacionCurriculo",
        label: "Articulación con el Currículo MEN",
        type: "textarea",
        placeholder: "¿Cómo se articula con los estándares curriculares?",
        required: true,
      },
    ],
  },
  {
    id: 3,
    name: "DISEÑO DIDÁCTICO",
    description: "Secuenciación y estrategias",
    color: "#10B981",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    fields: [
      {
        key: "secuenciacion",
        label: "Secuenciación de Actividades",
        type: "textarea",
        placeholder: "Describe las actividades en orden secuencial...",
        required: true,
      },
      {
        key: "estrategias",
        label: "Estrategias Pedagógicas",
        type: "select",
        options: STRATEGIES,
        placeholder: "Selecciona la estrategia principal",
        required: true,
      },
      {
        key: "rolesYTiempos",
        label: "Roles y Tiempos",
        type: "textarea",
        placeholder: "Define los roles de estudiantes y docente, y tiempos estimados...",
        required: true,
      },
    ],
  },
  {
    id: 4,
    name: "IMPLEMENTACIÓN",
    description: "Ejecución y acompañamiento",
    color: "#8B5CF6",
    bg: "bg-violet-50",
    border: "border-violet-200",
    fields: [
      {
        key: "ejecucion",
        label: "Ejecución de la Actividad",
        type: "textarea",
        placeholder: "Describe cómo se ejecutará la actividad...",
        required: true,
      },
      {
        key: "mediacionDocente",
        label: "Mediación Docente",
        type: "textarea",
        placeholder: "¿Cómo mediará el docente el proceso de aprendizaje?",
        required: true,
      },
      {
        key: "acompanamiento",
        label: "Acompañamiento a Estudiantes",
        type: "textarea",
        placeholder: "¿Cómo se acompañará a los estudiantes durante el proceso?",
        required: true,
      },
    ],
  },
  {
    id: 5,
    name: "EVALUACIÓN",
    description: "Evaluación y reflexión",
    color: "#EF4444",
    bg: "bg-red-50",
    border: "border-red-200",
    fields: [
      {
        key: "tipoEvaluacion",
        label: "Tipo de Evaluación",
        type: "select",
        options: EVALUATION_TYPES,
        placeholder: "Selecciona el tipo de evaluación",
        required: true,
      },
      {
        key: "criteriosEvaluacion",
        label: "Criterios de Evaluación",
        type: "textarea",
        placeholder: "Define los criterios para evaluar el aprendizaje...",
        required: true,
      },
      {
        key: "instrumentosEvaluacion",
        label: "Instrumentos de Evaluación",
        type: "textarea",
        placeholder: "¿Qué herramientas se usarán? (rúbricas, listas de cotejo, etc.)",
        required: true,
      },
      {
        key: "reflexionRetroalimentacion",
        label: "Reflexión y Retroalimentación",
        type: "textarea",
        placeholder: "¿Cómo se reflexionará sobre el proceso y se dará retroalimentación?",
        required: true,
      },
    ],
  },
];
