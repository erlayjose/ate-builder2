import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">🏫 ATE Builder</h1>
          <p className="text-lg text-slate-600 mb-8">Constructor de Actividades Tecnológicas Escolares</p>
          <p className="text-slate-600 mb-8 max-w-md">Crea y gestiona actividades pedagógicas estructuradas en 6 fases, con exportación a PDF y TXT.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg">
              🔐 Iniciar Sesión
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold">🏫 ATE Builder</h1>
          <p className="text-sm opacity-75 mt-1">Bienvenido/a, {user?.name || "usuario"}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Comienza a crear tu ATE</h2>
          <p className="text-slate-600 mb-6">Accede al constructor de Actividades Tecnológicas Escolares para crear documentos estructurados en 6 fases pedagógicas.</p>
          <Button onClick={() => setLocation("/ate")} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2">
            ➜ Ir a ATE Builder
          </Button>
        </div>
      </div>
    </div>
  );
}
