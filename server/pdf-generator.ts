import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface ATEData {
  teacherName: string;
  institution: string;
  ateName: string;
  grade: string;
  componente: string;
  tipo: string;
  situacionProblema?: string;
  analisisEntorno?: string;
  vinculacionIntereses?: string;
  objetivosAprendizaje?: string;
  contenidosDisciplinares?: string;
  articulacionCurriculo?: string;
  secuenciacion?: string;
  estrategias?: string;
  rolesYTiempos?: string;
  ejecucion?: string;
  mediacionDocente?: string;
  acompanamiento?: string;
  tipoEvaluacion?: string;
  criteriosEvaluacion?: string;
  instrumentosEvaluacion?: string;
  reflexionRetroalimentacion?: string;
}

const PHASES = [
  {
    id: 1,
    name: "CONTEXTUALIZACIÓN",
    color: "#1E3A5F",
    fields: [
      { key: "situacionProblema", label: "Situación Problema" },
      { key: "analisisEntorno", label: "Análisis del Entorno" },
      { key: "vinculacionIntereses", label: "Vinculación de Intereses" },
    ],
  },
  {
    id: 2,
    name: "FUNDAMENTACIÓN",
    color: "#2E5090",
    fields: [
      { key: "objetivosAprendizaje", label: "Objetivos de Aprendizaje" },
      { key: "contenidosDisciplinares", label: "Contenidos Disciplinares" },
      { key: "articulacionCurriculo", label: "Articulación Curricular" },
    ],
  },
  {
    id: 3,
    name: "DISEÑO DIDÁCTICO",
    color: "#3D66BF",
    fields: [
      { key: "secuenciacion", label: "Secuenciación" },
      { key: "estrategias", label: "Estrategias" },
      { key: "rolesYTiempos", label: "Roles y Tiempos" },
    ],
  },
  {
    id: 4,
    name: "IMPLEMENTACIÓN",
    color: "#4D7CEE",
    fields: [
      { key: "ejecucion", label: "Ejecución" },
      { key: "mediacionDocente", label: "Mediación Docente" },
      { key: "acompanamiento", label: "Acompañamiento" },
    ],
  },
  {
    id: 5,
    name: "EVALUACIÓN",
    color: "#5D8CFF",
    fields: [
      { key: "tipoEvaluacion", label: "Tipo de Evaluación" },
      { key: "criteriosEvaluacion", label: "Criterios de Evaluación" },
      { key: "instrumentosEvaluacion", label: "Instrumentos de Evaluación" },
      { key: "reflexionRetroalimentacion", label: "Reflexión y Retroalimentación" },
    ],
  },
];

export async function generateATEPdf(ateData: ATEData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", (err: Error) => {
        reject(err);
      });

      // Encabezado
      doc.fontSize(24).font("Helvetica-Bold").text(ateData.ateName || "ATE sin nombre", {
        align: "center",
      });

      doc.fontSize(10).font("Helvetica").fillColor("#666").text(`Profesor/a: ${ateData.teacherName}`, {
        align: "left",
      });

      doc.text(`Institución: ${ateData.institution}`);
      doc.text(`Grado: ${ateData.grade || "N/A"}`);
      doc.text(`Componente: ${ateData.componente || "N/A"}`);
      doc.text(`Tipo: ${ateData.tipo || "N/A"}`);

      doc.moveDown();
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#1E3A5F");
      doc.moveDown();

      // Contenido por fases
      PHASES.forEach((phase) => {
        doc.fontSize(14).font("Helvetica-Bold").fillColor(phase.color).text(`${phase.name}`, {
          align: "left",
        });

        doc.fontSize(10).font("Helvetica").fillColor("#000");

        let hasContent = false;

        phase.fields.forEach((field) => {
          const value = (ateData as any)[field.key];
          if (value && value.trim()) {
            hasContent = true;
            doc.fontSize(11).font("Helvetica-Bold").fillColor("#333").text(`${field.label}:`, {
              align: "left",
            });

            doc.fontSize(10).font("Helvetica").fillColor("#555").text(value, {
              align: "left",
              width: 475,
            });

            doc.moveDown(0.5);
          }
        });

        if (!hasContent) {
          doc.fontSize(10).font("Helvetica").fillColor("#999").text("(Fase no completada)", {
            align: "left",
          });
        }

        doc.moveDown();
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#E5E5E5");
        doc.moveDown();
      });

      // Pie de página
      doc.fontSize(8).font("Helvetica").fillColor("#999").text(
        `Generado con ATE Builder · ${new Date().toLocaleDateString("es-CO")}`,
        {
          align: "center",
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
