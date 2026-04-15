import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { PHASES, COMPONENTS } from "@/const/phases";


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

  // Guardar TODAS las fases a la vez
  const handleSaveAll = async () => {
    const headerErrors: string[] = [];
    if (!ateData.teacherName?.trim()) headerErrors.push("Profesor/a");
    if (!ateData.institution?.trim()) headerErrors.push("Institución");
    if (!ateData.ateName?.trim()) headerErrors.push("Nombre ATE");
    if (!ateData.componente?.trim()) headerErrors.push("Componente");

    if (headerErrors.length > 0) {
      toast.error(`Completa: ${headerErrors.join(", ")}`);
      return;
    }

    setIsSaving(true);
    try {
      if (!ateId) {
        const result = await createATEMutation.mutateAsync({
          teacherName: ateData.teacherName,
          institution: ateData.institution,
          ateName: ateData.ateName,
          grade: ateData.grade,
          componente: ateData.componente,
          tipo: ateData.tipo,
        });
        const newId = (result as any)?.id;
        if (newId) setAteId(newId);
      } else {
        await updateATEMutation.mutateAsync({
          id: ateId,
          data: ateData,
        });
      }

      // Marcar todas las fases como guardadas
      setSavedPhases(new Set([1, 2, 3, 4, 5]));
      toast.success("✅ ATE guardada completamente");
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Avanzar a siguiente fase y marcar actual como completada
  const handleNextPhase = () => {
    if (currentPhase < 5) {
      setSavedPhases((prev) => new Set(Array.from(prev).concat([currentPhase])));
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handlePrevPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const exportPdfMutation = trpc.ate.exportPdf.useMutation();

  const handleExportPdf = async () => {
    if (!ateId) {
      toast.error("Guarda la ATE primero");
      return;
    }

    toast.loading("Generando PDF...");
    try {
      const result = await exportPdfMutation.mutateAsync({ id: ateId });
      
      // Convertir base64 a blob y descargar
      const binaryString = atob(result.buffer);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ATE_${ateData.ateName || "documento"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF descargado");
    } catch (error) {
      toast.error("Error al exportar PDF");
      console.error(error);
    }
  };

  const completedCount = savedPhases.size;
  const progressPercent = (completedCount / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🏫 ATE Builder</h1>
            <div className="flex gap-2">
              <Button onClick={() => setShowPreview(true)} className="bg-blue-600">
                👁 Vista Previa
              </Button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 mt-4">
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

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 items-center">
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
              {ateId && completedCount === 5 && (
                <Button onClick={handleExportPdf} className="bg-red-600 ml-auto">
                  📥 Descargar PDF
                </Button>
              )}
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
                      <Button onClick={handlePrevPhase} variant="outline">
                        ← Anterior
                      </Button>
                    )}
                    {currentPhase < 5 && (
                      <Button onClick={handleNextPhase} variant="outline">
                        Siguiente →
                      </Button>
                    )}
                    {currentPhase === 5 && (
                      <Button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="ml-auto bg-green-600"
                      >
                        {isSaving ? "Guardando..." : "💾 Guardar ATE"}
                      </Button>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📄 Vista Previa</h2>
              <Button onClick={() => setShowPreview(false)} variant="outline">
                Cerrar
              </Button>
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
