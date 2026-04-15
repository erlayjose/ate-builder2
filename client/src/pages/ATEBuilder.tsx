import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { PHASES, COMPONENTS } from "@/const/phases";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ATEBuilder() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [ateId, setAteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedPhases, setSavedPhases] = useState<Set<number>>(new Set());
  const previewRef = useRef<HTMLDivElement>(null);

  const [ateData, setAteData] = useState<Record<string, string>>({
    teacherName: "",
    institution: "",
    ateName: "",
    grade: "",
    componente: "",
    tipo: "Producto",
    situacionProblema: "",
    analisisEntorno: "",
    vinculacionIntereses: "",
    objetivosAprendizaje: "",
    contenidosDisciplinares: "",
    articulacionCurriculo: "",
    secuenciacion: "",
    estrategias: "",
    rolesYTiempos: "",
    ejecucion: "",
    mediacionDocente: "",
    acompanamiento: "",
    tipoEvaluacion: "",
    criteriosEvaluacion: "",
    instrumentosEvaluacion: "",
    reflexionRetroalimentacion: "",
  });

  const createATEMutation = trpc.ate.create.useMutation();
  const updateATEMutation = trpc.ate.update.useMutation();

  const handleFieldChange = (key: string, value: any) => {
    setAteData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePhase = async (phaseNum: number) => {
    const headerErrors: string[] = [];
    if (!ateData.teacherName?.trim()) headerErrors.push("Profesor/a");
    if (!ateData.institution?.trim()) headerErrors.push("Institución");
    if (!ateData.ateName?.trim()) headerErrors.push("Nombre ATE");
    if (!ateData.componente?.trim()) headerErrors.push("Componente");

    if (headerErrors.length > 0) {
      toast.error(`Completa: ${headerErrors.join(", ")}`);
      return;
    }

    const phase = PHASES[phaseNum - 1];
    const missingFields = phase.fields.filter(
      (f) => f.required && !ateData[f.key]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error(`Faltan: ${missingFields.map((f) => f.label).join(", ")}`);
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...ateData,
        [`fase${phaseNum}Completed`]: 1,
      };

      if (!ateId) {
        const result = await createATEMutation.mutateAsync({
          teacherName: ateData.teacherName,
          institution: ateData.institution,
          ateName: ateData.ateName,
          grade: ateData.grade,
          componente: ateData.componente,
          tipo: ateData.tipo,
        });
        setAteId((result as any)?.id || null);
      } else {
        await updateATEMutation.mutateAsync({
          id: ateId,
          data: dataToSave,
        });
      }

      setSavedPhases((prev) => new Set(Array.from(prev).concat([phaseNum])));
      toast.success(`✅ Fase ${phaseNum} guardada`);
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (!previewRef.current) {
      toast.error("Abre la vista previa");
      return;
    }

    toast.loading("Generando PDF...");
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${ateData.ateName || "ATE"}.pdf`);
      toast.success("✅ PDF descargado");
    } catch (error) {
      toast.error("Error al generar PDF");
      console.error(error);
    }
  };

  const completedCount = savedPhases.size;
  const progressPercent = (completedCount / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">🏫 ATE Builder</h1>
              <p className="text-sm opacity-75 mt-1">Actividades Tecnológicas Escolares</p>
            </div>
            <Button onClick={() => setShowPreview(true)} className="bg-blue-600">
              👁 Vista Previa
            </Button>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Progreso: {completedCount}/5</span>
              <span className="text-sm opacity-75">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {!showPreview ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8 pb-8 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold mb-6">📋 Información General</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={ateData.teacherName}
                  onChange={(e) => handleFieldChange("teacherName", e.target.value)}
                  placeholder="Profesor/a *"
                  className="border border-gray-300 rounded px-3 py-2"
                />
                <input
                  value={ateData.institution}
                  onChange={(e) => handleFieldChange("institution", e.target.value)}
                  placeholder="Institución *"
                  className="border border-gray-300 rounded px-3 py-2"
                />
                <input
                  value={ateData.ateName}
                  onChange={(e) => handleFieldChange("ateName", e.target.value)}
                  placeholder="Nombre ATE *"
                  className="border border-gray-300 rounded px-3 py-2"
                />
                <input
                  value={ateData.grade}
                  onChange={(e) => handleFieldChange("grade", e.target.value)}
                  placeholder="Grado"
                  className="border border-gray-300 rounded px-3 py-2"
                />
                <select
                  value={ateData.componente}
                  onChange={(e) => handleFieldChange("componente", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Componente *</option>
                  {COMPONENTS.map((comp) => (
                    <option key={comp} value={comp}>
                      {comp}
                    </option>
                  ))}
                </select>
                <select
                  value={ateData.tipo}
                  onChange={(e) => handleFieldChange("tipo", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option>Producto</option>
                  <option>Proceso</option>
                  <option>Sistema</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {PHASES.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setCurrentPhase(phase.id)}
                  className={`px-4 py-2 rounded font-semibold whitespace-nowrap transition-all ${
                    currentPhase === phase.id
                      ? `text-white`
                      : savedPhases.has(phase.id)
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  style={
                    currentPhase === phase.id
                      ? { backgroundColor: phase.color }
                      : {}
                  }
                >
                  {savedPhases.has(phase.id) ? "✅" : ""} Fase {phase.id}
                </button>
              ))}
            </div>

            {PHASES.map((phase) => (
              currentPhase === phase.id && (
                <div key={phase.id} className={`p-6 rounded-lg ${phase.bg} border-2 ${phase.border}`}>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: phase.color }}>
                    {phase.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{phase.description}</p>

                  <div className="space-y-6">
                    {phase.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold mb-2">
                          {field.label} {field.required && "*"}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={ateData[field.key] || ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                          />
                        ) : field.type === "select" ? (
                          <select
                            value={ateData[field.key] || ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          >
                            <option value="">{field.placeholder}</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex gap-4">
                    {currentPhase > 1 && (
                      <Button onClick={() => setCurrentPhase(currentPhase - 1)} variant="outline">
                        ← Anterior
                      </Button>
                    )}
                    {currentPhase < 5 && (
                      <Button onClick={() => setCurrentPhase(currentPhase + 1)} variant="outline">
                        Siguiente →
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSavePhase(currentPhase)}
                      disabled={isSaving}
                      className="ml-auto bg-green-600"
                    >
                      {isSaving ? "Guardando..." : "💾 Guardar"}
                    </Button>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📄 Vista Previa</h2>
              <div className="flex gap-2">
                <Button onClick={handleExportPdf} className="bg-red-600">
                  📥 PDF
                </Button>
                <Button onClick={() => setShowPreview(false)} variant="outline">
                  Cerrar
                </Button>
              </div>
            </div>

            <div ref={previewRef} className="bg-white p-8 border-2 border-gray-200 rounded-lg">
              <h1 className="text-3xl font-bold mb-2">{ateData.ateName}</h1>
              <p className="text-gray-600 mb-6">
                {ateData.institution} | {ateData.grade} | {ateData.componente}
              </p>

              {PHASES.map((phase) => (
                <div key={phase.id} className={`mb-8 p-6 rounded-lg ${phase.bg} border-l-4`} style={{ borderColor: phase.color }}>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: phase.color }}>
                    {phase.name}
                  </h2>
                  {phase.fields.map((field) => (
                    ateData[field.key] && (
                      <div key={field.key} className="mb-4">
                        <h3 className="font-semibold text-gray-800">{field.label}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{(ateData as any)[field.key]}</p>
                      </div>
                    )
                  ))}
                </div>
              ))}

              <div className="text-center text-xs text-gray-400 mt-8">
                ATE Builder · {new Date().toLocaleDateString("es-CO")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
