import { useAuth } from "../Auth/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const { usuario, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200 shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Alternar menú"
        >
          <i className="pi pi-bars text-xl" />
        </button>
        <span className="text-lg font-bold text-slate-900">Sistema de Gestión de Taller Automotríz</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-slate-900">{usuario?.nombre}</span>
          <span className="text-xs text-slate-500">{usuario?.rol}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <i className="pi pi-sign-out text-xl" />
        </button>
      </div>
    </header>
  );
}