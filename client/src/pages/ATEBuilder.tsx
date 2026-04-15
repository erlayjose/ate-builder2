import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { PHASES, COMPONENTES_TECNOLOGICOS } from "@/const/phases";

interface ATEData {
  teacherName: string;
  institution: string;
  ateName: string;
  grade: string;
  competencia: string;
  tipo: "producto" | "proceso" | "sistema";
  [key: string]: any;
}

export default function ATEBuilder() {
  const { user } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);

  const [currentPhase, setCurrentPhase] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ateData, setAteData] = useState<ATEData>({
    teacherName: "",
    institution: "",
    ateName: "",
    grade: "",
    competencia: "",
    tipo: "producto",
  });
  const [savedPhases, setSavedPhases] = useState<Set<number>>(new Set());
  const [ateId, setAteId] = useState<number | null>(null);

  const createATEMutation = trpc.ate.create.useMutation();
  const updateATEMutation = trpc.ate.update.useMutation();

  const handleFieldChange = (key: string, value: any) => {
    setAteData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePhase = async (phaseNum: number) => {
    const phase = PHASES[phaseNum - 1];
    const missingFields = phase.fields.filter(
      (f) => f.required && !ateData[f.key]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error(
        `Completa los campos obligatorios: ${missingFields.map((f) => f.label).join(", ")}`
      );
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
          competencia: ateData.competencia,
          tipo: ateData.tipo,
        });
        setAteId(result?.id || null);
      } else {
        await updateATEMutation.mutateAsync({
          id: ateId,
          data: dataToSave,
        });
      }

      setSavedPhases((prev) => new Set(Array.from(prev).concat([phaseNum])));
      toast.success(`✅ Fase ${phaseNum} guardada correctamente`);
    } catch (error) {
      toast.error("Error al guardar la fase");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (!previewRef.current) {
      toast.error("Por favor, abre la vista previa para exportar a PDF");
      return;
    }

    toast.loading("Generando PDF, por favor espera...");
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ATE_${(ateData.ateName || "documento").replace(/\s/g, "_")}.pdf`);
      toast.success("📄 PDF exportado exitosamente");
    } catch (error) {
      toast.error("Error al generar el PDF");
      console.error(error);
    }
  };



  const phase = PHASES[currentPhase - 1];
  const progressPct = (savedPhases.size / 6) * 100;

  if (showPreview) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="sticky top-0 z-50 bg-slate-900 text-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <div className="text-xl font-bold">Vista Previa — ATE</div>
              <div className="text-sm opacity-75">
                {ateData.teacherName} · {ateData.institution}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportPdf} className="bg-red-600 hover:bg-red-700">
                ⬇ Exportar PDF
              </Button>
              <Button onClick={() => setShowPreview(false)} variant="outline" className="text-white border-white">
                ✕ Cerrar
              </Button>
            </div>
          </div>
        </div>

        <div ref={previewRef} className="max-w-4xl mx-auto p-8 bg-white">
          <Card className="p-8 mb-6 border-t-4" style={{ borderTopColor: "#1E3A5F" }}>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{ateData.ateName || "(Sin nombre)"}</h1>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-semibold text-slate-700">Profesor/a:</span>
                <span className="text-slate-600 ml-2">{ateData.teacherName || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Institución:</span>
                <span className="text-slate-600 ml-2">{ateData.institution || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Grado:</span>
                <span className="text-slate-600 ml-2">{ateData.grade || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Tipo:</span>
                <span className="text-slate-600 ml-2">{ateData.tipo}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Competencia:</span>
                <span className="text-slate-600 ml-2">{ateData.competencia || "—"}</span>
              </div>
            </div>
          </Card>

          {PHASES.map((ph) => {
            const hasContent = ph.fields.some((f) => ateData[f.key]);
            return (
              <Card key={ph.number} className="mb-6 p-6" style={{ borderLeftColor: ph.color, borderLeftWidth: "4px" }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: ph.color }}>
                  <span>{ph.icon}</span>
                  Fase {ph.number}: {ph.title}
                </h2>
                {hasContent ? (
                  ph.fields.map((f) =>
                    ateData[f.key] ? (
                      <div key={f.key} className="mb-4">
                        <div className="font-semibold text-sm text-slate-700 mb-1">{f.label}</div>
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded whitespace-pre-wrap">
                          {ateData[f.key]}
                        </div>
                      </div>
                    ) : null
                  )
                ) : (
                  <div className="text-sm text-slate-400 italic">Fase no completada</div>
                )}
              </Card>
            );
          })}

          <div className="text-center text-xs text-slate-400 mt-8">
            Generado con ATE Builder · {new Date().toLocaleDateString("es-CO")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">🏫 ATE Builder</h1>
              <p className="text-sm opacity-75 mt-1">Constructor de Actividades Tecnológicas Escolares</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowPreview(true)} variant="default" className="bg-blue-600 hover:bg-blue-700">
                👁 Vista Previa
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold opacity-75 mb-2 uppercase tracking-wider">👤 Profesor/a *</label>
              <input
                value={ateData.teacherName}
                onChange={(e) => handleFieldChange("teacherName", e.target.value)}
                placeholder="Ej: Dra. María García"
                className="w-full bg-white/10 border border-white/25 text-white rounded px-3 py-2 text-sm placeholder-white/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-75 mb-2 uppercase tracking-wider">🏛 Institución *</label>
              <input
                value={ateData.institution}
                onChange={(e) => handleFieldChange("institution", e.target.value)}
                placeholder="Ej: IE San José"
                className="w-full bg-white/10 border border-white/25 text-white rounded px-3 py-2 text-sm placeholder-white/50"
              />
            </div>
          </div>

          <div className="bg-white/10 border-t border-white/20 pt-4">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold opacity-75 mb-1 uppercase tracking-wider">Nombre ATE *</label>
                <input
                  value={ateData.ateName}
                  onChange={(e) => handleFieldChange("ateName", e.target.value)}
                  placeholder="Ej: Purificador de agua"
                  className="w-full bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-xs placeholder-white/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold opacity-75 mb-1 uppercase tracking-wider">Grado</label>
                <input
                  value={ateData.grade}
                  onChange={(e) => handleFieldChange("grade", e.target.value)}
                  placeholder="Ej: 8°"
                  className="w-full bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-xs placeholder-white/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold opacity-75 mb-1 uppercase tracking-wider">Competencia *</label>
                <select
                  value={ateData.competencia}
                  onChange={(e) => handleFieldChange("competencia", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-xs"
                >
                  <option value="">Seleccionar...</option>
                  {COMPONENTES_TECNOLOGICOS.map((comp: string) => (
                    <option key={comp} value={comp} className="bg-slate-900">
                      {comp}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold opacity-75 mb-1 uppercase tracking-wider">Tipo</label>
                <select
                  value={ateData.tipo}
                  onChange={(e) => handleFieldChange("tipo", e.target.value as any)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-xs"
                >
                  <option value="producto" className="bg-slate-900">Producto</option>
                  <option value="proceso" className="bg-slate-900">Proceso</option>
                  <option value="sistema" className="bg-slate-900">Sistema</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700">Progreso: {savedPhases.size}/6 fases completadas</span>
            <span className="text-sm text-slate-600">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-slate-900 to-blue-600 rounded transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {PHASES.map((ph) => (
            <button
              key={ph.number}
              onClick={() => setCurrentPhase(ph.number)}
              className="px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all"
              style={{
                borderBottomColor: currentPhase === ph.number ? ph.color : "transparent",
                color: currentPhase === ph.number ? ph.color : savedPhases.has(ph.number) ? "#10B981" : "#6B7280",
              }}
            >
              {savedPhases.has(ph.number) ? "✅" : ph.icon} {ph.number}. {ph.title}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="overflow-hidden shadow-lg">
          <div className="p-6" style={{ background: phase.bg, borderBottom: `2px solid ${phase.border}` }}>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{phase.icon}</span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: phase.color }}>
                  Fase {phase.number} de 6
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{phase.title}</h2>
              </div>
              {savedPhases.has(phase.number) && (
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  ✓ Guardada
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-white/60 rounded border-l-4" style={{ borderLeftColor: phase.color }}>
              <div className="text-sm text-slate-700">
                <strong>💡 Consejo:</strong> {phase.tip}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {phase.fields.map((field) => (
                <div key={field.key}>
                  <label className="block font-semibold text-slate-900 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={ateData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      rows={4}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: phase.color + "40" }}
                    />
                  ) : (
                    <input
                      value={ateData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      type="text"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: phase.color + "40" }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <Button
                onClick={() => currentPhase > 1 && setCurrentPhase(currentPhase - 1)}
                disabled={currentPhase === 1}
                variant="outline"
                className="opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </Button>

              <Button
                onClick={() => handleSavePhase(phase.number)}
                disabled={isSaving}
                className="text-white"
                style={{ background: phase.color }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  `💾 Guardar Fase ${phase.number}`
                )}
              </Button>

              <Button
                onClick={() => currentPhase < 6 && setCurrentPhase(currentPhase + 1)}
                disabled={currentPhase === 6}
                className="opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#1E3A5F" }}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => setShowPreview(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                👁 Ver Vista Previa Completa
              </Button>
        </div>
      </div>
    </div>
  );
}
